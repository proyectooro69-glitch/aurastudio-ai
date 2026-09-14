export interface SavedCreation {
  id: string
  type: 'image' | 'video'
  prompt: string
  preset: string
  ratio: string
  thumbnail: string
  createdAt: number
}

export interface SavedPreset {
  id: string
  name: string
  preset: string
  prompt: string
  ratio: string
  createdAt: number
}

export interface PromptTemplate {
  id: string
  label: string
  prompt: string
  category: string
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  { id: 't1', label: 'Retrato editorial', category: 'Retrato', prompt: 'Retrato editorial de una modelo con iluminación dramática de claroscuro, fondo neutro oscuro, textura de piel detallada, profundidad de campo cinematográfica' },
  { id: 't2', label: 'Arquitectura brutalista', category: 'Arquitectura', prompt: 'Estructura brutalista de hormigón en un paisaje árido, luz dorada del atardecer, composición simétrica, líneas fuertes, atmósfera cinematográfica' },
  { id: 't3', label: 'Naturaleza épica', category: 'Paisaje', prompt: 'Paisaje épico de montañas nevadas al amanecer, niebla flotando en los valles, luz cálida, hiperrealista, gran angular, profundidad atmosférica' },
  { id: 't4', label: 'Producto de lujo', category: 'Producto', prompt: 'Producto de lujo sobre superficie de mármol, iluminación de estudio suave, reflejos controlados, fondo gradiente, detalle comercial premium' },
  { id: 't5', label: 'Ciudad futurista', category: 'Concepto', prompt: 'Ciudad futurista al anochecer con luces de neón reflejándose en superficies mojadas, atmósfera cyberpunk, perspectiva aérea, ultra detallado' },
  { id: 't6', label: 'Bodegón minimalista', category: 'Producto', prompt: 'Bodegón minimalista con objetos cotidianos, paleta monocromática, luz lateral suave, composición equilibrada, estilo editorial moderno' },
]

const CREATIONS_KEY = 'aurastudio_creations'
const PRESETS_KEY = 'aurastudio_presets'

export function getCreations(): SavedCreation[] {
  try {
    const raw = localStorage.getItem(CREATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCreation(item: Omit<SavedCreation, 'id' | 'createdAt'>): SavedCreation {
  const creation: SavedCreation = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  const all = getCreations()
  all.unshift(creation)
  localStorage.setItem(CREATIONS_KEY, JSON.stringify(all.slice(0, 100)))
  return creation
}

export function deleteCreation(id: string) {
  const all = getCreations().filter((c) => c.id !== id)
  localStorage.setItem(CREATIONS_KEY, JSON.stringify(all))
}

export function getPresets(): SavedPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePreset(item: Omit<SavedPreset, 'id' | 'createdAt'>): SavedPreset {
  const preset: SavedPreset = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  const all = getPresets()
  all.unshift(preset)
  localStorage.setItem(PRESETS_KEY, JSON.stringify(all.slice(0, 50)))
  return preset
}

export function deletePreset(id: string) {
  const all = getPresets().filter((p) => p.id !== id)
  localStorage.setItem(PRESETS_KEY, JSON.stringify(all))
}
