const calculator = require("../server/protos/calculator_pb");
const service = require("../server/protos/calculator_grpc_pb");

const grpc = require("@grpc/grpc-js");

function main() {
    const client = new service.CalculatorServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    const request = new calculator.SumRequest();

    request.setFirstNumber(300);
    request.setSecondNumber(1);

    client.sum(request, (error, response) => {
        if (!error) {
            console.log(`Sum Result: ${response.getNumber()}`);
        } else {
            console.error(error);
        }
    });
}

main();
