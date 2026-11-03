
package campus_canteen.service;

import campus_canteen.entity.CampusLocation;
import campus_canteen.repository.CampusLocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CampusLocationService {

    private final CampusLocationRepository locationRepository;

    public CampusLocationService(
            CampusLocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<CampusLocation> getActiveLocations() {
        return locationRepository.findByActiveTrueOrderByNameAsc();
    }

    public List<CampusLocation> getAllLocations() {
        return locationRepository.findAll();
    }

    @Transactional
    public CampusLocation addLocation(String name) {

        String cleanedName = validateName(name);

        if (locationRepository.existsByNameIgnoreCase(cleanedName)) {
            throw new IllegalArgumentException(
                    "This campus location already exists.");
        }

        CampusLocation location = new CampusLocation();
        location.setName(cleanedName);
        location.setActive(true);

        return locationRepository.save(location);
    }

    @Transactional
    public CampusLocation updateLocation(
            Long id, String name, boolean active) {

        String cleanedName = validateName(name);

        CampusLocation location = locationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Campus location not found."));

        if (locationRepository.existsByNameIgnoreCaseAndIdNot(
                cleanedName, id)) {
            throw new IllegalArgumentException(
                    "Another campus location already uses this name.");
        }

        location.setName(cleanedName);
        location.setActive(active);

        return locationRepository.save(location);
    }

    private String validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "Location name cannot be empty.");
        }

        String cleanedName = name.trim();

        if (cleanedName.length() > 100) {
            throw new IllegalArgumentException(
                    "Location name cannot exceed 100 characters.");
        }

        return cleanedName;
    }
}
