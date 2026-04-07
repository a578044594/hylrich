import { WebSocketBus } from '../src/protocols/WebSocketBus';

describe('WebSocketBus 基础功能', () => {
  let wsBus: WebSocketBus;

  beforeEach(() => {
    wsBus = new WebSocketBus({
      url: 'ws://localhost:8080',
      reconnectInterval: 1000,
      maxReconnectAttempts: 3
    });
  });

  afterEach(() => {
    wsBus.disconnect();
  });

  test('应该正确创建并配置', () => {
    expect(wsBus).toBeInstanceOf(WebSocketBus);
    expect(wsBus['config'].url).toBe('ws://localhost:8080');
    expect(wsBus['config'].reconnectInterval).toBe(1000);
    expect(wsBus['config'].maxReconnectAttempts).toBe(3);
  });

  test('未连接时应将消息加入队列', () => {
    const message = { type: 'test', data: '测试消息' };
    
    wsBus.send(message);
    expect(wsBus['messageQueue'].length).toBe(1);
    expect(wsBus['messageQueue'][0]).toEqual(message);
  });

  test('断开连接时应清空消息队列', () => {
    const message = { type: 'test', data: '测试消息' };
    
    wsBus.send(message);
    expect(wsBus['messageQueue'].length).toBe(1);
    
    wsBus.disconnect();
    expect(wsBus['messageQueue'].length).toBe(0);
  });
});
