package com.placehub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRequest {
    @NotBlank(message = "Company name is required")
    private String companyName;

    private String location;

    private String website;
}
