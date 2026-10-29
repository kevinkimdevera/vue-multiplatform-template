/**
 * Starts the Vite dev server on your network, then runs the native app with live reload
 * pointed at it. Ctrl+C stops both and restores the native project's config.
 *
 * Usage: node scripts/dev-native.ts <android|ios> [extra `cap run` args, e.g. --target <id>]
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { build, createServer } from 'vite'

const [platform, ...capArgs] = process.argv.slice(2)
if (platform !== 'android' && platform !== 'ios') {
  console.error('Usage: node scripts/dev-native.ts <android|ios> [cap run args]')
  process.exit(1)
}

if (platform === 'ios' && process.platform !== 'darwin') {
  console.error('iOS builds need Xcode, which only runs on macOS. Use `pnpm dev:android` here.')
  process.exit(1)
}

// `cap run` syncs webDir into the native project first, so it has to exist.
if (!existsSync('dist')) await build()

// host: true listens on all interfaces so the device/emulator can reach this machine.
// If 5173 is taken (e.g. another dev server), Vite moves to the next free port.
const server = await createServer({ server: { host: true, port: 5173 } })
await server.listen()
server.printUrls()
const { port } = server.httpServer!.address() as AddressInfo

const cap = spawn('cap', ['run', platform, '--live-reload', '--port', String(port), ...capArgs], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

// Ctrl+C reaches `cap` too; let it revert its live-reload config before we shut down.
process.on('SIGINT', () => {})
cap.on('exit', async (code) => {
  await server.close()
  process.exit(code ?? 0)
})
