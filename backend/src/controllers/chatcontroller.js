const db = require("../config/db");

const {
    createEmbedding,
    generateAnswer
} = require("../services/openaiService");

const {
    cosineSimilarity
} = require("../utils/vector");


exports.askQuestion =
async (req, res) => {

    try {

        const {
            question,
            documentId
        } = req.body;

        if (
            !question ||
            !documentId
        ) {

            return res.status(400).json({
                message:
                    "Question and documentId are required"
            });
        }

        const userId =
            req.user.id;

        // Check document ownership
        const [documents] =
            await db.execute(
                `
                SELECT id, filename
                FROM documents
                WHERE id = ?
                AND user_id = ?
                `,
                [
                    documentId,
                    userId
                ]
            );

        if (
            documents.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Document not found"
            });
        }

        // Create embedding for question
        const questionEmbedding =
            await createEmbedding(
                question
            );

        // Get document chunks
        const [chunks] =
            await db.execute(
                `
                SELECT
                    id,
                    chunk_text,
                    embedding
                FROM document_chunks
                WHERE document_id = ?
                `,
                [documentId]
            );

        if (chunks.length === 0) {

            return res.status(404).json({
                message:
                    "No document chunks found"
            });
        }

        // Calculate similarity
        const rankedChunks =
            chunks.map(
                (chunk) => {

                    const embedding =
                        JSON.parse(
                            chunk.embedding
                        );

                    const score =
                        cosineSimilarity(
                            questionEmbedding,
                            embedding
                        );

                    return {
                        id: chunk.id,
                        text:
                            chunk.chunk_text,
                        score
                    };
                }
            );

        // Highest similarity first
        rankedChunks.sort(
            (a, b) =>
                b.score - a.score
        );

        // Top 5 chunks
        const topChunks =
            rankedChunks.slice(
                0,
                5
            );

        // Context
        const context =
            topChunks
                .map(
                    (chunk, index) =>
                        `
SOURCE ${index + 1}:

${chunk.text}
`
                )
                .join("\n");

        // Ask LLM
        const answer =
            await generateAnswer(
                question,
                context
            );

        // Create conversation
        const [
            conversationResult
        ] = await db.execute(
            `
            INSERT INTO conversations
            (user_id, document_id)
            VALUES (?, ?)
            `,
            [
                userId,
                documentId
            ]
        );

        const conversationId =
            conversationResult.insertId;

        // Save question
        await db.execute(
            `
            INSERT INTO messages
            (conversation_id, role, content)
            VALUES (?, 'user', ?)
            `,
            [
                conversationId,
                question
            ]
        );

        // Save answer
        await db.execute(
            `
            INSERT INTO messages
            (conversation_id, role, content)
            VALUES (?, 'assistant', ?)
            `,
            [
                conversationId,
                answer
            ]
        );

        res.json({

            answer,

            document:
                documents[0].filename,

            sources:
                topChunks.map(
                    (chunk) => ({
                        chunkId:
                            chunk.id,

                        similarity:
                            Number(
                                chunk.score
                                    .toFixed(4)
                            ),

                        text:
                            chunk.text
                    })
                )
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Question processing failed"
        });
    }
};