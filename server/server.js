const calculator = require("./protos/calculator_pb");
const service = require("./protos/calculator_grpc_pb");

const grpc = require("@grpc/grpc-js");

/*
    Implements the sum RPC method.
*/
function sum(call, callback) {
    const sumResponse = new calculator.SumResponse();
    sumResponse.setNumber(
        call.request.getFirstNumber() + call.request.getSecondNumber()
    );
    callback(null, sumResponse);
}

function main() {
    const server = new grpc.Server();
    server.addService(service.CalculatorServiceService, { sum: sum });
    server.bindAsync(
        "127.0.0.1:50051",
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
            if (err != null) {
                return console.error(err);
            }
            console.log(`gRPC Server listening on ${port}`);
        }
    );
}

main();
