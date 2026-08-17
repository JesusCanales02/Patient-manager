import { Pill } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <Pill size={21} />
        </div>

        <span>Priscilla Canales</span>
      </div>
    </nav>
  );
};

export default Navbar;