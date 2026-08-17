import { Pill, Bell } from "lucide-react";
import "./Navbar.css"
const Navbar = ({ urgentCount }) => {
  return (
    <nav className="navbar">

      <div className="navbar-brand">
        <div className="brand-icon">
          <Pill size={21} />
        </div>

        <span>PharmaCare</span>
      </div>

      <div className="navbar-right">

        <div className="notification">
          <Bell size={20} />

          {urgentCount > 0 && (
            <span className="notification-badge">
              {urgentCount}
            </span>
          )}
        </div>

        <div className="user-avatar">
          F
        </div>

      </div>

    </nav>
  );
};

export default Navbar;