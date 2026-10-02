const fs = require("fs");

const db = require("../config/db");

const {
    extractText
} = require("../services/pdfService");

const {
    createChunks
} = require("../services/chunkService");

const {
    createEmbedding
} = require("../services/openaiService");


exports.uploadDocument =
async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                message:
                    "Please upload a PDF"
            });
        }

        const userId =
            req.user.id;

        const buffer =
            fs.readFileSync(
                req.file.path
            );

        const text =
            await extractText(buffer);

        if (!text.trim()) {

            return res.status(400).json({
                message:
                    "Could not extract text from PDF"
            });
        }

        const [documentResult] =
            await db.execute(
                `
                INSERT INTO documents
                (user_id, filename, file_path)
                VALUES (?, ?, ?)
                `,
                [
                    userId,
                    req.file.originalname,
                    req.file.path
                ]
            );

        const documentId =
            documentResult.insertId;

        const chunks =
            createChunks(text);

        for (
            const chunk of chunks
        ) {

            const embedding =
                await createEmbedding(
                    chunk
                );

            await db.execute(
                `
                INSERT INTO document_chunks
                (document_id, chunk_text, embedding)
                VALUES (?, ?, ?)
                `,
                [
                    documentId,
                    chunk,
                    JSON.stringify(
                        embedding
                    )
                ]
            );
        }

        res.status(201).json({
            message:
                "Document processed successfully",

            documentId,

            filename:
                req.file.originalname,

            chunks:
                chunks.length
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Document processing failed"
        });
    }
};