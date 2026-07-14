package com.placehub.dto.request;

import com.placehub.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationStatusRequest {
    @NotNull(message = "Status is required")
    private ApplicationStatus status;
}
