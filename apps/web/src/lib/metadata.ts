const SITE_URL = "https://wingmnn.com";
const SITE_NAME = "Wingmnn";
const DEFAULT_DESCRIPTION =
	"Human-centered ops stack that keeps every part of your team rhythm tidy, from mails to fun. Ship faster rituals with one login.";
const TWITTER_HANDLE = "@wingmnn";

export interface MetadataOptions {
	title: string;
	description?: string;
	image?: string;
	imageAlt?: string;
	imageWidth?: number;
	imageHeight?: number;
	path?: string;
	keywords?: string[];
	noindex?: boolean;
	type?: "website" | "article";
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	structuredData?: Record<string, unknown>;
}

export function generateMetadata({
	title,
	description = DEFAULT_DESCRIPTION,
	image = "/logo512.png",
	imageAlt,
	imageWidth = 1200,
	imageHeight = 630,
	path = "",
	keywords = [],
	noindex = false,
	type = "website",
	publishedTime,
	modifiedTime,
	author,
	structuredData,
}: MetadataOptions) {
	const url = `${SITE_URL}${path}`;
	const fullTitle = title.includes(SITE_NAME)
		? title
		: `${title} - ${SITE_NAME}`;
	const defaultKeywords = [
		"team collaboration",
		"unified workspace",
		"productivity tools",
		"team management",
		"ops stack",
		"workflow automation",
	];
	const allKeywords = [...defaultKeywords, ...keywords].join(", ");
	const imageUrl = `${SITE_URL}${image}`;
	const imageAltText = imageAlt || `${fullTitle} - ${SITE_NAME}`;

	const metaTags = [
		{
			title: fullTitle,
		},
		{
			name: "description",
			content: description,
		},
		{
			name: "keywords",
			content: allKeywords,
		},
		{
			name: "author",
			content: author || SITE_NAME,
		},
		{
			name: "robots",
			content: noindex ? "noindex, nofollow" : "index, follow",
		},
		// Open Graph - Basic
		{
			property: "og:type",
			content: type,
		},
		{
			property: "og:title",
			content: fullTitle,
		},
		{
			property: "og:description",
			content: description,
		},
		{
			property: "og:image",
			content: imageUrl,
		},
		{
			property: "og:image:url",
			content: imageUrl,
		},
		{
			property: "og:image:secure_url",
			content: imageUrl,
		},
		{
			property: "og:image:type",
			content: image.endsWith(".png") ? "image/png" : "image/jpeg",
		},
		{
			property: "og:image:width",
			content: String(imageWidth),
		},
		{
			property: "og:image:height",
			content: String(imageHeight),
		},
		{
			property: "og:image:alt",
			content: imageAltText,
		},
		{
			property: "og:url",
			content: url,
		},
		{
			property: "og:site_name",
			content: SITE_NAME,
		},
		{
			property: "og:locale",
			content: "en_US",
		},
		// Open Graph - Article (for blog posts)
		...(type === "article"
			? [
					...(publishedTime
						? [
								{
									property: "article:published_time",
									content: publishedTime,
								},
						  ]
						: []),
					...(modifiedTime
						? [
								{
									property: "article:modified_time",
									content: modifiedTime,
								},
						  ]
						: []),
					...(author
						? [
								{
									property: "article:author",
									content: author,
								},
						  ]
						: []),
			  ]
			: []),
		// Twitter Card
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:site",
			content: TWITTER_HANDLE,
		},
		{
			name: "twitter:creator",
			content: TWITTER_HANDLE,
		},
		{
			name: "twitter:title",
			content: fullTitle,
		},
		{
			name: "twitter:description",
			content: description,
		},
		{
			name: "twitter:image",
			content: imageUrl,
		},
		{
			name: "twitter:image:alt",
			content: imageAltText,
		},
	];

	// Generate default structured data if not provided
	const defaultStructuredData: Record<string, unknown> = structuredData || {
		"@context": "https://schema.org",
		"@type": type === "article" ? "Article" : "WebSite",
		name: fullTitle,
		description: description,
		url: url,
		...(type === "article"
			? {
					headline: title,
					...(publishedTime && { datePublished: publishedTime }),
					...(modifiedTime && { dateModified: modifiedTime }),
					...(author && { author: { "@type": "Person", name: author } }),
			  }
			: {
					publisher: {
						"@type": "Organization",
						name: SITE_NAME,
						logo: {
							"@type": "ImageObject",
							url: `${SITE_URL}/logo512.png`,
						},
					},
			  }),
		image: {
			"@type": "ImageObject",
			url: imageUrl,
			width: imageWidth,
			height: imageHeight,
		},
	};

	return {
		meta: metaTags,
		links: [
			{
				rel: "canonical",
				href: url,
			},
		],
		scripts: [
			{
				type: "application/ld+json",
				children: JSON.stringify(defaultStructuredData),
			},
		],
	};
}
