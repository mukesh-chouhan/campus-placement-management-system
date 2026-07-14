package com.placehub.service;

import com.placehub.dto.request.JobDriveRequest;
import com.placehub.dto.response.EligibilityResponse;
import com.placehub.entity.Company;
import com.placehub.entity.EligibleBranch;
import com.placehub.entity.JobDrive;
import com.placehub.entity.Student;
import com.placehub.enums.DriveStatus;
import com.placehub.exception.ResourceNotFoundException;
import com.placehub.repository.CompanyRepository;
import com.placehub.repository.EligibleBranchRepository;
import com.placehub.repository.JobDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobDriveService {
    private final JobDriveRepository jobDriveRepository;
    private final CompanyRepository companyRepository;
    private final EligibleBranchRepository eligibleBranchRepository;
    private final EligibilityService eligibilityService;

    @Transactional
    public JobDrive createJobDrive(JobDriveRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.getCompanyId()));

        JobDrive jobDrive = new JobDrive();
        jobDrive.setCompany(company);
        jobDrive.setRole(request.getRole());
        jobDrive.setJobDescription(request.getJobDescription());
        jobDrive.setPackageCtc(request.getPackageCtc());
        jobDrive.setMinimumCgpa(request.getMinimumCgpa());
        jobDrive.setAllowedBacklogs(request.getAllowedBacklogs());
        jobDrive.setGraduationYear(request.getGraduationYear());
        jobDrive.setApplicationDeadline(request.getApplicationDeadline());
        jobDrive.setDriveDate(request.getDriveDate());
        jobDrive.setStatus(request.getStatus());

        JobDrive savedDrive = jobDriveRepository.save(jobDrive);

        if (request.getEligibleBranches() != null) {
            List<EligibleBranch> branches = request.getEligibleBranches().stream()
                    .map(branchName -> {
                        EligibleBranch branch = new EligibleBranch();
                        branch.setJobDrive(savedDrive);
                        branch.setBranch(branchName);
                        return branch;
                    })
                    .collect(Collectors.toList());
            eligibleBranchRepository.saveAll(branches);
            savedDrive.setEligibleBranches(branches);
        }

        return savedDrive;
    }

    @Transactional(readOnly = true)
    public List<JobDrive> getAllJobDrives() {
        return jobDriveRepository.findAll();
    }

    @Transactional(readOnly = true)
    public JobDrive getJobDriveById(Long id) {
        return jobDriveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found with ID: " + id));
    }

    @Transactional
    public JobDrive updateJobDrive(Long id, JobDriveRequest request) {
        JobDrive jobDrive = getJobDriveById(id);
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.getCompanyId()));

        jobDrive.setCompany(company);
        jobDrive.setRole(request.getRole());
        jobDrive.setJobDescription(request.getJobDescription());
        jobDrive.setPackageCtc(request.getPackageCtc());
        jobDrive.setMinimumCgpa(request.getMinimumCgpa());
        jobDrive.setAllowedBacklogs(request.getAllowedBacklogs());
        jobDrive.setGraduationYear(request.getGraduationYear());
        jobDrive.setApplicationDeadline(request.getApplicationDeadline());
        jobDrive.setDriveDate(request.getDriveDate());
        jobDrive.setStatus(request.getStatus());

        // Remove old branches
        eligibleBranchRepository.deleteAll(jobDrive.getEligibleBranches());
        jobDrive.getEligibleBranches().clear();

        JobDrive savedDrive = jobDriveRepository.save(jobDrive);

        if (request.getEligibleBranches() != null) {
            List<EligibleBranch> branches = request.getEligibleBranches().stream()
                    .map(branchName -> {
                        EligibleBranch branch = new EligibleBranch();
                        branch.setJobDrive(savedDrive);
                        branch.setBranch(branchName);
                        return branch;
                    })
                    .collect(Collectors.toList());
            eligibleBranchRepository.saveAll(branches);
            savedDrive.setEligibleBranches(branches);
        }

        return savedDrive;
    }

    @Transactional
    public void deleteJobDrive(Long id) {
        JobDrive jobDrive = getJobDriveById(id);
        jobDriveRepository.delete(jobDrive);
    }

    @Transactional(readOnly = true)
    public List<JobDrive> getActiveJobDrives() {
        return jobDriveRepository.findByStatus(DriveStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<JobDrive> getEligibleJobDrives(Student student) {
        List<JobDrive> activeDrives = getActiveJobDrives();
        List<JobDrive> eligibleDrives = new ArrayList<>();
        for (JobDrive drive : activeDrives) {
            EligibilityResponse response = eligibilityService.evaluate(student, drive);
            if (response.isEligible()) {
                eligibleDrives.add(drive);
            }
        }
        return eligibleDrives;
    }
}
