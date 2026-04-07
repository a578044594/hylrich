#!/bin/bash
echo "Building Hylrich..."

# 先编译proto文件
if [ -f "scripts/build-proto.sh" ]; then
    bash scripts/build-proto.sh
fi

# 然后编译TypeScript
npx tsc

echo "Build completed!"
