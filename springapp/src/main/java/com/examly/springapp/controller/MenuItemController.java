package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.model.MenuItem;
import com.examly.springapp.service.MenuItemService;

import java.util.List;

@RestController
@RequestMapping("/api/menuitems")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @PostMapping("/{foodTruckId}")
    public ResponseEntity<MenuItem> createMenuItem(@PathVariable Long foodTruckId, @RequestBody MenuItem menuItem) {
        try {
            MenuItem savedMenuItem = menuItemService.saveMenuItem(foodTruckId, menuItem);
            return new ResponseEntity<>(savedMenuItem, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/list/{foodTruckId}")
    public ResponseEntity<List<MenuItem>> createMenuItems(@PathVariable Long foodTruckId,
            @RequestBody List<MenuItem> menuItems) {
        try {
            List<MenuItem> savedMenuItems = menuItemService.saveMenuItems(foodTruckId, menuItems);
            return new ResponseEntity<>(savedMenuItems, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long id) {
        return menuItemService.getMenuItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuItemService.getAllMenuItems();
    }

    @GetMapping("/foodtruck/{foodTruckId}")
    public List<MenuItem> getMenuItemsByFoodTruckId(@PathVariable Long foodTruckId) {
        return menuItemService.getMenuItemsByTruckId(foodTruckId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllMenuItems() {
        menuItemService.deleteAllMenuItems();
        return new ResponseEntity<>(HttpStatus.OK);
    }

     @PutMapping("/{id}")
    public ResponseEntity<MenuItem> putMenuItem(@PathVariable Long id, @RequestBody MenuItem menuItem) {
        try {
            MenuItem updatedMenuItem = menuItemService.putMenuItem(id, menuItem);
            return new ResponseEntity<>(updatedMenuItem, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<MenuItem> patchMenuItem(@PathVariable Long id, @RequestBody MenuItem menuItem) {
        try {
            MenuItem patchedMenuItem = menuItemService.patchMenuItem(id, menuItem);
            return new ResponseEntity<>(patchedMenuItem, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/bulk/{foodTruckId}")
    public ResponseEntity<List<MenuItem>> saveAllMenuItems(@PathVariable Long foodTruckId, @RequestBody List<MenuItem> menuItems) {
        List<MenuItem> savedItems = menuItemService.saveAllMenuItems(foodTruckId, menuItems);
        return new ResponseEntity<>(savedItems, HttpStatus.CREATED);
    }
}