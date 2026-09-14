export interface SavedCreation {
  id: string
  type: 'image' | 'video'
  prompt: string
  finalPrompt: string
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

/**
 * Construye el prompt final que se envía al motor de generación.
 *
 * Prioridad absoluta: el texto del usuario. La imagen de referencia (si existe)
 * se usa EXCLUSIVAMENTE como inspiración visual de estilo, paleta de colores y
 * composición general — nunca como fuente para clonar, copiar o calcar.
 *
 * Garantiza que cada generación produzca un diseño nuevo y premium, obedeciendo
 * las instrucciones de texto del usuario sobre cualquier parecido a la imagen.
 */
export function buildGenerationPrompt(
  userPrompt: string,
  hasReferenceImage: boolean,
  preset: string,
): string {
  const core = userPrompt.trim()

  const styleMap: Record<string, string> = {
    'Cinematográfico':
      'iluminación cinematográfica dramática, profundidad de campo, tonos de película',
    'Lujo Comercial':
      'estética de publicidad premium, iluminación de estudio, acabados impecables',
    Minimalista:
      'composición limpia y espaciada, paleta reducida, tipografía clara, mucho aire negativo',
    'Fotorrealista 8K':
      'detalle hiperrealista 8K, texturas precisas, iluminación fotorrealista, calidad comercial',
  }

  const styleSuffix = styleMap[preset] ?? styleMap['Cinematográfico']!

  if (hasReferenceImage) {
    return [
      core,
      `, ${styleSuffix}.`,
      ' IMPORTANTE: La imagen de referencia adjunta se usa únicamente como inspiración visual de estilo, paleta de colores y concepto general de diseño.',
      ' NO clonar, copiar, ni calcar la imagen de referencia.',
      ' El contenido, los elementos, los textos, la distribución y todos los detalles deben ser totalmente nuevos y obedecer estrictamente estas instrucciones de texto.',
      ' Genera un diseño premium original y creativo que respete la intención del texto sobre cualquier parecido visual con la referencia.',
    ].join('')
  }

  return `${core}, ${styleSuffix}, composición editorial, detalle comercial premium, profundidad atmosférica`
}
