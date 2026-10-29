import { createSharedApp } from '@app/ui'
import '@app/ui/styles.css'
import { webPlatform } from './platform'

createSharedApp({ platform: webPlatform, historyMode: 'web' }).mount('#app')
