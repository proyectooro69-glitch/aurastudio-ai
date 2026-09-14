import { Film, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import type { SavedCreation } from '@/lib/collection'

interface CollectionGalleryProps {
  creations: SavedCreation[]
  onDelete: (id: string) => void
  onUse: (creation: SavedCreation) => void
}

export function CollectionGallery({ creations, onDelete, onUse }: CollectionGalleryProps) {
  if (creations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="grid size-16 place-items-center rounded-2xl border border-dashed border-border text-muted-foreground">
          <ImageIcon className="size-7" />
        </div>
        <div>
          <p className="text-sm font-medium">Tu colección está vacía</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Genera imágenes o videos y se guardarán aquí automáticamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {creations.map((item) => (
        <div
          key={item.id}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
        >
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={item.thumbnail}
              alt={item.prompt}
              className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            {item.type === 'video' && (
              <div className="absolute inset-0 grid place-items-center bg-background/30">
                <div className="grid size-10 place-items-center rounded-full bg-background/80 text-primary">
                  <Film className="size-5" />
                </div>
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="line-clamp-2 text-xs text-muted-foreground">{item.prompt}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                {item.preset}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground">{item.ratio}</span>
            </div>
          </div>
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => onUse(item)}
              className="grid size-7 place-items-center rounded-md bg-background/80 text-foreground backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
              aria-label="Reutilizar"
            >
              <Plus className="size-3.5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="grid size-7 place-items-center rounded-md bg-background/80 text-foreground backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground"
              aria-label="Eliminar"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
