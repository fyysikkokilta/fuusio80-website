import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'

export const getSiteDesign = cache(async function getSiteDesign() {
  const payload = await getPayload({ config })

  try {
    return await payload.findGlobal({ slug: 'site-design', depth: 1 })
  } catch (error) {
    payload.logger.error(
      `Error fetching site design: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    return null
  }
})
