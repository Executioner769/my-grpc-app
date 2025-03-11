const calculator = require("./protos/calculator_pb");
const calculatorService = require("./protos/calculator_grpc_pb");

const greet = require("./protos/greet_pb");
const greetService = require("./protos/greet_grpc_pb");

const proto_blog = require("./protos/blog_pb");
const blogService = require("./protos/blog_grpc_pb");

const grpc = require("@grpc/grpc-js");

const fs = require("fs");

// Knex Requires
const environment = process.env.NODE_ENV || "development";
const config = require("./knexfile")[environment];
const knex = require("knex")(config);

function listBlogs(call, callback) {
    // get all the blogs from the database
    knex("blogs")
        .select("*")
        .then((blogs) => {
            blogs.forEach((blog) => {
                const blogObject = new proto_blog.Blog();
                blogObject.setId(blog.id);
                blogObject.setAuthor(blog.author);
                blogObject.setTitle(blog.title);
                blogObject.setContent(blog.content);

                const response = new proto_blog.ListBlogsResponse();
                response.setBlog(blogObject);

                call.write(response);
            });
            call.end(); // all blogs have been sent
        })
        .catch((error) => {
            console.error(error);
        });
}

function createBlog(call, callback) {
    const blog = call.request.getBlog();

    knex("blogs")
        .insert({
            author: blog.getAuthor(),
            title: blog.getTitle(),
            content: blog.getContent(),
        })
        .then(() => {
            const id = blog.getId();
            console.log(`Blog has been created`);

            const newBlog = new proto_blog.Blog();
            newBlog.setId(id);
            newBlog.setAuthor(blog.getAuthor());
            newBlog.setTitle(blog.getTitle());
            newBlog.setContent(blog.getContent());

            const response = new proto_blog.CreateBlogResponse();
            response.setBlog(newBlog);

            callback(null, response);
        })
        .catch((error) => {
            console.error(error);
            callback(error, null);
        });
}

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

function squareRoot(call, callback) {
    const number = call.request.getNumber();

    if (number >= 0) {
        const squareRoot = Math.sqrt(number);

        const response = new calculator.SquareRootResponse();
        response.setSquareRoot(squareRoot);

        callback(null, response);
    } else {
        // Error Handling
        callback({
            code: grpc.status.INVALID_ARGUMENT,
            message:
                "The number being sent is not positive " +
                "Number sent: " +
                number,
        });
    }
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
    // console.log(process.cwd());

    const credentials = grpc.ServerCredentials.createSsl(
        fs.readFileSync("./certs/ca.crt"),
        [
            {
                cert_chain: fs.readFileSync("./certs/server.crt"),
                private_key: fs.readFileSync("./certs/server.key"),
            },
        ],
        true
    );

    const unsafeCredentials = grpc.ServerCredentials.createInsecure();

    const server = new grpc.Server();
    server.addService(blogService.BlogServiceService, {
        listBlogs: listBlogs,
        createBlog: createBlog,
    });
    // server.addService(calculatorService.CalculatorServiceService, {
    //     sum: sum,
    //     primeNumberDecomposition: primeNumberDecomposition,
    //     computeAverage: computeAverage,
    //     findMaximum: findMaximum,
    //     squareRoot: squareRoot,
    // });
    // server.addService(greetService.GreetServiceService, {
    //     greetManyTimes: greetManyTimes,
    //     longGreet: longGreet,
    //     greetEveryone: greetEveryone,
    // });
    server.bindAsync("127.0.0.1:50051", unsafeCredentials, (err, port) => {
        if (err != null) {
            return console.error(err);
        }
        console.log(`gRPC Server listening on ${port}`);
    });
}

main();
