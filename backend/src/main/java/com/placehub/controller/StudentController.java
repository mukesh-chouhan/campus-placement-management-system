package com.placehub.controller;

import com.placehub.dto.request.ProfileUpdateRequest;
import com.placehub.dto.response.StudentResponse;
import com.placehub.entity.Application;
import com.placehub.entity.JobDrive;
import com.placehub.entity.Student;
import com.placehub.enums.ApplicationStatus;
import com.placehub.service.ApplicationService;
import com.placehub.service.JobDriveService;
import com.placehub.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {
    private final StudentService studentService;
    private final JobDriveService jobDriveService;
    private final ApplicationService applicationService;

    @GetMapping("/me")
    public ResponseEntity<StudentResponse> getProfile() {
        Student student = studentService.getCurrentStudent();
        return ResponseEntity.ok(StudentResponse.fromEntity(student));
    }

    @PutMapping("/me")
    public ResponseEntity<StudentResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        Student student = studentService.updateProfile(request);
        return ResponseEntity.ok(StudentResponse.fromEntity(student));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Student student = studentService.getCurrentStudent();
        List<JobDrive> activeDrives = jobDriveService.getActiveJobDrives();
        List<JobDrive> eligibleDrives = jobDriveService.getEligibleJobDrives(student);
        List<Application> applications = applicationService.getStudentApplications(student);

        long appliedCount = applications.size();
        long interviewsCount = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.ONLINE_ASSESSMENT
                        || app.getStatus() == ApplicationStatus.TECHNICAL_INTERVIEW
                        || app.getStatus() == ApplicationStatus.HR_INTERVIEW)
                .count();
        long offersCount = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SELECTED)
                .count();

        Map<String, Object> response = new HashMap<>();
        response.put("totalDrives", activeDrives.size());
        response.put("eligibleDrives", eligibleDrives.size());
        response.put("appliedJobs", appliedCount);
        response.put("interviews", interviewsCount);
        response.put("offers", offersCount);

        return ResponseEntity.ok(response);
    }
}
