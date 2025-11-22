import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Wingmnn",
			},
			{
				name: "theme-color",
				content: "#ff9ec5",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				href: "/logo.svg",
				type: "image/svg+xml",
			},
			{
				rel: "apple-touch-icon",
				href: "/logo192.png",
			},
			// Resource hints for performance
			{
				rel: "preconnect",
				href: "https://wingmnn.com",
			},
			{
				rel: "dns-prefetch",
				href: "https://wingmnn.com",
			},
			// Preload critical images
			{
				rel: "preload",
				href: "/logo512.png",
				as: "image",
				type: "image/png",
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<script
					dangerouslySetInnerHTML={{
						__html: `
              (function() {
                const stored = localStorage.getItem('theme');
                const theme = (stored === 'light' || stored === 'dark') ? stored : 'light';
                const root = document.documentElement;
                root.classList.remove('light', 'dark');
                root.classList.add(theme);
              })();
            `,
					}}
				/>
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
