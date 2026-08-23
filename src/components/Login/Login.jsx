import { useState } from "react";
import { Lock, Mail, AlertCircle } from "lucide-react";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return
    }

    setLoading(true)

    try {
      await onLogin(email, password)
    } catch (error) {
      setError(error.message || "Credenciales incorrectas. Inténtalo de nuevo.");
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus datos para acceder al sistema</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Nombre de usuario</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input

            type="text"
            placeholder="Ingresa tu matrícula"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
                />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Cargando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;