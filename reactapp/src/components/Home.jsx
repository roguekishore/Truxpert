import { Link } from "react-router-dom";
import './Home.css';

const Home = () => {
  return (
    <div className="t-home">
      <div className="t-home-container">
        <h1>Welcome to the Food Truck Vendor Application</h1>
        <p>
          Join our community of skilled vendors and connect with food lovers who
          are eager to explore culinary delights on wheels.
        </p>
        <Link to="/apply" className="t-home-button-link">
          Become a Vendor
        </Link>
      </div>
    </div>
  );
};

export default Home;