import { legacyRedirects } from '../docs/nav.js'

const page = name => () => import(`../pages/docs/${name}.vue`)

const routes = [
  {
    path: '/',
    component: () => import('../layouts/HomeLayout.vue'),
    children: [{ path: '', component: () => import('../pages/HomePage.vue') }]
  },
  {
    path: '/docs',
    component: () => import('../layouts/DocsLayout.vue'),
    children: [
      { path: '', component: page('IntroductionPage'), meta: { section: 'Get started' } },
      { path: 'installation', component: page('InstallationPage'), meta: { section: 'Get started' } },
      { path: 'quickstart', component: page('QuickstartPage'), meta: { section: 'Get started' } },
      { path: 'whats-new', component: page('WhatsNewPage'), meta: { section: 'Get started' } },
      { path: 'columns', component: page('ColumnsPage'), meta: { section: 'Guides' } },
      { path: 'filtering', component: page('FilteringPage'), meta: { section: 'Guides' } },
      { path: 'sorting', component: page('SortingPage'), meta: { section: 'Guides' } },
      { path: 'interaction', component: page('InteractionPage'), meta: { section: 'Guides' } },
      { path: 'grouping', component: page('GroupingPage'), meta: { section: 'Guides' } },
      { path: 'export', component: page('ExportPage'), meta: { section: 'Guides' } },
      { path: 'editing', component: page('EditingPage'), meta: { section: 'Guides' } },
      { path: 'drag-and-drop', component: page('DragDropPage'), meta: { section: 'Guides' } },
      { path: 'large-data', component: page('LargeDataPage'), meta: { section: 'Guides' } },
      { path: 'customization', component: page('CustomizationPage'), meta: { section: 'Guides' } },
      { path: 'sponsor', component: page('SponsorPage'), meta: { section: 'Community' } },
      { path: 'api', component: page('ApiPage'), meta: { section: 'API reference' } },
      { path: 'examples', component: page('ExamplesIndexPage'), meta: { section: 'Examples' } },
      { path: 'examples/:slug', component: page('ExamplePage'), meta: { section: 'Examples' } }
    ]
  },

  ...Object.keys(legacyRedirects).map(from => ({ path: from, redirect: legacyRedirects[from] })),

  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/NotFoundPage.vue')
  }
]

export default routes
