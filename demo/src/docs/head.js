// Keeps the static <head> tags of index.html (read by social crawlers) in sync
// with the current page, without adding duplicates.
import { watchEffect } from 'vue'

export const SITE = 'https://next-quasar-qgrid.netlify.app'
export const DEFAULT_TITLE = 'QGrid — the data grid for Quasar'
export const DEFAULT_DESC = 'QGrid is a free, open-source data grid for Quasar & Vue 3: column & header filters, grouping, totals, inline editing, drag & drop, Excel export and virtual scroll.'

function setAttr (selector, attr, value) {
  if (typeof document === 'undefined') return
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/** getter: () => ({ title, description, path }) */
export function usePageHead (getter) {
  watchEffect(() => {
    const { title, description, path } = getter()
    const fullTitle = title ? title + ' · QGrid' : DEFAULT_TITLE
    const desc = description || DEFAULT_DESC
    const url = SITE + (path || '/')
    if (typeof document !== 'undefined') document.title = fullTitle
    setAttr('meta[name="description"]', 'content', desc)
    setAttr('link[rel="canonical"]', 'href', url)
    setAttr('meta[property="og:url"]', 'content', url)
    setAttr('meta[property="og:title"]', 'content', fullTitle)
    setAttr('meta[property="og:description"]', 'content', desc)
    setAttr('meta[name="twitter:title"]', 'content', fullTitle)
    setAttr('meta[name="twitter:description"]', 'content', desc)
  })
}
