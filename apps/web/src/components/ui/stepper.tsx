/**
 * Stepper Component
 *
 * A multi-step indicator component that displays progress through a series of steps.
 * Supports both horizontal (mobile) and vertical (desktop) layouts.
 */

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
	/**
	 * Current active step (1-indexed)
	 */
	currentStep: number;
	/**
	 * Array of step names/labels
	 */
	steps: string[];
	/**
	 * Optional className for the container
	 */
	className?: string;
	/**
	 * Render mode: 'mobile' shows horizontal, 'desktop' shows vertical, 'both' shows both (default)
	 */
	mode?: "mobile" | "desktop" | "both";
}

export function Stepper({
	currentStep,
	steps,
	className,
	mode = "both",
}: StepperProps) {
	const mobileStepper = (
		<div
			className={cn(
				"flex md:hidden items-center justify-center w-full my-6 gap-2",
				className,
			)}
		>
			{steps.map((_, index) => {
				const stepNum = index + 1;
				return (
					<div
						key={stepNum}
						className="flex items-center"
					>
						<div className="flex items-center">
							<div
								className={cn(
									"flex items-center justify-center w-10 h-10 rounded-none retro-border font-bold",
									currentStep === stepNum
										? "bg-primary text-primary-foreground"
										: currentStep > stepNum
										? "bg-primary/20 text-primary"
										: "bg-muted text-muted-foreground",
								)}
							>
								{currentStep > stepNum ? "✓" : stepNum}
							</div>
							{stepNum < steps.length && (
								<div
									className={cn(
										"w-8 h-0.5 mx-2",
										currentStep > stepNum ? "bg-primary" : "bg-border",
									)}
								/>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);

	const desktopStepper = (
		<div
			className={cn(
				"hidden md:flex flex-col min-w-[200px] relative",
				className,
			)}
		>
			{steps.map((stepName, index) => {
				const stepNum = index + 1;
				const isLast = stepNum === steps.length;
				return (
					<div
						key={stepNum}
						className="relative"
					>
						<div className="flex items-start gap-3">
							<div className="relative flex flex-col items-center">
								{/* Solid background circle for completed steps to hide line */}
								{currentStep > stepNum && (
									<div className="absolute w-10 h-10 bg-background rounded-none z-0" />
								)}
								{/* Step circle */}
								<div
									className={cn(
										"flex items-center justify-center w-10 h-10 rounded-none retro-border font-bold shrink-0 relative z-10",
										currentStep === stepNum
											? "bg-primary text-primary-foreground"
											: currentStep > stepNum
											? "bg-primary/20 text-primary"
											: "bg-muted text-muted-foreground",
									)}
								>
									{currentStep > stepNum ? (
										<Check className="h-5 w-5" />
									) : (
										stepNum
									)}
								</div>
							</div>
							<div className="flex flex-col pt-0.5 pb-4">
								<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									Step {stepNum}
								</div>
								<div
									className={cn(
										"font-medium",
										currentStep === stepNum
											? "font-bold"
											: currentStep > stepNum
											? ""
											: "text-muted-foreground",
									)}
								>
									{stepName}
								</div>
							</div>
						</div>
						{/* Connecting line - rendered between steps, not within step container */}
						{!isLast && (
							<div
								className={cn(
									"absolute left-5 top-10 w-0.5 h-4 z-0",
									currentStep > stepNum ? "bg-primary" : "bg-border",
								)}
							/>
						)}
					</div>
				);
			})}
		</div>
	);

	if (mode === "mobile") {
		return mobileStepper;
	}
	if (mode === "desktop") {
		return desktopStepper;
	}

	return (
		<>
			{mobileStepper}
			{desktopStepper}
		</>
	);
}
