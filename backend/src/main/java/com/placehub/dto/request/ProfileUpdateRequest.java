package com.placehub.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProfileUpdateRequest {
    @NotBlank(message = "Full name is required")
    private String name;

    @Email(message = "Please provide a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    private String branch;

    @PositiveOrZero(message = "CGPA must be zero or greater")
    private BigDecimal cgpa;

    @PositiveOrZero(message = "Backlogs cannot be negative")
    private Integer backlogs;

    private Integer graduationYear;
    private List<String> skills;
    private String experiencesJson;
    private String projectsJson;
    private String skillCategoriesJson;
    private String accomplishmentsJson;
}
