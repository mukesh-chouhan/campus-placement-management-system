package com.placehub.service;

import com.placehub.dto.response.EligibilityResponse;
import com.placehub.entity.Application;
import com.placehub.entity.JobDrive;
import com.placehub.entity.Student;
import com.placehub.enums.ApplicationStatus;
import com.placehub.exception.DuplicateApplicationException;
import com.placehub.exception.EligibilityException;
import com.placehub.exception.ResourceNotFoundException;
import com.placehub.repository.ApplicationRepository;
import com.placehub.repository.JobDriveRepository;
import com.placehub.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final JobDriveRepository jobDriveRepository;
    private final StudentRepository studentRepository;
    private final EligibilityService eligibilityService;
    private final EmailService emailService;

    @Transactional
    public Application applyForJob(Student student, Long jobId) {
        if (Boolean.TRUE.equals(student.getIsBlacklisted())) {
            throw new IllegalStateException("Your account has been blacklisted by the placement administration.");
        }

        JobDrive jobDrive = jobDriveRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found with ID: " + jobId));

        // Evaluate eligibility
        EligibilityResponse eligibility = eligibilityService.evaluate(student, jobDrive);
        if (!eligibility.isEligible()) {
            String reasons = String.join("; ", eligibility.getFailedReasons());
            throw new EligibilityException("Not eligible to apply: " + reasons);
        }

        // Check if already applied
        if (applicationRepository.existsByStudentAndJobDrive(student, jobDrive)) {
            throw new DuplicateApplicationException("You have already applied for this job drive.");
        }

        Application application = new Application();
        application.setStudent(student);
        application.setJobDrive(jobDrive);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setAppliedDate(LocalDateTime.now());

        return applicationRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<Application> getStudentApplications(Student student) {
        return applicationRepository.findByStudent(student);
    }

    @Transactional(readOnly = true)
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + id));
    }

    @Transactional
    public Application updateApplicationStatus(Long id, ApplicationStatus status) {
        Application application = getApplicationById(id);
        application.setStatus(status);
        Application saved = applicationRepository.save(application);

        if (saved.getStudent() != null && saved.getJobDrive() != null) {
            String companyName = saved.getJobDrive().getCompany() != null ? saved.getJobDrive().getCompany().getCompanyName() : "Company";
            emailService.sendApplicationStatusNotification(
                    saved.getStudent().getEmail(),
                    saved.getStudent().getName(),
                    companyName,
                    saved.getJobDrive().getRole(),
                    status.name()
            );
        }
        return saved;
    }

    @Transactional
    public Application updateApplicationDetails(Long id, ApplicationStatus status, Integer rating, String adminNotes) {
        Application application = getApplicationById(id);
        if (status != null) application.setStatus(status);
        if (rating != null) application.setRating(rating);
        if (adminNotes != null) application.setAdminNotes(adminNotes);
        Application saved = applicationRepository.save(application);

        if (status != null && saved.getStudent() != null && saved.getJobDrive() != null) {
            String companyName = saved.getJobDrive().getCompany() != null ? saved.getJobDrive().getCompany().getCompanyName() : "Company";
            emailService.sendApplicationStatusNotification(
                    saved.getStudent().getEmail(),
                    saved.getStudent().getName(),
                    companyName,
                    saved.getJobDrive().getRole(),
                    status.name()
            );
        }
        return saved;
    }

    @Transactional
    public void withdrawApplication(Long id, Student student) {
        Application application = getApplicationById(id);
        if (!application.getStudent().getId().equals(student.getId())) {
            throw new IllegalArgumentException("You can only withdraw your own applications.");
        }
        applicationRepository.delete(application);
    }
}
