/*
 * Every .vue file in /pages (except Index & Error404) becomes a test page
 */

function kebabCase (str) {
  const result = str.replace(
    /[A-ZÀ-ÖØ-Þ]/g,
    match => '-' + match.toLowerCase()
  )
  return (str[0] === str[0].toUpperCase())
    ? result.substring(1)
    : result
}

function slugify (str) {
  return encodeURIComponent(String(str).trim().replace(/\s+/g, '-'))
}

const modules = import.meta.glob('../pages/*.vue')

export default Object.keys(modules)
  .map(file => ({ file, name: file.replace('../pages/', '').replace('.vue', '') }))
  .filter(page => page.name !== 'Index' && page.name !== 'Error404')
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  .map(page => ({
    component: modules[page.file],
    title: page.name + '.vue',
    path: slugify(kebabCase(page.name))
  }))
