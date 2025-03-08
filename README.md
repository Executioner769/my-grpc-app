- Command to generate the protobuf code. Replace the greet.proto with required file_name.proto
```bash
protoc -I=. ./protos/greet.proto \                       
  --js_out=import_style=commonjs,binary:./server \
  --grpc_out=./server \
  --plugin=protoc-gen-js=`which protoc-gen-js` \
  --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin`
```
