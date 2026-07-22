package com.placehub.config;

import com.placehub.entity.*;
import com.placehub.enums.DriveStatus;
import com.placehub.enums.UserRole;
import com.placehub.repository.AdminRepository;
import com.placehub.repository.CompanyRepository;
import com.placehub.repository.JobDriveRepository;
import com.placehub.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobDriveRepository jobDriveRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking data seeding status...");

        // 1. Seed & Reset Admin (Ensure admin@placehub.com is always active with password 'admin123')
        Admin admin = adminRepository.findByEmail("admin@placehub.com").orElse(null);
        if (admin == null) {
            log.info("Seeding Admin User...");
            admin = new Admin();
            admin.setName("System Admin");
            admin.setEmail("admin@placehub.com");
            admin.setPassword(passwordEncoder.encode("admin@123"));
            admin.setRole(UserRole.ADMIN);
            adminRepository.save(admin);
        } else {
            log.info("Ensuring default Admin credentials match 'admin@123'...");
            admin.setPassword(passwordEncoder.encode("admin@123"));
            admin.setName("System Admin");
            admin.setRole(UserRole.ADMIN);
            adminRepository.save(admin);
        }

        // 2. Seed Companies
        if (companyRepository.count() == 0) {
            log.info("Seeding Companies...");
            Company google = new Company(null, "Google", "Bangalore, India", "https://google.com", new ArrayList<>());
            Company microsoft = new Company(null, "Microsoft", "Hyderabad, India", "https://microsoft.com", new ArrayList<>());
            Company amazon = new Company(null, "Amazon", "Chennai, India", "https://amazon.com", new ArrayList<>());

            companyRepository.saveAll(List.of(google, microsoft, amazon));
        }

        // 3. Seed & Reset Students (Ensure default test students are active with password 'student123')
        Student student1 = studentRepository.findByEmail("rohit@placehub.com").orElse(null);
        if (student1 == null) {
            log.info("Seeding Student: Rohit...");
            student1 = new Student(
                    null,
                    "Rohit Kumar",
                    "rohit@placehub.com",
                    passwordEncoder.encode("student123"),
                    "CS2023001",
                    "Computer Science & Engineering (CSE)",
                    new BigDecimal("9.20"),
                    0,
                    2026,
                    List.of("Java", "Spring Boot", "React", "MySQL"),
                    UserRole.STUDENT,
                    false,
                    null,
                    null, null, null, null
            );
            studentRepository.save(student1);
        } else {
            log.info("Ensuring Rohit credentials match 'student123'...");
            student1.setPassword(passwordEncoder.encode("student123"));
            student1.setBranch("Computer Science & Engineering (CSE)");
            studentRepository.save(student1);
        }

        Student student2 = studentRepository.findByEmail("priya@placehub.com").orElse(null);
        if (student2 == null) {
            log.info("Seeding Student: Priya...");
            student2 = new Student(
                    null,
                    "Priya Sharma",
                    "priya@placehub.com",
                    passwordEncoder.encode("student123"),
                    "IT2023002",
                    "Information Technology (IT)",
                    new BigDecimal("8.50"),
                    0,
                    2026,
                    List.of("Python", "Machine Learning", "React"),
                    UserRole.STUDENT,
                    false,
                    null,
                    null, null, null, null
            );
            studentRepository.save(student2);
        } else {
            log.info("Ensuring Priya credentials match 'student123'...");
            student2.setPassword(passwordEncoder.encode("student123"));
            student2.setBranch("Information Technology (IT)");
            studentRepository.save(student2);
        }

        Student student3 = studentRepository.findByEmail("amit@placehub.com").orElse(null);
        if (student3 == null) {
            log.info("Seeding Student: Amit...");
            student3 = new Student(
                    null,
                    "Amit Singh",
                    "amit@placehub.com",
                    passwordEncoder.encode("student123"),
                    "ME2023003",
                    "Mechanical Engineering",
                    new BigDecimal("6.80"),
                    1,
                    2026,
                    List.of("AutoCAD", "MATLAB"),
                    UserRole.STUDENT,
                    false,
                    null,
                    null, null, null, null
            );
            studentRepository.save(student3);
        } else {
            log.info("Ensuring Amit credentials match 'student123'...");
            student3.setPassword(passwordEncoder.encode("student123"));
            studentRepository.save(student3);
        }

        // 4. Seed Job Drives
        if (jobDriveRepository.count() == 0) {
            log.info("Seeding Job Drives...");
            Company google = companyRepository.findAll().stream()
                    .filter(c -> c.getCompanyName().equalsIgnoreCase("Google")).findFirst().orElse(null);
            Company microsoft = companyRepository.findAll().stream()
                    .filter(c -> c.getCompanyName().equalsIgnoreCase("Microsoft")).findFirst().orElse(null);
            Company amazon = companyRepository.findAll().stream()
                    .filter(c -> c.getCompanyName().equalsIgnoreCase("Amazon")).findFirst().orElse(null);

            if (google != null) {
                JobDrive drive = new JobDrive();
                drive.setCompany(google);
                drive.setRole("Software Engineer");
                drive.setJobDescription("Develop scale-level search and cloud features.");
                drive.setPackageCtc(new BigDecimal("2400000.00"));
                drive.setMinimumCgpa(new BigDecimal("8.00"));
                drive.setAllowedBacklogs(0);
                drive.setGraduationYear(2026);
                drive.setApplicationDeadline(LocalDate.now().plusDays(10));
                drive.setDriveDate(LocalDate.now().plusDays(15));
                drive.setStatus(DriveStatus.ACTIVE);

                EligibleBranch b1 = new EligibleBranch(null, drive, "Computer Science & Engineering (CSE)");
                EligibleBranch b2 = new EligibleBranch(null, drive, "Information Technology (IT)");
                drive.setEligibleBranches(List.of(b1, b2));

                jobDriveRepository.save(drive);
            }

            if (microsoft != null) {
                JobDrive drive = new JobDrive();
                drive.setCompany(microsoft);
                drive.setRole("System Engineer");
                drive.setJobDescription("Maintain scalable Azure and Windows kernel services.");
                drive.setPackageCtc(new BigDecimal("1800000.00"));
                drive.setMinimumCgpa(new BigDecimal("7.50"));
                drive.setAllowedBacklogs(1);
                drive.setGraduationYear(2026);
                drive.setApplicationDeadline(LocalDate.now().plusDays(5));
                drive.setDriveDate(LocalDate.now().plusDays(7));
                drive.setStatus(DriveStatus.ACTIVE);

                EligibleBranch b1 = new EligibleBranch(null, drive, "Computer Science & Engineering (CSE)");
                EligibleBranch b2 = new EligibleBranch(null, drive, "Information Technology (IT)");
                drive.setEligibleBranches(List.of(b1, b2));

                jobDriveRepository.save(drive);
            }

            if (amazon != null) {
                JobDrive drive = new JobDrive();
                drive.setCompany(amazon);
                drive.setRole("Support Engineer");
                drive.setJobDescription("Work with AWS enterprise clients to resolve operations.");
                drive.setPackageCtc(new BigDecimal("1000000.00"));
                drive.setMinimumCgpa(new BigDecimal("6.00"));
                drive.setAllowedBacklogs(2);
                drive.setGraduationYear(2026);
                drive.setApplicationDeadline(LocalDate.now().plusDays(8));
                drive.setDriveDate(LocalDate.now().plusDays(12));
                drive.setStatus(DriveStatus.ACTIVE);

                EligibleBranch b1 = new EligibleBranch(null, drive, "Computer Science & Engineering (CSE)");
                EligibleBranch b2 = new EligibleBranch(null, drive, "Information Technology (IT)");
                EligibleBranch b3 = new EligibleBranch(null, drive, "Mechanical Engineering");
                drive.setEligibleBranches(List.of(b1, b2, b3));

                jobDriveRepository.save(drive);
            }
        }
        log.info("Data seeding finished successfully.");
    }
}
