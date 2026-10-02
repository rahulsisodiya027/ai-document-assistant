require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

app.use(express.json());

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "../uploads")
    )
);

app.get("/", (req, res) => {
    res.json({
        message: "AI Document Assistant API is running"
    });
});

app.use("/api/auth", authRoutes);

app.use(
    "/api/documents",
    documentRoutes
);

app.use(
    "/api/chat",
    chatRoutes
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});