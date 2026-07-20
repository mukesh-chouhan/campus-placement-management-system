package com.placehub.repository;

import com.placehub.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByActiveOrderByCreatedAtDesc(Boolean active);
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
