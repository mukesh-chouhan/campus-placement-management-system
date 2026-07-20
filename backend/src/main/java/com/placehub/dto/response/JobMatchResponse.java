package com.placehub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobMatchResponse {
    private Long jobId;
    private int matchPercentage;
    private String matchTier; // EXCELLENT, STRONG, MODERATE, LOW
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private List<String> aiRecommendations;
}
