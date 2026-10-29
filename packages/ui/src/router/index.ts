import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import HomeView from '../views/HomeView.vue'

export type HistoryMode = 'web' | 'hash'

export const routes: RouteRecordRaw[] = [
  {
    // Pages nested here render inside DefaultLayout's <RouterView />.
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'about', name: 'about', component: () => import('../views/AboutView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export function createAppRouter(mode: HistoryMode) {
  return createRouter({
    history: mode === 'hash' ? createWebHashHistory() : createWebHistory(import.meta.env.BASE_URL),
    routes,
  })
}
