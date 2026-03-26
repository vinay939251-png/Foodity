import React, { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Calls your Django endpoint: http://127.0.0.1:8000/api/token/
      const res = await api.post("token/", { email, password });

      // Save the Digital ID in LocalStorage
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      alert("Success! You are logged in.");
      navigate("/"); // Redirect back to Home
    } catch (err) {
      alert("Login failed! Check your email or password.");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px" }}>
      <h2>Login to Foodity</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#2ecc71",
            color: "white",
            border: "none",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
