import type { EditorAPI, Plugin } from "../types";

export class PluginManager {
	private plugins: Map<string, Plugin> = new Map();
	private editorAPI: EditorAPI;

	constructor(editorAPI: EditorAPI) {
		this.editorAPI = editorAPI;
	}

	registerPlugin(plugin: Plugin): void {
		if (this.plugins.has(plugin.name)) {
			console.warn(`Plugin "${plugin.name}" is already registered`);
			return;
		}

		this.plugins.set(plugin.name, plugin);
		plugin.initialize(this.editorAPI);
	}

	unregisterPlugin(pluginName: string): void {
		const plugin = this.plugins.get(pluginName);
		if (plugin) {
			plugin.destroy();
			this.plugins.delete(pluginName);
		}
	}

	getPlugin(pluginName: string): Plugin | undefined {
		return this.plugins.get(pluginName);
	}

	getAllPlugins(): Plugin[] {
		return Array.from(this.plugins.values());
	}

	destroy(): void {
		this.plugins.forEach((plugin) => plugin.destroy());
		this.plugins.clear();
	}
}
