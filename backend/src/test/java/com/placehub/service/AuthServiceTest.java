package com.placehub.service;

import com.placehub.dto.request.LoginRequest;
import com.placehub.dto.request.RegisterRequest;
import com.placehub.dto.response.AuthResponse;
import com.placehub.entity.Admin;
import com.placehub.entity.Student;
import com.placehub.enums.UserRole;
import com.placehub.repository.AdminRepository;
import com.placehub.repository.StudentRepository;
import com.placehub.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    public void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("Student Test");
        registerRequest.setEmail("test@student.com");
        registerRequest.setPassword("password123");
        registerRequest.setConfirmPassword("password123");
        registerRequest.setRollNumber("ROLL001");
        registerRequest.setBranch("Computer Science");
        registerRequest.setCgpa(new BigDecimal("8.50"));
        registerRequest.setBacklogs(0);
        registerRequest.setGraduationYear(2026);
        registerRequest.setSkills(List.of("Java"));

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@student.com");
        loginRequest.setPassword("password123");
    }

    @Test
    public void testRegisterStudent_Success() {
        when(studentRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(studentRepository.existsByRollNumber(registerRequest.getRollNumber())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(jwtService.generateToken(registerRequest.getEmail(), UserRole.STUDENT.name())).thenReturn("mockJwtToken");

        AuthResponse response = authService.registerStudent(registerRequest);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("STUDENT", response.getRole());
        assertEquals("Student Test", response.getName());
        assertEquals("test@student.com", response.getEmail());

        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    public void testRegisterStudent_DuplicateEmail() {
        when(studentRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            authService.registerStudent(registerRequest);
        });
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    public void testRegisterStudent_PasswordMismatch() {
        registerRequest.setConfirmPassword("passwordMismatch");

        assertThrows(IllegalArgumentException.class, () -> {
            authService.registerStudent(registerRequest);
        });
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    public void testLogin_StudentSuccess() {
        Student student = new Student();
        student.setEmail("test@student.com");
        student.setName("Student Name");
        student.setRole(UserRole.STUDENT);

        when(studentRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(student));
        when(jwtService.generateToken(student.getEmail(), UserRole.STUDENT.name())).thenReturn("studentJwtToken");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("studentJwtToken", response.getToken());
        assertEquals("STUDENT", response.getRole());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    public void testLogin_AdminSuccess() {
        Admin admin = new Admin();
        admin.setEmail("admin@placehub.com");
        admin.setName("Admin Name");
        admin.setRole(UserRole.ADMIN);

        loginRequest.setEmail("admin@placehub.com");

        when(studentRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());
        when(adminRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(admin));
        when(jwtService.generateToken(admin.getEmail(), UserRole.ADMIN.name())).thenReturn("adminJwtToken");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("adminJwtToken", response.getToken());
        assertEquals("ADMIN", response.getRole());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
