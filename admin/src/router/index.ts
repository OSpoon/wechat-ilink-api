import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: () => import('../pages/LoginPage.vue'), meta: { guest: true } },
    {
      path: '/',
      component: () => import('../layouts/ConsoleLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('../pages/DashboardPage.vue') },
        { path: 'accounts', component: () => import('../pages/AccountsPage.vue') },
        { path: 'accounts/bind', component: () => import('../pages/BindAccountPage.vue') },
        { path: 'accounts/:id', component: () => import('../pages/AccountDetailPage.vue') },
        { path: 'webhooks', component: () => import('../pages/WebhooksPage.vue') },
        {
          path: 'webhooks/:id/deliveries',
          component: () => import('../pages/WebhookDeliveriesPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.guest && auth.isAuthenticated) return '/dashboard'
  if (!to.meta.guest && !auth.isAuthenticated) return '/login'
})

export default router
