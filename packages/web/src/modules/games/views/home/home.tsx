import { Views } from "@constants";
import { useGames } from "@games/store/useGames";
import { ChartView } from "./chartView";
import { GridView } from "./gridView";
import { ListView } from "./listView";

export function Home() {
  const view = useGames("view");

  switch (view) {
    case Views.GRID:
      return <GridView />;
    case Views.LIST:
      return <ListView />;
    case Views.CHART:
      return <ChartView />;
    default:
      return null;
  }
}
