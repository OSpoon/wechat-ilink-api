import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../api/resources'
import { clearToken, getToken, setToken } from '../api/client'
import type { User } from '../types/api'

const userKey = 'wechat-ilink-admin-user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const user = ref<User | null>(JSON.parse(localStorage.getItem(userKey) || 'null'))
  const isAuthenticated = computed(() => Boolean(token.value))

  function saveUser(value: User) {
    user.value = value
    localStorage.setItem(userKey, JSON.stringify(value))
  }

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password)
    setToken(response.data.token)
    token.value = response.data.token
    saveUser(response.data.user)
  }

  async function restore() {
    if (!token.value) return
    try {
      const response = await authApi.profile()
      saveUser(response.data)
    } catch {
      logoutLocal()
    }
  }

  async function logout() {
    try {
      if (token.value) await authApi.logout()
    } finally {
      logoutLocal()
    }
  }

  function logoutLocal() {
    clearToken()
    localStorage.removeItem(userKey)
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, login, restore, logout, logoutLocal }
})
