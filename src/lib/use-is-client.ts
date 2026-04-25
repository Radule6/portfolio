"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * Returns false during SSR and the initial client render, then true after
 * hydration. Use this for components that must render different markup
 * post-hydration (theme toggles, OS-specific shortcuts) without setState
 * inside an effect — which React 19's react-hooks/set-state-in-effect rule flags.
 */
export function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
