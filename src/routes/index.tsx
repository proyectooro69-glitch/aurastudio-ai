import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  Aperture,
  ArrowDownToLine,
  Bookmark,
  ChevronDown,
  Clapperboard,
  Clock3,
  Film,
  Image as ImageIcon,
  LayoutGrid,
  LoaderCircle,
  Menu,
  Moon,
  MoreHorizontal,
  Play,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from 'lucide-react'
import { CollectionGallery } from '@/components/CollectionGallery'
import { ImageUploader } from '@/components/ImageUploader'
import {
  PROMPT_TEMPLATES,
  buildGenerationPrompt,
  deleteCreation as removeCreation,
  deletePreset as removePreset,
  getCreations,
  getPresets,
  saveCreation,
  savePreset,
  type SavedCreation,
  type SavedPreset,
} from '@/lib/collection'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'AuraStudio AI · Visual content, elevated' },
      { name: 'description', content: 'Premium AI image and video creation workspace.' },
      { name: 'theme-color', content: '#201d17' },
    ],
  }),
  component: AuraStudio,
})

const imageUrl =
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=90'
const secondImageUrl =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85'
const sampleVideo =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
const presets = ['Cinematográfico', 'Lujo Comercial', 'Minimalista', 'Fotorrealista 8K']
const aspectRatios = ['9:16', '1:1', '16:9']

