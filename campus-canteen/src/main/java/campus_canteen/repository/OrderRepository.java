
package campus_canteen.repository;

import campus_canteen.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByRollNumberOrderByCreatedAtDesc(String rollNumber);
}
