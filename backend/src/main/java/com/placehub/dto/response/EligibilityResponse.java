package com.placehub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EligibilityResponse {
    private boolean eligible;
    private Map<String, EligibilityCheckResult> checks = new LinkedHashMap<>();
    private List<String> failedReasons = new java.util.ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EligibilityCheckResult {
        private boolean passed;
        private Object studentValue;
        private Object requiredValue;
        private Object eligibleValues;
        private Object maximumAllowed;
    }
}
