import { FileReadTool } from '../../src/tools/FileReadTool';
import { FileWriteTool } from '../../src/tools/FileWriteTool';
import { BasicMetricsCollector } from '../../src/monitoring/BasicMetricsCollector';
import fs from 'fs/promises';

// 端到端测试：工具执行流程
describe('端到端测试 - 工具执行流程', () => {
  let fileReadTool: FileReadTool;
  let fileWriteTool: FileWriteTool;
  let metricsCollector: BasicMetricsCollector;

  beforeEach(() => {
    fileReadTool = new FileReadTool();
    fileWriteTool = new FileWriteTool();
    metricsCollector = new BasicMetricsCollector();
  });

  test('应该完成文件读写完整流程', async () => {
    // 1. 创建测试文件
    const testContent = 'Hello, E2E测试!';
    await fileWriteTool.execute({
      filePath: './test_e2e.txt',
      content: testContent
    });

    // 2. 读取测试文件
    const readResult = await fileReadTool.execute({
      filePath: './test_e2e.txt'
    });
    
    expect(readResult.content).toBe(testContent);
    expect(readResult.fileSize).toBeGreaterThan(0);

    // 3. 验证监控指标
    const metrics = metricsCollector.collectMetrics();
    expect(metrics).toBeDefined();

    // 4. 清理测试文件 - 删除文件而不是写入空内容
    await fs.unlink('./test_e2e.txt').catch(() => {});
  });

  test('应该处理文件不存在错误', async () => {
    await expect(fileReadTool.execute({
      filePath: './nonexistent_file.txt'
    })).rejects.toThrow('文件不存在');
  });

  test('应该记录执行指标', async () => {
    const testContent = '性能测试内容';
    
    // 记录开始时间
    const startTime = Date.now();
    
    // 执行文件写入
    await fileWriteTool.execute({
      filePath: './performance_test.txt',
      content: testContent
    });
    
    // 记录执行时间指标
    const executionTime = Date.now() - startTime;
    metricsCollector.recordMetric('file_write_time', executionTime);

    // 验证指标记录
    const metrics = metricsCollector.collectMetrics();
    expect(metrics.file_write_time).toBeDefined();
    expect(metrics.file_write_time.count).toBe(1);
    expect(metrics.file_write_time.max).toBeGreaterThanOrEqual(0);

    // 清理 - 删除文件
    await fs.unlink('./performance_test.txt').catch(() => {});
  });
});
