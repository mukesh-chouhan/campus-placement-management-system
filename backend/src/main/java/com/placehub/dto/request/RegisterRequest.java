package com.placehub.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    private String name;

    @Email(message = "Please provide a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "Branch is required")
    private String branch;

    @NotNull(message = "CGPA is required")
    @PositiveOrZero(message = "CGPA must be zero or greater")
    private BigDecimal cgpa;

    @PositiveOrZero(message = "Backlogs cannot be negative")
    private Integer backlogs;

    @NotNull(message = "Graduation year is required")
    private Integer graduationYear;

    private List<String> skills;
}
