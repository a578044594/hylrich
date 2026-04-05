import { HylrichCore } from "../src/index";
import { FileReadTool } from "../src/tools/FileReadTool";
import { FileWriteTool } from "../src/tools/FileWriteTool";

async function main() {
  console.log("🧪 Hylrich 基本使用示例\n");
  
  // 创建Hylrich核心实例
  const hylrich = new HylrichCore();
  
  // 注册工具
  const fileReadTool = new FileReadTool();
  const fileWriteTool = new FileWriteTool();
  
  hylrich.registerTool(fileReadTool);
  hylrich.registerTool(fileWriteTool);
  
  console.log("✅ 工具注册完成\n");
  
  try {
    // 示例1: 写入文件
    console.log("📝 示例1: 写入文件");
    const writeResult = await hylrich.scheduleTask("file_write", {
      filePath: "test-example.txt",
      content: "Hello, Hylrich! 这是Hylrich系统的第一个测试文件。\n生成时间: " + new Date().toISOString(),
      encoding: "utf8"
    });
    
    console.log(`✅ 文件写入成功:`);
    console.log(`   文件路径: ${writeResult.filePath}`);
    console.log(`   写入字节: ${writeResult.bytesWritten}`);
    console.log();
    
    // 示例2: 读取文件
    console.log("📖 示例2: 读取文件");
    const readResult = await hylrich.scheduleTask("file_read", {
      filePath: "test-example.txt",
      encoding: "utf8"
    });
    
    console.log(`✅ 文件读取成功:`);
    console.log(`   文件大小: ${readResult.fileSize} bytes`);
    console.log(`   文件编码: ${readResult.encoding}`);
    console.log(`   内容预览: ${readResult.content.substring(0, 50)}...`);
    console.log();
    
    // 示例3: 获取统计信息
    console.log("📊 示例3: 系统统计");
    const stats = hylrich.getQueueStats();
    console.log(`任务队列状态:`);
    console.log(`   等待中: ${stats.pending}`);
    console.log(`   执行中: ${stats.running}`);
    console.log(`   已完成: ${stats.completed}`);
    console.log(`   Agent列表: ${stats.agents.join(", ")}`);
    console.log();
    
    const readStats = hylrich.getAgentStats("file_read");
    const writeStats = hylrich.getAgentStats("file_write");
    
    console.log("📈 Agent执行统计:");
    console.log(`   file_read - 总数: ${readStats.totalTasks}, 成功率: ${readStats.successRate.toFixed(1)}%`);
    console.log(`   file_write - 总数: ${writeStats.totalTasks}, 成功率: ${writeStats.successRate.toFixed(1)}%`);
    console.log();
    
    console.log("🎉 示例执行完成! 所有操作均为真实执行，无模拟内容。");
    
  } catch (error) {
    console.error("❌ 执行失败:", error.message);
  } finally {
    hylrich.shutdown();
  }
}

// 执行示例
main().catch(console.error);
