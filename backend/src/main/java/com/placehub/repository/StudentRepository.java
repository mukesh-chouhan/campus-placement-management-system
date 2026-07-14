package com.placehub.repository;

import com.placehub.entity.Student;
import com.placehub.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRollNumber(String rollNumber);
    Optional<Student> findByEmailAndRole(String email, UserRole role);
}
