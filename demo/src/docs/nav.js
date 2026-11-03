// Single source of truth for the docs navigation, the examples and the search index.

export const examples = [
  // core
  { slug: 'basic', file: 'Basic', title: 'Basic', group: 'Core', desc: 'The smallest possible QGrid: data + columns.' },
  { slug: 'column-filter', file: 'ColumnFilter', title: 'Column filters', group: 'Filtering', desc: 'A filter input under every column header: type to filter rows instantly.' },
  { slug: 'select-column-filter', file: 'SelectColumnFilter', title: 'Select filters', group: 'Filtering', desc: 'Multi-select filters with "Select All" for columns with filter_type: \'select\'.' },
  { slug: 'header-filter', file: 'HeaderFilter', title: 'Header filters', group: 'Filtering', desc: 'Excel-like value lists, with search, inside each column header.' },
  { slug: 'date-range', file: 'DateRange', title: 'Date range filter', group: 'Filtering', desc: 'Filter dates with a range picker (filter_type: \'date\').' },
  { slug: 'number-range', file: 'NumberRange', title: 'Number range filter', group: 'Filtering', desc: 'Open or closed numeric ranges (filter_type: \'number_range\').' },
  { slug: 'filter-customization', file: 'FilterCustomization', title: 'Filter styling', group: 'Filtering', desc: 'Restyle every filter input with filter_input_props and hide the filter row.' },
  { slug: 'array-field', file: 'ArrayField', title: 'Array values (tags)', group: 'Filtering', desc: 'Fields holding arrays get one select option per value.' },
  { slug: 'grouping', file: 'Grouping', title: 'Grouping', group: 'Data', desc: 'Group rows by any column marked grouping: true.' },
  { slug: 'aggregation', file: 'Aggregation', title: 'Totals & aggregation', group: 'Data', desc: 'Sum, average, min, max, count or custom footer totals that follow the filters.', isNew: true },
  { slug: 'master-detail', file: 'MasterDetail', title: 'Master / detail', group: 'Data', desc: 'Expandable detail rows with the #detail slot.', isNew: true },
  { slug: 'inline-editing', file: 'InlineEditing', title: 'Inline editing', group: 'Data', desc: 'Edit cells in place, with typed editors and validation.', isNew: true },
  { slug: 'export', file: 'ExcelExport', title: 'Excel & CSV export', group: 'Data', desc: 'Real .xlsx and CSV export of exactly what is on screen.', isNew: true },
  { slug: 'draggable-rows', file: 'DraggableRows', title: 'Draggable rows', group: 'Drag & drop', desc: 'Reorder rows with drag & drop.' },
  { slug: 'draggable-columns', file: 'DraggableColumnsDemo', title: 'Draggable columns', group: 'Drag & drop', desc: 'Reorder columns with drag & drop.' },
  { slug: 'draggable-columns-slot', file: 'DraggableColumnsSlotDemo', title: 'Draggable columns + slot', group: 'Drag & drop', desc: 'Column drag & drop together with a custom body slot.' },
  { slug: 'column-chooser', file: 'ColumnChooser', title: 'Column chooser', group: 'Layout', desc: 'Let users show and hide columns.', isNew: true },
  { slug: 'virtual-scroll', file: 'VirtualScroll', title: 'Virtual scroll (50k rows)', group: 'Layout', desc: 'Render only what is visible, with a sticky header.', isNew: true },
  { slug: 'custom-column', file: 'CustomColumn', title: 'Column styling', group: 'Layout', desc: 'Per-column classes, styles and header classes.' },
  { slug: 'custom-cells', file: 'CustomCells', title: 'Custom cells', group: 'Slots', desc: 'Override single cells with #body-cell-[name], keep everything else.', isNew: true },
  { slug: 'slot-demo', file: 'SlotDemo', title: 'Body slot', group: 'Slots', desc: 'Render whole rows yourself with the #body slot.' },
  { slug: 'selection-slot-demo', file: 'SelectionSlotDemo', title: 'Body slot + selection', group: 'Slots', desc: 'Custom rows with a selection checkbox.' },
  { slug: 'header-slot-demo', file: 'HeaderSlotDemo', title: 'Header slot', group: 'Slots', desc: 'Render the header row yourself with the #header slot.' },
  { slug: 'state-persistence', file: 'StatePersistence', title: 'Save & restore state', group: 'Advanced', desc: 'Persist filters, sort, columns and grouping with state_key.', isNew: true },
  { slug: 'server-side', file: 'ServerSide', title: 'Server-side data', group: 'Advanced', desc: 'Server pagination, sorting and column filters via @OnRequest.', isNew: true }
]

