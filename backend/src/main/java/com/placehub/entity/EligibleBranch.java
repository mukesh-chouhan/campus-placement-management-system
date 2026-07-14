package com.placehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "eligible_branches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EligibleBranch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private JobDrive jobDrive;

    @Column(nullable = false)
    private String branch;
}
