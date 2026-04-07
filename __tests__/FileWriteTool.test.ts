import { FileWriteTool } from '../src/tools/FileWriteTool';
import fs from 'fs/promises';

// Mock fs module
jest.mock('fs/promises');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('FileWriteTool', () => {
  let fileWriteTool: FileWriteTool;

  beforeEach(() => {
    fileWriteTool = new FileWriteTool();
    jest.clearAllMocks();
  });

  test('should be created with correct name and description', () => {
    expect(fileWriteTool.name).toBe('file_write');
    expect(fileWriteTool.description).toBe('写入文件内容工具');
  });

  test('should have defined parameters schema', () => {
    expect(fileWriteTool.parameters).toBeDefined();
    expect(fileWriteTool.parameters.type).toBe('object');
    expect(fileWriteTool.parameters.properties).toBeDefined();
    expect(fileWriteTool.parameters.properties.filePath).toBeDefined();
    expect(fileWriteTool.parameters.properties.content).toBeDefined();
    expect(fileWriteTool.parameters.properties.encoding).toBeDefined();
  });

  test('should write file successfully', async () => {
    const content = 'file content';
    const mockStats = { size: Buffer.from(content, 'utf8').length };
    
    mockedFs.writeFile.mockResolvedValue(undefined);
    mockedFs.stat.mockResolvedValue(mockStats as any);

    const result = await fileWriteTool.execute({
      filePath: 'test.txt',
      content: content,
      encoding: 'utf8'
    });

    expect(result).toEqual({
      success: true,
      filePath: 'test.txt',
      bytesWritten: mockStats.size
    });

    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      'test.txt',
      content,
      { encoding: 'utf8' }
    );
  });

  test('should handle write error', async () => {
    const error = new Error('Write permission denied');
    (error as any).code = 'EACCES';
    
    mockedFs.writeFile.mockRejectedValue(error);

    await expect(fileWriteTool.execute({
      filePath: 'restricted.txt',
      content: 'test content'
    })).rejects.toThrow('没有权限写入文件: restricted.txt');
  });

  test('should handle general write error', async () => {
    const error = new Error('Disk full');
    
    mockedFs.writeFile.mockRejectedValue(error);

    await expect(fileWriteTool.execute({
      filePath: 'test.txt',
      content: 'test content'
    })).rejects.toThrow('写入文件失败: Disk full');
  });

  test('should validate file path security', async () => {
    await expect(fileWriteTool.execute({
      filePath: '../sensitive.txt',
      content: 'secret'
    })).rejects.toThrow('无效的文件路径');

    await expect(fileWriteTool.execute({
      filePath: '/etc/passwd',
      content: 'malicious'
    })).rejects.toThrow('无效的文件路径');
  });

  test('should validate input parameters', async () => {
    await expect(fileWriteTool.execute({} as any)).rejects.toThrow('文件路径必须是非空字符串');
    
    await expect(fileWriteTool.execute({
      filePath: ''
    } as any)).rejects.toThrow('文件路径必须是非空字符串');

    await expect(fileWriteTool.execute({
      filePath: 'test.txt',
      content: ''
    })).rejects.toThrow('内容必须是非空字符串');
  });

  test('should calculate bytes written correctly', async () => {
    const content = '测试内容';
    const byteLength = Buffer.from(content, 'utf8').length;
    const mockStats = { size: byteLength };
    
    mockedFs.writeFile.mockResolvedValue(undefined);
    mockedFs.stat.mockResolvedValue(mockStats as any);

    const result = await fileWriteTool.execute({
      filePath: 'test.txt',
      content: content,
      encoding: 'utf8'
    });

    expect(result.bytesWritten).toBe(byteLength);
  });
});
