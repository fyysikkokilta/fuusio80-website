import { PageBackground } from '@/components/PageBackground'
import { SideGraphic } from '@/components/SideGraphic'
import { getSiteDesign } from '@/lib/getSiteDesign'

// The background and side graphic shared by every page. Rendered by the layout, so the error and
// 404 pages get them too. It sits behind the page content (negative z-index inside the layout's
// isolated wrapper) and covers the area of that wrapper.
export const SiteBackdrop = async () => {
  const design = await getSiteDesign()
  if (!design) return null

  const { backgroundImage, sideGraphic } = design
  const background = typeof backgroundImage === 'object' ? backgroundImage : null
  const side = typeof sideGraphic === 'object' ? sideGraphic : null

  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      {background && (
        <PageBackground image={background} mirror={design.mirrorBackgroundHorizontally !== false} />
      )}
      {side?.url && side.width && side.height && (
        <SideGraphic url={side.url} width={side.width} height={side.height} />
      )}
    </div>
  )
}
