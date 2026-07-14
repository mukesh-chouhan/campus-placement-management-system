package com.placehub.entity;

import com.placehub.enums.DriveStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_drives")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDrive {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false)
    @NotBlank
    private String role;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "package_ctc", precision = 10, scale = 2)
    private BigDecimal packageCtc;

    @Column(name = "minimum_cgpa", precision = 3, scale = 2)
    private BigDecimal minimumCgpa;

    @Column(name = "allowed_backlogs")
    private Integer allowedBacklogs;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "drive_date")
    private LocalDate driveDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriveStatus status = DriveStatus.DRAFT;

    @OneToMany(mappedBy = "jobDrive", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EligibleBranch> eligibleBranches = new ArrayList<>();

    @OneToMany(mappedBy = "jobDrive", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications = new ArrayList<>();
}
