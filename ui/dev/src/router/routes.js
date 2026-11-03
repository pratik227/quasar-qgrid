import pages from './pages'

const children = pages.map(page => ({
  path: page.path,
  component: page.component
}))

const routes = [
  {
    path: '/',
    component: () => import('../layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/Index.vue') }
    ].concat(children)
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/Error404.vue')
  }
]

export default routes
