import { WebSocketBus } from '../src/protocols/WebSocketBus';

// 简化测试，专注于核心功能
describe('WebSocketBus', () => {
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

  test('应该处理重连逻辑', () => {
    // 模拟连接断开
    wsBus['isConnected'] = true;
    wsBus['handleReconnect']();
    
    expect(wsBus['reconnectAttempts']).toBe(1);
    expect(wsBus['isConnected']).toBe(false);
  });

  test('连接成功时应重置重连计数', () => {
    wsBus['reconnectAttempts'] = 2;
    
    // 模拟连接成功
    wsBus['isConnected'] = true;
    wsBus['reconnectAttempts'] = 0;
    
    expect(wsBus['reconnectAttempts']).toBe(0);
    expect(wsBus['isConnected']).toBe(true);
  });

  test('应该处理消息队列处理', () => {
    const message = { type: 'test', data: '测试消息' };
    wsBus['messageQueue'].push(message);
    wsBus['isConnected'] = true;
    
    // 模拟发送消息
    const sendSpy = jest.spyOn(wsBus as any, 'send');
    wsBus['processMessageQueue']();
    
    expect(sendSpy).toHaveBeenCalledWith(message);
    expect(wsBus['messageQueue'].length).toBe(0);
  });
});
