import { Views } from "@constants";
import { createStore } from "@frameworks/store/create";

interface GamesStore {
  view: Views;
  tab: "history" | "game" | "analytics";
}

const { useState: useGames, store } = createStore<GamesStore>({
  view: Views.GRID,
  tab: "game",
});

const GamesActions = (function () {
  return {
    setView: (view: Views) => store.set("view", view),
    setTab: (tab: GamesStore["tab"]) => store.set("tab", tab),
  };
})();

export { GamesActions, useGames };
