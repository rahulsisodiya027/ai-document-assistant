import { useState } from "react";
import API from "../api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post("/auth/login", {
                email,
                password
            });

            console.log(response.data);

            // Save token
            localStorage.setItem(
                "token",
                response.data.token
            );

            alert("Login successful!");

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                    setEmail(e.target.value)
                }
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
            />

            <button type="submit">
                Login
            </button>
        </form>
    );
}

export default Login;