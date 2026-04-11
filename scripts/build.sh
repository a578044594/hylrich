#!/bin/bash
echo "Building Hylrich..."

# 暂时跳过proto编译
# if [ -f "scripts/build-proto.sh" ]; then
#     bash scripts/build-proto.sh
# fi

# 编译TypeScript
npx tsc

echo "Build completed!"
