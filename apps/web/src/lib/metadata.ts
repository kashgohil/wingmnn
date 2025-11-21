const SITE_URL = "https://wingmnn.com";
const SITE_NAME = "Wingmnn";
const DEFAULT_DESCRIPTION =
	"Human-centered ops stack that keeps every part of your team rhythm tidy, from mails to fun. Ship faster rituals with one login.";

export interface MetadataOptions {
	title: string;
	description?: string;
	image?: string;
	path?: string;
	keywords?: string[];
	noindex?: boolean;
}

export function generateMetadata({
	title,
	description = DEFAULT_DESCRIPTION,
	image = "/logo512.png",
	path = "",
	keywords = [],
	noindex = false,
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

	return {
		meta: [
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
				content: SITE_NAME,
			},
			{
				name: "robots",
				content: noindex ? "noindex, nofollow" : "index, follow",
			},
			// Open Graph
			{
				property: "og:type",
				content: "website",
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
				content: `${SITE_URL}${image}`,
			},
			{
				property: "og:url",
				content: url,
			},
			{
				property: "og:site_name",
				content: SITE_NAME,
			},
			// Twitter Card
			{
				name: "twitter:card",
				content: "summary_large_image",
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
				content: `${SITE_URL}${image}`,
			},
		],
		links: [
			{
				rel: "canonical",
				href: url,
			},
		],
	};
}
