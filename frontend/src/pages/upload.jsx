import { useState } from "react";
import API from "../api";

function Upload() {
    const [file, setFile] = useState(null);

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a PDF");
            return;
        }

        const formData = new FormData();

        formData.append("file", file);

        try {
            const token =
                localStorage.getItem("token");

            const response = await API.post(
                "/documents/upload",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            console.log(response.data);

            alert("PDF uploaded successfully!");

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Upload failed"
            );
        }
    };

    return (
        <div>
            <h2>Upload Document</h2>

            <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                    setFile(e.target.files[0])
                }
            />

            <button onClick={handleUpload}>
                Upload PDF
            </button>
        </div>
    );
}

export default Upload;