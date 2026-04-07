// 基础集成测试

import { FileReadTool } from '../../tools/FileReadTool';
import { FileWriteTool } from '../../tools/FileWriteTool';

describe('Basic Integration Test', () => {
  let fileReadTool: FileReadTool;
  let fileWriteTool: FileWriteTool;

  beforeEach(() => {
    // 初始化工具
    fileReadTool = new FileReadTool();
    fileWriteTool = new FileWriteTool();
  });

  test('should perform file read/write operations', async () => {
    // 测试基础文件操作
    const testContent = 'Phase 6 Development Test Content';
    
    // 写入文件
    const writeResult = await fileWriteTool.execute({
      path: 'integration_test.txt',
      content: testContent
    });
    
    expect(writeResult.success).toBe(true);
    expect(writeResult.path).toBe('integration_test.txt');

    // 读取文件
    const readResult = await fileReadTool.execute({
      path: 'integration_test.txt'
    });
    
    expect(readResult.success).toBe(true);
    expect(readResult.content).toBe(testContent);

    console.log('Basic integration test passed');
  });

  test('should handle file read errors', async () => {
    // 测试文件读取错误处理
    const result = await fileReadTool.execute({
      path: 'nonexistent_file.txt'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('文件');

    console.log('File read error handling test passed');
  });

  test('should handle concurrent file operations', async () => {
    // 测试并发文件操作
    const promises = [];
    
    for (let i = 0; i < 3; i++) {
      promises.push(
        fileWriteTool.execute({
          path: `concurrent_test_${i}.txt`,
          content: `Concurrent test ${i}`
        })
      );
    }

    const results = await Promise.all(promises);
    
    results.forEach((result, i) => {
      expect(result.success).toBe(true);
      expect(result.path).toBe(`concurrent_test_${i}.txt`);
    });

    console.log('Concurrent file operations test passed');
  });

  test('should demonstrate performance with multiple operations', async () => {
    // 测试多操作性能
    const startTime = Date.now();
    
    // 执行多个操作
    for (let i = 0; i < 5; i++) {
      await fileWriteTool.execute({
        path: `perf_test_${i}.txt`,
        content: `Performance test ${i}`
      });
      
      await fileReadTool.execute({
        path: `perf_test_${i}.txt`
      });
    }
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`Performance test passed - Execution time: ${executionTime}ms`);
    expect(executionTime).toBeGreaterThan(0);
  });

  test('should handle different content types', async () => {
    // 测试不同类型的内容
    const testContents = [
      'Simple text content',
      'Content with special chars: !@#$%^&*()',
      'Multi-line content\nLine 2\nLine 3',
      'Very long content '.repeat(10),
      'Content with unicode: 中文测试 🚀'
    ];

    for (let i = 0; i < testContents.length; i++) {
      const writeResult = await fileWriteTool.execute({
        path: `content_test_${i}.txt`,
        content: testContents[i]
      });
      
      expect(writeResult.success).toBe(true);

      const readResult = await fileReadTool.execute({
        path: `content_test_${i}.txt`
      });
      
      expect(readResult.success).toBe(true);
      expect(readResult.content).toBe(testContents[i]);
    }

    console.log('Different content types test passed');
  });
});
