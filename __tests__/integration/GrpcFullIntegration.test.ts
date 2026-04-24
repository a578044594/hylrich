/* eslint-disable @typescript-eslint/no-explicit-any */
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { GRPCService } from '../../src/protocols/grpc/GRPCService';
import { DistributedStateStore } from '../../src/state/DistributedStateStore';

// Type helpers
interface GetCurrentStateResponse {
  state: Record<string, Buffer>;
  timestamp: number;
}
interface HealthResponse {
  timestamp: number;
  tool_count: number;
  active_agents: number;
  status: string;
}
interface ExecuteToolResponse {
  success: boolean;
  result_data: Buffer;
  error_message?: string;
  execution_time_ms: number;
}
interface StateUpdateResponse {
  accepted: boolean;
  error?: string;
}
interface StateUpdate {
  key: string;
  value: Buffer;
  operation: string;
  timestamp: number;
  source: string;
}
interface MetricsData {
  timestamp: number;
  cpu_usage: number;
  memory_usage_mb: number;
  message_throughput: number;
}

function createAgentServiceClient(port: number) {
  const protoPath = join(process.cwd(), 'src', 'protos', 'agent.proto');
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  // Use any cast to bypass type checking issues with loadPackageDefinition
  const proto = (grpc as any).loadPackageDefinition(packageDefinition);
  const AgentService = (proto.openclaw.agent.AgentService);
  return new AgentService(
    `localhost:${port}`,
    (grpc as any).credentials.createInsecure()
  );
}

