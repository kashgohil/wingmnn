type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IconProps extends React.DetailedHTMLProps<React.SVGAttributes<SVGSVGElement>, SVGSVGElement> {
	height?: number;
	width?: number;
	fill?: string;
	className?: string;
}
