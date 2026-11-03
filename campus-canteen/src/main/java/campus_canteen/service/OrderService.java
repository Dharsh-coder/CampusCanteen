
package campus_canteen.service;

import campus_canteen.entity.CampusLocation;
import campus_canteen.repository.CampusLocationRepository;
import java.time.LocalTime;
import campus_canteen.entity.FoodItem;
import campus_canteen.entity.Order;
import campus_canteen.entity.OrderItem;
import campus_canteen.repository.FoodItemRepository;
import campus_canteen.repository.OrderItemRepository;
import campus_canteen.repository.OrderRepository;
import campus_canteen.controller.StudentOrderResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final FoodItemRepository foodItemRepository;
    private final CampusLocationRepository campusLocationRepository;

    public OrderService(
        OrderRepository orderRepository,
        OrderItemRepository orderItemRepository,
        FoodItemRepository foodItemRepository,
        CampusLocationRepository campusLocationRepository) {

    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.foodItemRepository = foodItemRepository;
    this.campusLocationRepository = campusLocationRepository;
}

    
    
@Transactional
public Order placeOrder(
        String studentName,
        String rollNumber,
        String phone,
        LocalTime pickupTime,
        String fulfillmentType,
        Long locationId,
        Map<Long, Integer> requestedItems) {

    if (requestedItems == null || requestedItems.isEmpty()) {
        throw new IllegalArgumentException("The cart cannot be empty.");
    }

    if (!"PICKUP".equals(fulfillmentType)
            && !"DELIVERY".equals(fulfillmentType)) {
        throw new IllegalArgumentException(
                "Fulfillment type must be PICKUP or DELIVERY.");
    }

    CampusLocation location = campusLocationRepository.findById(locationId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Campus location not found."));

    if (!location.isActive()) {
        throw new IllegalArgumentException(
                "The selected campus location is currently unavailable.");
    }

    Order order = new Order();

    order.setStudentName(studentName);
    order.setRollNumber(rollNumber);
    order.setPhone(phone);
    order.setPickupTime(pickupTime);
    order.setFulfillmentType(fulfillmentType);
    order.setCampusLocation(location);
    order.setDeliveryCharge(BigDecimal.ZERO);
    order.setPaymentMethod("CASH");
    order.setStatus("PENDING");
    order.setTotalAmount(BigDecimal.ZERO);

    BigDecimal total = BigDecimal.ZERO;
    List<OrderItem> orderItems = new java.util.ArrayList<>();

    for (Map.Entry<Long, Integer> entry : requestedItems.entrySet()) {

        Long foodId = entry.getKey();
        Integer quantity = entry.getValue();

        if (quantity == null || quantity < 1 || quantity > 100) {
            throw new IllegalArgumentException(
                    "Quantity must be between 1 and 100.");
        }

        FoodItem food = foodItemRepository.findById(foodId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Food item not found: " + foodId));

        if (!food.isAvailable() || !food.isActive()) {
            throw new IllegalArgumentException(
                    food.getName() + " is currently unavailable.");
        }

        BigDecimal subtotal = food.getPrice()
                .multiply(BigDecimal.valueOf(quantity));

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setFoodItem(food);
        item.setItemName(food.getName());
        item.setUnitPrice(food.getPrice());
        item.setQuantity(quantity);
        item.setSubtotal(subtotal);

        orderItems.add(item);
        total = total.add(subtotal);
    }

    order.setTotalAmount(total.add(BigDecimal.ZERO));

    Order savedOrder = orderRepository.save(order);

    for (OrderItem item : orderItems) {
        item.setOrder(savedOrder);
    }

    orderItemRepository.saveAll(orderItems);

    return savedOrder;
}


    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByRollNumber(String rollNumber) {
        return orderRepository.findByRollNumberOrderByCreatedAtDesc(
                rollNumber);
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {

        if (!"COMPLETED".equals(newStatus)
                && !"CANCELLED".equals(newStatus)) {
            throw new IllegalArgumentException(
                    "Status must be COMPLETED or CANCELLED.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + orderId));

        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalArgumentException(
                    "Only pending orders can be updated.");
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
    
@Transactional(readOnly = true)
public List<StudentOrderResponse> getStudentOrderResponses(String rollNumber) {

    List<Order> orders =
            orderRepository.findByRollNumberOrderByCreatedAtDesc(rollNumber);

    return orders.stream()
            .map(order -> {
                List<StudentOrderResponse.OrderItemResponse> items =
                        orderItemRepository
                                .findByOrder_IdOrderByIdAsc(order.getId())
                                .stream()
                                .map(item ->
                                        new StudentOrderResponse.OrderItemResponse(
                                                item.getItemName(),
                                                item.getUnitPrice(),
                                                item.getQuantity(),
                                                item.getSubtotal()
                                        ))
                                .toList();

                return new StudentOrderResponse(
        order.getId(),
        order.getStudentName(),
        order.getRollNumber(),
        order.getPickupTime(),
        order.getFulfillmentType(),
        order.getCampusLocation().getName(),
        order.getDeliveryCharge(),
        order.getTotalAmount(),
        order.getPaymentMethod(),
        order.getStatus(),
        order.getCreatedAt(),
        items
);
            })
            .toList();
}


}
