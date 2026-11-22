import { ExternalLink } from 'lucide-react'

import type { LinkButtonsBlock as LinkButtonsBlockType } from '@/payload-types'

interface LinkButtonsProps {
  block: LinkButtonsBlockType
}

// Every button is at least 14rem wide, so labels do not wrap into thin columns. The grid puts as
// many buttons on a row as fit and stretches them evenly to fill it; on a narrow screen they stack.
export const LinkButtons = ({ block }: LinkButtonsProps) => (
  <div className="not-prose my-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-4">
    {block.buttons?.map(({ id, label, url }) => (
      <a
        key={id}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-glow hover:text-fk-black flex items-center justify-center gap-2 rounded-full px-6 py-3 text-center font-bold no-underline transition-transform hover:scale-105"
      >
        {label}
        <ExternalLink size={18} aria-hidden="true" className="shrink-0" />
      </a>
    ))}
  </div>
)
