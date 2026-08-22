import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (email, password) => {
    // Aquí puedes conectar tu llamada API real al Backend/Supabase
    if (email && password) {
      setIsAuthenticated(true);
    } else {
      throw new Error("Datos inválidos");
    }
  };

  const handleLogout = () => {
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