import { useState, useEffect } from "react";
import './DisplayFoodTruck.css';

const DisplayFoodTruck = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const BASE_URL = process.env.REACT_APP_URL;
    const fetchVendors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/getAllVendors`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setVendors(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return (
    <div className="ft-vendor-list-container">
      <h2>Submitted Food Truck Vendor Applications</h2>
      {loading ? (
        <p className="ft-loading">Loading...</p>
      ) : vendors.length === 0 ? (
        <p className="ft-no-vendors">No food truck vendor applications found.</p>
      ) : (
        <table className="ft-vendor-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cuisine Specialties</th>
              <th>Operating Region</th>
              <th>Menu Highlights</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, index) => (
              <tr key={index}>
                <td data-label="Name">{vendor.name}</td>
                <td data-label="Cuisine Specialties">{vendor.cuisineSpecialties}</td>
                <td data-label="Operating Region">{vendor.operatingRegion}</td>
                <td data-label="Menu Highlights">{vendor.menuHighlights}</td>
                <td data-label="Phone Number">{vendor.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DisplayFoodTruck;