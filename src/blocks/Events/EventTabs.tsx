'use client'

import { Tabs } from '@base-ui/react/tabs'
import type { ReactNode } from 'react'

interface EventTabsProps {
  label: string
  defaultValue: string
  tabs: { id: string; date: string; title: string; content: ReactNode }[]
}

// Tab list is a sidebar on desktop and a sideways-scrolling strip on mobile.
export const EventTabs = ({ label, defaultValue, tabs }: EventTabsProps) => (
  <Tabs.Root defaultValue={defaultValue} className="my-6 flex flex-col gap-4 lg:flex-row lg:gap-8">
    <Tabs.List
      aria-label={label}
      className="flex shrink-0 scrollbar-thin gap-2 overflow-x-auto pb-2 lg:w-64 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {tabs.map((tab) => (
        <Tabs.Tab
          key={tab.id}
          value={tab.id}
          className="border-fuusio-gold/50 hover:border-fuusio-lightblue data-[active]:bg-fuusio-gold data-[active]:text-fuusio-darkblue flex shrink-0 cursor-pointer flex-col rounded-xl border px-4 py-2 text-left transition-colors data-[active]:border-transparent"
        >
          <span className="text-sm">{tab.date}</span>
          <span className="font-bold">{tab.title}</span>
        </Tabs.Tab>
      ))}
    </Tabs.List>
    {tabs.map((tab) => (
      <Tabs.Panel key={tab.id} value={tab.id} className="min-w-0 flex-1 [&>article]:mt-0">
        {tab.content}
      </Tabs.Panel>
    ))}
  </Tabs.Root>
)
