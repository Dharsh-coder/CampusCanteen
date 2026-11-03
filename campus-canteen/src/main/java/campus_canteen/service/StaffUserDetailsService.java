
package campus_canteen.service;

import campus_canteen.entity.StaffUser;
import campus_canteen.repository.StaffUserRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class StaffUserDetailsService implements UserDetailsService {

    private final StaffUserRepository staffUserRepository;

    public StaffUserDetailsService(
            StaffUserRepository staffUserRepository) {
        this.staffUserRepository = staffUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        StaffUser staff = staffUserRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Staff account not found"));

        return User.withUsername(staff.getUsername())
                .password(staff.getPasswordHash())
                .roles("STAFF")
                .disabled(!staff.isActive())
                .build();
    }
}
