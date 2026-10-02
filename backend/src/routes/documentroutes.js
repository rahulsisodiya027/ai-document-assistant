const express = require("express");

const multer = require("multer");

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    uploadDocument
} = require("../controllers/documentController");

const router = express.Router();

const upload =
    multer({
        dest: "uploads/",

        limits: {
            fileSize:
                10 * 1024 * 1024
        },

        fileFilter:
            (req, file, cb) => {

                if (
                    file.mimetype ===
                    "application/pdf"
                ) {

                    cb(null, true);

                } else {

                    cb(
                        new Error(
                            "Only PDF files are allowed"
                        )
                    );
                }
            }
    });


router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadDocument
);


module.exports = router;