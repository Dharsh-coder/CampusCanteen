
package campus_canteen.controller;

import campus_canteen.entity.CampusLocation;
import campus_canteen.service.CampusLocationService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501"
})
public class CampusLocationController {

    private final CampusLocationService locationService;

    public CampusLocationController(
            CampusLocationService locationService) {
        this.locationService = locationService;
    }

    // Student: view active campus locations
    @GetMapping
    public List<CampusLocation> getActiveLocations() {
        return locationService.getActiveLocations();
    }

    // Staff: view all campus locations
    @GetMapping("/all")
    public List<CampusLocation> getAllLocations() {
        return locationService.getAllLocations();
    }

    public record LocationRequest(String name, Boolean active) {
    }

    // Staff: add a campus location
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CampusLocation addLocation(
            @RequestBody LocationRequest request) {

        try {
            return locationService.addLocation(request.name());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    // Staff: edit or activate/deactivate a location
    @PutMapping("/{id}")
    public CampusLocation updateLocation(
            @PathVariable Long id,
            @RequestBody LocationRequest request) {

        try {
            if (request.active() == null) {
                throw new IllegalArgumentException(
                        "Active status is required.");
            }

            return locationService.updateLocation(
                    id, request.name(), request.active());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }
}

