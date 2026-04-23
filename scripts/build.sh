#!/bin/bash
echo "Building Hylrich..."

# 复制proto文件到dist目录
if [ -d "protos" ]; then
  mkdir -p dist/protos
  cp -r protos/* dist/protos/
  echo "Proto files copied to dist/protos/"
fi

# 编译TypeScript
npx tsc

echo "Build completed!"
