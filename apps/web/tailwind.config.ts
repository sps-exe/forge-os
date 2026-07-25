import type { Config } from 'tailwindcss'
import { forgePreset } from '@forge/config/tailwind/preset'

const config: Config = {
  presets: [forgePreset as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}

export default config