export const guides = [
  {
    title: 'Get started',
    items: [
      { title: 'Introduction', to: '/docs' },
      { title: 'Installation', to: '/docs/installation' },
      { title: 'Quickstart', to: '/docs/quickstart' },
      { title: "What's new in 1.1", to: '/docs/whats-new', isNew: true }
    ]
  },
  {
    title: 'Guides',
    items: [
      { title: 'Columns', to: '/docs/columns' },
      { title: 'Filtering', to: '/docs/filtering' },
      { title: 'Grouping & totals', to: '/docs/grouping' },
      { title: 'Export', to: '/docs/export' },
      { title: 'Editing', to: '/docs/editing' },
      { title: 'Drag & drop', to: '/docs/drag-and-drop' },
      { title: 'Large & server-side data', to: '/docs/large-data' },
      { title: 'Slots & customization', to: '/docs/customization' }
    ]
  },
  {
    title: 'Community',
    items: [
      { title: 'Sponsor', to: '/docs/sponsor' },
      { title: 'GitHub', href: 'https://github.com/pratik227/quasar-qgrid' }
    ]
  }
]

function exampleSections () {
  const groups = []
  examples.forEach(ex => {
    let group = groups.find(g => g.title === ex.group)
    if (!group) {
      group = { title: ex.group, items: [] }
      groups.push(group)
    }
    group.items.push({ title: ex.title, to: '/docs/examples/' + ex.slug, isNew: ex.isNew })
  })
  return groups
}

export const tabs = [
  { key: 'docs', title: 'Documentation', to: '/docs', sections: guides },
  { key: 'examples', title: 'Examples', to: '/docs/examples', sections: [{ title: 'Overview', items: [{ title: 'All examples', to: '/docs/examples' }] }].concat(exampleSections()) },
  { key: 'api', title: 'API reference', to: '/docs/api', sections: [{ title: 'Reference', items: [{ title: 'QGrid API', to: '/docs/api' }, { title: 'Column definition', to: '/docs/api#column-definition' }] }] }
]

export function tabForPath (path) {
  if (path.indexOf('/docs/examples') === 0) return 'examples'
  if (path.indexOf('/docs/api') === 0) return 'api'
  return 'docs'
}

/** Flat list for the search dialog */
export function searchIndex () {
  const out = []
  guides.forEach(section => section.items.forEach(item => {
    if (item.to) out.push({ title: item.title, section: section.title, to: item.to })
  }))
  examples.forEach(ex => out.push({ title: ex.title, section: 'Examples · ' + ex.group, to: '/docs/examples/' + ex.slug, desc: ex.desc }))
  out.push({ title: 'QGrid API', section: 'API reference', to: '/docs/api' })
  return out
}

// legacy URLs of the previous docs site -> new ones
export const legacyRedirects = {
  '/example-qgrid-basic': '/docs/examples/basic',
  '/example-qgrid-column-filter': '/docs/examples/column-filter',
  '/example-qgrid-header-filter': '/docs/examples/header-filter',
  '/example-qgrid-custom-column': '/docs/examples/custom-column',
  '/example-qgrid-draggable-rows': '/docs/examples/draggable-rows',
  '/example-qgrid-slot-demo': '/docs/examples/slot-demo',
  '/example-qgrid--selection-slot-demo': '/docs/examples/selection-slot-demo',
  '/example-qgrid-header-slot-demo': '/docs/examples/header-slot-demo',
  '/example-qgrid-select-column-filter': '/docs/examples/select-column-filter',
  '/example-qgrid-grouping': '/docs/examples/grouping',
  '/example-qgrid-date-range': '/docs/examples/date-range',
  '/example-qgrid-number-range': '/docs/examples/number-range',
  '/example-qgrid-draggable-columns': '/docs/examples/draggable-columns',
  '/example-qgrid-draggable-columns-slot': '/docs/examples/draggable-columns-slot',
  '/example-qgrid-filter-customization': '/docs/examples/filter-customization',
  '/example-qgrid-array-field': '/docs/examples/array-field',
  '/sponsor': '/docs/sponsor'
}
