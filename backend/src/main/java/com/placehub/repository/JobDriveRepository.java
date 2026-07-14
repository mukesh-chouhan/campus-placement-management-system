package com.placehub.repository;

import com.placehub.entity.JobDrive;
import com.placehub.enums.DriveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobDriveRepository extends JpaRepository<JobDrive, Long> {
    List<JobDrive> findByStatus(DriveStatus status);
}