describe('gRPC Full Integration Tests', () => {
  let service: GRPCService;
  let stateStore: DistributedStateStore;
  const TEST_PORT = 50052;
  const CLIENT_ID = 'integration-client-1';

  beforeAll(async () => {
    stateStore = new DistributedStateStore({ nodeId: 'server-node' });
    service = new GRPCService({
      port: TEST_PORT,
      stateStore,
      protoPath: join(process.cwd(), 'src', 'protos', 'agent.proto'),
    });
    await service.start();
  }, 15000);

  afterAll(async () => {
    await service.stop();
  });

  describe('GetCurrentState', () => {
    test('returns complete snapshot', (done) => {
      stateStore.set('test-key-1', { value: 100 });
      stateStore.set('test-key-2', [1, 2, 3]);

      const client = createAgentServiceClient(TEST_PORT);
      client.getCurrentState({ filter_prefix: '' }, (err: any, response: any) => {
        if (err) return done.fail(err as any);
        try {
          const resp = response as GetCurrentStateResponse;
          const state: Record<string, any> = {};
          for (const [key, buf] of Object.entries(resp.state)) {
            state[key] = JSON.parse(buf.toString('utf8'));
          }
          expect(state).toHaveProperty('test-key-1');
          expect(state['test-key-1'].value).toBe(100);
          expect(state).toHaveProperty('test-key-2');
          expect(state['test-key-2']).toEqual([1, 2, 3]);
          done();
        } catch (e) {
          done.fail(String(e));
        }
      });
    }, 5000);

    test('filters by prefix', (done) => {
      stateStore.set('prefix-abc', { type: 'a' });
      stateStore.set('prefix-xyz', { type: 'x' });
      stateStore.set('other-key', { type: 'o' });

      const client = createAgentServiceClient(TEST_PORT);
      client.getCurrentState({ filter_prefix: 'prefix-' }, (err: any, response: any) => {
        if (err) return done.fail(err as any);
        const returnedKeys = Object.keys(response.state);
        expect(returnedKeys).toContain('prefix-abc');
        expect(returnedKeys).toContain('prefix-xyz');
        expect(returnedKeys).not.toContain('other-key');
        done();
      });
    }, 5000);
  });

  describe('PublishState', () => {
    test('accepts and stores published state', (done) => {
      const client = createAgentServiceClient(TEST_PORT);
      const key = 'integration-published-key';
      const value = { message: 'hello', timestamp: Date.now() };
      
      client.publishState(
        { key, value: Buffer.from(JSON.stringify(value)), source: 'integration-test', timestamp: Date.now() },
        (err: any, response: any) => {
          if (err) return done.fail(err as any);
          const resp = response as StateUpdateResponse;
          expect(resp.accepted).toBe(true);
          const stored = stateStore.get(key);
          expect(stored).toEqual(value);
          done();
        }
      );
    }, 5000);

    test('handles duplicate publishes', (done) => {
      const client = createAgentServiceClient(TEST_PORT);
      const key = 'dup-key';
      client.publishState(
        { key, value: Buffer.from(JSON.stringify({ v: 1 })), source: 'test', timestamp: Date.now() },
        (err: any, response: any) => {
          if (err) return done.fail(err as any);
          expect((response as StateUpdateResponse).accepted).toBe(true);
          client.publishState(
            { key, value: Buffer.from(JSON.stringify({ v: 2 })), source: 'test', timestamp: Date.now() },
            (err2: any, response2: any) => {
              expect((response2 as StateUpdateResponse).accepted).toBe(true);
              const stored = stateStore.get(key) as any;
              expect(stored.v).toBe(2);
              done();
            }
          );
        }
      );
    }, 5000);
  });

  describe('StreamStateUpdates', () => {
    test('streams initial snapshot and subsequent updates', (done) => {
      const client = createAgentServiceClient(TEST_PORT);
      stateStore.set('stream-initial-1', 'initial-value-1');
      stateStore.set('stream-initial-2', { count: 42 });

      const call = client.streamStateUpdates({ client_id: CLIENT_ID, filter_prefix: '' });
      const receivedUpdates: StateUpdate[] = [];
      let snapshotReceived = 0;
      
      const checkDone = () => {
        if (snapshotReceived >= 3) {
          call.cancel();
          const upd1 = receivedUpdates.find(u => u.key === 'stream-initial-1');
          if (!upd1) throw new Error('Missing stream-initial-1');
          expect(JSON.parse(upd1.value.toString('utf8'))).toBe('initial-value-1');
          const upd2 = receivedUpdates.find(u => u.key === 'stream-initial-2');
          if (!upd2) throw new Error('Missing stream-initial-2');
          expect(JSON.parse(upd2.value.toString('utf8')).count).toBe(42);
          const newUpd = receivedUpdates.find(u => u.key === 'stream-new');
          if (!newUpd) throw new Error('Missing stream-new');
          expect(JSON.parse(newUpd.value.toString('utf8'))).toBe('new-stream-value');
          done();
        }
      };

      call.on('data', (update: any) => {
        receivedUpdates.push(update as StateUpdate);
        snapshotReceived++;
        checkDone();
      });

      call.on('error', (err: any) => done.fail(err as any));

      setTimeout(() => {
        stateStore.set('stream-new', 'new-stream-value');
      }, 300);
    }, 10000);

    test('filters updates by prefix', (done) => {
      const client = createAgentServiceClient(TEST_PORT);
      stateStore.set('filter-a', 'a-value');
      stateStore.set('filter-b', 'b-value');
      stateStore.set('other-c', 'c-value');

      const call = client.streamStateUpdates({ client_id: 'filter-client', filter_prefix: 'filter-' });
      const receivedKeys = new Set<string>();
      
      call.on('data', (update: any) => {
        receivedKeys.add(update.key);
        if (receivedKeys.size === 2) {
          call.cancel();
          expect(receivedKeys.has('filter-a')).toBe(true);
          expect(receivedKeys.has('filter-b')).toBe(true);
          expect(receivedKeys.has('other-c')).toBe(false);
          done();
        }
      });

      call.on('error', (err: any) => done.fail(err as any));
    }, 8000);
  });

  describe('GetSystemHealth', () => {
    test('returns healthy status', (done) => {
      const client = createAgentServiceClient(TEST_PORT);
      client.getSystemHealth({}, (err: any, response: any) => {
        if (err) return done.fail(err as any);
        const resp = response as HealthResponse;
        expect(resp.status).toBe('healthy');
        expect(resp.timestamp).toBeGreaterThan(0);
        expect(typeof resp.tool_count).toBe('number');
        expect(typeof resp.active_agents).toBe('number');
        done();
      });
    }, 5000);
  });

  describe('ExecuteTool', () => {
    test('executes tool successfully', (done) => {
      const client = createAgentServiceClient(TEST_PORT);
      client.executeTool(
        { tool_name: 'test_tool', input_data: Buffer.from(JSON.stringify({ param: 'value' })) },
        (err: any, response: any) => {
          if (err) return done.fail(err as any);
          const resp = response as ExecuteToolResponse;
          expect(resp.success).toBe(true);
          expect(resp.result_data).toBeInstanceOf(Buffer);
          done();
        }
      );
    }, 5000);

    test('handles invalid tool', (done) => {
      const client = createAgentServiceClient(TEST_PORT);
      client.executeTool(
        { tool_name: 'unknown_tool_xyz', input_data: Buffer.from(JSON.stringify({})) },
        (err: any, response: any) => {
          const resp = response as ExecuteToolResponse;
          expect(resp.success).toBe(false);
          expect(resp.error_message).toBeDefined();
          done();
        }
      );
    }, 5000);
  });

  describe('StreamMetrics', () => {
    test('streams periodic metrics', (done) => {
      const client = createAgentServiceClient(TEST_PORT);
      const call = client.streamMetrics({ interval_ms: 200 });
      const receivedMetrics: MetricsData[] = [];
      
      call.on('data', (metric: any) => {
        receivedMetrics.push(metric as MetricsData);
        if (receivedMetrics.length >= 3) {
          call.cancel();
          expect(receivedMetrics.length).toBeGreaterThanOrEqual(3);
          for (let i = 1; i < receivedMetrics.length; i++) {
            expect(receivedMetrics[i].timestamp).toBeGreaterThanOrEqual(receivedMetrics[i-1].timestamp);
          }
          done();
        }
      });

      call.on('error', (err: any) => done.fail(err as any));
    }, 5000);
  });

  describe('Concurrent Clients', () => {
    test('multiple clients can publish concurrently', (done) => {
      const client1 = createAgentServiceClient(TEST_PORT);
      const client2 = createAgentServiceClient(TEST_PORT);
      const key = 'concurrent-key';

      client1.publishState(
        { key: `${key}-1`, value: Buffer.from(JSON.stringify({ from: 'c1' })), source: 'c1', timestamp: Date.now() },
        (err: any, res1: any) => {
          if (err) return done.fail(err as any);
          client2.publishState(
            { key: `${key}-2`, value: Buffer.from(JSON.stringify({ from: 'c2' })), source: 'c2', timestamp: Date.now() },
            (err2: any, res2: any) => {
              const resp2 = res2 as StateUpdateResponse;
              expect(resp2.accepted).toBe(true);
              const stored1 = stateStore.get(`${key}-1`) as any;
              const stored2 = stateStore.get(`${key}-2`) as any;
              expect(stored1?.from).toBe('c1');
              expect(stored2?.from).toBe('c2');
              done();
            }
          );
        }
      );
    }, 5000);
  });
});
