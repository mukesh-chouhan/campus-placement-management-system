package com.placehub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank
    private String content;

    private String category = "GENERAL";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean active = true;
}
