import { useState } from "react";
import api from "./api";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<number | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<any[]>([]);

  const [message, setMessage] = useState("");

  // REGISTER / LOGIN
  const handleAuth = async () => {
    try {
      if (!isLogin) {
        await api.post("/auth/register", {
          name,
          email,
          password,
        });

        setMessage("Registration successful. Please login.");
        setIsLogin(true);
        setName("");
        setPassword("");
        return;
      }

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      setIsLoggedIn(true);
      setMessage("Login successful!");
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");

    setIsLoggedIn(false);
    setDocumentId(null);
    setAnswer("");
    setSources([]);
    setMessage("Logged out successfully.");
  };

  // UPLOAD PDF
  const uploadDocument = async () => {
    if (!file) {
      setMessage("Select a PDF first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        "/documents/upload",
        formData
      );

      setDocumentId(response.data.documentId);

      setMessage(
        `PDF processed successfully. ${response.data.chunks} chunks created.`
      );
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Upload failed"
      );
    }
  };

  // ASK QUESTION
  const askQuestion = async () => {
    if (!documentId) {
      setMessage("Upload a document first");
      return;
    }

    if (!question.trim()) {
      setMessage("Please enter a question");
      return;
    }

    try {
      const response = await api.post("/chat/ask", {
        question,
        documentId,
      });

      setAnswer(response.data.answer);
      setSources(response.data.sources || []);
      setMessage("");
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Question failed"
      );
    }
  };

  // =========================
  // LOGIN / REGISTER PAGE
  // =========================

  if (!isLoggedIn) {
    return (
      <div className="container">
        <h1>AI Document Intelligence</h1>

        <p className="subtitle">
          Upload a PDF and ask questions using RAG
        </p>

        <section className="card">
          <h2>
            {isLogin ? "Login" : "Create Account"}
          </h2>

          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleAuth}>
            {isLogin ? "Login" : "Register"}
          </button>

          <button
            className="secondary"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin
              ? "Create account"
              : "Already have an account?"}
          </button>

          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </section>
      </div>
    );
  }

  // =========================
  // MAIN DASHBOARD
  // =========================

  return (
    <div className="container">
      <div className="top-bar">
        <div>
          <h1>AI Document Intelligence</h1>

          <p className="subtitle">
            Upload a PDF and ask questions using RAG
          </p>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* UPLOAD */}
      <section className="card">
        <h2>Upload Document</h2>

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }}
        />

        <button onClick={uploadDocument}>
          Upload PDF
        </button>
      </section>

      {/* CHAT */}
      <section className="card">
        <h2>Ask Your Document</h2>

        <textarea
          placeholder="Ask something about your PDF..."
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
        />

        <button onClick={askQuestion}>
          Ask AI
        </button>

        {answer && (
          <div className="answer">
            <h3>Answer</h3>

            <p>{answer}</p>
          </div>
        )}

        {sources.length > 0 && (
          <div>
            <h3>Retrieved Sources</h3>

            {sources.map((source, index) => (
              <div
                className="source"
                key={source.chunkId || index}
              >
                <strong>
                  Similarity:
                </strong>{" "}
                {source.similarity}

                <p>{source.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {message && (
        <div className="message">
          {message}
        </div>
      )}
    </div>
  );
}

export default App;