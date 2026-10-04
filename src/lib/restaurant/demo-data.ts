import hero from "@/assets/restaurant/restaurant-hero.jpg";
import interior from "@/assets/restaurant/restaurant-interior.jpg";
import evening from "@/assets/restaurant/restaurant-evening.jpg";
import bife from "@/assets/restaurant/dish-bife.jpg";
import polvo from "@/assets/restaurant/dish-polvo.jpg";
import bacalhau from "@/assets/restaurant/dish-bacalhau.jpg";
import risotto from "@/assets/restaurant/dish-risotto.jpg";
import pao from "@/assets/restaurant/dish-pao.jpg";
import frango from "@/assets/restaurant/dish-frango.jpg";
import mousse from "@/assets/restaurant/dish-mousse.jpg";
import limonada from "@/assets/restaurant/drink-limonada.jpg";
import cogumelos from "@/assets/restaurant/dish-cogumelos.jpg";
import arrozMarisco from "@/assets/restaurant/dish-arroz-marisco.jpg";
import pratoDia from "@/assets/restaurant/dish-prato-dia.jpg";
import batatas from "@/assets/restaurant/dish-batatas.jpg";
import pudim from "@/assets/restaurant/dish-pudim.jpg";
import cola from "@/assets/restaurant/drink-cola.jpg";
import vinho from "@/assets/restaurant/drink-vinho.jpg";

// Imagens de demonstração dos pratos (referenciadas na base de dados como "demo:<nome>")
export const siteImages = { hero, interior, evening };
const demoImages: Record<string, string> = {
  bife,
  polvo,
  bacalhau,
  risotto,
  pao,
  frango,
  mousse,
  limonada,
  cogumelos,
  "arroz-marisco": arrozMarisco,
  "prato-dia": pratoDia,
  batatas,
  pudim,
  cola,
  vinho,
};

/** Converte o valor guardado na base de dados num URL utilizável no browser */
export const resolveImage = (url: string) =>
  url.startsWith("demo:") ? demoImages[url.slice(5)] ?? "" : url;

export type OrderStatus = "recebido" | "preparacao" | "pronto" | "entregue";
export type ReservationStatus =
  | "pendente"
  | "confirmada"
  | "chegou"
  | "concluida"
  | "cancelada";

export type Category = { id: string; name: string; sortOrder: number };
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string | null;
  image: string;
  available: boolean;
  featured: boolean;
};

export type Table = {
  id: string;
  number: number;
  name: string;
  slug: string;
  seats: number;
  active: boolean;
};

export type OrderItem = {
  productId: string | null;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  code: number;
  tableId: string | null;
  tableNumber: number;
  items: OrderItem[];
  note: string;
  total: number;
  status: OrderStatus;
  createdAt: number;
  closed: boolean;
};

export type TableRequest = {
  id: string;
  tableId: string | null;
  tableNumber: number;
  type: "empregado" | "conta";
  createdAt: number;
  resolved: boolean;
};

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  tableNumber?: number | undefined;
  notes: string;
  origin: "online" | "telefone";
  status: ReservationStatus;
  createdAt: number;
};

export type Settings = {
  name: string;
  tagline: string;
  introduction: string;
  logo: string;
  primaryColor: string;
  phone: string;
  email: string;
  address: string;
  hours: string[];
  features: {
    qrOrders: boolean;
    callWaiter: boolean;
    requestBill: boolean;
    reservations: boolean;
  };
};

export type PublicData = {
  restaurantId: string;
  slug: string;
  settings: Settings;
  categories: Category[];
  products: Product[];
  tables: Table[];
};

export type AdminData = PublicData & {
  orders: Order[];
  requests: TableRequest[];
  reservations: Reservation[];
};

export const todayISO = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const reservationTimes = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
];
