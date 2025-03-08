const calculator = require("../server/protos/calculator_pb");
const calculatorService = require("../server/protos/calculator_grpc_pb");

const greet = require("../server/protos/greet_pb");
const greetService = require("../server/protos/greet_grpc_pb");

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

function main() {}

main();
