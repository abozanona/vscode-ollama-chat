import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { logger } from './utils/logging'

try {
    const app = createApp(App)
    const pinia = createPinia()
    app.use(pinia)
    app.mount('#app')
} catch (error) {
    logger.error('Main: Error initializing application:', error)
}
