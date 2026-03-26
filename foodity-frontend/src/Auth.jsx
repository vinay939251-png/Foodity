import React, { useState } from "react";
import api from "./api";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
  });

const handleAuth = async (e) => {
  e.preventDefault();
  try {
    const endpoint = isLogin ? "token/" : "users/register/";

    // Prepare the data
    let payload = {
      email: formData.email,
      password: formData.password,
    };

    if (isLogin) {
      // Login expects 'username' key
      payload = {
        username: formData.email,
        password: formData.password,
      };
    } else {
      // Sign up expects 'birthdate'
      payload.birthdate = formData.birthdate;
    }

    const res = await api.post(endpoint, payload);

    if (isLogin) {
      localStorage.setItem("access_token", res.data.access);
      window.location.href = "/";
    } else {
      alert("Sign up successful! You can now log in.");
      setIsLogin(true); // Switches back to the login form
    }
  } catch (err) {
    alert("Process failed. Please check your details or internet.");
  }
};

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 text-white">
      <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-black text-emerald-400 text-center mb-8 tracking-tighter">
          {isLogin ? "LOG IN" : "SIGN UP"}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder={isLogin ? "Password" : "Create Password"}
            className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          {!isLogin && (
            <>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
              <label className="text-xs text-slate-500 ml-1">Birthdate</label>
              <input
                type="date"
                className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 text-slate-400"
                onChange={(e) =>
                  setFormData({ ...formData, birthdate: e.target.value })
                }
                required
              />
            </>
          )}

          <button className="w-full bg-emerald-500 hover:bg-emerald-600 py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-transform active:scale-95">
            {isLogin ? "LOG IN" : "SIGN UP"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-700 text-center space-y-4">
          <button className="w-full py-3 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-5"
              alt="google"
            />
            {isLogin ? "Continue with Google" : "Signup with Google"}
          </button>

          <p className="text-sm text-slate-400">
            {isLogin ? "Not on Foodity yet? " : "Already a member? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-400 font-bold cursor-pointer hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
