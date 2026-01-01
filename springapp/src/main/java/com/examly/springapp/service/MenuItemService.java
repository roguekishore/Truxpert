package com.examly.springapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examly.springapp.model.FoodTruck;
import com.examly.springapp.model.MenuItem;
import com.examly.springapp.repository.FoodTruckRepository;
import com.examly.springapp.repository.MenuItemRepository;

import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private FoodTruckRepository foodTruckRepository;

    public MenuItem saveMenuItem(Long truckId, MenuItem menuItem) {
        FoodTruck foodTruck = foodTruckRepository.findById(truckId)
                .orElseThrow(() -> new RuntimeException("FoodTruck not found with ID: " + truckId));
        menuItem.setFoodTruck(foodTruck);
        return menuItemRepository.save(menuItem);
    }

    public List<MenuItem> saveMenuItems(Long foodTruckId, List<MenuItem> menuItems) {
        FoodTruck foodTruck = foodTruckRepository.findById(foodTruckId)
                .orElseThrow(() -> new RuntimeException("Food Truck not found with ID: " + foodTruckId));

        for (MenuItem item : menuItems) {
            item.setFoodTruck(foodTruck);
        }

        return menuItemRepository.saveAll(menuItems);
    }

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }

    public List<MenuItem> getMenuItemsByTruckId(Long vendorId) {
        return menuItemRepository.findByTruckId(vendorId);
    }

    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    public void deleteAllMenuItems() {
        menuItemRepository.deleteAll();
    }

    public MenuItem patchMenuItem(Long id, MenuItem updatedMenuItem) {
        MenuItem existingMenuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found with ID: " + id));
        if (updatedMenuItem.getName() != null) {
            existingMenuItem.setName(updatedMenuItem.getName());
        }
        if (updatedMenuItem.getPrice() != null) {
            existingMenuItem.setPrice(updatedMenuItem.getPrice());
        }
        if (updatedMenuItem.getDescription() != null) {
            existingMenuItem.setDescription(updatedMenuItem.getDescription());
        }
        if (updatedMenuItem.getImageURL() != null) {
            existingMenuItem.setImageURL(updatedMenuItem.getImageURL());
        }

        return menuItemRepository.save(existingMenuItem);
    }

    public MenuItem putMenuItem(Long id, MenuItem updatedMenuItem) {
        MenuItem existingMenuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found with ID: " + id));

        existingMenuItem.setName(updatedMenuItem.getName());
        existingMenuItem.setPrice(updatedMenuItem.getPrice());
        existingMenuItem.setDescription(updatedMenuItem.getDescription());
        existingMenuItem.setImageURL(updatedMenuItem.getImageURL());
        return menuItemRepository.save(existingMenuItem);
    }

    public List<MenuItem> saveAllMenuItems(Long foodTruckId, List<MenuItem> menuItems) {
        FoodTruck foodTruck = foodTruckRepository.findById(foodTruckId)
                .orElseThrow(() -> new RuntimeException("Food Truck not found with ID: " + foodTruckId));

        for (MenuItem item : menuItems) {
            item.setFoodTruck(foodTruck);
        }

        return menuItemRepository.saveAll(menuItems);
    }
}