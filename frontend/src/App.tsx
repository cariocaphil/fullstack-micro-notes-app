import { NoteForm } from './components/NoteForm'
import { NotesList } from './components/NotesList'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1>Minimal Notes App</h1>
      <p className="app__subtitle">
        A minimal contract-first full-stack application.
      </p>
      <NoteForm />
      <NotesList />
    </main>
  )
}

export default App
