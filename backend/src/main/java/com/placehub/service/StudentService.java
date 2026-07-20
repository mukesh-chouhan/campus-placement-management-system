package com.placehub.service;

import com.placehub.dto.request.ProfileUpdateRequest;
import com.placehub.dto.request.RegisterRequest;
import com.placehub.entity.Student;
import com.placehub.enums.UserRole;
import com.placehub.exception.ResourceNotFoundException;
import com.placehub.repository.ApplicationRepository;
import com.placehub.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Student getCurrentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    @Transactional
    public Student updateProfile(ProfileUpdateRequest request) {
        Student student = getCurrentStudent();

        if (request.getEmail() != null && !request.getEmail().equals(student.getEmail())
                && studentRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setBranch(request.getBranch());
        student.setCgpa(request.getCgpa());
        student.setBacklogs(request.getBacklogs());
        student.setGraduationYear(request.getGraduationYear());
        student.setSkills(request.getSkills());

        return studentRepository.save(student);
    }

    @Transactional
    public Student createStudent(RegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (studentRepository.existsByRollNumber(request.getRollNumber())) {
            throw new IllegalArgumentException("Roll number already exists");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRollNumber(request.getRollNumber());
        student.setBranch(request.getBranch());
        student.setCgpa(request.getCgpa());
        student.setBacklogs(request.getBacklogs());
        student.setGraduationYear(request.getGraduationYear());
        student.setSkills(request.getSkills() != null ? request.getSkills() : new java.util.ArrayList<>());
        student.setRole(UserRole.STUDENT);
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudentAdmin(Long id, ProfileUpdateRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (request.getEmail() != null && !request.getEmail().equals(student.getEmail())
                && studentRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setBranch(request.getBranch());
        student.setCgpa(request.getCgpa());
        student.setBacklogs(request.getBacklogs());
        student.setGraduationYear(request.getGraduationYear());
        student.setSkills(request.getSkills() != null ? request.getSkills() : new java.util.ArrayList<>());

        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        var applications = applicationRepository.findByStudent(student);
        applicationRepository.deleteAll(applications);
        
        studentRepository.delete(student);
    }

    @Transactional
    public Student toggleBlacklist(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setIsBlacklisted(student.getIsBlacklisted() == null || !student.getIsBlacklisted());
        return studentRepository.save(student);
    }
}
