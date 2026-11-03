
package campus_canteen.controller;

import campus_canteen.entity.FoodItem;
import campus_canteen.service.FoodItemService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501"
})
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    // Student: view available menu items
    @GetMapping
    public List<FoodItem> getAvailableMenu() {
        return foodItemService.getAvailableFoodItems();
    }

    // Staff: view all menu items
    @GetMapping("/all")
    public List<FoodItem> getAllMenuItems() {
        return foodItemService.getAllFoodItems();
    }

    // Staff: add a food item
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FoodItem addFoodItem(@RequestBody FoodItem foodItem) {
        return foodItemService.addFoodItem(foodItem);
    }

    // Staff: update a food item
    @PutMapping("/{id}")
    public FoodItem updateFoodItem(
            @PathVariable Long id,
            @RequestBody FoodItem foodItem) {
        return foodItemService.updateFoodItem(id, foodItem);
    }

    // Staff: deactivate a food item
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateFoodItem(@PathVariable Long id) {
        foodItemService.deactivateFoodItem(id);
    }
}
