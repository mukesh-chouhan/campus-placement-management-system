package com.placehub.entity;

import com.placehub.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(name = "uk_student_job", columnNames = {"student_id", "job_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobDrive jobDrive;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "applied_date")
    private LocalDateTime appliedDate = LocalDateTime.now();

    private Integer rating;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;
}
