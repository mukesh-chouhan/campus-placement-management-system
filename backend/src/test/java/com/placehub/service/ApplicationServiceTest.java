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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobDriveRepository jobDriveRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private EligibilityService eligibilityService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ApplicationService applicationService;

    private Student student;
    private JobDrive jobDrive;
    private EligibilityResponse eligibilityResponse;

    @BeforeEach
    public void setUp() {
        student = new Student();
        student.setId(1L);
        student.setName("Student Name");

        jobDrive = new JobDrive();
        jobDrive.setId(10L);
        jobDrive.setRole("Developer");

        eligibilityResponse = new EligibilityResponse();
        eligibilityResponse.setEligible(true);
    }

    @Test
    public void testApplyForJob_Success() {
        when(jobDriveRepository.findById(10L)).thenReturn(Optional.of(jobDrive));
        when(eligibilityService.evaluate(student, jobDrive)).thenReturn(eligibilityResponse);
        when(applicationRepository.existsByStudentAndJobDrive(student, jobDrive)).thenReturn(false);

        Application mockApp = new Application();
        mockApp.setId(100L);
        mockApp.setStudent(student);
        mockApp.setJobDrive(jobDrive);
        mockApp.setStatus(ApplicationStatus.APPLIED);
        when(applicationRepository.save(any(Application.class))).thenReturn(mockApp);

        Application result = applicationService.applyForJob(student, 10L);

        assertNotNull(result);
        assertEquals(ApplicationStatus.APPLIED, result.getStatus());
        assertEquals(student, result.getStudent());
        assertEquals(jobDrive, result.getJobDrive());
        verify(applicationRepository, times(1)).save(any(Application.class));
    }

    @Test
    public void testApplyForJob_JobNotFound() {
        when(jobDriveRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            applicationService.applyForJob(student, 99L);
        });
    }

    @Test
    public void testApplyForJob_Ineligible() {
        eligibilityResponse.setEligible(false);
        eligibilityResponse.setFailedReasons(List.of("CGPA below required"));
        
        when(jobDriveRepository.findById(10L)).thenReturn(Optional.of(jobDrive));
        when(eligibilityService.evaluate(student, jobDrive)).thenReturn(eligibilityResponse);

        assertThrows(EligibilityException.class, () -> {
            applicationService.applyForJob(student, 10L);
        });
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    public void testApplyForJob_DuplicateApplication() {
        when(jobDriveRepository.findById(10L)).thenReturn(Optional.of(jobDrive));
        when(eligibilityService.evaluate(student, jobDrive)).thenReturn(eligibilityResponse);
        when(applicationRepository.existsByStudentAndJobDrive(student, jobDrive)).thenReturn(true);

        assertThrows(DuplicateApplicationException.class, () -> {
            applicationService.applyForJob(student, 10L);
        });
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    public void testUpdateApplicationStatus() {
        Application app = new Application();
        app.setId(100L);
        app.setStatus(ApplicationStatus.APPLIED);

        when(applicationRepository.findById(100L)).thenReturn(Optional.of(app));
        when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Application updated = applicationService.updateApplicationStatus(100L, ApplicationStatus.TECHNICAL_INTERVIEW);

        assertNotNull(updated);
        assertEquals(ApplicationStatus.TECHNICAL_INTERVIEW, updated.getStatus());
        verify(applicationRepository, times(1)).save(app);
    }
}
