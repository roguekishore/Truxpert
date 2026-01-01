import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../components/Home";
import App from "../App";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import DisplayFoodTruck from "../components/DisplayFoodTruck";
import ApplyForm from "../components/ApplyForm"; // Updated for ApplyForm

test("renders_home_component_with_title_and_description", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.getByText("Welcome to the Food Truck Vendor Application")).toBeInTheDocument();
  expect(screen.getByText(/Join our community of skilled vendors and connect with food lovers who are eager to explore culinary delights on wheels./)).toBeInTheDocument();
});

test("home_component_renders_become_a_vendor_button_with_link_to_apply", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  // Check if the "Apply Now" button is rendered with the correct link
  const applyButton = screen.getByText("Become a Vendor");

  expect(applyButton).toBeInTheDocument();
  expect(applyButton).toHaveAttribute("href", "/apply");
});

test("renders_navbar_in_App_component_with_links", () => {
  render(<App />);

  // Check if the component renders the title and links
  const titleElement = screen.getByText("Food Truck Vendor Application");
  const homeLink = screen.getByText("Home");
  const vendorDetailsLink = screen.getByText("Vendor Details");

  expect(titleElement).toBeInTheDocument();
  expect(homeLink).toBeInTheDocument();
  expect(vendorDetailsLink).toBeInTheDocument();
});

test("checks_link_destinations", () => {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

  // Check if the links have the correct destinations
  const homeLink = screen.getByText("Home");
  const vendorDetailsLink = screen.getByText("Vendor Details");

  expect(homeLink).toHaveAttribute("href", "/");
  expect(vendorDetailsLink).toHaveAttribute("href", "/getAllVendors");
});

test("renders_footer_component_with_copyright_text", () => {
  render(<Footer />);

  // Check if the copyright text is rendered
  const copyrightText = screen.getByText(
    /2024 Food Truck Vendor Application. All rights reserved./i
  );

  expect(copyrightText).toBeInTheDocument();
});

test("fetching_and_displaying_vendor_applications", async () => {
  // Mocked data to simulate the response from the API
  const MOCK_DATA = [
    {
      name: "Tasty Tacos",
      cuisineSpecialties: "Mexican",
      operatingRegion: "Chennai",
      menuHighlights: "Tacos, Burritos",  // Added menu highlights
      phoneNumber: "1234567890",
    },
    {
      name: "Sweet Treats",
      cuisineSpecialties: "Desserts",
      operatingRegion: "Bangalore",
      menuHighlights: "Cupcakes, Brownies",  // Added menu highlights
      phoneNumber: "0987654321",
    },
  ];

  // Mock the fetch function to return the mocked data
  const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(MOCK_DATA),
  });

  render(<DisplayFoodTruck />);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Check if each vendor is displayed in the table
  await waitFor(() => {
    MOCK_DATA.forEach((application) => {
      expect(screen.getByText(application.name)).toBeInTheDocument();
      expect(screen.getByText(application.cuisineSpecialties)).toBeInTheDocument();
      expect(screen.getByText(application.operatingRegion)).toBeInTheDocument();
      expect(screen.getByText(application.menuHighlights)).toBeInTheDocument();  // Check for menu highlights
      expect(screen.getByText(application.phoneNumber)).toBeInTheDocument();
    });
  });

  // Validate the fetch function call
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/getAllVendors"),
    expect.objectContaining({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  );
  fetchMock.mockRestore();
});

test("submits_valid_application_form", async () => {
  render(
    <MemoryRouter>
      <ApplyForm />  {/* Updated for ApplyForm */}
    </MemoryRouter>
  );

  // Fill in the form
  fireEvent.change(screen.getByLabelText("Name:"), { target: { value: "Tasty Tacos" } });
  fireEvent.change(screen.getByLabelText("Cuisine Specialties:"), { target: { value: "Mexican" } });
  fireEvent.change(screen.getByLabelText("Operating Region:"), { target: { value: "Chennai" } });
  fireEvent.change(screen.getByLabelText("Menu Highlights:"), { target: { value: "Tacos, Burritos" } });
  fireEvent.change(screen.getByLabelText("Phone Number:"), { target: { value: "1234567890" } });

  const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true });

  // Submit the form
  fireEvent.click(screen.getByText("Submit Application"));

  // Wait for the success modal to appear
  await waitFor(() => {
    expect(screen.getByText("Application submitted successfully!")).toBeInTheDocument();
  });

  fetchMock.mockRestore();
});

test("submits_invalid_application_form", () => {
  render(
    <MemoryRouter>
      <ApplyForm /> {/* Updated for ApplyForm */}
    </MemoryRouter>
  );

  // Attempt to submit without filling in the form
  const submitButton = screen.getByText("Submit Application");
  fireEvent.click(submitButton);

  // Check for validation error messages
  expect(screen.getByText("Name is required")).toBeInTheDocument();
  expect(screen.getByText("Cuisine Specialties are required")).toBeInTheDocument();
  expect(screen.getByText("Operating Region is required")).toBeInTheDocument();
  expect(screen.getByText("Menu Highlights are required")).toBeInTheDocument();  // Check for menu highlights validation
  expect(screen.getByText("Phone Number is required")).toBeInTheDocument();
});

test("checks_all_components_and_routes", () => {
  render(<App />);

  const homeLink = screen.getByText(/Home/i);
  fireEvent.click(homeLink);
  expect(screen.getByText("Welcome to the Food Truck Vendor Application")).toBeInTheDocument();

  const applyLink = screen.getByText("Become a Vendor");
  fireEvent.click(applyLink);
  expect(screen.getByText("Apply to Become a Food Truck Vendor")).toBeInTheDocument();

  const vendorDetailsLink = screen.getByText("Vendor Details");
  fireEvent.click(vendorDetailsLink);
  expect(screen.getByText("Submitted Food Truck Vendor Applications")).toBeInTheDocument();
});
