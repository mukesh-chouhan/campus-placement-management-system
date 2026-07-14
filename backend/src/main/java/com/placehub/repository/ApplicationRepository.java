package com.placehub.repository;

import com.placehub.entity.Application;
import com.placehub.entity.JobDrive;
import com.placehub.entity.Student;
import com.placehub.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByStudentAndJobDrive(Student student, JobDrive jobDrive);
    Optional<Application> findByStudentAndJobDrive(Student student, JobDrive jobDrive);
    List<Application> findByStudent(Student student);
    List<Application> findByJobDrive(JobDrive jobDrive);
    long countByStatus(ApplicationStatus status);
    long countByStudent(Student student);
}
