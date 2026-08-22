import { useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuth") === "true";
  });

  const handleLogin = async (matricula, password) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("isAuth", "true");
      setIsAuthenticated(true);
    } else {
      throw new Error(data.error || "Matrícula o contraseña incorrectas");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Navbar onLogout={handleLogout} />
      <Dashboard />
    </div>
  );
}

export default App;