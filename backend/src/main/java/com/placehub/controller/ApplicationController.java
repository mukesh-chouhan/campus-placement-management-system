package com.placehub.controller;

import com.placehub.dto.request.ApplicationRequest;
import com.placehub.dto.response.ApplicationResponse;
import com.placehub.entity.Application;
import com.placehub.entity.Student;
import com.placehub.service.ApplicationService;
import com.placehub.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApplicationController {
    private final ApplicationService applicationService;
    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(@Valid @RequestBody ApplicationRequest request) {
        Student student = studentService.getCurrentStudent();
        Application application = applicationService.applyForJob(student, request.getJobId());
        return new ResponseEntity<>(ApplicationResponse.fromEntity(application), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications() {
        Student student = studentService.getCurrentStudent();
        List<Application> applications = applicationService.getStudentApplications(student);
        List<ApplicationResponse> response = applications.stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
