const calculator = require("../server/protos/calculator_pb");
const calculatorService = require("../server/protos/calculator_grpc_pb");

const greet = require("../server/protos/greet_pb");
const greetService = require("../server/protos/greet_grpc_pb");

const directors = require("./data/directors.json");

const process = require("process");
// Get the process ID (PID)
const pid = process.pid;

const grpc = require("@grpc/grpc-js");

function callGreetManyTimes(firstName, lastName) {
    const client = new greetService.GreetServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    const request = new greet.GreetManyTimesRequest();

    const greeting = new greet.Greeting();
    greeting.setFirstName(firstName);
    greeting.setLastName(lastName);

    request.setGreeting(greeting);

    const call = client.greetManyTimes(request, () => {});

    call.on("data", (response) => {
        console.log("Client Streaming Response: ", response.getResult());
    });

    call.on("status", (status) => {
        console.log(status);
    });

    call.on("error", (error) => {
        console.error(error);
    });

    call.on("end", () => {
        console.log("Streaming Ended!");
    });
}

function callLongGreet(category, names) {
    const client = new greetService.GreetServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    const request = new greet.LongGreetRequest();

    const call = client.longGreet(request, (error, response) => {
        if (!error) {
            console.log("Server Response: ", response.getResult());
        } else {
            console.error(error);
        }
    });

    names.forEach(function (name, index) {
        setTimeout(function () {
            const greeting = new greet.Greeting();
            greeting.setFirstName(name.firstName);
            greeting.setLastName(name.lastName);

            const request = new greet.LongGreetRequest();
            request.setGreeting(greeting);

            console.log(
                `${pid}: ${category}: ${name.firstName} ${name.lastName}`
            );

            call.write(request);

            if (index === names.length - 1) {
                console.log("Streaming Ended!");
                call.end(); // we have sent all the messages
            }
        }, 500 * index);
    });
}

function callSum(num1, num2) {
    const client = new calculatorService.CalculatorServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    const request = new calculator.SumRequest();

    request.setFirstNumber(num1);
    request.setSecondNumber(num2);

    let result = 0;
    client.sum(request, (error, response) => {
        if (!error) {
            console.log(`Sum Result: ${response.getNumber()}`);
            result = response.getNumber();
        } else {
            console.error(error);
        }
    });

    return result;
}

function callPrimeNumberDecomposition(number) {
    const client = new calculatorService.CalculatorServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    const request = new calculator.PrimeNumberDecompositionRequest();
    request.setNumber(number);

    const call = client.primeNumberDecomposition(request, () => {});

    call.on("data", (response) => {
        console.log("Prime Factor: " + response.getPrimeFactor());
    });

    call.on("status", (status) => {
        console.log(status);
    });

    call.on("error", (error) => {
        console.error(error);
    });

    call.on("end", () => {
        console.log("Streaming Ended!");
    });
}

function main() {
    callLongGreet("directors", directors);
}

main();
