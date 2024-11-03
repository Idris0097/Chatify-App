import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

const Register = ({ csrfToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(""); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    setIsLoading(true); 
    const payload = {
      username,
      password,
      email,
      avatar, 
    };

    console.log("Register payload:", payload); 

    fetch("https://chatify-api.up.railway.app/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken, 
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Användarnamn eller e-postadress finns redan");
        }
        
        localStorage.setItem("Användarnamn", username);
        localStorage.setItem("e-post", email);
        console.log("Registration successful, redirecting to login"); // Logga vid framgång
        navigate("/login", { state: { message: "Registration successful" } });
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false); 
      });
  };

  return (
    <div className="bg-cover bg-center min-h-screen flex items-center justify-center">
      <div className="bg-white bg-opacity-60 backdrop-blur-lg p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-light text-center mb-8 text-white tracking-wide">
          Registrera dig
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <p className="text-green-500 text-center mb-4">
          Har du redan en konto?{" "}
          <NavLink to="/login" className="text-blue-500 underline">
            Login
          </NavLink>
        </p>

        {isLoading ? (
          <p className="text-center text-white">Registering...</p>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Användernamn"
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
            <div className="flex flex-col">
              <input
                type="email"
                placeholder="E-post"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-3 border border-gray-300 rounded-full bg-gray-800 text-white placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-green-500 text-white rounded-full hover:bg-green-600"
            >
              Registrera dig
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
