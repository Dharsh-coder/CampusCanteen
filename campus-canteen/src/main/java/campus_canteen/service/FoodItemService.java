
package campus_canteen.service;

import campus_canteen.entity.FoodItem;
import campus_canteen.repository.FoodItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;

    public FoodItemService(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    public List<FoodItem> getAvailableFoodItems() {
        return foodItemRepository.findByAvailableTrueAndActiveTrue();
    }

    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    public FoodItem addFoodItem(FoodItem foodItem) {
        return foodItemRepository.save(foodItem);
    }

    public FoodItem updateFoodItem(Long id, FoodItem updatedFood) {
        FoodItem existingFood = foodItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Food item not found: " + id));

        existingFood.setName(updatedFood.getName());
        existingFood.setDescription(updatedFood.getDescription());
        existingFood.setPrice(updatedFood.getPrice());
        existingFood.setCategory(updatedFood.getCategory());
        existingFood.setAvailable(updatedFood.isAvailable());
        existingFood.setActive(updatedFood.isActive());

        return foodItemRepository.save(existingFood);
    }

    public void deactivateFoodItem(Long id) {
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Food item not found: " + id));

        foodItem.setActive(false);
        foodItemRepository.save(foodItem);
    }
}
