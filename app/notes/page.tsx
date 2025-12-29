"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { NoteList } from "@/components/NoteList"
import { NoteEditor } from "@/components/NoteEditor"

export interface Note {
  id: string
  title: string | null
  content: string | null
  created_at: string
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false })

      setNotes(data || [])
      setSelectedNote(data?.[0] || null)
    }

    init()
  }, [router])

  async function createNote() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return

    const { data } = await supabase
      .from("notes")
      .insert({
        title: "Untitled",
        content: "",
        user_id: session.user.id,
      })
      .select()
      .single()

    if (!data) return

    setNotes([data, ...notes])
    setSelectedNote(data)
  }

  async function updateNote(id: string, updates: Partial<Note>) {
    await supabase.from("notes").update(updates).eq("id", id)

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    )

    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates })
    }
  }

  async function deleteNote(id: string) {
    await supabase.from("notes").delete().eq("id", id)
    const filtered = notes.filter((n) => n.id !== id)
    setNotes(filtered)
    setSelectedNote(filtered[0] || null)
  }

  return (
    <div className="flex h-screen">
      <NoteList
        notes={notes}
        selectedNoteId={selectedNote?.id || null}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelect={setSelectedNote}
        onCreate={createNote}
      />

      <div className="flex-1 flex flex-col">
        <NoteEditor
          note={selectedNote}
          onUpdate={updateNote}
          onDelete={deleteNote}
        />
      </div>
    </div>
  )
}
