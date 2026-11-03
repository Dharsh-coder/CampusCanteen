
package campus_canteen.controller;

public record StudentAuthResponse(
    Long id,
    String studentName,
    String rollNumber,
    String email,
    String phone,
    String message
) {}
