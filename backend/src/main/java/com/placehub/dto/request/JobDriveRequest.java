package com.placehub.dto.request;

import com.placehub.enums.DriveStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class JobDriveRequest {
    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Role is required")
    private String role;

    private String jobDescription;

    private BigDecimal packageCtc;

    @DecimalMin(value = "0.0", message = "Minimum CGPA must be between 0 and 10")
    private BigDecimal minimumCgpa;

    @PositiveOrZero(message = "Allowed backlogs cannot be negative")
    private Integer allowedBacklogs;

    private Integer graduationYear;
    private LocalDate applicationDeadline;
    private LocalDate driveDate;
    private DriveStatus status = DriveStatus.DRAFT;
    private List<String> eligibleBranches;
}
