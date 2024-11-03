import React, { useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";

const Login = ({ setToken, setUserId, csrfToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const message = location.state?.message;

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "https://chatify-api.up.railway.app/auth/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            csrfToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const token = data.token;
      const decoded = decodeToken(token);

      
      localStorage.setItem("token", token);
      localStorage.setItem("userId", decoded.id);
      localStorage.setItem("username", decoded.user);
      localStorage.setItem("avatar", decoded.avatar);
      localStorage.setItem("email", decoded.email);

      setToken(token);
      setUserId(decoded.id);
      setError("");

      navigate("/profile");
    } catch (err) {
      console.error("Inloggning misslyckades", err);
      setError(err.message);
    }
  };

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Token avkodning misslyckades", e);
      return {};
    }
  };

  return (
    <div
      className="bg-cover bg-center min-h-screen flex items-center justify-center"
      style={{ backgroundImage: "url('/src/components/Assets/Register.svg')" }}
    >
      <div className="bg-white bg-opacity-60 backdrop-blur-lg p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-light text-center mb-8 text-gray-100 tracking-wide">
          Logga in!
        </h1>
        {message && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col">
            <input
              type="Username"
              placeholder="Användarnamn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-full bg-gray-800 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col">
            <input
              type="password"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-full bg-gray-800 text-white placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            Login
          </button>
        </form>
        <NavLink to="/">
          <button className="w-full mt-3 py-3 bg-green-500 text-white rounded-full hover:bg-green-600">
            Ingen konto? Registrera dig här!
          </button>
        </NavLink>
      </div>
    </div>
  );
};

export default Login;
