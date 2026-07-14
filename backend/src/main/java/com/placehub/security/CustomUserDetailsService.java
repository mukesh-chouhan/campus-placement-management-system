package com.placehub.security;

import com.placehub.entity.Admin;
import com.placehub.entity.Student;
import com.placehub.enums.UserRole;
import com.placehub.repository.AdminRepository;
import com.placehub.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Student student = studentRepository.findByEmail(username).orElse(null);
        if (student != null) {
            return new User(student.getEmail(), student.getPassword(), List.of(new SimpleGrantedAuthority("ROLE_" + student.getRole().name())));
        }

        Admin admin = adminRepository.findByEmail(username).orElse(null);
        if (admin != null) {
            return new User(admin.getEmail(), admin.getPassword(), List.of(new SimpleGrantedAuthority("ROLE_" + admin.getRole().name())));
        }

        throw new UsernameNotFoundException("User not found");
    }
}
