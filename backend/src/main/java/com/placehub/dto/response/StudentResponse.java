package com.placehub.dto.response;

import com.placehub.entity.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String name;
    private String email;
    private String rollNumber;
    private String branch;
    private BigDecimal cgpa;
    private Integer backlogs;
    private Integer graduationYear;
    private List<String> skills;
    private String role;

    public static StudentResponse fromEntity(Student student) {
        if (student == null) return null;
        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getRollNumber(),
                student.getBranch(),
                student.getCgpa(),
                student.getBacklogs(),
                student.getGraduationYear(),
                student.getSkills(),
                student.getRole().name()
        );
    }
}
