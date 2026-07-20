package com.placehub.controller;

import com.placehub.entity.Announcement;
import com.placehub.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnnouncementController {
    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<Announcement>> getActiveAnnouncements() {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements());
    }
}
