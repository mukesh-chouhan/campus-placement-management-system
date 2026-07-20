package com.placehub.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    public void sendApplicationStatusNotification(String studentEmail, String studentName, String companyName, String role, String newStatus) {
        log.info("Sending Email Notification to {} ({}): Your application for {} - {} status updated to {}",
                studentName, studentEmail, companyName, role, newStatus);
        // In production environment with SMTP configured, JavaMailSender would send the real email here.
    }
}
