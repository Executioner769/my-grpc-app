const calculator = require("./protos/calculator_pb");
const calculatorService = require("./protos/calculator_grpc_pb");

const greet = require("./protos/greet_pb");
const greetService = require("./protos/greet_grpc_pb");

const grpc = require("@grpc/grpc-js");

function sum(call, callback) {
    const sumResponse = new calculator.SumResponse();
    sumResponse.setNumber(
        call.request.getFirstNumber() + call.request.getSecondNumber()
    );
    callback(null, sumResponse);
}

function greetManyTimes(call, callback) {
    const name =
        call.request.getGreeting().getFirstName() +
        " " +
        call.request.getGreeting().getLastName();

    let count = 0,
        intervalID = setInterval(function () {
            const greetManyTimesResponse = new greet.GreetManyTimesResponse();
            greetManyTimesResponse.setResult(name);

            // setup streaming
            call.write(greetManyTimesResponse);

            if (++count > 9) {
                clearInterval(intervalID);
                call.end(); // we have sent all messages!
            }
        }, 1000);
}

function main() {
    const server = new grpc.Server();
    server.addService(calculatorService.CalculatorServiceService, { sum: sum });
    server.addService(greetService.GreetServiceService, {
        greetManyTimes: greetManyTimes,
    });
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
