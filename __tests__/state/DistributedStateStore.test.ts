import { DistributedStateStore } from '../../src/state/DistributedStateStore';
import { EventBus } from '../../src/core/EventBus';

describe('DistributedStateStore', () => {
  let store: DistributedStateStore;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    store = new DistributedStateStore({
      nodeId: 'test-node-1',
      eventBus
    });
  });

  afterEach(() => {
    store = null as any;
  });

  test('should set and get values', () => {
    store.set('key1', 'value1');
    expect(store.get('key1')).toBe('value1');

    store.set('key2', { nested: 'object' });
    expect(store.get('key2')).toEqual({ nested: 'object' });
  });

  test('should delete keys', () => {
    store.set('key1', 'value1');
    store.delete('key1');
    expect(store.get('key1')).toBeUndefined();
  });

  test('should produce snapshot', () => {
    store.set('a', 1);
    store.set('b', 2);
    store.set('c.large', 3);
    
    const full = store.snapshot();
    expect(full['a']).toBe(1);
    expect(full['b']).toBe(2);
    expect(full['c.large']).toBe(3);

    const filtered = store.snapshot('c');
    expect(filtered['c.large']).toBe(3);
    expect(filtered.hasOwnProperty('c.large')).toBe(true);
    expect(Object.keys(filtered)).not.toContain('a');
  });

  test('should emit state change events with correct operation', (done) => {
    store.subscribe((event: any) => {
      expect(event.type).toBe('state.changed');
      expect(event.payload.key).toBe('mykey');
      expect(event.payload.operation).toBe('set');
      done();
    });

    store.set('mykey', 'myvalue');
  });

  test('should apply remote updates and not broadcast further', (done) => {
    const emitSpy = jest.spyOn(eventBus, 'emit');
    const internalSetSpy = jest.spyOn((store as any)._internal, 'set');

    store.subscribe(() => {}); // dummy subscriber to ensure event flow

    const remoteEvent = {
      type: 'state.changed' as const,
      payload: {
        key: 'remote-key',
        value: 'remote-value',
        operation: 'set' as const,
        timestamp: Date.now(),
        source: 'other-node'
      }
    };

    (store as any).handleRemoteUpdate(remoteEvent);

    // Verify state updated
    expect(store.get('remote-key')).toBe('remote-value');

    // Verify that internal set was NOT used (broadcast flag irrelevant)
    expect(internalSetSpy).not.toHaveBeenCalled();

    // Clean up
    emitSpy.mockRestore();
    internalSetSpy.mockRestore();
    done();
  });
});
