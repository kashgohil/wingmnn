import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateTag, useProjectTags } from "@/lib/hooks/use-tags";
import { toast } from "@/lib/toast";
import { catchError } from "@wingmnn/utils";
import { ChevronDown, Plus, Search, Tag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

// Predefined color palette for tags
export const TAG_COLORS = [
	"#EF4444", // red
	"#F97316", // orange
	"#F59E0B", // amber
	"#EAB308", // yellow
	"#84CC16", // lime
	"#22C55E", // green
	"#10B981", // emerald
	"#14B8A6", // teal
	"#06B6D4", // cyan
	"#0EA5E9", // sky
	"#3B82F6", // blue
	"#6366F1", // indigo
	"#8B5CF6", // violet
	"#A855F7", // purple
	"#D946EF", // fuchsia
	"#EC4899", // pink
	"#F43F5E", // rose
	"#64748B", // slate
];

interface TagPickerProps {
	projectId: string | null;
	selectedTagIds: string[];
	onTagIdsChange: (tagIds: string[]) => void;
	disabled?: boolean;
}

export function TagPicker({
	projectId,
	selectedTagIds,
	onTagIdsChange,
	disabled = false,
}: TagPickerProps) {
	const { data: projectTags = [] } = useProjectTags(projectId);
	const createTag = useCreateTag();
	const [tagSelectorOpen, setTagSelectorOpen] = useState(false);
	const [showCreateTagForm, setShowCreateTagForm] = useState(false);
	const [newTagName, setNewTagName] = useState("");
	const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
	const [tagSearchQuery, setTagSearchQuery] = useState("");

	const selectedTags = projectTags.filter((tag) =>
		selectedTagIds.includes(tag.id),
	);

	// Filter tags based on search query
	const filteredTags = projectTags.filter((tag) =>
		tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()),
	);

	const handleCreateTag = async () => {
		if (!projectId || !newTagName.trim()) {
			return;
		}

		const [tag, error] = await catchError(
			createTag.mutateAsync({
				projectId,
				params: {
					name: newTagName.trim(),
					colorCode: newTagColor,
				},
			}),
		);

		if (error || !tag) {
			toast.error("Failed to create tag", {
				description:
					error instanceof Error
						? error.message
						: "Failed to create tag. Please try again.",
			});
			return;
		}

		// Add the newly created tag to the selected tags
		onTagIdsChange([...selectedTagIds, tag.id]);

		// Reset form
		setNewTagName("");
		setNewTagColor(TAG_COLORS[0]);
		setShowCreateTagForm(false);
		// Keep popover open so user can select more tags
		toast.success("Tag created", {
			description: `"${tag.name}" has been created and added to this task.`,
		});
	};

	const handleTagToggle = (tagId: string, checked: boolean) => {
		if (checked) {
			onTagIdsChange([...selectedTagIds, tagId]);
		} else {
			onTagIdsChange(selectedTagIds.filter((id) => id !== tagId));
		}
	};

	return (
		<Popover
			open={tagSelectorOpen}
			onOpenChange={(open) => {
				setTagSelectorOpen(open);
				if (!open) {
					setTagSearchQuery("");
					setShowCreateTagForm(false);
				}
			}}
		>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="mt-2 w-full flex items-center justify-between gap-2 rounded-none border-2 border-border bg-transparent px-3 py-2 text-sm font-medium text-foreground retro-border-shadow-sm hover:bg-accent/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:retro-border-shadow focus-visible:ring-0 outline-none"
					disabled={disabled}
				>
					<div className="flex items-center gap-2 flex-1 min-w-0">
						<Tag className="size-4 shrink-0 text-muted-foreground" />
						{selectedTags.length === 0 ? (
							<span className="text-muted-foreground">Select tags...</span>
						) : (
							<div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
								{selectedTags.slice(0, 3).map((tag) => (
									<div
										key={tag.id}
										className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-border bg-muted/50 shrink-0"
									>
										<div
											className="size-2.5 rounded-sm"
											style={{
												backgroundColor: tag.colorCode,
											}}
										/>
										<span className="text-xs truncate">{tag.name}</span>
									</div>
								))}
								{selectedTags.length > 3 && (
									<span className="text-xs text-muted-foreground shrink-0">
										+{selectedTags.length - 3} more
									</span>
								)}
							</div>
						)}
					</div>
					<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80 p-0"
				align="start"
			>
				<div className="max-h-96 overflow-y-auto">
					{!showCreateTagForm ? (
						<>
							{/* Search input */}
							<div className="p-2 border-b border-border">
								<div className="relative">
									<Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
									<Input
										type="text"
										placeholder="Search tags..."
										value={tagSearchQuery}
										onChange={(e) => setTagSearchQuery(e.target.value)}
										className="pl-8"
										autoFocus
									/>
								</div>
							</div>
							{projectTags.length === 0 ? (
								<div className="p-4 text-center text-sm text-muted-foreground">
									<p className="mb-2">No tags available.</p>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											setShowCreateTagForm(true);
											if (tagSearchQuery) {
												setNewTagName(tagSearchQuery);
											}
										}}
										className="w-full"
									>
										<Plus className="size-4 mr-2" />
										Create first tag
									</Button>
								</div>
							) : filteredTags.length === 0 ? (
								<div className="p-4 text-center text-sm text-muted-foreground">
									<p className="mb-2">
										No tags found matching "{tagSearchQuery}".
									</p>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											setShowCreateTagForm(true);
											setNewTagName(tagSearchQuery);
										}}
										className="w-full"
									>
										<Plus className="size-4 mr-2" />
										Create "{tagSearchQuery}"
									</Button>
								</div>
							) : (
								<>
									<div className="p-2">
										{filteredTags.map((tag) => (
											<label
												key={tag.id}
												className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
											>
												<Checkbox
													checked={selectedTagIds.includes(tag.id)}
													onCheckedChange={(checked: boolean) =>
														handleTagToggle(tag.id, checked)
													}
													disabled={disabled}
												/>
												<div
													className="size-3 rounded-sm shrink-0"
													style={{
														backgroundColor: tag.colorCode,
													}}
												/>
												<span className="text-sm flex-1">{tag.name}</span>
											</label>
										))}
									</div>
									<div className="border-t border-border p-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												setShowCreateTagForm(true);
												if (tagSearchQuery) {
													setNewTagName(tagSearchQuery);
												}
											}}
											className="w-full"
											disabled={disabled}
										>
											<Plus className="size-4 mr-2" />
											Create new tag
										</Button>
									</div>
								</>
							)}
						</>
					) : (
						<div className="p-4 space-y-4">
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-semibold">Create new tag</h4>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									onClick={() => {
										setShowCreateTagForm(false);
										setNewTagName("");
										setNewTagColor(TAG_COLORS[0]);
									}}
								>
									<X className="size-4" />
								</Button>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-tag-name">Tag name</Label>
								<Input
									id="new-tag-name"
									value={newTagName}
									onChange={(e) => setNewTagName(e.target.value)}
									placeholder="Enter tag name"
									className="w-full"
									autoFocus
									disabled={createTag.isPending || disabled}
								/>
							</div>
							<div className="space-y-2">
								<Label>Color</Label>
								<div className="grid grid-cols-6 gap-2">
									{TAG_COLORS.map((color) => (
										<button
											key={color}
											type="button"
											className={`size-8 rounded-sm border-2 transition-all ${
												newTagColor === color
													? "border-foreground scale-110"
													: "border-border hover:border-foreground/50"
											}`}
											style={{
												backgroundColor: color,
											}}
											onClick={() => setNewTagColor(color)}
											disabled={createTag.isPending || disabled}
											aria-label={`Select color ${color}`}
										/>
									))}
								</div>
							</div>
							<div className="flex gap-2 pt-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										setShowCreateTagForm(false);
										setNewTagName("");
										setNewTagColor(TAG_COLORS[0]);
									}}
									className="flex-1"
									disabled={createTag.isPending || disabled}
								>
									Cancel
								</Button>
								<Button
									type="button"
									size="sm"
									onClick={handleCreateTag}
									className="flex-1"
									disabled={
										!newTagName.trim() ||
										createTag.isPending ||
										disabled
									}
								>
									{createTag.isPending ? "Creating..." : "Create"}
								</Button>
							</div>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

