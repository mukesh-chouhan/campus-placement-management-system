package com.placehub.dto.response;

import com.placehub.entity.Company;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {
    private Long id;
    private String companyName;
    private String location;
    private String website;

    public static CompanyResponse fromEntity(Company company) {
        if (company == null) return null;
        return new CompanyResponse(
                company.getId(),
                company.getCompanyName(),
                company.getLocation(),
                company.getWebsite()
        );
    }
}
