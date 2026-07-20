package com.placehub.service;

import com.placehub.dto.request.AnnouncementRequest;
import com.placehub.entity.Announcement;
import com.placehub.exception.ResourceNotFoundException;
import com.placehub.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {
    private final AnnouncementRepository announcementRepository;

    @Transactional(readOnly = true)
    public List<Announcement> getActiveAnnouncements() {
        return announcementRepository.findByActiveOrderByCreatedAtDesc(true);
    }

    @Transactional(readOnly = true)
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Announcement createAnnouncement(AnnouncementRequest request) {
        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setCategory(request.getCategory() != null ? request.getCategory() : "GENERAL");
        announcement.setActive(request.getActive() != null ? request.getActive() : true);
        return announcementRepository.save(announcement);
    }

    @Transactional
    public Announcement updateAnnouncement(Long id, AnnouncementRequest request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        if (request.getCategory() != null) announcement.setCategory(request.getCategory());
        if (request.getActive() != null) announcement.setActive(request.getActive());

        return announcementRepository.save(announcement);
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));
        announcementRepository.delete(announcement);
    }
}
