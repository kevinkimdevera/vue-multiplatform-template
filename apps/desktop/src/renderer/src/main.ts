import { createSharedApp } from '@app/ui'
import '@app/ui/styles.css'
import { electronPlatform } from './platform'

// Hash history: the production build is loaded from file://, where there's no server to rewrite URLs.
createSharedApp({ platform: electronPlatform, historyMode: 'hash' }).mount('#app')
