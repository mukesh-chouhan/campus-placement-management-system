package com.placehub.service;

import com.placehub.dto.response.JobMatchResponse;
import com.placehub.entity.JobDrive;
import com.placehub.entity.Student;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIEvaluatorService {

    public JobMatchResponse evaluateMatch(Student student, JobDrive jobDrive) {
        if (student == null || jobDrive == null) {
            return new JobMatchResponse(
                    jobDrive != null ? jobDrive.getId() : null,
                    0, "LOW", Collections.emptyList(), Collections.emptyList(), List.of("Complete student profile to generate AI match analysis.")
            );
        }

        // 1. Gather Candidate Skills & Keywords
        Set<String> studentKeywords = new HashSet<>();
        if (student.getSkills() != null) {
            student.getSkills().forEach(s -> studentKeywords.add(s.trim().toLowerCase()));
        }
        if (student.getSkillCategoriesJson() != null) {
            extractKeywordsFromJson(student.getSkillCategoriesJson(), studentKeywords);
        }
        if (student.getExperiencesJson() != null) {
            extractKeywordsFromJson(student.getExperiencesJson(), studentKeywords);
        }
        if (student.getProjectsJson() != null) {
            extractKeywordsFromJson(student.getProjectsJson(), studentKeywords);
        }

        // 2. Gather Job Drive Requirements Keywords
        Set<String> requiredKeywords = new HashSet<>();
        if (jobDrive.getRole() != null) {
            extractWords(jobDrive.getRole(), requiredKeywords);
        }
        if (jobDrive.getJobDescription() != null) {
            extractWords(jobDrive.getJobDescription(), requiredKeywords);
        }
        // Add common tech stack implied by roles if applicable
        if (jobDrive.getRole() != null) {
            String roleLower = jobDrive.getRole().toLowerCase();
            if (roleLower.contains("software") || roleLower.contains("developer") || roleLower.contains("engineer")) {
                requiredKeywords.addAll(List.of("java", "python", "react", "sql", "git", "dsa"));
            }
        }

        // Filter out non-technical stop words
        Set<String> stopWords = Set.of("and", "the", "for", "with", "or", "in", "to", "a", "of", "on", "at", "work", "develop", "maintain", "scale", "level", "features", "services", "operations");
        requiredKeywords.removeAll(stopWords);

        // Calculate Skill Matching
        List<String> matchingSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String req : requiredKeywords) {
            boolean matched = studentKeywords.stream().anyMatch(sk -> sk.contains(req) || req.contains(sk));
            if (matched) {
                matchingSkills.add(capitalize(req));
            } else if (req.length() > 2) {
                missingSkills.add(capitalize(req));
            }
        }

        // 3. Score Calculation
        int academicScore = 0;
        // CGPA (Max 20)
        if (student.getCgpa() != null && jobDrive.getMinimumCgpa() != null) {
            if (student.getCgpa().compareTo(jobDrive.getMinimumCgpa()) >= 0) {
                academicScore += 15;
                if (student.getCgpa().subtract(jobDrive.getMinimumCgpa()).compareTo(new BigDecimal("0.5")) >= 0) {
                    academicScore += 5; // Bonus for strong CGPA
                }
            } else {
                academicScore += 5;
            }
        } else {
            academicScore += 10;
        }

        // Backlogs (Max 10)
        if (student.getBacklogs() != null && jobDrive.getAllowedBacklogs() != null) {
            if (student.getBacklogs() <= jobDrive.getAllowedBacklogs()) {
                academicScore += 10;
            }
        } else {
            academicScore += 10;
        }

        // Skills Overlap (Max 45)
        int skillScore = 0;
        if (!requiredKeywords.isEmpty()) {
            double ratio = (double) matchingSkills.size() / (double) requiredKeywords.size();
            skillScore = (int) Math.round(ratio * 45);
        } else {
            skillScore = 30;
        }

        // Experience & Resume Completeness (Max 25)
        int experienceScore = 0;
        if (student.getResumeUrl() != null) experienceScore += 10;
        if (student.getExperiencesJson() != null && !student.getExperiencesJson().equals("[]")) experienceScore += 10;
        if (student.getProjectsJson() != null && !student.getProjectsJson().equals("[]")) experienceScore += 5;

        int totalScore = Math.min(100, Math.max(10, academicScore + skillScore + experienceScore));

        // Determine Match Tier
        String matchTier;
        if (totalScore >= 85) matchTier = "EXCELLENT";
        else if (totalScore >= 70) matchTier = "STRONG";
        else if (totalScore >= 50) matchTier = "MODERATE";
        else matchTier = "LOW";

        // Generate AI Recommendations
        List<String> recommendations = new ArrayList<>();
        if (student.getResumeUrl() == null) {
            recommendations.add("Upload your PDF resume to complete automated ATS candidate screening.");
        }
        if (!missingSkills.isEmpty()) {
            String topMissing = missingSkills.stream().limit(3).collect(Collectors.joining(", "));
            recommendations.add("Add skills (" + topMissing + ") to your profile to boost your ATS match score.");
        }
        if (student.getProjectsJson() == null || student.getProjectsJson().equals("[]")) {
            recommendations.add("Add 1 software or hardware project matching company tech stack.");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("Your candidate profile is highly aligned with this hiring drive! Submit your application.");
        }

        return new JobMatchResponse(
                jobDrive.getId(),
                totalScore,
                matchTier,
                matchingSkills.stream().distinct().limit(8).collect(Collectors.toList()),
                missingSkills.stream().distinct().limit(6).collect(Collectors.toList()),
                recommendations
        );
    }

    private void extractKeywordsFromJson(String json, Set<String> keywords) {
        if (json == null) return;
        String clean = json.replaceAll("[\\[\\]{}\":,]", " ").toLowerCase();
        for (String word : clean.split("\\s+")) {
            if (word.length() > 2 && !word.matches("\\d+")) {
                keywords.add(word);
            }
        }
    }

    private void extractWords(String text, Set<String> keywords) {
        if (text == null) return;
        String clean = text.replaceAll("[^a-zA-Z0-9#+]", " ").toLowerCase();
        for (String word : clean.split("\\s+")) {
            if (word.length() > 2) {
                keywords.add(word);
            }
        }
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
