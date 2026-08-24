export type ResourceId = "stone" | "wood" | "iron" | "gold" | "crystal";
export type MaterialId = "herb" | "canvas" | "paint";
export type ToolId = "hands" | "pick" | "drill" | "excavator" | "laser";
export type AutoId = "worker" | "crew" | "factory" | "corp";
export type FurnitureId = "bed" | "table" | "lamp" | "carpet" | "painting" | "trophy";
export type PlantId = "wheat" | "herb" | "berry" | "sunflower" | "bloom";

export const RESOURCES: { id: ResourceId; name: string; value: number; color: string; rare?: boolean }[] = [
  { id: "stone", name: "Камень", value: 1, color: "#9aa4b8" },
  { id: "wood", name: "Дерево", value: 2, color: "#c98d4f" },
  { id: "iron", name: "Железо", value: 5, color: "#b8c4d6" },
  { id: "gold", name: "Золото", value: 20, color: "#FFD700", rare: true },
  { id: "crystal", name: "Кристаллы", value: 100, color: "#7fe8ff", rare: true },
];

export const TOOLS: { id: ToolId; name: string; mult: number; price: number }[] = [
  { id: "hands", name: "Руки", mult: 1, price: 0 },
  { id: "pick", name: "Кирка", mult: 2, price: 100 },
  { id: "drill", name: "Бур", mult: 5, price: 500 },
  { id: "excavator", name: "Экскаватор", mult: 20, price: 2000 },
  { id: "laser", name: "Лазер", mult: 100, price: 10000 },
];

export const AUTOS: { id: AutoId; name: string; rate: number; price: number }[] = [
  { id: "worker", name: "Рабочий", rate: 1, price: 500 },
  { id: "crew", name: "Бригада", rate: 10, price: 5000 },
  { id: "factory", name: "Завод", rate: 100, price: 50000 },
  { id: "corp", name: "Корпорация", rate: 1000, price: 100000 },
];

export const HOUSE_LEVELS = [
  { name: "Хижина", price: 0, rooms: 1, note: "1 комната" },
  { name: "Дом", price: 500, rooms: 2, note: "2 комнаты" },
  { name: "Коттедж", price: 2000, rooms: 3, note: "3 комнаты + сад" },
  { name: "Особняк", price: 10000, rooms: 5, note: "5 комнат + бассейн" },
  { name: "Дворец", price: 50000, rooms: 10, note: "10 комнат + парк" },
  { name: "Крепость", price: 200000, rooms: 20, note: "20 комнат + стены" },
];

export const HOUSE_SIZE = [2, 2, 3, 4, 5, 6]; // cells of house footprint

export const PLOTS = [
  { size: 10, price: 0 },
  { size: 20, price: 1000 },
  { size: 30, price: 5000 },
  { size: 50, price: 25000 },
  { size: 100, price: 100000 },
];

export const FURNITURE: {
  id: FurnitureId;
  name: string;
  price: number;
  bonus: string;
  effect: { energy?: number; craftSlot?: number; light?: number; mood?: number; prestige?: number; incomePct?: number };
}[] = [
  { id: "bed", name: "Кровать", price: 50, bonus: "+5 к макс. энергии", effect: { energy: 5 } },
  { id: "table", name: "Стол", price: 100, bonus: "+1 слот крафта", effect: { craftSlot: 1 } },
  { id: "lamp", name: "Лампа", price: 30, bonus: "+2 к Свету", effect: { light: 2 } },
  { id: "carpet", name: "Ковёр", price: 80, bonus: "+5 к настроению", effect: { mood: 5 } },
  { id: "painting", name: "Картина", price: 200, bonus: "+10 к престижу", effect: { prestige: 10 } },
  { id: "trophy", name: "Трофей", price: 500, bonus: "+5% к доходу", effect: { incomePct: 5 } },
];

export interface Recipe {
  id: string;
  name: string;
  inputs: Partial<Record<ResourceId | MaterialId, number>>;
  value: number; // цена продажи
  time: number; // сек
  profession?: string; // id профессии
  desc: string;
}

