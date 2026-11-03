
package campus_canteen.repository;

import campus_canteen.entity.CampusLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampusLocationRepository
        extends JpaRepository<CampusLocation, Long> {

    List<CampusLocation> findByActiveTrueOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
