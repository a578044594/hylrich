import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { GRPCService } from '../../src/protocols/grpc/GRPCService';
import { DistributedStateStore } from '../../src/state/DistributedStateStore';
import { EventBus } from '../../src/core/EventBus';

// Helper to create gRPC client from proto
function createAgentServiceClient(port: number) {
  const protoPath = join(process.cwd(), 'src', 'protos', 'agent.proto');
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const proto = grpc.loadPackageDefinition(packageDefinition) as any;
  const AgentService = proto.openclaw.agent.AgentService;
  return new AgentService(
    `localhost:${port}`,
    grpc.credentials.createInsecure()
  );
}

describe('gRPC StateSync Integration', () => {
  let service: GRPCService;
  let stateStore: DistributedStateStore;
  let eventBus: EventBus;
  const TEST_PORT = 50052;
  const CLIENT_ID = 'integration-client-1';

  beforeAll(async () => {
    stateStore = new DistributedStateStore({ nodeId: 'server-node' });
    eventBus = new EventBus();

    service = new GRPCService({
      port: TEST_PORT,
      stateStore,
      // Explicit proto path to avoid loading issues
      protoPath: join(process.cwd(), 'src', 'protos', 'agent.proto'),
    });
    await service.start();
  }, 15000);

  afterAll(async () => {
    await service.stop();
  });

  test('GetCurrentState returns snapshot', async (done) => {
    stateStore.set('snapshot-key-1', { value: 100 });
    stateStore.set('snapshot-key-2', [1, 2, 3]);

    const client = createAgentServiceClient(TEST_PORT);
    const call = client.getCurrentState({ filter_prefix: '' }, (err: any, response: any) => {
      if (err) return done.fail(err);
      try {
        const state: Record<string, any> = {};
        for (const [key, buf] of Object.entries(response.state)) {
          state[key] = JSON.parse(buf.toString('utf8'));
        }
        expect(state).toHaveProperty('snapshot-key-1');
        expect(state['snapshot-key-1'].value).toBe(100);
        expect(state).toHaveProperty('snapshot-key-2');
        expect(state['snapshot-key-2']).toEqual([1, 2, 3]);
        done();
      } catch (e: any) {
        done.fail(e);
      }
    });
  }, 5000);

  test('PublishState updates store', (done) => {
    const client = createAgentServiceClient(TEST_PORT);
    const key = 'published-key';
    const value = { nested: true, count: 5 };
    
    client.publishState(
      {
        key,
        value: Buffer.from(JSON.stringify(value)),
        source: 'integration-client',
        timestamp: Date.now(),
      },
      (err: any, response: any) => {
        if (err) return done.fail(err);
        expect(response.accepted).toBe(true);
        const stored = stateStore.get(key);
        expect(stored).toEqual(value);
        done();
      }
    );
  }, 5000);

  test('StreamStateUpdates delivers snapshot and future updates', (done) => {
    const client = createAgentServiceClient(TEST_PORT);
    stateStore.set('stream-initial', 'initial-value');

    const call = client.streamStateUpdates({
      client_id: CLIENT_ID,
      filter_prefix: '',
    });

    const receivedUpdates: any[] = [];

    call.on('data', (update: any) => {
      receivedUpdates.push(update);
      const keys = receivedUpdates.map(u => u.key);
      if (keys.includes('stream-initial') && keys.includes('stream-new')) {
        call.cancel();
        const initialUpdate = receivedUpdates.find(u => u.key === 'stream-initial');
        expect(initialUpdate).toBeDefined();
        expect(initialUpdate.operation).toBe('set');
        const initialVal = JSON.parse(initialUpdate.value.toString('utf8'));
        expect(initialVal).toBe('initial-value');

        const newUpdate = receivedUpdates.find(u => u.key === 'stream-new');
        expect(newUpdate).toBeDefined();
        expect(newUpdate.operation).toBe('set');
        const newVal = JSON.parse(newUpdate.value.toString('utf8'));
        expect(newVal).toBe('new-value');

        done();
      }
    });

    call.on('error', (err: any) => done.fail(err));

    // Push a new update after the stream is established.
    // Need to ensure the stream has time to set up; use small delay.
    setTimeout(() => {
      stateStore.set('stream-new', 'new-value');
    }, 200);
  }, 8000);
});
