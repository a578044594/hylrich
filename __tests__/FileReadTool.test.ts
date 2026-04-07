import { FileReadTool } from '../src/tools/FileReadTool';
import fs from 'fs/promises';

// Mock fs module
jest.mock('fs/promises');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('FileReadTool', () => {
  let fileReadTool: FileReadTool;

  beforeEach(() => {
    fileReadTool = new FileReadTool();
    jest.clearAllMocks();
  });

  test('should be created with correct name and description', () => {
    expect(fileReadTool.name).toBe('file_read');
    expect(fileReadTool.description).toBe('读取文件内容工具');
  });

  test('should have defined parameters schema', () => {
    expect(fileReadTool.parameters).toBeDefined();
    expect(fileReadTool.parameters.type).toBe('object');
    expect(fileReadTool.parameters.properties).toBeDefined();
    expect(fileReadTool.parameters.properties.filePath).toBeDefined();
    expect(fileReadTool.parameters.properties.encoding).toBeDefined();
  });

  test('should read file successfully', async () => {
    const mockContent = 'file content';
    const mockStats = { size: 12 };
    
    mockedFs.readFile.mockResolvedValue(mockContent);
    mockedFs.stat.mockResolvedValue(mockStats as any);

    const result = await fileReadTool.execute({
      filePath: 'test.txt',
      encoding: 'utf8'
    });

    expect(result).toEqual({
      content: mockContent,
      fileSize: mockStats.size,
      encoding: 'utf8'
    });

    expect(mockedFs.readFile).toHaveBeenCalledWith('test.txt', { encoding: 'utf8' });
    expect(mockedFs.stat).toHaveBeenCalledWith('test.txt');
  });

  test('should handle file not found error', async () => {
    const error = new Error('File not found');
    (error as any).code = 'ENOENT';
    
    mockedFs.readFile.mockRejectedValue(error);

    await expect(fileReadTool.execute({
      filePath: 'nonexistent.txt'
    })).rejects.toThrow('文件不存在: nonexistent.txt');
  });

  test('should handle permission error', async () => {
    const error = new Error('Permission denied');
    (error as any).code = 'EACCES';
    
    mockedFs.readFile.mockRejectedValue(error);

    await expect(fileReadTool.execute({
      filePath: 'restricted.txt'
    })).rejects.toThrow('没有权限读取文件: restricted.txt');
  });

  test('should handle general read error', async () => {
    const error = new Error('General read error');
    
    mockedFs.readFile.mockRejectedValue(error);

    await expect(fileReadTool.execute({
      filePath: 'error.txt'
    })).rejects.toThrow('读取文件失败: General read error');
  });

  test('should validate file path security', async () => {
    await expect(fileReadTool.execute({
      filePath: '../sensitive.txt'
    })).rejects.toThrow('无效的文件路径');

    await expect(fileReadTool.execute({
      filePath: '/etc/passwd'
    })).rejects.toThrow('无效的文件路径');
  });

  test('should validate input parameters', async () => {
    await expect(fileReadTool.execute({} as any)).rejects.toThrow('文件路径必须是非空字符串');
    
    await expect(fileReadTool.execute({
      filePath: ''
    })).rejects.toThrow('文件路径必须是非空字符串');
  });
});
