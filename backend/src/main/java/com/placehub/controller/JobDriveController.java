package com.placehub.controller;

import com.placehub.dto.response.JobDriveResponse;
import com.placehub.entity.JobDrive;
import com.placehub.entity.Student;
import com.placehub.service.JobDriveService;
import com.placehub.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobDriveController {
    private final JobDriveService jobDriveService;
    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<List<JobDriveResponse>> getActiveJobs() {
        List<JobDrive> drives = jobDriveService.getActiveJobDrives();
        List<JobDriveResponse> response = drives.stream()
                .map(JobDriveResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDriveResponse> getJobById(@PathVariable Long id) {
        JobDrive drive = jobDriveService.getJobDriveById(id);
        return ResponseEntity.ok(JobDriveResponse.fromEntity(drive));
    }

    @GetMapping("/eligible")
    public ResponseEntity<List<JobDriveResponse>> getEligibleJobs() {
        Student student = studentService.getCurrentStudent();
        List<JobDrive> drives = jobDriveService.getEligibleJobDrives(student);
        List<JobDriveResponse> response = drives.stream()
                .map(JobDriveResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
