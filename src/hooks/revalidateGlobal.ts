import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import type { GlobalAfterChangeHook } from 'payload'

// To revalidate only a specific page, the exact path needs to be provided.
// The path shouldn't contain the route groups or any dynamic segments.
// revalidatePath should be used with only one argument, the path.
// Eg. /fi or /se will revalidate the Finnish and Swedish landing pages respectively.

// To revalidate all pages in the dynamic segment, the filesystem path needs to be provided.
// This path HAS to contain the route groups and dynamic segments.
// revalidatePath should be used with two arguments, the path and the type of the path, 'layout' or 'page'.
// Eg. /(frontend)/[locale] will revalidate all landing pages for all locales AND all pages for all locales.

export const revalidateGlobal = (): GlobalAfterChangeHook => {
  return async ({ doc, req: { payload, context } }) => {
    // Don't revalidate if the skipRevalidate flag is set
    if (context.skipRevalidate) {
      return
    }

    // Don't revalidate for draft-only saves (autosave). The public site is
    // unchanged until the document is published, so revalidating here just
    // causes unnecessary cache churn and memory pressure.
    const docWithStatus = doc as unknown as { _status?: string }
    if (docWithStatus._status === 'draft') {
      return
    }

    // This is a hack to revalidate all pages when a global is updated.
    // This should be improved in the future.
    {
      const path = '/(frontend)/[locale]'

      payload.logger.info(`Revalidating all pages at path: ${path}`)

      // Same as above.
      after(async () => {
        revalidatePath(path, 'layout')
      })
    }
  }
}
