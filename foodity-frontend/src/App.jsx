import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";

function App() {
  return (
    <Router>
      <nav style={{ padding: "20px", background: "#f4f4f4" }}>
        <Link to="/" style={{ marginRight: "15px" }}>
          Home
        </Link>
        <Link to="/login">Login</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
