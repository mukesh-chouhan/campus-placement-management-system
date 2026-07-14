package com.placehub.service;

import com.placehub.dto.response.EligibilityResponse;
import com.placehub.entity.EligibleBranch;
import com.placehub.entity.JobDrive;
import com.placehub.entity.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EligibilityServiceTest {

    private EligibilityService eligibilityService;
    private Student student;
    private JobDrive jobDrive;

    @BeforeEach
    public void setUp() {
        eligibilityService = new EligibilityService();

        student = new Student();
        student.setId(1L);
        student.setName("Test Student");
        student.setEmail("student@test.com");
        student.setBranch("Computer Science");
        student.setCgpa(new BigDecimal("8.50"));
        student.setBacklogs(0);
        student.setGraduationYear(2026);

        jobDrive = new JobDrive();
        jobDrive.setId(1L);
        jobDrive.setRole("Software Engineer");
        jobDrive.setMinimumCgpa(new BigDecimal("8.00"));
        jobDrive.setAllowedBacklogs(0);
        jobDrive.setGraduationYear(2026);

        EligibleBranch csBranch = new EligibleBranch(1L, jobDrive, "Computer Science");
        EligibleBranch itBranch = new EligibleBranch(2L, jobDrive, "Information Technology");
        jobDrive.setEligibleBranches(List.of(csBranch, itBranch));
    }

    @Test
    public void testStudentEligible_Success() {
        EligibilityResponse response = eligibilityService.evaluate(student, jobDrive);
        assertTrue(response.isEligible());
        assertTrue(response.getFailedReasons().isEmpty());
    }

    @Test
    public void testStudentIneligible_DueToCgpa() {
        student.setCgpa(new BigDecimal("7.50"));
        EligibilityResponse response = eligibilityService.evaluate(student, jobDrive);
        assertFalse(response.isEligible());
        assertEquals(1, response.getFailedReasons().size());
        assertTrue(response.getFailedReasons().get(0).contains("Minimum CGPA required is 8.00"));
    }

    @Test
    public void testStudentIneligible_DueToBacklogs() {
        student.setBacklogs(1);
        EligibilityResponse response = eligibilityService.evaluate(student, jobDrive);
        assertFalse(response.isEligible());
        assertEquals(1, response.getFailedReasons().size());
        assertTrue(response.getFailedReasons().get(0).contains("active backlog"));
    }

    @Test
    public void testStudentIneligible_DueToBranch() {
        student.setBranch("Mechanical Engineering");
        EligibilityResponse response = eligibilityService.evaluate(student, jobDrive);
        assertFalse(response.isEligible());
        assertEquals(1, response.getFailedReasons().size());
        assertTrue(response.getFailedReasons().get(0).contains("not an eligible branch"));
    }

    @Test
    public void testStudentIneligible_DueToGraduationYear() {
        student.setGraduationYear(2025);
        EligibilityResponse response = eligibilityService.evaluate(student, jobDrive);
        assertFalse(response.isEligible());
        assertEquals(1, response.getFailedReasons().size());
        assertTrue(response.getFailedReasons().get(0).contains("Graduation year must be 2026"));
    }

    @Test
    public void testMultipleIneligibilities() {
        student.setCgpa(new BigDecimal("7.00"));
        student.setBacklogs(2);
        student.setBranch("Civil Engineering");
        student.setGraduationYear(2024);

        EligibilityResponse response = eligibilityService.evaluate(student, jobDrive);
        assertFalse(response.isEligible());
        assertEquals(4, response.getFailedReasons().size());
    }
}
