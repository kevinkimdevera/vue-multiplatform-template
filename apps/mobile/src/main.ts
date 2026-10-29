import { createSharedApp } from '@app/ui'
import '@app/ui/styles.css'
import { capacitorPlatform } from './platform'

// Hash history keeps deep links working with the relative base Capacitor needs.
createSharedApp({ platform: capacitorPlatform, historyMode: 'hash' }).mount('#app')
