const calculator = require("../server/protos/calculator_pb");
const calculatorService = require("../server/protos/calculator_grpc_pb");

const greet = require("../server/protos/greet_pb");
const greetService = require("../server/protos/greet_grpc_pb");

const blog = require("../server/protos/blog_pb");
const blogService = require("../server/protos/blog_grpc_pb");

const fs = require("fs");

const directors = require("./data/directors.json");

const process = require("process");
// Get the process ID (PID)
const pid = process.pid;

const grpc = require("@grpc/grpc-js");

const credentials = grpc.credentials.createSsl(
    fs.readFileSync("./certs/ca.crt"),
    fs.readFileSync("./certs/client.key"),
    fs.readFileSync("./certs/client.crt")
);

const unsafeCredentials = grpc.credentials.createInsecure();

function getRPCDeadline(rpcType) {
    // milliseconds
    timeAllowed = 5000;

    switch (rpcType) {
        case "Unary":
            timeAllowed = 5000;
            break;
        case "ServerStreaming":
            timeAllowed = 7000;
            break;
        case "ClientStreaming":
            timeAllowed = 6000;
            break;
        case "BiDiStreaming":
            timeAllowed = 8000;
            break;
        default:
            timeAllowed = 5000;
            break;
    }

    return new Date(Date.now() + timeAllowed);
}

function callListBlogs() {
    const client = new blogService.BlogServiceClient(
        "localhost:50051",
        unsafeCredentials
    );

    const request = new blog.ListBlogsRequest();

    const call = client.listBlogs(request, (error, response) => {});

    call.on("data", (response) => {
        console.log(
            "Client Streaming Response: ",
            response.getBlog().toString() + "\n"
        );
    });

    call.on("error", (error) => {
        console.error(error);
    });

    call.on("end", () => {});
}

function callCreateBlog() {
    const client = new blogService.BlogServiceClient(
        "localhost:50051",
        unsafeCredentials
    );

    const newBlog = new blog.Blog();
    newBlog.setAuthor("Stephane Maarek");
    newBlog.setTitle("New Blog!");
    newBlog.setContent("Hello, World! This is my first blog post!");

    const request = new blog.CreateBlogRequest();
    request.setBlog(newBlog);

    client.createBlog(request, (error, response) => {
        if (!error) {
            console.log(
                "Received create blog response",
                response.getBlog().toString()
            );
        } else {
            console.error(error);
        }
    });
}

function callReadBlog(blogId) {
    const client = new blogService.BlogServiceClient(
        "localhost:50051",
        unsafeCredentials
    );

    const request = new blog.ReadBlogRequest();

    request.setBlogId(blogId);

    client.readBlog(request, (error, response) => {
        if (!error) {
            console.log("Blog: " + response.getBlog().toString());
        } else {
            if (error.code === grpc.status.NOT_FOUND) {
                console.log(`Blog with id ${blogId} does not exist`);
            } else {
                console.log(error);
            }
        }
    });
}

function callUpdateBlog(blogId) {
    const client = new blogService.BlogServiceClient(
        "localhost:50051",
        unsafeCredentials
    );

    const request = new blog.UpdateBlogRequest();

    const newBlog = new blog.Blog();
    newBlog.setId(blogId);
    newBlog.setAuthor("Charlie Brown");
    newBlog.setTitle("My First Blog (edited)");
    newBlog.setContent(
        "This is the content of my blog! I have updated this blog post!"
    );

    request.setBlog(newBlog);

    client.updateBlog(request, (error, response) => {
        if (!error) {
            console.log("Updated Blog: ", response.getBlog().toString());
        } else {
            if (error.code === grpc.status.NOT_FOUND) {
                console.log(`Blog with id ${blogId} does not exist`);
            } else {
                console.error(error);
            }
        }
    });
}

function callDeleteBlog(blogId) {
    const client = new blogService.BlogServiceClient(
        "localhost:50051",
        unsafeCredentials
    );

    const request = new blog.DeleteBlogRequest();
    request.setBlogId(blogId);

    client.deleteBlog(request, (error, response) => {
        if (!error) {
            console.log(`Deleted blog with id ${response.getBlogId()}`);
        } else {
            if (error.code == grpc.status.NOT_FOUND) {
                console.log(`Blog with id ${blogId} does not exist`);
            } else {
                console.error(error);
            }
        }
    });
}

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
        unsafeCredentials
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

function callSquareRoot(number) {
    const deadline = getRPCDeadline("Unary");

    const client = new calculatorService.CalculatorServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    const request = new calculator.SquareRootRequest();
    request.setNumber(number);

    client.squareRoot(request, { deadline: deadline }, (error, response) => {
        if (!error) {
            console.log(`Square Root Result: ${response.getSquareRoot()}`);
        } else {
            console.error(error.message);
        }
    });
}

async function callFindMaximum() {
    const client = new calculatorService.CalculatorServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    const request = new calculator.FindMaximumRequest();

    const call = client.findMaximum(request, (error, response) => {});

    call.on("data", (response) => {
        console.log(`New Maximum is ${response.getMaximum()}`);
    });

    call.on("error", (error) => {
        console.error(error);
    });

    call.on("end", () => {
        console.log("Server is completed sending messages!");
    });

    data = [3, 6, 17, 9, 8, 30];
    for (let idx = 0; idx < data.length; idx++) {
        const request = new calculator.FindMaximumRequest();
        request.setNumber(data[idx]);

        console.log(`Sending the number ${data[idx]}`);

        call.write(request);

        await sleep(1000);
    }

    call.end();
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

function callComputeAverage(numbers) {
    const client = new calculatorService.CalculatorServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    const request = new calculator.ComputeAverageRequest();

    const call = client.computeAverage(request, (error, response) => {
        if (!error) {
            console.log("Average: " + response.getAverage());
        } else {
            console.error(error);
        }
    });

    numbers.forEach((number, index) => {
        const request = new calculator.ComputeAverageRequest();
        request.setNumber(number);

        console.log("Sent Number: " + number);

        call.write(request);

        if (index == numbers.length - 1) {
            call.end(); // we have sent all the numbers
        }
    });
}

async function sleep(interval) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), interval);
    });
}

async function callGreetEveryone() {
    const client = new greetService.GreetServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    const request = new greet.GreetEveryoneRequest();

    const call = client.greetEveryone(request, (error, response) => {
        if (!error) {
            console.log("Server Response: " + response);
        } else {
            console.error(error);
        }
    });

    call.on("data", (response) => {
        console.log("Hello ! " + response.getResult());
    });

    call.on("error", (error) => {
        console.error(error);
    });

    call.on("end", () => {
        console.log("Client The End");
    });

    for (let i = 0; i < 10; i++) {
        const greeting = new greet.Greeting();
        greeting.setFirstName("Jennie");
        greeting.setLastName("Ruby Jane");

        const request = new greet.GreetEveryoneRequest();
        request.setGreeting(greeting);

        call.write(request);

        await sleep(1000);
    }

    call.end();
}

function main() {
    // callCreateBlog();
    // callListBlogs();
    // callReadBlog(30);
    // callUpdateBlog(5);
    // callDeleteBlog(4);
}

main();
