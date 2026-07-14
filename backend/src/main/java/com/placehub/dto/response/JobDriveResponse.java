package com.placehub.dto.response;

import com.placehub.entity.JobDrive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDriveResponse {
    private Long id;
    private Long companyId;
    private String companyName;
    private String companyLocation;
    private String companyWebsite;
    private String role;
    private String jobDescription;
    private BigDecimal packageCtc;
    private BigDecimal minimumCgpa;
    private Integer allowedBacklogs;
    private Integer graduationYear;
    private LocalDate applicationDeadline;
    private LocalDate driveDate;
    private String status;
    private List<String> eligibleBranches;

    public static JobDriveResponse fromEntity(JobDrive drive) {
        if (drive == null) return null;
        List<String> branches = drive.getEligibleBranches().stream()
                .map(b -> b.getBranch())
                .collect(Collectors.toList());

        return new JobDriveResponse(
                drive.getId(),
                drive.getCompany() != null ? drive.getCompany().getId() : null,
                drive.getCompany() != null ? drive.getCompany().getCompanyName() : null,
                drive.getCompany() != null ? drive.getCompany().getLocation() : null,
                drive.getCompany() != null ? drive.getCompany().getWebsite() : null,
                drive.getRole(),
                drive.getJobDescription(),
                drive.getPackageCtc(),
                drive.getMinimumCgpa(),
                drive.getAllowedBacklogs(),
                drive.getGraduationYear(),
                drive.getApplicationDeadline(),
                drive.getDriveDate(),
                drive.getStatus().name(),
                branches
        );
    }
}
