package com.placehub.dto.response;

import com.placehub.entity.Application;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentRollNumber;
    private String studentBranch;
    private BigDecimal studentCgpa;
    private Integer studentBacklogs;
    private Long jobId;
    private String companyName;
    private String role;
    private BigDecimal packageCtc;
    private String status;
    private LocalDateTime appliedDate;

    public static ApplicationResponse fromEntity(Application app) {
        if (app == null) return null;
        return new ApplicationResponse(
                app.getId(),
                app.getStudent() != null ? app.getStudent().getId() : null,
                app.getStudent() != null ? app.getStudent().getName() : null,
                app.getStudent() != null ? app.getStudent().getRollNumber() : null,
                app.getStudent() != null ? app.getStudent().getBranch() : null,
                app.getStudent() != null ? app.getStudent().getCgpa() : null,
                app.getStudent() != null ? app.getStudent().getBacklogs() : null,
                app.getJobDrive() != null ? app.getJobDrive().getId() : null,
                (app.getJobDrive() != null && app.getJobDrive().getCompany() != null) ? app.getJobDrive().getCompany().getCompanyName() : null,
                app.getJobDrive() != null ? app.getJobDrive().getRole() : null,
                app.getJobDrive() != null ? app.getJobDrive().getPackageCtc() : null,
                app.getStatus().name(),
                app.getAppliedDate()
        );
    }
}
