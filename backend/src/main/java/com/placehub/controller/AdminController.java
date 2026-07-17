package com.placehub.controller;

import com.placehub.dto.request.ApplicationStatusRequest;
import com.placehub.dto.request.CompanyRequest;
import com.placehub.dto.request.JobDriveRequest;
import com.placehub.dto.request.ProfileUpdateRequest;
import com.placehub.dto.request.RegisterRequest;
import com.placehub.service.StudentService;
import com.placehub.dto.response.ApplicationResponse;
import com.placehub.dto.response.JobDriveResponse;
import com.placehub.dto.response.StudentResponse;
import com.placehub.dto.response.CompanyResponse;
import com.placehub.entity.Application;
import com.placehub.entity.Company;
import com.placehub.entity.JobDrive;
import com.placehub.entity.Student;
import com.placehub.enums.ApplicationStatus;
import com.placehub.enums.DriveStatus;
import com.placehub.repository.ApplicationRepository;
import com.placehub.repository.CompanyRepository;
import com.placehub.repository.JobDriveRepository;
import com.placehub.repository.StudentRepository;
import com.placehub.service.CompanyService;
import com.placehub.service.JobDriveService;
import com.placehub.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {
    private final CompanyService companyService;
    private final JobDriveService jobDriveService;
    private final ApplicationService applicationService;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobDriveRepository jobDriveRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentService studentService;

    // --- Company CRUD ---
    @PostMapping("/companies")
    public ResponseEntity<CompanyResponse> createCompany(@Valid @RequestBody CompanyRequest request) {
        Company company = companyService.createCompany(request);
        return new ResponseEntity<>(CompanyResponse.fromEntity(company), HttpStatus.CREATED);
    }

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        List<Company> companies = companyService.getAllCompanies();
        List<CompanyResponse> response = companies.stream()
                .map(CompanyResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<CompanyResponse> updateCompany(@PathVariable Long id, @Valid @RequestBody CompanyRequest request) {
        Company company = companyService.updateCompany(id, request);
        return ResponseEntity.ok(CompanyResponse.fromEntity(company));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    // --- Job Drive CRUD ---
    @PostMapping("/jobs")
    public ResponseEntity<JobDriveResponse> createJobDrive(@Valid @RequestBody JobDriveRequest request) {
        JobDrive drive = jobDriveService.createJobDrive(request);
        return new ResponseEntity<>(JobDriveResponse.fromEntity(drive), HttpStatus.CREATED);
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobDriveResponse>> getAllJobDrives() {
        List<JobDrive> drives = jobDriveService.getAllJobDrives();
        List<JobDriveResponse> response = drives.stream()
                .map(JobDriveResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<JobDriveResponse> updateJobDrive(@PathVariable Long id, @Valid @RequestBody JobDriveRequest request) {
        JobDrive drive = jobDriveService.updateJobDrive(id, request);
        return ResponseEntity.ok(JobDriveResponse.fromEntity(drive));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJobDrive(@PathVariable Long id) {
        jobDriveService.deleteJobDrive(id);
        return ResponseEntity.noContent().build();
    }

    // --- Applications CRUD ---
    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {
        List<Application> apps = applicationService.getAllApplications();
        List<ApplicationResponse> response = apps.stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusRequest request) {
        Application app = applicationService.updateApplicationStatus(id, request.getStatus());
        return ResponseEntity.ok(ApplicationResponse.fromEntity(app));
    }

    // --- Students List ---
    @GetMapping("/students")
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        List<StudentResponse> response = students.stream()
                .map(StudentResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/students")
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody RegisterRequest request) {
        Student student = studentService.createStudent(request);
        return new ResponseEntity<>(StudentResponse.fromEntity(student), HttpStatus.CREATED);
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<StudentResponse> updateStudent(@PathVariable Long id, @Valid @RequestBody ProfileUpdateRequest request) {
        Student student = studentService.updateStudentAdmin(id, request);
        return ResponseEntity.ok(StudentResponse.fromEntity(student));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // --- Dashboard Stats ---
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalCompanies = companyRepository.count();
        long activeDrives = jobDriveRepository.findByStatus(DriveStatus.ACTIVE).size();
        long applications = applicationRepository.count();
        
        long selectedStudents = applicationRepository.findAll().stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SELECTED)
                .map(app -> app.getStudent().getId())
                .distinct()
                .count();

        Map<String, Object> response = new HashMap<>();
        response.put("totalStudents", totalStudents);
        response.put("totalCompanies", totalCompanies);
        response.put("activeDrives", activeDrives);
        response.put("applications", applications);
        response.put("selectedStudents", selectedStudents);

        return ResponseEntity.ok(response);
    }

    // --- Analytics ---
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        List<Student> students = studentRepository.findAll();
        List<Application> applications = applicationRepository.findAll();

        long totalStudentsCount = students.size();
        
        // Find students placed (at least one application with status SELECTED)
        Set<Long> placedStudentIds = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SELECTED)
                .map(app -> app.getStudent().getId())
                .collect(Collectors.toSet());

        long placedStudentsCount = placedStudentIds.size();
        long remainingStudentsCount = Math.max(0, totalStudentsCount - placedStudentsCount);

        double placementPercentage = totalStudentsCount > 0 
                ? ((double) placedStudentsCount / totalStudentsCount) * 100 
                : 0.0;

        // Calculate Average & Highest package for SELECTED applications
        List<BigDecimal> packages = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SELECTED && app.getJobDrive() != null && app.getJobDrive().getPackageCtc() != null)
                .map(app -> app.getJobDrive().getPackageCtc())
                .collect(Collectors.toList());

        BigDecimal highestPackage = packages.stream()
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal averagePackage = BigDecimal.ZERO;
        if (!packages.isEmpty()) {
            BigDecimal sum = packages.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            averagePackage = sum.divide(BigDecimal.valueOf(packages.size()), 2, RoundingMode.HALF_UP);
        }

        // Company-wise hiring count
        Map<String, Long> companyHiring = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SELECTED && app.getJobDrive() != null && app.getJobDrive().getCompany() != null)
                .collect(Collectors.groupingBy(
                        app -> app.getJobDrive().getCompany().getCompanyName(),
                        Collectors.counting()
                ));

        // Branch-wise placement count
        Map<String, Long> branchPlacement = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SELECTED && app.getStudent() != null)
                .collect(Collectors.groupingBy(
                        app -> app.getStudent().getBranch(),
                        Collectors.counting()
                ));

        // Status distribution count
        Map<String, Long> statusDistribution = applications.stream()
                .collect(Collectors.groupingBy(
                        app -> app.getStatus().name(),
                        Collectors.counting()
                ));

        // Create clean JSON structure
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("placementPercentage", Math.round(placementPercentage * 100.0) / 100.0);
        analytics.put("studentsPlaced", placedStudentsCount);
        analytics.put("remainingStudents", remainingStudentsCount);
        analytics.put("averagePackage", averagePackage);
        analytics.put("highestPackage", highestPackage);
        analytics.put("companyHiring", companyHiring);
        analytics.put("branchPlacement", branchPlacement);
        analytics.put("statusDistribution", statusDistribution);

        return ResponseEntity.ok(analytics);
    }
}
