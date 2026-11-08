package com.cariocaphil.notes.service;

import com.cariocaphil.notes.dto.NoteResponse;
import com.cariocaphil.notes.exception.NoteNotFoundException;
import com.cariocaphil.notes.model.Note;
import com.cariocaphil.notes.repository.NoteRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class NotesService {

    private final NoteRepository noteRepository;

    public NotesService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> listNotes() {
        Sort sort = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
        return noteRepository.findAll(sort).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NoteResponse createNote(String content) {
        Note note = noteRepository.save(new Note(content, Instant.now()));
        return toResponse(note);
    }

    @Transactional
    public void deleteNote(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new NoteNotFoundException(id);
        }
        noteRepository.deleteById(id);
    }

    private NoteResponse toResponse(Note note) {
        return new NoteResponse(note.getId(), note.getContent(), note.getCreatedAt());
    }
}
