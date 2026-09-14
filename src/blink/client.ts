import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'aurastudio-ai-saas-kn07cz7k',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_DfUOEWKS6zn7eqGE_ICcctjEjK20cIFb',
  authRequired: false,
  auth: { mode: 'managed' },
})
