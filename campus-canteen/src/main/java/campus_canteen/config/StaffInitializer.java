
package campus_canteen.config;

import campus_canteen.entity.StaffUser;
import campus_canteen.repository.StaffUserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class StaffInitializer {

    @Bean
    CommandLineRunner createInitialStaff(
            StaffUserRepository repository,
            PasswordEncoder passwordEncoder,
            @Value("${canteen.staff.username:}") String username,
            @Value("${canteen.staff.password:}") String password) {

        return args -> {
            if (username.isBlank() || password.isBlank()) {
                System.out.println(
                    "Initial staff account not configured.");
                return;
            }

            if (repository.findByUsername(username).isEmpty()) {
                StaffUser staff = new StaffUser();
                staff.setUsername(username);
                staff.setPasswordHash(
                    passwordEncoder.encode(password));
                staff.setActive(true);

                repository.save(staff);

                System.out.println(
                    "Initial staff account created.");
            }
        };
    }
}
