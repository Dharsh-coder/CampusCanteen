
package campus_canteen.service;

import campus_canteen.controller.StudentAuthResponse;
import campus_canteen.controller.StudentLoginRequest;
import campus_canteen.controller.StudentRegistrationRequest;
import campus_canteen.entity.Student;
import campus_canteen.repository.StudentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudentAuthService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentAuthService(
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {

        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public StudentAuthResponse register(
            StudentRegistrationRequest request) {

        String email = request.email().trim().toLowerCase();
        String rollNumber = request.rollNumber().trim();

        if (studentRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "This email is already registered."
            );
        }

        if (studentRepository.existsByRollNumberIgnoreCase(rollNumber)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "This roll number is already registered."
            );
        }

        Student student = new Student();

        student.setStudentName(request.studentName().trim());
        student.setRollNumber(rollNumber);
        student.setEmail(email);
        student.setPhone(request.phone().trim());

        // Store only the encoded password.
        student.setPasswordHash(
            passwordEncoder.encode(request.password())
        );

        student.setActive(true);

        Student savedStudent = studentRepository.save(student);

        return new StudentAuthResponse(
            savedStudent.getId(),
            savedStudent.getStudentName(),
            savedStudent.getRollNumber(),
            savedStudent.getEmail(),
            savedStudent.getPhone(),
            "Registration successful"
        );
    }

    @Transactional(readOnly = true)
    public StudentAuthResponse login(
            StudentLoginRequest request) {

        String email = request.email().trim().toLowerCase();

        Student student = studentRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password."
            ));

        if (!student.isActive()
                || !passwordEncoder.matches(
                    request.password(),
                    student.getPasswordHash())) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password."
            );
        }

        return new StudentAuthResponse(
            student.getId(),
            student.getStudentName(),
            student.getRollNumber(),
            student.getEmail(),
            student.getPhone(),
            "Login successful"
        );
    }
}
