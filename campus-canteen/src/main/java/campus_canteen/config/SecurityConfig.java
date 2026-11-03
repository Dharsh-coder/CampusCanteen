
package campus_canteen.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private static final PathPatternRequestMatcher.Builder PATH =
            PathPatternRequestMatcher.withDefaults();

    // ==========================================
    // 1. STUDENT SECURITY CHAIN
    // Session-based authentication only
    // ==========================================

    @Bean
    @Order(1)
    public SecurityFilterChain studentSecurityChain(
            HttpSecurity http) throws Exception {

        RequestMatcher studentMatcher = new OrRequestMatcher(
            PATH.matcher("/api/student/**"),
            PATH.matcher(HttpMethod.GET, "/api/orders/my"),
            PATH.matcher(HttpMethod.POST, "/api/orders")
        );

        http
            .securityMatcher(studentMatcher)
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.IF_REQUIRED
                )
            )

            .securityContext(context ->
                context.securityContextRepository(
                    new HttpSessionSecurityContextRepository()
                )
            )

            // Student requests must not use HTTP Basic
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests(auth -> auth

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/student/auth/register",
                    "/api/student/auth/login"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/student/auth/me"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/student/auth/logout"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/orders/my"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/orders"
                ).hasRole("STUDENT")

                .anyRequest().denyAll()
            );

        return http.build();
    }


    // ==========================================
    // 2. PUBLIC SECURITY CHAIN
    // Public menu and active locations
    // ==========================================

    @Bean
    @Order(2)
    public SecurityFilterChain publicSecurityChain(
            HttpSecurity http) throws Exception {

        RequestMatcher publicMatcher = new OrRequestMatcher(
            PATH.matcher(HttpMethod.GET, "/api/menu"),
            PATH.matcher(HttpMethod.GET, "/api/locations"),
            PATH.matcher("/error")
        );

        http
            .securityMatcher(publicMatcher)
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests(auth ->
                auth.anyRequest().permitAll()
            );

        return http.build();
    }


    // ==========================================
    // 3. STAFF SECURITY CHAIN
    // HTTP Basic authentication only
    // ==========================================

    @Bean
    @Order(3)
    public SecurityFilterChain staffSecurityChain(
            HttpSecurity http) throws Exception {

        RequestMatcher staffMatcher = new OrRequestMatcher(

            // Staff order management
            PATH.matcher(HttpMethod.GET, "/api/orders"),
            PATH.matcher(HttpMethod.PATCH, "/api/orders/*/status"),

            // Staff menu management
            PATH.matcher("/api/menu"),
            PATH.matcher("/api/menu/**"),

            // Staff location management
            PATH.matcher(HttpMethod.GET, "/api/locations/all"),
            PATH.matcher(HttpMethod.POST, "/api/locations"),
            PATH.matcher(HttpMethod.PUT, "/api/locations/**")
        );

        http
            .securityMatcher(staffMatcher)
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Staff uses HTTP Basic
            .httpBasic(Customizer.withDefaults())
            .formLogin(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests(auth ->
                auth.anyRequest().hasRole("STAFF")
            );

        return http.build();
    }


    // ==========================================
    // 4. FALLBACK SECURITY CHAIN
    // Deny unconfigured endpoints
    // ==========================================

    @Bean
    @Order(4)
    public SecurityFilterChain fallbackSecurityChain(
            HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)

            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests(auth ->
                auth.anyRequest().denyAll()
            );

        return http.build();
    }


    // ==========================================
    // PASSWORD ENCODER
    // ==========================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // ==========================================
    // CORS CONFIGURATION
    // ==========================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:5501",
            "http://127.0.0.1:5501"
        ));

        config.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Accept"
        ));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/api/**", config
        );

        return source;
    }
}
