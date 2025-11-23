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
                
                // Module slug to color mapping (light and dark theme)
                const moduleColorMap = {
                  'mails': { light: '#fff4a3', dark: '#d4a574' },
                  'notes': { light: '#ffd1dc', dark: '#d977a6' },
                  'finance': { light: '#c4f0c4', dark: '#7fb3a3' },
                  'feeds': { light: '#b8e6ff', dark: '#5b9bd5' },
                  'messages': { light: '#ffb8a3', dark: '#d98a6b' },
                  'calendar': { light: '#a8e0d0', dark: '#6ba3a3' },
                  'wellness': { light: '#ffd4a3', dark: '#c9a574' },
                  'projects': { light: '#e0d4ff', dark: '#a78bfa' },
                  'files': { light: '#b8d4f0', dark: '#6b9bc5' },
                  'fun': { light: '#ffa8d4', dark: '#e68fb8' }
                };
                
                // Function to get current module from pathname
                function getCurrentModule() {
                  const pathname = window.location.pathname;
                  // Check if pathname matches a module route (e.g., /mails, /files, etc.)
                  for (const slug of Object.keys(moduleColorMap)) {
                    if (pathname === '/' + slug || pathname.startsWith('/' + slug + '/')) {
                      return slug;
                    }
                  }
                  return null;
                }
                
                // Function to update favicon based on theme and module
                function updateFavicon() {
                  const isDark = root.classList.contains('dark');
                  const borderColor = isDark ? '#3d3d4d' : '#e2d5c4';
                  
                  // Get current module
                  const currentModuleSlug = getCurrentModule();
                  let fillColor;
                  
                  if (currentModuleSlug && moduleColorMap[currentModuleSlug]) {
                    // Use module color based on theme
                    fillColor = isDark 
                      ? moduleColorMap[currentModuleSlug].dark 
                      : moduleColorMap[currentModuleSlug].light;
                  } else {
                    // Use primary color when no module is selected
                    fillColor = isDark ? '#d977a6' : '#ff9ec5';
                  }
                  
                  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="\${fillColor}" stroke="\${borderColor}" stroke-width="1.5" stroke-linejoin="round"><title>Wingmnn Logo v5</title><path d="M2 3 L8 3 L12 12 L8 21 L2 21 Z" /><path d="M22 3 L16 3 L12 12 L16 21 L22 21 Z" /></svg>\`;
                  const dataUrl = 'data:image/svg+xml,' + encodeURIComponent(svg);
                  
                  // Find existing favicon link
                  let faviconLink = document.querySelector('link[rel="icon"]');
                  
                  // Remove old link to force browser refresh
                  if (faviconLink && faviconLink.parentNode) {
                    faviconLink.parentNode.removeChild(faviconLink);
                  }
                  
                  // Create new link with updated icon
                  faviconLink = document.createElement('link');
                  faviconLink.setAttribute('rel', 'icon');
                  faviconLink.setAttribute('type', 'image/svg+xml');
                  faviconLink.setAttribute('href', dataUrl);
                  document.head.appendChild(faviconLink);
                }
                
                // Update favicon on initial load
                updateFavicon();
                
                // Watch for theme changes
                const themeObserver = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                      updateFavicon();
                    }
                  });
                });
                
                themeObserver.observe(root, {
                  attributes: true,
                  attributeFilter: ['class']
                });
                
                // Watch for route changes (pathname changes)
                let lastPathname = window.location.pathname;
                let lastHash = window.location.hash;
                let lastSearch = window.location.search;
                
                const checkPathname = function() {
                  const currentPathname = window.location.pathname;
                  const currentHash = window.location.hash;
                  const currentSearch = window.location.search;
                  
                  if (currentPathname !== lastPathname || 
                      currentHash !== lastHash || 
                      currentSearch !== lastSearch) {
                    lastPathname = currentPathname;
                    lastHash = currentHash;
                    lastSearch = currentSearch;
                    updateFavicon();
                  }
                };
                
                // Use popstate for browser navigation
                window.addEventListener('popstate', checkPathname);
                
                // Use pushstate/replacestate interception for programmatic navigation
                const originalPushState = history.pushState;
                const originalReplaceState = history.replaceState;
                
                history.pushState = function() {
                  originalPushState.apply(history, arguments);
                  setTimeout(checkPathname, 0);
                };
                
                history.replaceState = function() {
                  originalReplaceState.apply(history, arguments);
                  setTimeout(checkPathname, 0);
                };
                
                // Listen for clicks on links (TanStack Router uses Link components)
                document.addEventListener('click', function(e) {
                  const target = e.target;
                  const link = target.closest('a[href]');
                  if (link && link.getAttribute('href')?.startsWith('/')) {
                    // Delay check to allow router to update
                    setTimeout(checkPathname, 100);
                  }
                }, true);
                
                // Periodic check as fallback (more frequent for better responsiveness)
                // This ensures we catch route changes even if other methods miss them
                setInterval(checkPathname, 200);
                
                // Also listen for storage changes (when theme is changed in another tab)
                window.addEventListener('storage', function(e) {
                  if (e.key === 'theme') {
                    const newTheme = e.newValue;
                    root.classList.remove('light', 'dark');
                    root.classList.add(newTheme);
                    updateFavicon();
                  }
                });
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
