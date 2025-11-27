import { Link, useLocation } from "@tanstack/react-router";
import {
	Copyright,
	Facebook,
	Github,
	Instagram,
	Linkedin,
	Mail,
	Twitter,
} from "lucide-react";
import { getAllModuleSlugs } from "../lib/modules";
import { TiktokIcon } from "./icons/TiktokIcon";

// Protected routes that should not show header/footer
const PROTECTED_ROUTES = [
	"/dashboard",
	...getAllModuleSlugs().map((slug) => `/${slug}`),
];

function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`/${route}/`),
	);
}

export function FloatingFooter() {
	// Get location - useLocation() should work in route components
	// Always call the hook (React requirement), but use window.location as fallback if needed
	const location = useLocation();
	const pathname =
		location?.pathname ||
		(typeof window !== "undefined" ? window.location.pathname : "/");
	const currentYear = new Date().getFullYear();

	// Don't show footer on protected routes
	if (isProtectedRoute(pathname)) {
		return null;
	}

	const handleLinkClick = () => {
		window.scrollTo({ top: 0, behavior: "instant" });
	};

	const footerLinks = {
		product: [
			{ label: "Features", href: "/features" },
			{ label: "Pricing", href: "/pricing" },
			{ label: "Roadmap", href: "/roadmap" },
		],
		company: [
			{ label: "About", href: "/about" },
			{ label: "Blog", href: "/blog" },
			{ label: "Careers", href: "/careers" },
		],
		legal: [
			{ label: "Privacy", href: "/privacy" },
			{ label: "Terms", href: "/terms" },
			{ label: "Security", href: "/security" },
		],
		support: [
			{ label: "Help Center", href: "/help" },
			{ label: "Contact", href: "/contact" },
			{ label: "Status", href: "/status" },
		],
	};

	const socialLinks = [
		{ icon: Twitter, href: "#twitter", label: "Twitter" },
		{ icon: Github, href: "#github", label: "GitHub" },
		{ icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
		{ icon: Instagram, href: "#instagram", label: "Instagram" },
		{ icon: Facebook, href: "#facebook", label: "Facebook" },
		{ icon: TiktokIcon, href: "#tiktok", label: "TikTok" },
		{ icon: Mail, href: "#email", label: "Email" },
	];

	// All module colors
	const allModuleColors = [
		"var(--module-mail)",
		"var(--module-notes)",
		"var(--module-finance)",
		"var(--module-feeds)",
		"var(--module-messages)",
		"var(--module-calendar)",
		"var(--module-wellness)",
		"var(--module-projects)",
		"var(--module-files)",
		"var(--module-fun)",
	];

	// Shuffle function
	const shuffle = <T,>(array: T[]): T[] => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	// Shuffled module colors for top border
	const topBorderColors = shuffle(allModuleColors);

	// Select 4 unique colors for each section
	const shuffledColors = shuffle(allModuleColors);
	const sectionColors = [
		shuffledColors[0], // Product
		shuffledColors[1], // Company
		shuffledColors[2], // Legal
		shuffledColors[3], // Support
	];

	return (
		<footer className="w-full bg-card/80 backdrop-blur-sm border-t-2 border-border rounded-none relative overflow-hidden">
			{/* Color accent bars at top - using all module colors */}
			<div className="flex h-1">
				{topBorderColors.map((color, idx) => (
					<div
						key={`top-${idx}`}
						className="flex-1"
						style={{ backgroundColor: color }}
					/>
				))}
			</div>

			<div className="mx-auto max-w-7xl px-6 py-8 md:py-12 relative">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
					{/* Product Links */}
					<div className="relative group">
						<div
							className="absolute -left-2 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
							style={{ backgroundColor: sectionColors[0] }}
						/>
						<div className="retro-border rounded-none p-4 bg-card/50 hover:bg-card/70 transition-all">
							<div className="flex items-center gap-2 mb-4">
								<div
									className="w-3 h-3 shrink-0"
									style={{ backgroundColor: sectionColors[0] }}
								/>
								<h4 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">
									Product
								</h4>
							</div>
							<ul className="space-y-2">
								{footerLinks.product.map((link) => (
									<li key={link.label}>
										<Link
											to={link.href}
											onClick={handleLinkClick}
											className="text-sm text-foreground hover:text-foreground transition-colors flex items-center gap-2 group/link"
										>
											<span
												className="w-1 h-1 opacity-0 group-hover/link:opacity-100 transition-opacity"
												style={{ backgroundColor: sectionColors[0] }}
											/>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Company Links */}
					<div className="relative group">
						<div
							className="absolute -left-2 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
							style={{ backgroundColor: sectionColors[1] }}
						/>
						<div className="retro-border rounded-none p-4 bg-card/50 hover:bg-card/70 transition-all">
							<div className="flex items-center gap-2 mb-4">
								<div
									className="w-3 h-3 shrink-0"
									style={{ backgroundColor: sectionColors[1] }}
								/>
								<h4 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">
									Company
								</h4>
							</div>
							<ul className="space-y-2">
								{footerLinks.company.map((link) => (
									<li key={link.label}>
										<Link
											to={link.href}
											onClick={handleLinkClick}
											className="text-sm text-foreground hover:text-foreground transition-colors flex items-center gap-2 group/link"
										>
											<span
												className="w-1 h-1 opacity-0 group-hover/link:opacity-100 transition-opacity"
												style={{ backgroundColor: sectionColors[1] }}
											/>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Legal Links */}
					<div className="relative group">
						<div
							className="absolute -left-2 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
							style={{ backgroundColor: sectionColors[2] }}
						/>
						<div className="retro-border rounded-none p-4 bg-card/50 hover:bg-card/70 transition-all">
							<div className="flex items-center gap-2 mb-4">
								<div
									className="w-3 h-3 shrink-0"
									style={{ backgroundColor: sectionColors[2] }}
								/>
								<h4 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">
									Legal
								</h4>
							</div>
							<ul className="space-y-2">
								{footerLinks.legal.map((link) => (
									<li key={link.label}>
										<Link
											to={link.href}
											onClick={handleLinkClick}
											className="text-sm text-foreground hover:text-foreground transition-colors flex items-center gap-2 group/link"
										>
											<span
												className="w-1 h-1 opacity-0 group-hover/link:opacity-100 transition-opacity"
												style={{ backgroundColor: sectionColors[2] }}
											/>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Support Links */}
					<div className="relative group">
						<div
							className="absolute -left-2 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
							style={{ backgroundColor: sectionColors[3] }}
						/>
						<div className="retro-border rounded-none p-4 bg-card/50 hover:bg-card/70 transition-all">
							<div className="flex items-center gap-2 mb-4">
								<div
									className="w-3 h-3 shrink-0"
									style={{ backgroundColor: sectionColors[3] }}
								/>
								<h4 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">
									Support
								</h4>
							</div>
							<ul className="space-y-2">
								{footerLinks.support.map((link) => (
									<li key={link.label}>
										<Link
											to={link.href}
											onClick={handleLinkClick}
											className="text-sm text-foreground hover:text-foreground transition-colors flex items-center gap-2 group/link"
										>
											<span
												className="w-1 h-1 opacity-0 group-hover/link:opacity-100 transition-opacity"
												style={{ backgroundColor: sectionColors[3] }}
											/>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				{/* Retro Divider with pattern */}
				<div className="relative mb-6">
					<div className="border-t-2 border-border" />
					<div className="absolute top-0 left-0 right-0 flex gap-1 justify-center -translate-y-1.5">
						{shuffle(allModuleColors)
							.slice(0, 8)
							.map((color, idx) => (
								<div
									key={idx}
									className="w-3 h-3"
									style={{ backgroundColor: color }}
								/>
							))}
					</div>
				</div>

				{/* Bottom Section */}
				<div className="flex flex-col md:flex-row items-center justify-between gap-4">
					{/* Copyright with retro styling */}
					<div className="text-sm text-muted-foreground font-mono">
						<p className="flex items-center gap-2">
							<span className="text-primary">
								<Copyright className="h-4 w-4" />
							</span>
							<span>{currentYear}</span>
							<span className="text-primary font-bold">WINGMNN</span>
							<span>All rights reserved.</span>
						</p>
					</div>

					{/* Social Links with retro borders */}
					<div className="flex items-center gap-3">
						{socialLinks.map((social, idx) => {
							const Icon = social.icon;
							const color = allModuleColors[idx % allModuleColors.length];
							return (
								<a
									key={social.label}
									href={social.href}
									aria-label={social.label}
									className="relative retro-border rounded-none p-2 text-muted-foreground hover:text-foreground transition-all hover:scale-110 group"
									style={{
										borderColor: color,
									}}
								>
									<Icon className="h-5 w-5" />
									<div
										className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
										style={{ backgroundColor: color }}
									/>
								</a>
							);
						})}
					</div>
				</div>
			</div>
		</footer>
	);
}
