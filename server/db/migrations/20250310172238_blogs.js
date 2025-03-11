/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("blogs", function (table) {
        table.increments();
        table.text("content").notNullable; // Change to text type, no length limit
        table.string("title", 500).notNullable; // Increase to 500 characters
        table.string("author", 255).notNullable;
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("blogs");
};
