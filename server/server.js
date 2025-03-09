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

function computeAverage(call, callback) {
    let sum = 0,
        count = 0;
    call.on("data", (request) => {
        const number = request.getNumber();
        console.log(`Received Number ${count}: ${number}`);
        sum += number;
        count++;
    });

    call.on("error", (error) => {
        console.error(error);
    });

    call.on("end", () => {
        const response = new calculator.ComputeAverageResponse();
        const average = sum / count;
        response.setAverage(average);

        callback(null, response);
    });
}

function findMaximum(call, callback) {
    let maximum = -1,
        number = 0;
    call.on("data", (request) => {
        number = request.getNumber();
        console.log("Received: " + number);

        if (number > maximum) {
            maximum = number;

            const response = new calculator.FindMaximumResponse();
            response.setMaximum(maximum);

            call.write(response);
        } else {
            // do nothing
        }
    });

    call.on("error", (error) => {
        console.error(error);
    });

    call.on("end", () => {
        call.end();
        console.log("I am done with my Job!");
    });
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

function longGreet(call, callback) {
    call.on("data", (request) => {
        const fullName =
            request.getGreeting().getFirstName() +
            " " +
            request.getGreeting().getLastName();

        console.log("Hello " + fullName);
    });

    call.on("error", (error) => {
        console.error(error);
    });

    call.on("end", () => {
        const response = new greet.LongGreetResponse();
        response.setResult("Long greet client streaming ...");

        callback(null, response);
    });
}

async function sleep(interval) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), interval);
    });
}

async function greetEveryone(call, callback) {
    call.on("data", (response) => {
        const fullName =
            response.getGreeting().getFirstName() +
            " " +
            response.getGreeting().getLastName();

        console.log(`Hello ${fullName}`);
    });

    call.on("error", (error) => {
        console.error(error);
    });

    call.on("end", () => {
        console.log("Server The End");
    });

    for (let i = 0; i < 10; ++i) {
        const response = new greet.GreetEveryoneResponse();
        response.setResult("Lalisa Manobal");

        call.write(response);
        await sleep(1500);
    }

    call.end();
}

function main() {
    const server = new grpc.Server();
    server.addService(calculatorService.CalculatorServiceService, {
        sum: sum,
        primeNumberDecomposition: primeNumberDecomposition,
        computeAverage: computeAverage,
        findMaximum: findMaximum,
    });
    server.addService(greetService.GreetServiceService, {
        greetManyTimes: greetManyTimes,
        longGreet: longGreet,
        greetEveryone: greetEveryone,
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
