import type { Config } from 'tailwindcss';

export default {
	darkMode: ['class'],
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-geist-sans)'],
				mono: ['var(--font-geist-mono)'],
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',

				'black-1': 'hsl(var(--black-1))',
				'black-2': 'hsl(var(--black-2))',
				'black-3': 'hsl(var(--black-3))',
				'black-4': 'hsl(var(--black-4))',

				'white-1': 'hsl(var(--white-1))',
				'white-2': 'hsl(var(--white-2))',
				'white-3': 'hsl(var(--white-3))',
				'white-4': 'hsl(var(--white-4))',

				'gray-1': 'hsl(var(--gray-1))',
				'gray-2': 'hsl(var(--gray-2))',
				'gray-3': 'hsl(var(--gray-3))',
				'gray-4': 'hsl(var(--gray-4))',

				'red-1': 'hsl(var(--red-1))',
				'red-2': 'hsl(var(--red-2))',
				'red-3': 'hsl(var(--red-3))',
				'red-4': 'hsl(var(--red-4))',

				'cyan-1': 'hsl(var(--cyan-1))',
				'cyan-2': 'hsl(var(--cyan-2))',
				'cyan-3': 'hsl(var(--cyan-3))',
				'cyan-4': 'hsl(var(--cyan-4))',

				'pink-1': 'hsl(var(--pink-1))',
				'pink-2': 'hsl(var(--pink-2))',
				'pink-3': 'hsl(var(--pink-3))',
				'pink-4': 'hsl(var(--pink-4))',

				'indigo-1': 'hsl(var(--indigo-1))',
				'indigo-2': 'hsl(var(--indigo-2))',
				'indigo-3': 'hsl(var(--indigo-3))',
				'indigo-4': 'hsl(var(--indigo-4))',

				'brown-1': 'hsl(var(--brown-1))',
				'brown-2': 'hsl(var(--brown-2))',
				'brown-3': 'hsl(var(--brown-3))',
				'brown-4': 'hsl(var(--brown-4))',

				'yellow-1': 'hsl(var(--yellow-1))',
				'yellow-2': 'hsl(var(--yellow-2))',
				'yellow-3': 'hsl(var(--yellow-3))',
				'yellow-4': 'hsl(var(--yellow-4))',

				'blue-1': 'hsl(var(--blue-1))',
				'blue-2': 'hsl(var(--blue-2))',
				'blue-3': 'hsl(var(--blue-3))',
				'blue-4': 'hsl(var(--blue-4))',

				'green-1': 'hsl(var(--green-1))',
				'green-2': 'hsl(var(--green-2))',
				'green-3': 'hsl(var(--green-3))',
				'green-4': 'hsl(var(--green-4))',

				'orange-1': 'hsl(var(--orange-1))',
				'orange-2': 'hsl(var(--orange-2))',
				'orange-3': 'hsl(var(--orange-3))',
				'orange-4': 'hsl(var(--orange-4))',

				'violet-1': 'hsl(var(--violet-1))',
				'violet-2': 'hsl(var(--violet-2))',
				'violet-3': 'hsl(var(--violet-3))',
				'violet-4': 'hsl(var(--violet-4))',

				'emerald-1': 'hsl(var(--emerald-1))',
				'emerald-2': 'hsl(var(--emerald-2))',
				'emerald-3': 'hsl(var(--emerald-3))',
				'emerald-4': 'hsl(var(--emerald-4))',

				'sky-1': 'hsl(var(--sky-1))',
				'sky-2': 'hsl(var(--sky-2))',
				'sky-3': 'hsl(var(--sky-3))',
				'sky-4': 'hsl(var(--sky-4))',

				'amber-1': 'hsl(var(--amber-1))',
				'amber-2': 'hsl(var(--amber-2))',
				'amber-3': 'hsl(var(--amber-3))',
				'amber-4': 'hsl(var(--amber-4))',

				'purple-1': 'hsl(var(--purple-1))',
				'purple-2': 'hsl(var(--purple-2))',
				'purple-3': 'hsl(var(--purple-3))',
				'purple-4': 'hsl(var(--purple-4))',

				'teal-1': 'hsl(var(--teal-1))',
				'teal-2': 'hsl(var(--teal-2))',
				'teal-3': 'hsl(var(--teal-3))',
				'teal-4': 'hsl(var(--teal-4))',

				'lime-1': 'hsl(var(--lime-1))',
				'lime-2': 'hsl(var(--lime-2))',
				'lime-3': 'hsl(var(--lime-3))',
				'lime-4': 'hsl(var(--lime-4))',

				'rose-1': 'hsl(var(--rose-1))',
				'rose-2': 'hsl(var(--rose-2))',
				'rose-3': 'hsl(var(--rose-3))',
				'rose-4': 'hsl(var(--rose-4))',

				'periwinkle-1': 'hsl(var(--periwinkle-1))',
				'periwinkle-2': 'hsl(var(--periwinkle-2))',
				'periwinkle-3': 'hsl(var(--periwinkle-3))',
				'periwinkle-4': 'hsl(var(--periwinkle-4))',

				'seafoam-1': 'hsl(var(--seafoam-1))',
				'seafoam-2': 'hsl(var(--seafoam-2))',
				'seafoam-3': 'hsl(var(--seafoam-3))',
				'seafoam-4': 'hsl(var(--seafoam-4))',

				'coral-1': 'hsl(var(--coral-1))',
				'coral-2': 'hsl(var(--coral-2))',
				'coral-3': 'hsl(var(--coral-3))',
				'coral-4': 'hsl(var(--coral-4))',

				'mauve-1': 'hsl(var(--mauve-1))',
				'mauve-2': 'hsl(var(--mauve-2))',
				'mauve-3': 'hsl(var(--mauve-3))',
				'mauve-4': 'hsl(var(--mauve-4))',

				'aubergine-1': 'hsl(var(--aubergine-1))',
				'aubergine-2': 'hsl(var(--aubergine-2))',
				'aubergine-3': 'hsl(var(--aubergine-3))',
				'aubergine-4': 'hsl(var(--aubergine-4))',

				'turquoise-1': 'hsl(var(--turquoise-1))',
				'turquoise-2': 'hsl(var(--turquoise-2))',
				'turquoise-3': 'hsl(var(--turquoise-3))',
				'turquoise-4': 'hsl(var(--turquoise-4))',

				'plum-1': 'hsl(var(--plum-1))',
				'plum-2': 'hsl(var(--plum-2))',
				'plum-3': 'hsl(var(--plum-3))',
				'plum-4': 'hsl(var(--plum-4))',

				'sage-1': 'hsl(var(--sage-1))',
				'sage-2': 'hsl(var(--sage-2))',
				'sage-3': 'hsl(var(--sage-3))',
				'sage-4': 'hsl(var(--sage-4))',

				'pastel-peach-1': 'hsl(var(--pastel-peach-1))',
				'pastel-peach-2': 'hsl(var(--pastel-peach-2))',
				'pastel-peach-3': 'hsl(var(--pastel-peach-3))',
				'pastel-peach-4': 'hsl(var(--pastel-peach-4))',

				'pastel-yellow-1': 'hsl(var(--pastel-yellow-1))',
				'pastel-yellow-2': 'hsl(var(--pastel-yellow-2))',
				'pastel-yellow-3': 'hsl(var(--pastel-yellow-3))',
				'pastel-yellow-4': 'hsl(var(--pastel-yellow-4))',

				'pastel-lilac-1': 'hsl(var(--pastel-lilac-1))',
				'pastel-lilac-2': 'hsl(var(--pastel-lilac-2))',
				'pastel-lilac-3': 'hsl(var(--pastel-lilac-3))',
				'pastel-lilac-4': 'hsl(var(--pastel-lilac-4))',

				'pastel-aqua-1': 'hsl(var(--pastel-aqua-1))',
				'pastel-aqua-2': 'hsl(var(--pastel-aqua-2))',
				'pastel-aqua-3': 'hsl(var(--pastel-aqua-3))',
				'pastel-aqua-4': 'hsl(var(--pastel-aqua-4))',

				'pastel-pink-1': 'hsl(var(--pastel-pink-1))',
				'pastel-pink-2': 'hsl(var(--pastel-pink-2))',
				'pastel-pink-3': 'hsl(var(--pastel-pink-3))',
				'pastel-pink-4': 'hsl(var(--pastel-pink-4))',

				'pastel-blue-1': 'hsl(var(--pastel-blue-1))',
				'pastel-blue-2': 'hsl(var(--pastel-blue-2))',
				'pastel-blue-3': 'hsl(var(--pastel-blue-3))',
				'pastel-blue-4': 'hsl(var(--pastel-blue-4))',

				'pastel-lavender-1': 'hsl(var(--pastel-lavender-1))',
				'pastel-lavender-2': 'hsl(var(--pastel-lavender-2))',
				'pastel-lavender-3': 'hsl(var(--pastel-lavender-3))',
				'pastel-lavender-4': 'hsl(var(--pastel-lavender-4))',

				'pastel-mint-1': 'hsl(var(--pastel-mint-1))',
				'pastel-mint-2': 'hsl(var(--pastel-mint-2))',
				'pastel-mint-3': 'hsl(var(--pastel-mint-3))',
				'pastel-mint-4': 'hsl(var(--pastel-mint-4))',

				'pastel-pistachio-1': 'hsl(var(--pastel-pistachio-1))',
				'pastel-pistachio-2': 'hsl(var(--pastel-pistachio-2))',
				'pastel-pistachio-3': 'hsl(var(--pastel-pistachio-3))',
				'pastel-pistachio-4': 'hsl(var(--pastel-pistachio-4))',

				'pastel-wisteria-1': 'hsl(var(--pastel-wisteria-1))',
				'pastel-wisteria-2': 'hsl(var(--pastel-wisteria-2))',
				'pastel-wisteria-3': 'hsl(var(--pastel-wisteria-3))',
				'pastel-wisteria-4': 'hsl(var(--pastel-wisteria-4))',

				'pastel-sky-1': 'hsl(var(--pastel-sky-1))',
				'pastel-sky-2': 'hsl(var(--pastel-sky-2))',
				'pastel-sky-3': 'hsl(var(--pastel-sky-3))',
				'pastel-sky-4': 'hsl(var(--pastel-sky-4))',

				'pastel-apricot-1': 'hsl(var(--pastel-apricot-1))',
				'pastel-apricot-2': 'hsl(var(--pastel-apricot-2))',
				'pastel-apricot-3': 'hsl(var(--pastel-apricot-3))',
				'pastel-apricot-4': 'hsl(var(--pastel-apricot-4))',

				'pastel-rose-1': 'hsl(var(--pastel-rose-1))',
				'pastel-rose-2': 'hsl(var(--pastel-rose-2))',
				'pastel-rose-3': 'hsl(var(--pastel-rose-3))',
				'pastel-rose-4': 'hsl(var(--pastel-rose-4))',

				'toxic-green-1': 'hsl(var(--toxic-green-1))',
				'toxic-green-2': 'hsl(var(--toxic-green-2))',
				'toxic-green-3': 'hsl(var(--toxic-green-3))',
				'toxic-green-4': 'hsl(var(--toxic-green-4))',

				'electric-blue-1': 'hsl(var(--electric-blue-1))',
				'electric-blue-2': 'hsl(var(--electric-blue-2))',
				'electric-blue-3': 'hsl(var(--electric-blue-3))',
				'electric-blue-4': 'hsl(var(--electric-blue-4))',

				'neon-orange-1': 'hsl(var(--neon-orange-1))',
				'neon-orange-2': 'hsl(var(--neon-orange-2))',
				'neon-orange-3': 'hsl(var(--neon-orange-3))',
				'neon-orange-4': 'hsl(var(--neon-orange-4))',

				'plasma-pink-1': 'hsl(var(--plasma-pink-1))',
				'plasma-pink-2': 'hsl(var(--plasma-pink-2))',
				'plasma-pink-3': 'hsl(var(--plasma-pink-3))',
				'plasma-pink-4': 'hsl(var(--plasma-pink-4))',

				'electric-purple-1': 'hsl(var(--electric-purple-1))',
				'electric-purple-2': 'hsl(var(--electric-purple-2))',
				'electric-purple-3': 'hsl(var(--electric-purple-3))',
				'electric-purple-4': 'hsl(var(--electric-purple-4))',

				'neon-green-1': 'hsl(var(--neon-green-1))',
				'neon-green-2': 'hsl(var(--neon-green-2))',
				'neon-green-3': 'hsl(var(--neon-green-3))',
				'neon-green-4': 'hsl(var(--neon-green-4))',

				'hot-pink-1': 'hsl(var(--hot-pink-1))',
				'hot-pink-2': 'hsl(var(--hot-pink-2))',
				'hot-pink-3': 'hsl(var(--hot-pink-3))',
				'hot-pink-4': 'hsl(var(--hot-pink-4))',

				'acid-yellow-1': 'hsl(var(--acid-yellow-1))',
				'acid-yellow-2': 'hsl(var(--acid-yellow-2))',
				'acid-yellow-3': 'hsl(var(--acid-yellow-3))',
				'acid-yellow-4': 'hsl(var(--acid-yellow-4))',

				'cyber-lime-1': 'hsl(var(--cyber-lime-1))',
				'cyber-lime-2': 'hsl(var(--cyber-lime-2))',
				'cyber-lime-3': 'hsl(var(--cyber-lime-3))',
				'cyber-lime-4': 'hsl(var(--cyber-lime-4))',

				'laser-blue-1': 'hsl(var(--laser-blue-1))',
				'laser-blue-2': 'hsl(var(--laser-blue-2))',
				'laser-blue-3': 'hsl(var(--laser-blue-3))',
				'laser-blue-4': 'hsl(var(--laser-blue-4))',

				'atomic-tangerine-1': 'hsl(var(--atomic-tangerine-1))',
				'atomic-tangerine-2': 'hsl(var(--atomic-tangerine-2))',
				'atomic-tangerine-3': 'hsl(var(--atomic-tangerine-3))',
				'atomic-tangerine-4': 'hsl(var(--atomic-tangerine-4))',

				'radioactive-teal-1': 'hsl(var(--radioactive-teal-1))',
				'radioactive-teal-2': 'hsl(var(--radioactive-teal-2))',
				'radioactive-teal-3': 'hsl(var(--radioactive-teal-3))',
				'radioactive-teal-4': 'hsl(var(--radioactive-teal-4))',

				'fusion-red-1': 'hsl(var(--fusion-red-1))',
				'fusion-red-2': 'hsl(var(--fusion-red-2))',
				'fusion-red-3': 'hsl(var(--fusion-red-3))',
				'fusion-red-4': 'hsl(var(--fusion-red-4))',

				'plasma-violet-1': 'hsl(var(--plasma-violet-1))',
				'plasma-violet-2': 'hsl(var(--plasma-violet-2))',
				'plasma-violet-3': 'hsl(var(--plasma-violet-3))',
				'plasma-violet-4': 'hsl(var(--plasma-violet-4))',

				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				linear: {
					'0%': { transform: 'translateX(0%)' },
					'100%': { transform: 'translateX(-100%)' },
				},
				'spin-slow': {
					'0%': { transform: 'rotateZ(0deg)' },
					'100%': { transform: 'rotateZ(360deg)' },
				},
			},
			animation: {
				'spin-slow': 'spin 30s linear infinite',
			},
		},
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require('tailwindcss-animate')],
} satisfies Config;
