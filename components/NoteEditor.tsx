"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Note } from "@/app/notes/page"

interface NoteEditorProps {
  note: Note | null
  onUpdate: (id: string, updates: Partial<Note>) => void
  onDelete: (id: string) => void
}

export function NoteEditor({ note, onUpdate, onDelete }: NoteEditorProps) {
  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a note or create one
      </div>
    )
  }

  return (
    <>
      <div className="border-b px-6 py-4 flex justify-between items-center">
        <Input
          value={note.title || ""}
          onChange={(e) => onUpdate(note.id, { title: e.target.value })}
          className="text-2xl font-semibold border-0 px-0 h-auto"
          placeholder="Note title..."
        />
        <Button variant="ghost" size="icon" onClick={() => onDelete(note.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 p-6">
        <textarea
          value={note.content || ""}
          onChange={(e) => onUpdate(note.id, { content: e.target.value })}
          className="w-full h-full resize-none bg-transparent focus:outline-none"
          placeholder="Start writing..."
        />
      </div>
    </>
  )
}
