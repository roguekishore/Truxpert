package com.examly.springapp;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Comprehensive Data Seeder for TruXpert Food Truck Management System
 * Seeds realistic demo data following the proper workflow:
 * 1. Users (Admin, Reviewers, Inspectors, Super Admin)
 * 2. Vendors with multiple Brands
 * 3. Food Trucks with Applications per Brand
 * 4. Applications assigned to Reviewers (some approved, rejected, pending)
 * 5. Approved trucks assigned Inspections (some passed, failed, pending)
 * 6. Menu Items for operational food trucks
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private VendorRepository vendorRepository;
    @Autowired
    private BrandRepository brandRepository;
    @Autowired
    private FoodTruckRepository foodTruckRepository;
    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private InspectionRepository inspectionRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private DocumentRepository documentRepository;

    private boolean hasRun = false;
    private final Random random = new Random(42);
    private static final String DEFAULT_PASSWORD = "Demo@12345";

    // ============ DEMO DATA CONSTANTS ============

    private static final Object[][] USERS_DATA = {
        {"Admin One", "admin1@gmail.com", "ADMIN"},
        {"Admin Two", "admin2@gmail.com", "ADMIN"},
        {"Super Admin", "superadmin@gmail.com", "SUPER_ADMIN"},
        {"Inspector John", "inspector1@gmail.com", "INSPECTOR"},
        {"Inspector Sarah", "inspector2@gmail.com", "INSPECTOR"},
        {"Inspector Mike", "inspector3@gmail.com", "INSPECTOR"},
        {"Reviewer Alice", "reviewer1@gmail.com", "REVIEWER"},
        {"Reviewer Bob", "reviewer2@gmail.com", "REVIEWER"},
        {"Reviewer Carol", "reviewer3@gmail.com", "REVIEWER"},
    };

    private static final Object[][] VENDORS_DATA = {
        {"John's Food Empire", "vendor@gmail.com"},
        {"Maria's Kitchen Ventures", "maria.kitchen@gmail.com"},
        {"Chen's Asian Flavors", "chen.flavors@gmail.com"},
        {"Rodriguez Family Foods", "rodriguez.foods@gmail.com"},
        {"The Gourmet Group", "gourmet.group@gmail.com"},
        {"Street Eats Inc", "street.eats@gmail.com"},
        {"Urban Bites LLC", "urban.bites@gmail.com"},
    };

    private static final String[][] BRANDS_BY_VENDOR = {
        {"Taco Fiesta", "Burger Barn", "Pizza Palace"},
        {"Maria's Tacos", "Sabor Latino", "Empanada Express"},
        {"Wok & Roll", "Dim Sum Delights", "Pho Real", "Sushi Express"},
        {"Abuela's Kitchen", "Churro Heaven"},
        {"Lobster Love", "Truffle Truck", "Wagyu Wagon", "Caviar Cart"},
        {"Hot Dog Haven", "Pretzel Paradise", "Corn Dog Castle"},
        {"Vegan Vibes", "Plant Power", "Green Machine"},
    };

    private static final String[][] FOOD_TRUCK_TEMPLATES = {
        {"Downtown Plaza", "Downtown District", "Mexican, Tex-Mex", "Authentic tacos, fresh guacamole"},
        {"Harbor View", "Waterfront", "Seafood, American", "Fresh catch, fish tacos"},
        {"Tech Park", "Business District", "Asian Fusion", "Quick lunch bowls, bento boxes"},
        {"University Campus", "College Area", "Budget-Friendly", "Student specials, combo meals"},
        {"Arts District", "Cultural Quarter", "Gourmet", "Chef specials, craft beverages"},
        {"Sports Arena", "Entertainment Zone", "Classic American", "Hot dogs, burgers, nachos"},
        {"Farmers Market", "Suburban Area", "Organic, Healthy", "Farm-to-truck, seasonal menu"},
        {"Food Truck Park", "Central Hub", "International", "Rotating specials"},
        {"Beach Boardwalk", "Coastal", "Casual Seafood", "Fried fish, shrimp baskets"},
        {"Mountain View Plaza", "Uptown", "Mediterranean", "Kebabs, falafel, hummus"},
        {"Industrial District", "Warehouse Area", "BBQ, Smoked Meats", "Slow-cooked ribs, brisket"},
        {"Civic Center", "Government District", "Quick Service", "Express meals, grab-and-go"},
        {"Night Market", "Entertainment", "Street Food", "Late night eats, fusion snacks"},
        {"Shopping Mall", "Retail District", "Family Friendly", "Kids meals, desserts"},
        {"Convention Center", "Events Area", "Catering Style", "Large portions, platters"},
        {"Train Station", "Transit Hub", "Quick Bites", "Grab-and-go options"},
        {"Office Complex", "Corporate Park", "Healthy Lunch", "Salads, wraps, smoothies"},
        {"Stadium Lot", "Sports District", "Game Day Eats", "Loaded nachos, giant pretzels"},
    };

    private static final Map<String, String[][]> MENU_ITEMS_BY_TYPE = new HashMap<>();
    static {
        MENU_ITEMS_BY_TYPE.put("Mexican", new String[][] {
            {"Classic Taco", "8.99", "Seasoned beef, lettuce, cheese, salsa", "https://placehold.co/400x300?text=Classic+Taco"},
            {"Chicken Burrito", "12.99", "Grilled chicken, rice, beans, guacamole", "https://placehold.co/400x300?text=Chicken+Burrito"},
            {"Quesadilla", "9.99", "Melted cheese, choice of protein", "https://placehold.co/400x300?text=Quesadilla"},
            {"Nachos Supreme", "11.99", "Loaded with toppings, jalapeños", "https://placehold.co/400x300?text=Nachos+Supreme"},
            {"Churros", "5.99", "Cinnamon sugar, chocolate dipping sauce", "https://placehold.co/400x300?text=Churros"},
        });
        MENU_ITEMS_BY_TYPE.put("Asian", new String[][] {
            {"Teriyaki Bowl", "13.99", "Grilled protein over rice, teriyaki glaze", "https://placehold.co/400x300?text=Teriyaki+Bowl"},
            {"Spring Rolls", "7.99", "Fresh vegetables, peanut sauce", "https://placehold.co/400x300?text=Spring+Rolls"},
            {"Pad Thai", "14.99", "Rice noodles, shrimp, peanuts", "https://placehold.co/400x300?text=Pad+Thai"},
            {"Bao Buns", "10.99", "Steamed buns, braised pork", "https://placehold.co/400x300?text=Bao+Buns"},
            {"Bubble Tea", "5.99", "Assorted flavors, tapioca pearls", "https://placehold.co/400x300?text=Bubble+Tea"},
        });
        MENU_ITEMS_BY_TYPE.put("American", new String[][] {
            {"Classic Burger", "11.99", "Angus beef, lettuce, tomato, special sauce", "https://placehold.co/400x300?text=Classic+Burger"},
            {"Loaded Fries", "8.99", "Cheese, bacon, sour cream", "https://placehold.co/400x300?text=Loaded+Fries"},
            {"Hot Dog Deluxe", "7.99", "All-beef frank, your choice of toppings", "https://placehold.co/400x300?text=Hot+Dog+Deluxe"},
            {"Chicken Tenders", "10.99", "Hand-breaded, honey mustard", "https://placehold.co/400x300?text=Chicken+Tenders"},
            {"Milkshake", "6.99", "Vanilla, chocolate, or strawberry", "https://placehold.co/400x300?text=Milkshake"},
        });
        MENU_ITEMS_BY_TYPE.put("Gourmet", new String[][] {
            {"Truffle Fries", "14.99", "Parmesan, truffle oil, herbs", "https://placehold.co/400x300?text=Truffle+Fries"},
            {"Lobster Roll", "24.99", "Maine lobster, buttered brioche", "https://placehold.co/400x300?text=Lobster+Roll"},
            {"Wagyu Slider", "18.99", "Premium beef, caramelized onions", "https://placehold.co/400x300?text=Wagyu+Slider"},
            {"Foie Gras Toast", "22.99", "Seared foie gras, brioche, fig jam", "https://placehold.co/400x300?text=Foie+Gras+Toast"},
            {"Artisan Cheese Plate", "16.99", "Selection of imported cheeses", "https://placehold.co/400x300?text=Cheese+Plate"},
        });
        MENU_ITEMS_BY_TYPE.put("Vegan", new String[][] {
            {"Beyond Burger", "14.99", "Plant-based patty, vegan cheese", "https://placehold.co/400x300?text=Beyond+Burger"},
            {"Buddha Bowl", "12.99", "Quinoa, roasted vegetables, tahini", "https://placehold.co/400x300?text=Buddha+Bowl"},
            {"Jackfruit Tacos", "11.99", "Pulled jackfruit, cilantro lime", "https://placehold.co/400x300?text=Jackfruit+Tacos"},
            {"Acai Bowl", "10.99", "Acai, granola, fresh fruits", "https://placehold.co/400x300?text=Acai+Bowl"},
            {"Coconut Curry", "13.99", "Vegetables in coconut curry sauce", "https://placehold.co/400x300?text=Coconut+Curry"},
        });
        MENU_ITEMS_BY_TYPE.put("BBQ", new String[][] {
            {"Pulled Pork Sandwich", "13.99", "Slow-smoked, tangy slaw", "https://placehold.co/400x300?text=Pulled+Pork"},
            {"Beef Brisket Plate", "18.99", "12-hour smoked, two sides", "https://placehold.co/400x300?text=Beef+Brisket"},
            {"BBQ Ribs", "22.99", "Fall-off-the-bone, house rub", "https://placehold.co/400x300?text=BBQ+Ribs"},
            {"Smoked Wings", "12.99", "Dry rubbed, ranch dipping", "https://placehold.co/400x300?text=Smoked+Wings"},
            {"Mac & Cheese", "7.99", "Creamy, four cheese blend", "https://placehold.co/400x300?text=Mac+Cheese"},
        });
        MENU_ITEMS_BY_TYPE.put("Seafood", new String[][] {
            {"Fish & Chips", "15.99", "Beer-battered cod, tartar sauce", "https://placehold.co/400x300?text=Fish+Chips"},
            {"Shrimp Po'Boy", "14.99", "Fried shrimp, remoulade", "https://placehold.co/400x300?text=Shrimp+PoBoy"},
            {"Crab Cakes", "18.99", "Lump crab, aioli", "https://placehold.co/400x300?text=Crab+Cakes"},
            {"Clam Chowder", "8.99", "New England style, bread bowl", "https://placehold.co/400x300?text=Clam+Chowder"},
            {"Grilled Salmon", "19.99", "Lemon herb, seasonal vegetables", "https://placehold.co/400x300?text=Grilled+Salmon"},
        });
    }

    private static final String[][] DOCUMENT_TEMPLATES = {
        {"Business License", "/documents/business_license"},
        {"Food Safety Certificate", "/documents/food_safety"},
        {"Insurance Certificate", "/documents/insurance"},
        {"Vehicle Registration", "/documents/vehicle_reg"},
        {"Health Department Permit", "/documents/health_permit"},
    };

    // ============ MAIN METHODS ============

    @Override
    public void run(String... args) throws Exception {
        System.out.println("DataSeeder: Auto-run disabled. Use /api/seed/run or /api/seed/force endpoints.");
    }

    public boolean seedData() {
        if (hasRun) {
            return false;
        }
        forceSeedData();
        hasRun = true;
        return true;
    }

    @Transactional
    public void forceSeedData() {
        System.out.println("=".repeat(60));
        System.out.println("🚀 Starting TruXpert Data Seeder...");
        System.out.println("=".repeat(60));

        List<User> users = seedUsers();
        System.out.println("✓ Created " + users.size() + " users");

        List<Vendor> vendors = seedVendors();
        System.out.println("✓ Created " + vendors.size() + " vendors");

        List<Brand> brands = seedBrands(vendors);
        System.out.println("✓ Created " + brands.size() + " brands");

        List<FoodTruck> foodTrucks = seedFoodTrucksWithApplications(brands);
        System.out.println("✓ Created " + foodTrucks.size() + " food trucks with applications");

        List<User> reviewers = users.stream()
            .filter(u -> u.getRole() == User.Role.REVIEWER)
            .toList();
        List<User> inspectors = users.stream()
            .filter(u -> u.getRole() == User.Role.INSPECTOR)
            .toList();

        processApplications(reviewers);
        System.out.println("✓ Processed applications with reviews");

        assignInspections(inspectors);
        System.out.println("✓ Assigned inspections to approved trucks");

        addMenuItems();
        System.out.println("✓ Added menu items to operational trucks");

        System.out.println("=".repeat(60));
        System.out.println("✅ Data Seeding Complete!");
        printSummary();
        System.out.println("=".repeat(60));
    }

    // ============ SEEDING METHODS ============

    private List<User> seedUsers() {
        List<User> users = new ArrayList<>();
        for (Object[] userData : USERS_DATA) {
            String email = (String) userData[1];
            Optional<User> existing = userRepository.findByEmail(email);
            if (existing.isEmpty()) {
                User user = new User();
                user.setName((String) userData[0]);
                user.setEmail(email);
                user.setPassword(DEFAULT_PASSWORD);
                user.setRole(User.Role.valueOf((String) userData[2]));
                users.add(userRepository.save(user));
            } else {
                users.add(existing.get());
            }
        }
        return users;
    }

    private List<Vendor> seedVendors() {
        List<Vendor> vendors = new ArrayList<>();
        for (Object[] vendorData : VENDORS_DATA) {
            String email = (String) vendorData[1];
            Optional<Vendor> existing = vendorRepository.findByEmail(email);
            if (existing.isEmpty()) {
                Vendor vendor = new Vendor();
                vendor.setName((String) vendorData[0]);
                vendor.setEmail(email);
                vendor.setPassword(DEFAULT_PASSWORD);
                vendors.add(vendorRepository.save(vendor));
            } else {
                vendors.add(existing.get());
            }
        }
        return vendors;
    }

    private List<Brand> seedBrands(List<Vendor> vendors) {
        List<Brand> allBrands = new ArrayList<>();
        for (int i = 0; i < vendors.size() && i < BRANDS_BY_VENDOR.length; i++) {
            Vendor vendor = vendors.get(i);
            String[] brandNames = BRANDS_BY_VENDOR[i];
            
            for (String brandName : brandNames) {
                Optional<Brand> existing = brandRepository.findByBrandName(brandName);
                if (existing.isEmpty()) {
                    Brand brand = new Brand();
                    brand.setBrandName(brandName);
                    brand.setVendor(vendor);
                    allBrands.add(brandRepository.save(brand));
                } else {
                    allBrands.add(existing.get());
                }
            }
        }
        return allBrands;
    }

    private List<FoodTruck> seedFoodTrucksWithApplications(List<Brand> brands) {
        List<FoodTruck> allTrucks = new ArrayList<>();
        int templateIndex = 0;

        for (Brand brand : brands) {
            int numTrucks = 2 + random.nextInt(3); // 2-4 trucks per brand
            
            for (int t = 0; t < numTrucks; t++) {
                String[] template = FOOD_TRUCK_TEMPLATES[templateIndex % FOOD_TRUCK_TEMPLATES.length];
                templateIndex++;

                // Check if truck already exists for this brand at this location
                String truckLocation = template[0] + " - " + brand.getBrandName() + " #" + (t + 1);
                
                FoodTruck truck = new FoodTruck();
                truck.setLocation(truckLocation);
                truck.setOperatingRegion(template[1]);
                truck.setCuisineSpecialties(template[2]);
                truck.setMenuHighlights(template[3]);
                truck.setBrand(brand);
                truck.setApplicationStatus(Application.ApplicationStatus.SUBMITTED);
                
                FoodTruck savedTruck = foodTruckRepository.save(truck);

                // Create application
                Application application = new Application();
                application.setFoodTruck(savedTruck);
                application.setVendor(brand.getVendor());
                application.setSubmissionDate(LocalDateTime.now().minusDays(random.nextInt(60) + 1));
                application.setStatus(Application.ApplicationStatus.SUBMITTED);
                application.setDocuments(new ArrayList<>());

                // Add documents
                String brandSlug = brand.getBrandName().toLowerCase().replace(" ", "_");
                for (String[] docTemplate : DOCUMENT_TEMPLATES) {
                    Document doc = new Document();
                    doc.setDocumentName(docTemplate[0]);
                    doc.setFilePath(docTemplate[1] + "_" + brandSlug + "_" + (t+1) + ".pdf");
                    doc.setApplication(application);
                    application.getDocuments().add(doc);
                }

                applicationRepository.save(application);
                allTrucks.add(savedTruck);
            }
        }
        return allTrucks;
    }

    private void processApplications(List<User> reviewers) {
        List<Application> allApplications = applicationRepository.findAll();
        
        // ~30% approved, ~10% rejected, ~15% in_review, ~45% submitted (unassigned for testing)
        int total = allApplications.size();
        int approvedCount = (int) (total * 0.30);
        int rejectedCount = (int) (total * 0.10);
        int inReviewCount = (int) (total * 0.15);

        Collections.shuffle(allApplications, random);
        int reviewerIndex = 0;

        for (int i = 0; i < allApplications.size(); i++) {
            Application app = allApplications.get(i);
            
            // Skip if already processed
            if (app.getStatus() != Application.ApplicationStatus.SUBMITTED) {
                continue;
            }
            
            User reviewer = reviewers.get(reviewerIndex % reviewers.size());
            reviewerIndex++;

            if (i < approvedCount) {
                processApplicationWithReview(app, reviewer, Review.ReviewStatus.APPROVED, 
                    Application.ApplicationStatus.APPROVED);
            } else if (i < approvedCount + rejectedCount) {
                processApplicationWithReview(app, reviewer, Review.ReviewStatus.REJECTED,
                    Application.ApplicationStatus.REJECTED);
            } else if (i < approvedCount + rejectedCount + inReviewCount) {
                // In review - assigned but not decided
                assignReviewerOnly(app, reviewer);
            }
            // Rest remain as SUBMITTED
        }
    }

    private void processApplicationWithReview(Application app, User reviewer, 
            Review.ReviewStatus reviewStatus, Application.ApplicationStatus appStatus) {
        Review review = new Review();
        review.setApplication(app);
        review.setReviewer(reviewer);
        review.setReviewDate(LocalDateTime.now().minusDays(random.nextInt(30)));
        review.setReviewStatus(reviewStatus);
        Review savedReview = reviewRepository.save(review);

        app.setReview(savedReview);
        app.setStatus(appStatus);
        applicationRepository.save(app);
        
        FoodTruck truck = app.getFoodTruck();
        truck.setApplicationStatus(appStatus);
        foodTruckRepository.save(truck);
    }

    private void assignReviewerOnly(Application app, User reviewer) {
        Review review = new Review();
        review.setApplication(app);
        review.setReviewer(reviewer);
        review.setReviewDate(LocalDateTime.now().minusDays(random.nextInt(10)));
        review.setReviewStatus(Review.ReviewStatus.IN_PROGRESS);
        Review savedReview = reviewRepository.save(review);

        app.setReview(savedReview);
        app.setStatus(Application.ApplicationStatus.IN_REVIEW);
        applicationRepository.save(app);
        
        FoodTruck truck = app.getFoodTruck();
        truck.setApplicationStatus(Application.ApplicationStatus.IN_REVIEW);
        foodTruckRepository.save(truck);
    }

    private void assignInspections(List<User> inspectors) {
        List<Application> approvedApps = applicationRepository.findByStatus(Application.ApplicationStatus.APPROVED);
        
        // ~30% passed, ~15% failed, ~15% in_progress, ~40% no inspector assigned
        int total = approvedApps.size();
        int passedCount = (int) (total * 0.30);
        int failedCount = (int) (total * 0.15);
        int inProgressCount = (int) (total * 0.15);

        Collections.shuffle(approvedApps, random);
        int inspectorIndex = 0;

        for (int i = 0; i < approvedApps.size(); i++) {
            Application app = approvedApps.get(i);
            FoodTruck truck = app.getFoodTruck();
            
            // Skip if inspection already exists
            if (inspectionRepository.findByFoodTruckId(truck.getId()).isPresent()) {
                continue;
            }

            User inspector = inspectors.get(inspectorIndex % inspectors.size());
            inspectorIndex++;

            Inspection inspection = new Inspection();
            inspection.setFoodTruck(truck);
            inspection.setInspector(inspector);
            inspection.setInspectionDate(LocalDateTime.now().minusDays(random.nextInt(20)));

            if (i < passedCount) {
                inspection.setResult(Inspection.InspectionResult.PASS);
            } else if (i < passedCount + failedCount) {
                inspection.setResult(Inspection.InspectionResult.FAIL);
            } else if (i < passedCount + failedCount + inProgressCount) {
                inspection.setResult(Inspection.InspectionResult.IN_PROGRESS);
            } else {
                // Skip - no inspector assigned for remaining approved trucks
                continue;
            }

            inspectionRepository.save(inspection);
        }
    }

    private void addMenuItems() {
        List<Inspection> passedInspections = inspectionRepository.findAll().stream()
            .filter(i -> i.getResult() == Inspection.InspectionResult.PASS)
            .toList();

        for (Inspection inspection : passedInspections) {
            FoodTruck truck = inspection.getFoodTruck();
            
            // Skip if already has menu items
            List<MenuItem> existingItems = menuItemRepository.findByFoodTruckId(truck.getId());
            if (existingItems != null && !existingItems.isEmpty()) {
                continue;
            }

            String cuisineType = determineCuisineType(truck.getCuisineSpecialties());
            String[][] menuData = MENU_ITEMS_BY_TYPE.getOrDefault(cuisineType, MENU_ITEMS_BY_TYPE.get("American"));
            
            int numItems = 3 + random.nextInt(3); // 3-5 items
            for (int i = 0; i < Math.min(numItems, menuData.length); i++) {
                String[] item = menuData[i];
                MenuItem menuItem = new MenuItem();
                menuItem.setName(item[0]);
                menuItem.setPrice(Double.parseDouble(item[1]));
                menuItem.setDescription(item[2]);
                menuItem.setImageURL(item[3]);
                menuItem.setFoodTruck(truck);
                menuItemRepository.save(menuItem);
            }
        }
    }

    private String determineCuisineType(String specialties) {
        if (specialties == null) return "American";
        String lower = specialties.toLowerCase();
        
        if (lower.contains("mexican") || lower.contains("tex-mex") || lower.contains("latin")) return "Mexican";
        if (lower.contains("asian") || lower.contains("chinese") || lower.contains("japanese")) return "Asian";
        if (lower.contains("gourmet") || lower.contains("premium")) return "Gourmet";
        if (lower.contains("vegan") || lower.contains("organic") || lower.contains("healthy")) return "Vegan";
        if (lower.contains("bbq") || lower.contains("smoked")) return "BBQ";
        if (lower.contains("seafood") || lower.contains("fish")) return "Seafood";
        return "American";
    }

    private void printSummary() {
        System.out.println("\n📊 Database Summary:");
        System.out.println("─".repeat(50));
        System.out.println("👤 Users: " + userRepository.count());
        System.out.println("   ├─ Admins: " + userRepository.findByRole(User.Role.ADMIN).size());
        System.out.println("   ├─ Reviewers: " + userRepository.findByRole(User.Role.REVIEWER).size());
        System.out.println("   ├─ Inspectors: " + userRepository.findByRole(User.Role.INSPECTOR).size());
        System.out.println("   └─ Super Admins: " + userRepository.findByRole(User.Role.SUPER_ADMIN).size());
        System.out.println("🏪 Vendors: " + vendorRepository.count());
        System.out.println("🏷️  Brands: " + brandRepository.count());
        System.out.println("🚚 Food Trucks: " + foodTruckRepository.count());
        System.out.println("📋 Applications:");
        System.out.println("   ├─ Submitted (Pending): " + applicationRepository.findByStatus(Application.ApplicationStatus.SUBMITTED).size());
        System.out.println("   ├─ In Review: " + applicationRepository.findByStatus(Application.ApplicationStatus.IN_REVIEW).size());
        System.out.println("   ├─ Approved: " + applicationRepository.findByStatus(Application.ApplicationStatus.APPROVED).size());
        System.out.println("   └─ Rejected: " + applicationRepository.findByStatus(Application.ApplicationStatus.REJECTED).size());
        System.out.println("📝 Reviews: " + reviewRepository.count());
        System.out.println("🔍 Inspections:");
        long passed = inspectionRepository.findAll().stream().filter(i -> i.getResult() == Inspection.InspectionResult.PASS).count();
        long failed = inspectionRepository.findAll().stream().filter(i -> i.getResult() == Inspection.InspectionResult.FAIL).count();
        long pending = inspectionRepository.findAll().stream().filter(i -> i.getResult() == Inspection.InspectionResult.IN_PROGRESS).count();
        System.out.println("   ├─ Passed: " + passed);
        System.out.println("   ├─ Failed: " + failed);
        System.out.println("   └─ Pending: " + pending);
        System.out.println("🍔 Menu Items: " + menuItemRepository.count());
        System.out.println("─".repeat(50));
    }
}