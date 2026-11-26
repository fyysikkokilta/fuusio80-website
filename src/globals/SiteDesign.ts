import type { GlobalConfig } from 'payload'

import { signedIn } from '@/access/signed-in'
import { revalidateGlobal } from '@/hooks/revalidateGlobal'

export const SiteDesign: GlobalConfig = {
  slug: 'site-design',
  label: 'Site design',
  access: {
    read: () => true,
    update: signedIn
  },
  admin: {
    group: 'Globals',
    description: 'Background graphics shared by every page, including the error and 404 pages'
  },
  fields: [
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Background of the site, shown on both sides of the center column. It repeats downwards as it is, so it must tile seamlessly top to bottom. Sideways it repeats too, mirrored or not depending on the option below. It is drawn at its own pixel size.'
      }
    },
    {
      name: 'mirrorBackgroundHorizontally',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        condition: (data) => !!data?.backgroundImage,
        description:
          'Mirror every second copy of the background sideways, so the edges of neighbouring copies match. Turn off if the image already tiles seamlessly sideways or must not be mirrored.'
      }
    },
    {
      name: 'sideGraphic',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Graphic along the very left edge of the page, mirrored on the right edge. It tiles downwards over the background, behind the center column, and scrolls at half the speed of the page. It must tile seamlessly top to bottom. It only uses the free space beside the center column: it is drawn at its own pixel size, scaled down to fit that space if it is wider, and not shown on screens narrower than 1655px, the width from which the floating logo of the header is shown.'
      }
    }
  ],
  hooks: {
    afterChange: [revalidateGlobal()]
  }
}