export const RECIPES: Recipe[] = [
  { id: "planks", name: "Доски", inputs: { wood: 2 }, value: 8, time: 4, desc: "Дерево → доски" },
  { id: "chair", name: "Мебель", inputs: { wood: 6 }, value: 45, time: 8, profession: "carpenter", desc: "Дерево → мебель" },
  { id: "bricks", name: "Кирпичи", inputs: { stone: 2 }, value: 6, time: 4, desc: "Камень → кирпичи" },
  { id: "wall", name: "Стены", inputs: { stone: 10 }, value: 60, time: 12, desc: "Камень → стены" },
  { id: "sword", name: "Меч", inputs: { iron: 10, wood: 5 }, value: 100, time: 15, profession: "blacksmith", desc: "10 железа + 5 дерева" },
  { id: "machine", name: "Механизм", inputs: { iron: 8, wood: 4 }, value: 150, time: 20, profession: "blacksmith", desc: "Инструменты → механизмы" },
  { id: "jewel", name: "Украшение", inputs: { gold: 3 }, value: 90, time: 12, profession: "jeweler", desc: "Золото → украшение" },
  { id: "luxury", name: "Предмет роскоши", inputs: { gold: 6, crystal: 1 }, value: 400, time: 30, profession: "jeweler", desc: "Украшения → роскошь" },
  { id: "potion", name: "Зелье силы", inputs: { crystal: 3, herb: 5 }, value: 500, time: 25, profession: "alchemist", desc: "3 кристалла + 5 трав" },
  { id: "picture", name: "Картина", inputs: { canvas: 5, paint: 3 }, value: 300, time: 18, desc: "5 холста + 3 краски" },
];

export const MATERIALS: { id: MaterialId; name: string; price: number }[] = [
  { id: "herb", name: "Травы", price: 5 },
  { id: "canvas", name: "Холст", price: 10 },
  { id: "paint", name: "Краски", price: 8 },
];

export const ACHIEVEMENTS = [
  { id: "c100", clicks: 100, name: "Первая сотня", reward: 50 },
  { id: "c1000", clicks: 1000, name: "Труженик", reward: 500 },
  { id: "c10000", clicks: 10000, name: "Мастер кирки", reward: 5000 },
  { id: "c100000", clicks: 100000, name: "Стальная рука", reward: 50000 },
  { id: "c1000000", clicks: 1000000, name: "Легенда Империи", reward: 500000 },
];

export const FISH = [
  { name: "Карась", min: 10, max: 50, tier: "Обычная", color: "#9aa4b8" },
  { name: "Окунь", min: 10, max: 50, tier: "Обычная", color: "#8fbf7f" },
  { name: "Щука", min: 50, max: 200, tier: "Редкая", color: "#7fc4bf" },
  { name: "Сом", min: 50, max: 200, tier: "Редкая", color: "#b8a06f" },
  { name: "Осётр", min: 200, max: 1000, tier: "Легендарная", color: "#c9a4ff" },
  { name: "Золотая рыбка", min: 1000, max: 2500, tier: "Золотая", color: "#FFD700" },
];

export const PLANTS: { id: PlantId; name: string; seed: number; time: number; min: number; max: number; rare?: boolean; food?: number; mood?: number }[] = [
  { id: "wheat", name: "Пшеница", seed: 3, time: 30, min: 5, max: 15 },
  { id: "herb", name: "Травы", seed: 5, time: 60, min: 10, max: 30 },
  { id: "berry", name: "Ягоды", seed: 8, time: 90, min: 15, max: 40, food: 20 },
  { id: "sunflower", name: "Подсолнух", seed: 15, time: 120, min: 30, max: 80, mood: 3 },
  { id: "bloom", name: "Кристальный цветок", seed: 60, time: 300, min: 200, max: 500, rare: true },
];

export const MINE_TIERS = [
  { upTo: 10, min: 1, max: 10 },
  { upTo: 20, min: 10, max: 50 },
  { upTo: 50, min: 50, max: 100 },
  { upTo: 100, min: 100, max: 500 },
];

export const LOTTERY = { ticketPrice: 10, jackpotBase: 10000, jackpotPerTicket: 5, maxN: 50, pick: 5 };
export const LOTTERY_PRIZES: Record<number, number> = { 2: 50, 3: 500, 4: 5000 };
