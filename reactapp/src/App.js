import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./components/Home";
import DisplayFoodTruck from "./components/DisplayFoodTruck";
import ApplyForm from "./components/ApplyForm";
import Footer from "./components/Footer";
import RenderComp from "./RenderComp";
import SeedPage from "./pages/SeedPage";
import { ApiProvider } from "./context/ApiContext";
  
function App() {  
  return (
    <ApiProvider>
      <Router>
        <MainContent />
      </Router>
    </ApiProvider>
  );   
}

function MainContent() {
  const location = useLocation();
  const showFullLayout = location.pathname !== "/app";

  return (
    <div className="App">
      {/* {showFullLayout && <Navbar />} */}
      <Routes>
        {/* <Route path="/" element={<Home />} />
        <Route path="/apply" element={<ApplyForm />} />
        <Route path="/getAllVendors" element={<DisplayFoodTruck />} /> */}
        <Route path="/" element={<RenderComp />} />
        <Route path="/seed" element={<SeedPage />} />
      </Routes>
      {/* {showFullLayout && <Footer />} */}
    </div>
  );
}

export default App;
