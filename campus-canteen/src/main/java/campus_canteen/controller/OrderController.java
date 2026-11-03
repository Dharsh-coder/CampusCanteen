
package campus_canteen.controller;

import campus_canteen.entity.Order;
import campus_canteen.entity.Student;
import campus_canteen.repository.StudentRepository;
import campus_canteen.service.OrderService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501"
})
public class OrderController {

    private final OrderService orderService;
    private final StudentRepository studentRepository;

    public OrderController(
            OrderService orderService,
            StudentRepository studentRepository) {
        this.orderService = orderService;
        this.studentRepository = studentRepository;
    }

    
public record OrderRequest(
        @NotNull LocalTime pickupTime,

        @NotNull
        @Pattern(regexp = "PICKUP|DELIVERY",
                 message = "Select PICKUP or DELIVERY")
        String fulfillmentType,

        @NotNull
        @Positive
        Long locationId,

        @NotEmpty Map<
                @NotNull @Positive Long,
                @NotNull @Positive Integer> items
) {}


    // Student: place an order using the authenticated account
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order placeOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {

        Student student = getAuthenticatedStudent(authentication);

        try {
            
return orderService.placeOrder(
        student.getStudentName(),
        student.getRollNumber(),
        student.getPhone(),
        request.pickupTime(),
        request.fulfillmentType(),
        request.locationId(),
        request.items()
);

        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    ex.getMessage()
            );
        }
    }

    // Student: retrieve only the logged-in student's orders
    @GetMapping("/my")
    public List<StudentOrderResponse> getMyOrders(
            Authentication authentication) {

        Student student = getAuthenticatedStudent(authentication);

        return orderService.getStudentOrderResponses(
                student.getRollNumber()
        );
    }

    private Student getAuthenticatedStudent(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities().stream()
                    .noneMatch(authority ->
                        authority.getAuthority().equals("ROLE_STUDENT"))) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in as a student."
            );
        }

        return studentRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Student account not found."
                ));
    }

    // Staff: list all orders
    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    public record StatusRequest(
            @Pattern(regexp = "COMPLETED|CANCELLED")
            String status
    ) {}

    // Staff: update order status
    @PatchMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusRequest request) {

        try {
            return orderService.updateOrderStatus(
                    id,
                    request.status()
            );
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    ex.getMessage()
            );
        }
    }
}
