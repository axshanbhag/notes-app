"use client"

import { FileText, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Note } from "@/app/notes/page"

interface NoteListProps {
  notes: Note[]
  selectedNoteId: string | null
  searchQuery: string
  setSearchQuery: (v: string) => void
  onSelect: (note: Note) => void
  onCreate: () => void
}

export function NoteList({
  notes,
  selectedNoteId,
  searchQuery,
  setSearchQuery,
  onSelect,
  onCreate,
}: NoteListProps) {
  const filteredNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-64 border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notes
        </h1>
      </div>

      <div className="p-4">
        <Button onClick={onCreate} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => onSelect(note)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                selectedNoteId === note.id
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="font-medium text-sm truncate">
                {note.title || "Untitled"}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-1">
                {note.content || "Empty note"}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
