package com.examly.springapp;

import java.io.File;
import org.springframework.http.MediaType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = SpringappApplication.class)
@AutoConfigureMockMvc
class SpringappFoodTruckVendorTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testAddFoodTruckVendor() throws Exception {
        String vendorData = "{\"name\": \"Tasty Bites\", \"cuisineSpecialties\": \"Indian\", \"operatingRegion\": \"Chennai\", \"menuHighlights\": \"Butter Chicken, Paneer Tikka\", \"phoneNumber\": \"9876543210\"}";
        mockMvc.perform(MockMvcRequestBuilders.post("/addVendor")
                .contentType(MediaType.APPLICATION_JSON)
                .content(vendorData)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andReturn();
    }

    @Test
void testAddFoodTruckVendor_InvalidOperatingRegion() throws Exception {
    String vendorData = "{\"name\": \"Tasty Bites\", \"cuisineSpecialties\": \"Indian\", \"operatingRegion\": \"InvalidRegion\", \"menuHighlights\": \"Butter Chicken, Paneer Tikka\", \"phoneNumber\": \"9876543210\"}";

    mockMvc.perform(MockMvcRequestBuilders.post("/addVendor")
            .contentType(MediaType.APPLICATION_JSON)
            .content(vendorData)
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isBadRequest())
            .andExpect(MockMvcResultMatchers.jsonPath("$").value("Invalid operating region. Must be either Chennai or Bangalore."))
            .andReturn();
}

    @Test
    void testGetAllFoodTruckVendors() throws Exception {
        mockMvc.perform(get("/getAllVendors")
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andReturn();
    }

    @Test
    public void test_Controller_Directory_Exists() {
        String directoryPath = "src/main/java/com/examly/springapp/controller";
        File directory = new File(directoryPath);
        assertTrue(directory.exists() && directory.isDirectory());
    }

    @Test
    public void test_FoodTruckVendorController_File_Exists() {
        String filePath = "src/main/java/com/examly/springapp/controller/FoodTruckVendorController.java";
        File file = new File(filePath);
        assertTrue(file.exists() && file.isFile());
    }

    @Test
    public void test_Model_Directory_Exists() {
        String directoryPath = "src/main/java/com/examly/springapp/model";
        File directory = new File(directoryPath);
        assertTrue(directory.exists() && directory.isDirectory());
    }

    @Test
    public void test_FoodTruckVendorModel_File_Exists() {
        String filePath = "src/main/java/com/examly/springapp/model/FoodTruckVendor.java";
        File file = new File(filePath);
        assertTrue(file.exists() && file.isFile());
    }

    @Test
    public void test_Repository_Directory_Exists() {
        String directoryPath = "src/main/java/com/examly/springapp/repository";
        File directory = new File(directoryPath);
        assertTrue(directory.exists() && directory.isDirectory());
    }

    @Test
    public void test_Service_Directory_Exists() {
        String directoryPath = "src/main/java/com/examly/springapp/service";
        File directory = new File(directoryPath);
        assertTrue(directory.exists() && directory.isDirectory());
    }

    @Test
    public void test_FoodTruckvendorService_Class_Exists() {
        checkClassExists("com.examly.springapp.service.FoodTruckVendorService");
    }

      
      @Test
      public void test_FoodTruckVendorModel_Class_Exists() {
          checkClassExists("com.examly.springapp.model.FoodTruckVendor");
      }

    @Test
    public void test_FoodTruckVendorModel_Has_name_Field() {
        checkFieldExists("com.examly.springapp.model.FoodTruckVendor", "name");
    }

    @Test
    public void test_FoodTruckVendorModel_Has_cuisineSpecialties_Field() {
        checkFieldExists("com.examly.springapp.model.FoodTruckVendor", "cuisineSpecialties");
    }

    @Test
    public void test_FoodTruckVendorModel_Has_operatingRegion_Field() {
        checkFieldExists("com.examly.springapp.model.FoodTruckVendor", "operatingRegion");
    }

    @Test
    public void test_FoodTruckVendorModel_Has_menuHighlights_Field() {
        checkFieldExists("com.examly.springapp.model.FoodTruckVendor", "menuHighlights");
    }

    @Test
    public void test_FoodTruckVendorModel_Has_phoneNumber_Field() {
        checkFieldExists("com.examly.springapp.model.FoodTruckVendor", "phoneNumber");
    }

    @Test
    public void test_FoodTruckVendorRepo_Extends_JpaRepository() {
        checkClassImplementsInterface("com.examly.springapp.repository.FoodTruckVendorRepo", "org.springframework.data.jpa.repository.JpaRepository");
    }

    @Test
    public void test_CorsConfiguration_Class_Exists() {
        checkClassExists("com.examly.springapp.configuration.CorsConfiguration");
    }

    @Test
    public void test_CorsConfiguration_Has_Configuration_Annotation() {
        checkClassHasAnnotation("com.examly.springapp.configuration.CorsConfiguration", "org.springframework.context.annotation.Configuration");
    }

    @Test
    public void test_InvalidOperatingRegionException_Class_Exists() {
        checkClassExists("com.examly.springapp.exception.InvalidOperatingRegionException");
    }

     
     @Test
     public void test_InvalidOperatingRegionException_Extends_RuntimeException() {
         try {
             Class<?> clazz = Class.forName("com.examly.springapp.exception.InvalidOperatingRegionException");
             assertTrue(RuntimeException.class.isAssignableFrom(clazz),
                     "InvalidOperatingRegionException should extend RuntimeException");
         } catch (ClassNotFoundException e) {
             fail("InvalidOperatingRegionException class does not exist.");
         }
     }

    private void checkClassExists(String className) {
        try {
            Class.forName(className);
        } catch (ClassNotFoundException e) {
            fail("Class " + className + " does not exist.");
        }
    }

    private void checkFieldExists(String className, String fieldName) {
        try {
            Class<?> clazz = Class.forName(className);
            clazz.getDeclaredField(fieldName);
        } catch (ClassNotFoundException | NoSuchFieldException e) {
            fail("Field " + fieldName + " in class " + className + " does not exist.");
        }
    }

    private void checkClassImplementsInterface(String className, String interfaceName) {
        try {
            Class<?> clazz = Class.forName(className);
            Class<?> interfaceClazz = Class.forName(interfaceName);
            assertTrue(interfaceClazz.isAssignableFrom(clazz));
        } catch (ClassNotFoundException e) {
            fail("Class " + className + " or interface " + interfaceName + " does not exist.");
        }
    }

    private void checkClassHasAnnotation(String className, String annotationName) {
        try {
            Class<?> clazz = Class.forName(className);
            Class<?> annotationClazz = Class.forName(annotationName);
            assertTrue(clazz.isAnnotationPresent((Class<? extends java.lang.annotation.Annotation>) annotationClazz));
        } catch (ClassNotFoundException e) {
            fail("Class " + className + " or annotation " + annotationName + " does not exist.");
        }
    }
}
