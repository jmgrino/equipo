<script setup>
  import { ref, computed } from 'vue'
  import IconBars3 from '@/components/icons/IconBars3.vue'
  import IconClose from '@/components/icons/IconClose.vue'
  import { useAuthStore } from '@/stores/authStore'
  import { useRouter } from 'vue-router'

  const versionNumber = ref(import.meta.env.VITE_APP_VERSION)
  const authStore = useAuthStore()
  const router = useRouter()

  const isOpen = ref(false)
  // const showModSpace = ref(false)
  const userPage = computed(() => {
    if (authStore.user) {
      return { name: 'user', params: { id: authStore.user.id } }
    } else {
      return {}
    }
  })

  const userName = computed(() => {
    let userName = 'No user'
    if (authStore.user) {
      if (authStore.user.name) {
        userName = authStore.user.name
      } else {
        userName = authStore.user.email
      }
    }
    return userName
  })

  const modSpace = () => {
    authStore.showModSpace = true
    isOpen.value = false
  }

  const openLink = link => {
    router.push({ name: link })
    isOpen.value = false
  }
</script>

<template>
  <header
    class="header sticky"
    :class="{ 'nav-open': isOpen }"
  >
    <div class="flex flex-wrap items-end gap-5">
      <router-link
        :to="{ name: 'home' }"
        aria-current-value="page"
      >
        <!-- <img
          class="logo"
          alt="Omnifood logo"
          src="@/assets/images/omnifood-logo.png"
        /> -->
        <span class="text-5xl tracking-widest font-bold hover:text-color-std-high">EQUIPO</span>
      </router-link>
      <router-link
        v-if="authStore.user"
        :to="userPage"
        aria-current-value="page"
      >
        <span class="text-3xl hover:text-color-std-high">{{ userName }}</span>
      </router-link>
      <h3
        v-else
        :to="userPage"
        aria-current-value="page"
      >
        <span class="text-3xl">{{ userName }}</span>
      </h3>
    </div>

    <nav class="main-nav">
      <ul class="main-nav-list">
        <h3 class="text-cs-h4 leading-cs-h4 md:mt-4 hidden md:block">Versión {{ versionNumber }}</h3>
        <li class="hidden md:list-item">
          <a
            class="main-nav-link"
            @click="modSpace"
          >
            Formato
          </a>
        </li>
        <li class="list-item">
          <a
            class="main-nav-link"
            @click="openLink('tools')"
          >
            Herramientas
          </a>
        </li>

        <!-- <li><a class="main-nav-link nav-cta" @click="menu1">Action</a></li> -->
      </ul>
    </nav>

    <button class="btn-mobile-nav">
      <IconBars3
        class="iconBars3"
        size="4.8rem"
        title="Open menu"
        @click="isOpen = true"
      >
      </IconBars3>
      <IconClose
        class="iconClose"
        size="4.8rem"
        title="Close menu"
        @click="isOpen = false"
      >
      </IconClose>

      <!-- <ion-icon class="icon-mobile-nav" name="menu-outline"></ion-icon>
        <ion-icon class="icon-mobile-nav" name="close-outline"></ion-icon> -->
    </button>
  </header>
</template>

<style scope>
  .logo {
    height: 2.2rem;
    z-index: 99;
  }

  .header > a:has(img) {
    z-index: 99;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* background-color: var(--color-std-background); */
    background-color: var(--color-std-background-transparent);

    /* height: 9.6rem; */
    height: var(--header-height);
    padding: 0 4.8rem;
    position: relative;
  }

  .main-nav-list {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 3.2rem;
  }

  .main-nav-link,
  .main-nav-link:link,
  .main-nav-link:visited {
    text-decoration: none;
    color: var(--color-std-text);
    font-weight: 500;
    font-size: 1.8rem;
    cursor: pointer;

    transition: all 0.3s;
  }

  .main-nav-link:hover,
  .main-nav-link:active {
    color: var(--color-std-high);
  }

  .main-nav-link.nav-cta,
  .main-nav-link.nav-cta:link,
  .main-nav-link.nav-cta:visited {
    padding: 1.2rem 2.4rem;
    border-radius: 9px;
    color: white;
    background-color: var(--color-std-high);
  }

  .main-nav-link.nav-cta,
  .main-nav-link.nav-cta:link,
  .main-nav-link.nav-cta:visited {
    font-size: 2.4rem;
    font-weight: 400;
    padding: 4px 32px 6px 32px;
    fill: #ffffff;
    color: #ffffff;
    background-color: var(--color-std-high);
    border-style: solid;
    border-width: 2px 2px 2px 2px;
    border-color: var(--color-std-high);
    border-radius: 10px;
    box-shadow: 0px 17px 5px -15px rgba(0, 0, 0, 0.26);
  }

  .main-nav-link.nav-cta:hover,
  .main-nav-link.nav-cta:active {
    background-color: var(--color-std-high-shade);
    color: var(--color-std-high);
    background-color: #ffffff;
    border-color: var(--color-std-high);
  }

  /* Mobile navigation */

  .btn-mobile-nav {
    color: var(--color-std-text);
    display: none;
  }

  .iconClose {
    display: none;
  }

  /* Sticky Navigation */
  .sticky {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }

  /******************************/
  /* BELOW 768px (Mini Tablets) */
  /******************************/

  @media (max-width: 48em) {
    .header {
      padding: 0 1.4rem;
      z-index: 2;
    }

    .btn-mobile-nav {
      display: block;
      z-index: 999;
    }

    .main-nav {
      background-color: rgba(255, 255, 255, 0.95);
      position: absolute;
      top: 0;
      left: 100%;
      width: 100%;
      height: 100vh;
      transform: translateX(0);

      display: flex;
      align-items: center;
      align-items: flex-start;
      justify-content: center;
      transition: all 0.3s ease-in;

      /* Hide Navigation */
      opacity: 0;
      pointer-events: none;
      visibility: hidden;

      z-index: 9;
    }

    .nav-open .main-nav {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      transform: translateX(-100%);
    }

    .nav-open .iconClose {
      display: block;
    }

    .nav-open .iconBars3 {
      display: none;
    }

    .main-nav-list {
      flex-direction: column;
      gap: 4.8rem;
    }

    .main-nav-link,
    .main-nav-link:link,
    .main-nav-link:visited {
      font-size: 3rem;
    }
  }
</style>
