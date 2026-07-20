package com.placehub.dto.request;

import com.placehub.enums.ApplicationStatus;
import lombok.Data;

@Data
public class ApplicationUpdateRequest {
    private ApplicationStatus status;
    private Integer rating;
    private String adminNotes;
}
