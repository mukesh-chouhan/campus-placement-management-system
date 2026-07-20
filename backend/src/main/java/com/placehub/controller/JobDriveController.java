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
    private final com.placehub.service.AIEvaluatorService aiEvaluatorService;

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

    @GetMapping("/{id}/match")
    public ResponseEntity<com.placehub.dto.response.JobMatchResponse> getJobMatch(@PathVariable Long id) {
        Student student = studentService.getCurrentStudent();
        JobDrive drive = jobDriveService.getJobDriveById(id);
        return ResponseEntity.ok(aiEvaluatorService.evaluateMatch(student, drive));
    }

    @GetMapping("/matches")
    public ResponseEntity<java.util.Map<Long, com.placehub.dto.response.JobMatchResponse>> getAllJobMatches() {
        Student student = studentService.getCurrentStudent();
        List<JobDrive> drives = jobDriveService.getActiveJobDrives();
        java.util.Map<Long, com.placehub.dto.response.JobMatchResponse> matches = new java.util.HashMap<>();
        for (JobDrive drive : drives) {
            matches.put(drive.getId(), aiEvaluatorService.evaluateMatch(student, drive));
        }
        return ResponseEntity.ok(matches);
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
