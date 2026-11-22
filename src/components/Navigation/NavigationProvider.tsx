'use client'

import { createContext, type ReactNode, useContext } from 'react'

import type { MainNavigation } from '@/payload-types'

const NavigationContext = createContext<MainNavigation | null>(null)

// The layout loads the navigation once; the header (placed inside each page) and the 404 and
// error pages read it from here.
export const NavigationProvider = ({
  navigation,
  children
}: {
  navigation: MainNavigation
  children: ReactNode
}) => <NavigationContext value={navigation}>{children}</NavigationContext>

export const useNavigation = () => {
  const navigation = useContext(NavigationContext)
  if (!navigation) {
    throw new Error('useNavigation must be used inside NavigationProvider')
  }
  return navigation
}
