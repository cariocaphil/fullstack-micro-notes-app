package com.cariocaphil.notes.repository;

import com.cariocaphil.notes.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {
}
