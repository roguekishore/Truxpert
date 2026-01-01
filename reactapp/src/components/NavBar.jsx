import { Link } from "react-router-dom";
import './NavBar.css';

const Navbar = () => {
  return (
    <nav className="t-nav-bar">
      <div className="t-nav-container">
        <Link to="/" className="t-nav-brand">
          Food Truck Vendor Application
        </Link>
        <div className="t-nav-links">
          <Link to="/" className="t-nav-link">
            Home
          </Link>
          <Link to="/getAllVendors" className="t-nav-link">
            Vendor Details
          </Link>
          <Link to="/app" className="t-nav-link">
            Go to App
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
