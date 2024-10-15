import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import RidesView from '@/views/RidesView.vue'
import loginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'
import { useRidesStore } from '@/stores/ridesStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/rides',
      component: HomeView,
    },
    {
      path: '/rides',
      name: 'rides',
      component: RidesView,
    },
    {
      path: '/rides/new',
      name: 'newRide',
      component: () => import('../views/NewEditRideView.vue'),
    },
    {
      path: '/rides/:id',
      name: 'ride',
      component: () => import('../views/RideView.vue'),
    },
    {
      path: '/rides/edit/:id',
      name: 'editRide',
      component: () => import('../views/NewEditRideView.vue'),
    },
    {
      path: '/rides/edit/:id/track',
      name: 'tracks',
      component: () => import('../views/TracksView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: loginView,
    },
    {
      path: '/change-password',
      name: 'changePassword',
      component: () => import('../views/ChangePassword.vue'),
    },
    {
      path: '/users/:id',
      name: 'user',
      component: () => import('../views/UserView.vue'),
    },
    {
      path: '/users/edit/:id',
      name: 'editUser',
      component: () => import('../views/EditUserView.vue'),
    },
  ],
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  const validUser = await authStore.checkValidUser()
  let user = null
  if (validUser) {
    user = authStore.user
  }

  if (user) {
    if (to.name === 'login' || to.name === 'changePassword') {
      return false
    } else if (to.name === 'editRide') {
      const ridesStore = useRidesStore()
      const rideData = await ridesStore.getRide(to.params.id)
      if (rideData.owner === user.id || user.admin) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  } else {
    if (to.name === 'login' || to.name === 'changePassword') {
      return true
    } else {
      return { name: 'login' }
    }
  }
})

export default router
