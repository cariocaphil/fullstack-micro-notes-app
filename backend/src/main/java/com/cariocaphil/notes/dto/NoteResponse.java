package com.cariocaphil.notes.dto;

import java.time.Instant;

public record NoteResponse(Long id, String content, Instant createdAt) {
}
