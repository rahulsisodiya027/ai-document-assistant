const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


async function createEmbedding(text) {

    const response =
        await client.embeddings.create({
            model:
                process.env.EMBEDDING_MODEL,
            input: text
        });

    return response.data[0].embedding;
}


async function generateAnswer(
    question,
    context
) {

    const prompt = `
You are an AI document assistant.

Answer the question using ONLY
the information provided in the context.

If the answer cannot be found in
the context, say:

"I could not find this information
in the uploaded document."

Do not invent facts.

CONTEXT:
${context}

QUESTION:
${question}

Give a clear and concise answer.
`;

    const response =
        await client.responses.create({
            model:
                process.env.OPENAI_MODEL,
            input: prompt
        });

    return response.output_text;
}


module.exports = {
    createEmbedding,
    generateAnswer
};