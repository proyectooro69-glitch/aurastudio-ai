import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  label?: string
  max?: number
  columns?: number
}

export function ImageUploader({
  images,
  onChange,
  label,
  max = 1,
  columns = 3,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const remaining = max - images.length
    const fileArray = Array.from(files).slice(0, remaining)
    const readers = fileArray.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        }),
    )
    Promise.all(readers).then((results) => {
      onChange([...images, ...results].slice(0, max))
    })
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const gridCols =
    columns === 4 ? 'grid-cols-4' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div>
      {label && (
        <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </label>
      )}
      <div className={`grid ${gridCols} gap-2`}>
        {images.map((img, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border"
          >
            <img
              src={img}
              alt={`Referencia ${i + 1}`}
              className="size-full object-cover"
            />
            <button
              onClick={() => removeImage(i)}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-md bg-background/80 text-foreground opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
              aria-label="Eliminar imagen"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <Upload className="size-4" />
            <span className="text-[9px]">
              {max > 1 ? `${images.length}/${max}` : 'Subir'}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
