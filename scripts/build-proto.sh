#!/bin/bash
echo "Compiling proto files..."

# 检查必要的工具
if ! command -v protoc &> /dev/null; then
    echo "Error: protoc not found. Please install protobuf compiler."
    exit 1
fi

if ! command -v protoc-gen-ts &> /dev/null; then
    echo "Error: protoc-gen-ts not found. Please install ts-protoc-gen."
    exit 1
fi

# 创建输出目录
mkdir -p src/generated

# 编译所有proto文件
for proto_file in ./protos/*.proto; do
    echo "Compiling $proto_file..."
    protoc \
      --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
      --ts_out=./src/generated \
      --proto_path=./protos \
      "$proto_file"
done

echo "Proto compilation completed!"
