import type { Block } from 'payload'

export const RotatablePlaneBlock: Block = {
  slug: 'rotatable-plane',
  interfaceName: 'RotatablePlaneBlock',
  labels: {
    singular: 'Rotatable Plane',
    plural: 'Rotatable Planes'
  },
  fields: [
    {
      name: 'frontImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description:
          'Front side. The shape of the plane follows this image, so give the back side the same proportions.'
      }
    },
    {
      name: 'backImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Back side, seen when the plane is turned around.' }
    }
  ]
}
