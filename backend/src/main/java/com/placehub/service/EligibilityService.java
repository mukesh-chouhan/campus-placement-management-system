package com.placehub.service;

import com.placehub.dto.response.EligibilityResponse;
import com.placehub.entity.JobDrive;
import com.placehub.entity.Student;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class EligibilityService {

    public EligibilityResponse evaluate(Student student, JobDrive jobDrive) {
        EligibilityResponse response = new EligibilityResponse();
        Map<String, EligibilityResponse.EligibilityCheckResult> checks = new LinkedHashMap<>();

        boolean cgpaPassed = student.getCgpa() != null && jobDrive.getMinimumCgpa() != null && student.getCgpa().compareTo(jobDrive.getMinimumCgpa()) >= 0;
        checks.put("cgpa", new EligibilityResponse.EligibilityCheckResult(
                cgpaPassed,
                student.getCgpa(),
                jobDrive.getMinimumCgpa(),
                null,
                null));

        boolean branchPassed = false;
        List<String> eligibleBranches = new ArrayList<>();
        if (jobDrive.getEligibleBranches() != null) {
            for (var branch : jobDrive.getEligibleBranches()) {
                eligibleBranches.add(branch.getBranch());
            }
        }
        if (student.getBranch() != null && eligibleBranches.contains(student.getBranch())) {
            branchPassed = true;
        }
        checks.put("branch", new EligibilityResponse.EligibilityCheckResult(
                branchPassed,
                student.getBranch(),
                eligibleBranches,
                eligibleBranches,
                null));

        boolean backlogPassed = student.getBacklogs() != null && jobDrive.getAllowedBacklogs() != null && student.getBacklogs() <= jobDrive.getAllowedBacklogs();
        checks.put("backlogs", new EligibilityResponse.EligibilityCheckResult(
                backlogPassed,
                student.getBacklogs(),
                null,
                null,
                jobDrive.getAllowedBacklogs()));

        boolean graduationPassed = student.getGraduationYear() != null && jobDrive.getGraduationYear() != null && student.getGraduationYear().equals(jobDrive.getGraduationYear());
        checks.put("graduationYear", new EligibilityResponse.EligibilityCheckResult(
                graduationPassed,
                student.getGraduationYear(),
                jobDrive.getGraduationYear(),
                null,
                null));

        List<String> failedReasons = new ArrayList<>();
        if (!cgpaPassed) {
            failedReasons.add("Minimum CGPA required is " + jobDrive.getMinimumCgpa() + ". Your CGPA is " + student.getCgpa() + ".");
        }
        if (!branchPassed) {
            failedReasons.add(student.getBranch() + " is not an eligible branch for this drive.");
        }
        if (!backlogPassed) {
            failedReasons.add("You have " + student.getBacklogs() + " active backlog(s), but the maximum allowed is " + jobDrive.getAllowedBacklogs() + ".");
        }
        if (!graduationPassed) {
            failedReasons.add("Graduation year must be " + jobDrive.getGraduationYear() + ". Your graduation year is " + student.getGraduationYear() + ".");
        }

        response.setEligible(cgpaPassed && branchPassed && backlogPassed && graduationPassed);
        response.setChecks(checks);
        response.setFailedReasons(failedReasons);
        return response;
    }
}
