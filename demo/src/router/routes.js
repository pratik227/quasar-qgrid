const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '',  redirect: '/docs' },
      { path: '/docs', component: () => import('pages/Index.vue') },
      { path: '/examples', component: () => import('pages/Examples.vue') }
    ]
  }
]


// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
