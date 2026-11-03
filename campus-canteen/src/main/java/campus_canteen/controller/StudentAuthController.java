
package campus_canteen.controller;

import campus_canteen.entity.Student;
import campus_canteen.repository.StudentRepository;
import campus_canteen.service.StudentAuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/auth")
public class StudentAuthController {

    private final StudentAuthService studentAuthService;
    private final StudentRepository studentRepository;

    public StudentAuthController(
            StudentAuthService studentAuthService,
            StudentRepository studentRepository) {

        this.studentAuthService = studentAuthService;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentAuthResponse register(
            @Valid @RequestBody StudentRegistrationRequest request) {

        return studentAuthService.register(request);
    }

    @PostMapping("/login")
    public StudentAuthResponse login(
            @Valid @RequestBody StudentLoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        // Verify student credentials.
        StudentAuthResponse response =
                studentAuthService.login(request);

        Student student = studentRepository
                .findByEmailIgnoreCase(response.email())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password."
                ));

        // Invalidate any existing session.
        HttpSession existingSession =
                httpRequest.getSession(false);

        if (existingSession != null) {
            existingSession.invalidate();
        }

        // Create a fresh session.
        httpRequest.getSession(true);

        // Create authenticated student identity.
        var authentication =
                new UsernamePasswordAuthenticationToken(
                        student.getEmail(),
                        null,
                        List.of(
                                new SimpleGrantedAuthority("ROLE_STUDENT")
                        )
                );

        // Create and populate the security context.
        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // Explicitly persist authentication in the HTTP session.
        HttpSessionSecurityContextRepository repository =
                new HttpSessionSecurityContextRepository();

        repository.saveContext(
                context,
                httpRequest,
                httpResponse
        );

        return response;
    }

    @PostMapping("/logout")
    public Map<String, String> logout(
            HttpServletRequest httpRequest) {

        HttpSession session =
                httpRequest.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return Map.of(
                "message",
                "Logged out successfully"
        );
    }

    @GetMapping("/me")
    public StudentAuthResponse getCurrentStudent(
            org.springframework.security.core.Authentication authentication) {
                System.out.println("========== STUDENT SESSION DEBUG ==========");
System.out.println("Authentication: " + authentication);
System.out.println("Authenticated: " +
        (authentication != null && authentication.isAuthenticated()));

if (authentication != null) {
    System.out.println("Username: " + authentication.getName());
    System.out.println("Authorities: " + authentication.getAuthorities());
}

System.out.println("============================================");
        // Verify that the current user is an authenticated student.
        if (authentication == null
                || !authentication.isAuthenticated()
                || !authentication.getAuthorities().stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_STUDENT"))) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in as a student."
            );
        }

        // Retrieve the authenticated student's profile.
        Student student = studentRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Student account not found."
                ));

        
return new StudentAuthResponse(
    student.getId(),
    student.getStudentName(),
    student.getRollNumber(),
    student.getEmail(),
    student.getPhone(),
    "Student session active"
);

    }
}
