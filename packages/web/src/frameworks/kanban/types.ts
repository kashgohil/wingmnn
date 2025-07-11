export interface CardData {
  id: string;
  content: string;
}

export interface ColumnData {
  id: string;
  title: string;
  cards: CardData[];
}
