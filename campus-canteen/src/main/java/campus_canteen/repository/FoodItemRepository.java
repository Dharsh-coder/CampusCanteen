
package campus_canteen.repository;

import campus_canteen.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodItemRepository
        extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByAvailableTrueAndActiveTrue();

}
