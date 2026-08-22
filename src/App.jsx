import { useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuth") === "true";
  });

  const handleLogin = async (email, password) => {
    if (email && password) {
      localStorage.setItem("isAuth", "true");
      setIsAuthenticated(true);
    } else {
      throw new Error("Datos inválidos");
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