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

function primeNumberDecomposition(call, callback) {
    let number = call.request.getNumber();

    // validate the number
    // if number is less than 2, then we return -1
    if (number < 2) {
        let primeNumberDecompositionResponse =
            new calculator.PrimeNumberDecompositionResponse();
        primeNumberDecompositionResponse.setPrimeFactor(-1);
        call.write(primeNumberDecompositionResponse);
        call.end();

        return;
    }

    let divisor = 2;

    while (number > 1) {
        if (number % divisor === 0) {
            let primeNumberDecompositionResponse =
                new calculator.PrimeNumberDecompositionResponse();
            primeNumberDecompositionResponse.setPrimeFactor(divisor);
            call.write(primeNumberDecompositionResponse);

            number = number / divisor;
        } else {
            divisor++;
        }
    }

    call.end(); // we have sent all the prime factors
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
    server.addService(calculatorService.CalculatorServiceService, {
        sum: sum,
        primeNumberDecomposition: primeNumberDecomposition,
    });
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
