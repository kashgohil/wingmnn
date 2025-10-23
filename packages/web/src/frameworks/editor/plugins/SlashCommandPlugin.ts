import type { Block, EditorAPI, Plugin } from "../types";

export class SlashCommandPlugin implements Plugin {
	name = "slash-command";
	version = "1.0.0";
	private editorAPI: EditorAPI | null = null;

	initialize(editor: EditorAPI): void {
		this.editorAPI = editor;
		this.setupSlashCommands();
	}

	destroy(): void {
		// Cleanup if needed
	}

	private setupSlashCommands(): void {
		// Set up keyboard event listeners for slash commands
		document.addEventListener("keydown", this.handleKeyDown.bind(this));
	}

	private handleKeyDown(event: KeyboardEvent): void {
		// Only handle slash key
		if (event.key !== "/") return;

		// Check if we're in an editor block
		const target = event.target as HTMLElement;
		const blockElement = target.closest("[data-block-id]");

		if (!blockElement) return;

		const blockId = blockElement.getAttribute("data-block-id");
		if (!blockId) return;

		// Show slash command menu
		this.showSlashMenu(blockId, target);
	}

	private showSlashMenu(blockId: string, target: HTMLElement): void {
		// Create slash command menu
		const menu = document.createElement("div");
		menu.className =
			"slash-menu fixed bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50";
		menu.style.top = `${target.getBoundingClientRect().bottom + 5}px`;
		menu.style.left = `${target.getBoundingClientRect().left}px`;

		const commands = [
			{ label: "Heading 1", command: "h1", icon: "H1" },
			{ label: "Heading 2", command: "h2", icon: "H2" },
			{ label: "Heading 3", command: "h3", icon: "H3" },
			{ label: "Code Block", command: "code", icon: "</>" },
			{ label: "Quote", command: "quote", icon: '"' },
			{ label: "Checklist", command: "checklist", icon: "☑" },
			{ label: "Divider", command: "divider", icon: "---" },
		];

		commands.forEach((cmd, index) => {
			const item = document.createElement("div");
			item.className =
				"slash-menu-item flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer";
			item.innerHTML = `
				<span class="text-sm font-mono">${cmd.icon}</span>
				<span class="text-sm">${cmd.label}</span>
			`;

			item.addEventListener("click", () => {
				this.executeSlashCommand(blockId, cmd.command);
				document.body.removeChild(menu);
			});

			// Highlight first item
			if (index === 0) {
				item.classList.add("bg-gray-100");
			}

			menu.appendChild(item);
		});

		document.body.appendChild(menu);

		// Remove menu when clicking outside
		const removeMenu = (e: MouseEvent) => {
			if (!menu.contains(e.target as Node)) {
				document.body.removeChild(menu);
				document.removeEventListener("click", removeMenu);
			}
		};

		setTimeout(() => {
			document.addEventListener("click", removeMenu);
		}, 100);
	}

	private executeSlashCommand(blockId: string, command: string): void {
		if (!this.editorAPI) return;

		const commandMap: Record<string, Block["type"]> = {
			h1: "heading1",
			h2: "heading2",
			h3: "heading3",
			code: "codeBlock",
			quote: "quote",
			divider: "divider",
			checklist: "checklist",
		};

		const blockType = commandMap[command];
		if (blockType) {
			this.editorAPI.updateBlock(blockId, {
				type: blockType,
				content: "", // Clear the slash command
			});
		}
	}

	onBlockCreate(block: Block): void {
		// Handle slash commands when creating blocks
		if (block.content.startsWith("/")) {
			this.processSlashCommand(block);
		}
	}

	onBlockUpdate(block: Block): void {
		// Handle slash commands when updating blocks
		if (block.content.startsWith("/")) {
			this.processSlashCommand(block);
		}
	}

	private processSlashCommand(block: Block): void {
		if (!this.editorAPI) return;

		const command = block.content.slice(1).toLowerCase();
		const commandMap: Record<string, Block["type"]> = {
			h1: "heading1",
			h2: "heading2",
			h3: "heading3",
			code: "codeBlock",
			quote: "quote",
			divider: "divider",
			checklist: "checklist",
			todo: "checklist",
			task: "checklist",
		};

		const blockType = commandMap[command];
		if (blockType) {
			this.editorAPI.updateBlock(block.id, {
				type: blockType,
				content: "", // Clear the slash command
			});
		}
	}
}
