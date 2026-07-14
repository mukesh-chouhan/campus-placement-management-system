package com.placehub.service;

import com.placehub.dto.request.CompanyRequest;
import com.placehub.entity.Company;
import com.placehub.exception.ResourceNotFoundException;
import com.placehub.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;

    @Transactional
    public Company createCompany(CompanyRequest request) {
        Company company = new Company();
        company.setCompanyName(request.getCompanyName());
        company.setLocation(request.getLocation());
        company.setWebsite(request.getWebsite());
        return companyRepository.save(company);
    }

    @Transactional(readOnly = true)
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Company getCompanyById(Long id) {
        return companyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    @Transactional
    public Company updateCompany(Long id, CompanyRequest request) {
        Company company = getCompanyById(id);
        company.setCompanyName(request.getCompanyName());
        company.setLocation(request.getLocation());
        company.setWebsite(request.getWebsite());
        return companyRepository.save(company);
    }

    @Transactional
    public void deleteCompany(Long id) {
        Company company = getCompanyById(id);
        companyRepository.delete(company);
    }
}
