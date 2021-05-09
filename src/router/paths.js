export default [

  {
    path: '*',
    meta: {
      public: true,
    },
    redirect: {
      path: '/404'
    }
  },  
  {
    path: '/',
    meta: {
      public: true,
    },
    name: 'home',
    component: () => import(
      `@/views/Home.vue`
    )
  },
  {
    path: '/about',
    meta: { breadcrumb: true },
    name: 'about',
    component: () => import(
      `@/views/About.vue`
    )
  },
  {
    path: '/mrc',
    meta: { breadcrumb: true },
    name: 'mrc',
    component: () => import(
      `@/views/Mrc.vue`
    )
  }
]
