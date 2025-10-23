// Main components
export { ColorPicker } from "./components/ColorPicker";
export { Editor } from "./components/editor";
export { LinkDialog } from "./components/LinkDialog";
export { OptimizedEditor } from "./components/OptimizedEditor";
export { SimpleRichTextEditor } from "./components/SimpleRichTextEditor";
export { VirtualScrollEditor } from "./components/VirtualScrollEditor";
export { useEditor } from "./useEditor";

// Types
export type {
	Block,
	BlockProps,
	BlockType,
	EditorAPI,
	EditorCommand,
	EditorState,
	FloatingToolbarProps,
	Plugin,
	Selection,
} from "./types";

// Block components
export { BaseBlock } from "./blocks/BaseBlock";
export { BlockRenderer } from "./blocks/BlockRenderer";
export { ChecklistBlock } from "./blocks/ChecklistBlock";
export { CodeBlock } from "./blocks/CodeBlock";
export { DividerBlock } from "./blocks/DividerBlock";
export { HeadingBlock } from "./blocks/HeadingBlock";
export { OptimizedBlockRenderer } from "./blocks/OptimizedBlockRenderer";
export { QuoteBlock } from "./blocks/QuoteBlock";
export { TextBlock } from "./blocks/TextBlock";

// Toolbar components
export { FloatingToolbar } from "./toolbar/FloatingToolbar";
export { SimpleFloatingToolbar } from "./toolbar/SimpleFloatingToolbar";

// Core classes
export { AutoSaveManager } from "./core/AutoSaveManager";
export { CommandManager } from "./core/CommandManager";
export { DragDropManager } from "./core/DragDropManager";
export { EditorAPIImpl } from "./core/EditorAPI";
export { EditorStateManager } from "./core/EditorState";
export { KeyboardNavigation } from "./core/KeyboardNavigation";
export { PerformanceOptimizer } from "./core/PerformanceOptimizer";
export { RichTextFormatter } from "./core/RichTextFormatter";
export { SearchReplaceManager } from "./core/SearchReplaceManager";
export { SelectionManager } from "./core/SelectionManager";

// Plugin system
export { PluginManager } from "./plugins/PluginManager";
export { SlashCommandPlugin } from "./plugins/SlashCommandPlugin";
