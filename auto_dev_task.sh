#!/bin/bash

# Hylrich自动开发任务脚本

echo "Starting Hylrich development tasks..."

# 1. 检查项目状态
echo "Checking project status..."
git status

# 2. 更新依赖
echo "Updating dependencies..."
npm install

# 3. 运行测试
echo "Running tests..."
npm test

# 4. 构建项目
echo "Building project..."
npm run build

# 5. 检查日志
echo "Checking logs..."
tail -n 20 auto_dev_task.log

# 6. 记录状态
echo "Recording task completion"
date >> auto_dev_task.log
echo "------------------------" >> auto_dev_task.log

echo "Development tasks completed successfully!"
