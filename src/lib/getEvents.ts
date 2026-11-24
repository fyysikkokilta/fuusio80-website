import { z } from 'zod'

import { env } from '@/env'

import { type IlmoEvent, ilmoEventSchema } from './events'

// Ilmomasiina hides ended events from its list after a few days unless asked for older ones.
// ponytail: the server caps how far back it goes (about half a year on ilmo.fyysikkokilta.fi).
// A past event that has dropped off the list is shown without date, location and price.
const MAX_AGE_DAYS = 400

/** All events of Ilmomasiina. Returns null when Ilmomasiina cannot be reached. */
export async function getEvents(): Promise<IlmoEvent[] | null> {
  try {
    const response = await fetch(`${env.ILMO_URL}/api/events?maxAge=${MAX_AGE_DAYS}`, {
      next: { revalidate: 120 }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return z.array(ilmoEventSchema).parse(await response.json())
  } catch (error) {
    console.error(
      `Error fetching events from Ilmomasiina: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    return null
  }
}
