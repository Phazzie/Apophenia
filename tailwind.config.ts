import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        nosifer: ['Nosifer', 'cursive'],
        creepster: ['Creepster', 'cursive'],
        courier: ['"Courier Prime"', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
