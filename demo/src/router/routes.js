
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/example-qgrid-basic', component: () => import('pages/BasicExample') },
      { path: '/example-qgrid-column-filter', component: () => import('pages/ColumnFilterExample') },
      { path: '/example-qgrid-header-filter', component: () => import('pages/HeaderFilterExample') },
      { path: '/example-qgrid-custom-column', component: () => import('pages/CustomColumnExample') },
      { path: '/example-qgrid-draggable-rows', component: () => import('pages/DraggableRowsExample') },
      { path: '/example-qgrid-slot-demo', component: () => import('pages/SlotDemoExample') },
      { path: '/example-qgrid-select-column-filter', component: () => import('pages/SelectColumnFilterExample') },
      { path: '/example-qgrid-grouping', component: () => import('pages/GroupingExample') },
      // { path: '/example-qhierarchy-slot-demo', component: () => import('pages/SlotDemoExample') },
      // { path: '/example-qhierarchy-default-expand-all', component: () => import('pages/ExpandAllExample') },
      { path: '/sponsor', component: () => import('pages/Sponsor') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
