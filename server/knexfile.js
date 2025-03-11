const path = require("path");

module.exports = {
    development: {
        client: "postgresql",
        connection: {
            host: "localhost",
            database: "grpc-blog",
            user: "postgres",
            password: "postgres",
            port: 5432,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: path.join(__dirname, "db", "migrations"),
        },
        seeds: {
            directory: path.join(__dirname, "db", "seeds"),
        },
    },
};
