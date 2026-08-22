import { LogOut } from "lucide-react";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  return (
    <nav className="navbar">
      <button className="btn-logout" onClick={onLogout}>
        <LogOut size={18} />
        <span>Cerrar sesión</span>
      </button>
    </nav>
  );
};

export default Navbar;