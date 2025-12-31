"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, LogOut } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  created_at: string
}

export default function NotesPage() {
  const router = useRouter()

  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)

  // -------------------------
  // Auth + Initial Fetch
  // -------------------------
  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setNotes(data)
        setSelectedNote(data[0] ?? null)
      }

      setLoading(false)
    }

    init()
  }, [router])

  // -------------------------
  // CRUD
  // -------------------------
  const createNote = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("notes")
      .insert({
        title: "Untitled Note",
        content: "",
        user_id: user.id, // 🔑 THIS IS THE FIX
      })
      .select()
      .single()

    if (error) {
      console.error("Create note failed:", error)
      return
    }

    setNotes((prev) => [data, ...prev])
    setSelectedNote(data)
  }


  const updateNote = async (id: string, updates: Partial<Note>) => {
    // 1️⃣ Update local notes list
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      )
    )

    // 2️⃣ Update selected note (THIS is what unbreaks typing)
    setSelectedNote((prev) =>
      prev && prev.id === id ? { ...prev, ...updates } : prev
    )

    // 3️⃣ Persist to database
    await supabase.from("notes").update(updates).eq("id", id)
  }


  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id)

    const remaining = notes.filter((n) => n.id !== id)
    setNotes(remaining)
    setSelectedNote(remaining[0] ?? null)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return <div className="p-6">Loading…</div>
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Notes</h2>
          <Button size="icon" variant="ghost" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-2">
          <Button className="w-full" onClick={createNote}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedNote?.id === note.id
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              {note.title || "Untitled"}
            </button>
          ))}
        </ScrollArea>
      </aside>

      {/* Editor */}
      <main className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <Input
                value={selectedNote.title}
                onChange={(e) =>
                  updateNote(selectedNote.id, { title: e.target.value })
                }
                className="text-xl font-semibold border-none px-0"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteNote(selectedNote.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <textarea
              value={selectedNote.content}
              onChange={(e) =>
                updateNote(selectedNote.id, { content: e.target.value })
              }
              className="flex-1 p-6 resize-none outline-none"
              placeholder="Start writing…"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select or create a note
          </div>
        )}
      </main>
    </div>
  )
}
