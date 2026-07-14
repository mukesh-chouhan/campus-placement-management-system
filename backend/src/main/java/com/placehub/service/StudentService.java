package com.placehub.service;

import com.placehub.dto.request.ProfileUpdateRequest;
import com.placehub.entity.Student;
import com.placehub.exception.ResourceNotFoundException;
import com.placehub.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;

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
}
