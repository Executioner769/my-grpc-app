/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("blogs").del();
    await knex("blogs").insert([
        {
            title: "The Rise of Sustainable Urban Gardening",
            author: "Elena Rodriguez",
            content:
                "Urban gardening is no longer just a hobby; it's a movement. As cities grow, so does the need for sustainable food sources and green spaces. We explore how rooftop gardens and vertical farms are transforming city landscapes and providing fresh produce to local communities. Discover the latest techniques and the positive impact on our environment.",
        },
        {
            title: "Decoding the Latest AI Trends in 2024",
            author: "David Chen",
            content:
                "Artificial intelligence continues to evolve at an astonishing pace. From generative AI to advancements in machine learning, we break down the key trends shaping the tech industry. Understand the implications of AI on various sectors and what the future holds for this transformative technology. We look at the latest developments from major tech companies, and discuss ethical implications.",
        },
        {
            title: "Exploring the Hidden Gems of the Italian Riviera",
            author: "Sophia Bianchi",
            content:
                "Beyond the popular tourist destinations, the Italian Riviera hides charming villages and breathtaking landscapes waiting to be discovered. Join us as we venture off the beaten path and explore the lesser-known coastal towns, savor local cuisine, and immerse ourselves in the authentic Italian lifestyle. Learn about hiking trails, local festivals, and the best times to visit to avoid the crowds.",
        },
    ]);
};
