import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { plugin, defaultConfig } from '@formkit/vue'
import config from './formkit.config'

import App from './App.vue'
import router from './router'

import { useFormElements } from './components/form/useFormElements'

const formElements = useFormElements()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(plugin, defaultConfig(config))

formElements.register(app)

app.mount('#app')
