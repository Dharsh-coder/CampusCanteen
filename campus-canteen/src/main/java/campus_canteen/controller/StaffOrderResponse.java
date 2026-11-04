package campus_canteen.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record StaffOrderResponse(
        Long id,
        String studentName,
        String rollNumber,
        String phone,
        LocalTime pickupTime,
        String fulfillmentType,
        String locationName,
        BigDecimal deliveryCharge,
        BigDecimal totalAmount,
        String paymentMethod,
        String status,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
    public record OrderItemResponse(
            String itemName,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal subtotal
    ) {}
}