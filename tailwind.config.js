/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Inter', 'sans-serif'],
  			display: ['Inter', 'system-ui', 'sans-serif'],
  			mono: ['JetBrains Mono', 'monospace']
  		},
  		borderRadius: {
  			'2xl': '1rem',
  			'3xl': '1.5rem',
  			'4xl': '2rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
        kidRed: '#FF3366',
        kidBlue: '#4D94FF',
        kidYellow: '#FFCC00',
        kidGreen: '#22C55E',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))'
  		},
  		boxShadow: {
  			playful: '4px 4px 0px 0px rgba(0,0,0,1)',
  			'playful-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'playful-sm': '2px 2px 0px 0px rgba(0,0,0,1)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}