function AuraStudio() {
  const [active, setActive] = useState<'images' | 'videos' | 'collection'>('images')
  const [preset, setPreset] = useState(presets[0])
  const [ratio, setRatio] = useState('16:9')
  const [prompt, setPrompt] = useState(
    'Un refugio brutalista suspendido sobre un acantilado, bañado por la luz ámbar del atardecer',
  )
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(true)
  const [videoGenerated, setVideoGenerated] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [mobileNav, setMobileNav] = useState(false)

  // Feature state
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const [videoImages, setVideoImages] = useState<string[]>([])
  const [videoMode, setVideoMode] = useState<'prompt' | 'sequence'>('prompt')
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([])
  const [creations, setCreations] = useState<SavedCreation[]>([])

  // Load persisted data on mount (client-only)
  useEffect(() => {
    setSavedPresets(getPresets())
    setCreations(getCreations())
  }, [])

  const optimizePrompt = () => {
    const hasRef = referenceImages.length > 0
    const enhanced = hasRef
      ? `${prompt.trim()}, iluminación de estudio cinematográfica, texturas hiperrealistas, composición editorial, detalle comercial premium, profundidad atmosférica. La imagen de referencia aporta solo paleta de colores y concepto de diseño; el contenido y los elementos deben ser totalmente nuevos`
      : `${prompt.trim()}, iluminación de estudio cinematográfica, texturas hiperrealistas, composición editorial, detalle comercial premium, profundidad atmosférica`
    setPrompt(enhanced)
    toast.success('Prompt optimizado', {
      description: hasRef
        ? 'Texto enriquecido · referencia limitada a paleta y concepto de diseño'
        : 'Añadimos iluminación, textura y dirección de arte.',
    })
  }

  const generateImage = () => {
    setGenerating(true)
    setGenerated(false)
    const hasRef = referenceImages.length > 0
    const finalPrompt = buildGenerationPrompt(prompt, hasRef, preset)
    window.setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
      const thumb = referenceImages[0] || imageUrl
      saveCreation({ type: 'image', prompt, finalPrompt, preset, ratio, thumbnail: thumb })
      setCreations(getCreations())
      toast.success('Imagen lista para tu colección', {
        description: hasRef
          ? 'Texto como prioridad · referencia usada solo como inspiración de estilo'
          : 'Generada a partir de tu prompt',
      })
    }, 1400)
  }

  const generateVideo = () => {
    setVideoGenerated(false)
    setVideoProgress(12)
    const timer = window.setInterval(() => {
      setVideoProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer)
          setVideoGenerated(true)
          const thumb = videoImages[0] || imageUrl
          saveCreation({ type: 'video', prompt, preset, ratio, thumbnail: thumb })
          setCreations(getCreations())
          toast.success('Video renderizado en calidad Pro')
          return 100
        }
        return value + 22
      })
    }, 380)
  }

  const handleSavePreset = () => {
    savePreset({ name: `${preset} · ${ratio}`, preset, prompt, ratio })
    setSavedPresets(getPresets())
    toast.success('Preset guardado', {
      description: 'Podrás reutilizarlo en futuras creaciones.',
    })
  }

  const applyPreset = (p: SavedPreset) => {
    setPreset(p.preset)
    setPrompt(p.prompt)
    setRatio(p.ratio)
    toast.info('Preset aplicado')
  }

  const handleDeletePreset = (id: string) => {
    removePreset(id)
    setSavedPresets(getPresets())
  }

  const applyTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt)
    toast.info('Plantilla aplicada')
  }

  const handleDeleteCreation = (id: string) => {
    removeCreation(id)
    setCreations(getCreations())
  }

  const handleUseCreation = (c: SavedCreation) => {
    setPrompt(c.prompt)
    setPreset(c.preset)
    setRatio(c.ratio)
    setActive(c.type === 'video' ? 'videos' : 'images')
    toast.info('Cargado en el editor')
  }

  return (
    <div className="min-h-dvh bg-background text-foreground selection:bg-primary/30">
      <header className="flex h-16 items-center justify-between border-b border-border/70 px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Abrir menú"
          >
            {mobileNav ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="grid size-8 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
            <Aperture className="size-4" />
          </div>
          <span className="font-serif text-xl tracking-tight">
            AuraStudio <span className="text-primary">AI</span>
          </span>
          <span className="hidden rounded-full border border-border bg-muted/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            Pro workspace
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground sm:flex">
            <Moon className="size-3.5" /> Dark mode
          </button>
          <button className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-8px_var(--primary)]">
            AS
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside
          className={`${mobileNav ? 'fixed inset-y-16 left-0 z-20 flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-border/70 bg-sidebar p-4 lg:static lg:flex lg:min-h-[calc(100dvh-4rem)]`}
        >
          <div className="mb-6 flex items-center justify-between px-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span>Workspace</span>
            <MoreHorizontal className="size-4" />
          </div>
          <nav className="space-y-1">
            <NavItem
              active={active === 'images'}
              onClick={() => setActive('images')}
              icon={<ImageIcon className="size-4" />}
              label="Generador de imágenes"
            />
            <NavItem
              active={active === 'videos'}
              onClick={() => setActive('videos')}
              icon={<Film className="size-4" />}
              label="Generador de videos"
            />
            <button
              onClick={() => setActive('collection')}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                active === 'collection'
                  ? 'bg-accent text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              }`}
            >
              <LayoutGrid className="size-4" /> Mi colección
              <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                {creations.length}
              </span>
            </button>
          </nav>

          {savedPresets.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="px-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Presets guardados
              </div>
              {savedPresets.map((p) => (
                <div
                  key={p.id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
                >
                  <button
                    onClick={() => applyPreset(p)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <Bookmark className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate">{p.name}</span>
                  </button>
                  <button
                    onClick={() => handleDeletePreset(p.id)}
                    className="grid size-5 place-items-center rounded text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                    aria-label="Eliminar preset"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto space-y-1 border-t border-border/70 pt-4">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted-foreground transition hover:bg-accent/60 hover:text-foreground">
              <Settings2 className="size-4" /> Preferencias
            </button>
            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                <Sparkles className="size-3.5 text-primary" /> Créditos Pro
              </div>
              <div className="mb-2 flex items-end justify-between">
                <span className="font-mono text-[11px] text-muted-foreground">1.240 / 2.000</span>
                <span className="text-[10px] text-primary">62%</span>
              </div>
              <div className="h-1 rounded-full bg-accent">
                <div className="h-full w-[62%] rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-7 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              {active === 'collection' ? (
                <motion.div
                  key="collection"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                      Colección / 03
                    </p>
                    <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
                      Mi <em className="text-primary">colección</em>
                    </h1>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                      Todas tus creaciones guardadas en un solo lugar. Reutiliza prompts o elimina lo
                      que ya no necesites.
                    </p>
                  </div>
                  <CollectionGallery
                    creations={creations}
                    onDelete={handleDeleteCreation}
                    onUse={handleUseCreation}
                  />
                </motion.div>
              ) : active === 'images' ? (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                        Create / 01
                      </p>
                      <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
                        Hazlo visualmente
                        <br />
                        <em className="text-primary">extraordinario.</em>
                      </h1>
                      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                        Convierte una idea en una pieza visual con dirección de arte, textura y
                        movimiento de nivel editorial.
                      </p>
                    </div>
                    <div className="flex rounded-xl border border-border bg-card p-1">
                      <button
                        onClick={() => setActive('images')}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground"
                      >
                        <ImageIcon className="size-3.5" /> Imágenes
                      </button>
                      <button
                        onClick={() => setActive('videos')}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
                      >
                        <Clapperboard className="size-3.5" /> Videos
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                    <section className="space-y-5 rounded-2xl border border-border bg-card/70 p-5 shadow-lg">
                      <div>
                        <FieldLabel text="Dirección de arte" />
                        <div className="relative">
                          <select
                            value={preset}
                            onChange={(e) => setPreset(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary"
                          >
                            {presets.map((p) => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div>
                        <FieldLabel text="Relación de aspecto" />
                        <div className="grid grid-cols-3 gap-2">
                          {aspectRatios.map((item) => (
                            <button
                              key={item}
                              onClick={() => setRatio(item)}
                              className={`rounded-xl border px-2 py-3 text-xs transition ${
                                ratio === item
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border text-muted-foreground hover:border-primary/50'
                              }`}
                            >
                              {item}
                              <span className="mt-1 block text-[9px] opacity-60">
                                {item === '9:16' ? 'Social' : item === '1:1' ? 'Square' : 'Landscape'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <FieldLabel text="Plantillas de prompts" />
                        <div className="flex flex-wrap gap-2">
                          {PROMPT_TEMPLATES.map((tpl) => (
                            <button
                              key={tpl.id}
                              onClick={() => applyTemplate(tpl.prompt)}
                              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                            >
                              {tpl.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <FieldLabel text="Tu idea" />
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {prompt.length}/500
                          </span>
                        </div>
                        <textarea
                          value={prompt}
                          maxLength={500}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-36 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/50 focus:border-primary"
                        />
                      </div>

                      <ImageUploader
                        images={referenceImages}
                        onChange={setReferenceImages}
                        label="Imagen de referencia (inspiración de estilo)"
                        max={1}
                      />
                      {referenceImages.length > 0 && (
                        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] leading-4 text-muted-foreground">
                          La imagen se usa <span className="font-medium text-primary">solo como inspiración</span> de paleta de colores, estilo y composición. El motor de generación obedecerá tu texto como prioridad absoluta y creará un diseño totalmente nuevo.
                        </p>
                      )}

                      <button
                        onClick={optimizePrompt}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/5 py-3 text-xs font-medium text-primary transition hover:bg-primary/15"
                      >
                        <WandSparkles className="size-4" /> Optimizar con IA
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSavePreset}
                          className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-xs font-medium text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                        >
                          <Bookmark className="size-4" /> Guardar preset
                        </button>
                        <button
                          disabled={generating}
                          onClick={generateImage}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-15px_var(--primary)] transition hover:brightness-110 active:scale-[.98] disabled:cursor-wait disabled:opacity-70"
                        >
                          {generating ? (
                            <>
                              <LoaderCircle className="size-4 animate-spin" /> Pintando tu visión...
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-4" /> Generar imagen{' '}
                              <span className="font-mono text-[10px] opacity-70">20 créditos</span>
                            </>
                          )}
                        </button>
                      </div>
                    </section>

                    <PreviewCard
                      generated={generated}
                      ratio={ratio}
                      referenceImage={referenceImages[0]}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="videos"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                        Create / 02
                      </p>
                      <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
                        Dale vida y
                        <br />
                        <em className="text-primary">movimiento.</em>
                      </h1>
                      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                        Genera video a partir de un prompt o una secuencia de imágenes con movimiento
                        cinematográfico.
                      </p>
                    </div>
                    <div className="flex rounded-xl border border-border bg-card p-1">
                      <button
                        onClick={() => setActive('images')}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
                      >
                        <ImageIcon className="size-3.5" /> Imágenes
                      </button>
                      <button
                        onClick={() => setActive('videos')}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground"
                      >
                        <Clapperboard className="size-3.5" /> Videos
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                    <section className="space-y-5 rounded-2xl border border-border bg-card/70 p-5 shadow-lg">
                      <div className="flex rounded-xl border border-border bg-background p-1">
                        <button
                          onClick={() => setVideoMode('prompt')}
                          className={`flex-1 rounded-lg px-3 py-2 text-xs transition ${
                            videoMode === 'prompt'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Desde prompt
                        </button>
                        <button
                          onClick={() => setVideoMode('sequence')}
                          className={`flex-1 rounded-lg px-3 py-2 text-xs transition ${
                            videoMode === 'sequence'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Desde imágenes
                        </button>
                      </div>

                      {videoMode === 'prompt' ? (
                        <>
                          <div>
                            <FieldLabel text="Escena y movimiento" />
                            <textarea
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              className="min-h-44 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm leading-6 outline-none transition focus:border-primary"
                              placeholder="Un dolly-in lento sobre..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="text-xs text-muted-foreground">
                              Duración
                              <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary">
                                <option>5 segundos</option>
                                <option>10 segundos</option>
                                <option>15 segundos</option>
                              </select>
                            </label>
                            <label className="text-xs text-muted-foreground">
                              Frame rate
                              <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary">
                                <option>24 fps</option>
                                <option>30 fps</option>
                                <option>60 fps</option>
                              </select>
                            </label>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <FieldLabel text="Secuencia de imágenes" />
                            <p className="mb-3 text-[11px] text-muted-foreground">
                              Sube hasta 6 imágenes. Se combinarán en una transición fluida de video.
                            </p>
                            <ImageUploader
                              images={videoImages}
                              onChange={setVideoImages}
                              max={6}
                              columns={3}
                            />
                          </div>
                          <div>
                            <FieldLabel text="Transición" />
                            <select className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary">
                              <option>Crossfade suave</option>
                              <option>Dolly continuo</option>
                              <option>Corte rápido</option>
                              <option>Zoom progresivo</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="text-xs text-muted-foreground">
                              Duración
                              <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary">
                                <option>5 segundos</option>
                                <option>10 segundos</option>
                                <option>15 segundos</option>
                              </select>
                            </label>
                            <label className="text-xs text-muted-foreground">
                              Frame rate
                              <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary">
                                <option>24 fps</option>
                                <option>30 fps</option>
                                <option>60 fps</option>
                              </select>
                            </label>
                          </div>
                        </>
                      )}

                      <button
                        onClick={generateVideo}
                        disabled={
                          (videoProgress > 0 && videoProgress < 100) ||
                          (videoMode === 'sequence' && videoImages.length === 0)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {videoProgress > 0 && videoProgress < 100 ? (
                          <>
                            <LoaderCircle className="size-4 animate-spin" /> Renderizando {videoProgress}%
                          </>
                        ) : (
                          <>
                            <Play className="size-4 fill-current" /> Generar video{' '}
                            <span className="font-mono text-[10px] opacity-70">80 créditos</span>
                          </>
                        )}
                      </button>
                      {videoProgress > 0 && videoProgress < 100 && (
                        <div className="space-y-2">
                          <div className="h-1.5 overflow-hidden rounded-full bg-accent">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${videoProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {videoMode === 'sequence'
                              ? 'Interpolando entre imágenes y renderizando fotogramas...'
                              : 'Analizando movimiento y renderizando fotogramas...'}
                          </p>
                        </div>
                      )}
                    </section>

                    <VideoPreview generated={videoGenerated} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

function NavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
        active ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
      }`}
    >
      {icon}
      {label}
      {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
    </button>
  )
}

function FieldLabel({ text }: { text: string }) {
  return (
    <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {text}
    </label>
  )
}

function PreviewCard({
  generated,
  ratio,
  referenceImage,
}: {
  generated: boolean
  ratio: string
  referenceImage?: string
}) {
  const displayImage = referenceImage || imageUrl
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium">Vista previa</span>
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
            {ratio} · 2048 × 1152 px
          </span>
        </div>
        {generated && (
          <span className="flex items-center gap-1.5 text-[10px] text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> Generado hace un momento
          </span>
        )}
      </div>
      <div className="group relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-lg">
        {generated ? (
          <>
            <img
              src={displayImage}
              alt="Imagen generada"
              className="size-full object-cover transition duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">
                  {referenceImage ? 'Inspirado en tu referencia · diseño original' : 'Golden hour / Brutalist retreat'}
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/60">
                  AuraStudio render · {ratio}
                </p>
              </div>
              <a
                href={displayImage}
                download
                target="_blank"
                rel="noreferrer"
                className="grid size-9 place-items-center rounded-lg border border-border/70 bg-background/70 text-foreground backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
                aria-label="Descargar imagen"
              >
                <ArrowDownToLine className="size-4" />
              </a>
            </div>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <LoaderCircle className="size-6 animate-spin text-primary" />
            <span className="text-xs">Creando composición...</span>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-primary/70">
          <img src={displayImage} alt="Miniatura" className="size-full object-cover" />
          <span className="absolute bottom-2 left-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[9px] text-primary">
            01
          </span>
        </div>
        <div className="aspect-video overflow-hidden rounded-xl border border-border opacity-60 transition hover:opacity-100">
          <img src={secondImageUrl} alt="Referencia visual" className="size-full object-cover" />
        </div>
        <button className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary">
          <Plus className="size-4" />
        </button>
      </div>
    </section>
  )
}

function VideoPreview({ generated }: { generated: boolean }) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium">Monitor de reproducción</span>
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
            16:9 · 00:05 · 24 fps
          </span>
        </div>
        {generated && (
          <a
            href={sampleVideo}
            download
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[10px] text-primary hover:underline"
          >
            <ArrowDownToLine className="size-3" /> Descargar MP4
          </a>
        )}
      </div>
      <div className="group relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-lg">
        {generated ? (
          <>
            <video src={sampleVideo} controls loop className="size-full object-cover" poster={imageUrl} />
            <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-border/70 bg-background/70 px-2 py-1 font-mono text-[9px] text-primary backdrop-blur">
              AURASTUDIO / MOTION 01
            </div>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="grid size-14 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
              <Play className="ml-1 size-6 fill-current" />
            </div>
            <span className="text-xs">Tu preview aparecerá aquí</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 text-xs text-muted-foreground">
        <Clock3 className="size-4 text-primary" />
        La generación de movimiento puede tardar unos segundos.
      </div>
    </section>
  )
}
