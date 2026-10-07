/**
 * Controlador do Modo de Demonstração / Staging Visual Isolado
 * Permite testar todo o Workspace (Hub, CRM, Restaurantes, Match, Admin)
 * com dados fictícios ricos e estado interativo, sem qualquer ligação a bases de dados reais.
 */

import type {
  AdminData,
  Category,
  Order,
  OrderStatus,
  Product,
  Reservation,
  ReservationStatus,
  Settings,
  Table,
  TableRequest,
} from "./restaurant/demo-data";
import { todayISO } from "./restaurant/demo-data";
import type {
  Business,
  Interaction,
  Opportunity,
  Profile,
  Project,
  Task,
  WebsiteRequest,
} from "./crm";
import type { SatisfactionSurvey, PublicSurveyView, SubmitSurveyPayload } from "./satisfacao";

export function isDemoMode(): boolean {
  // Production deployment is NEVER allowed to enter demo mode or bypass auth.
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      host === "novawebstudio.pt" ||
      host === "www.novawebstudio.pt" ||
      host.endsWith(".novawebstudio.pt")
    ) {
      return false;
    }
  } else {
    if (process.env["VERCEL_ENV"] === "production") return false;
  }

  // Preview opt-in ONLY. Neither localhost nor a query string can grant admin access.
  const requested = import.meta.env["VITE_DEMO_MODE"] === "true";
  const preview = import.meta.env["VITE_DEPLOYMENT_ENV"] === "preview";
  if (typeof window === "undefined") {
    return preview && requested && process.env["DEMO_MODE"] === "true";
  }
  return preview && requested;
}

// ============================================================================
// DADOS DE EXEMPLO (CARREGADOS APENAS QUANDO O UTILIZADOR PEDIR NO MODO DEMO)
// ============================================================================

const sampleSettings: Settings = {
  name: "Restaurante de Demonstração [DEMO]",
  tagline: "Cozinha portuguesa de produto, servida sem pressa.",
  introduction:
    "Ambiente de demonstração visual isolado no NWS Workspace com pedidos, ementa e mesas simuladas.",
  logo: "",
  primaryColor: "#39D9E6",
  phone: "912 000 000",
  email: "demo@restaurante-exemplo.pt",
  address: "Rua de Exemplo 42, Lisboa",
  hours: [
    "Terça a Sexta: 12:00 - 15:00 e 19:00 - 23:00",
    "Sábado: 12:30 - 16:00 e 19:00 - 23:30",
    "Domingo: 12:30 - 16:00",
    "Segunda: Encerrado",
  ],
  features: {
    qrOrders: true,
    callWaiter: true,
    requestBill: true,
    reservations: true,
  },
};

const cleanSettings: Settings = {
  name: "Restaurante de Demonstração [DEMO]",
  tagline: "Configure a identidade do seu restaurante",
  introduction:
    "Restaurante de demonstração sem dados iniciais. Clique em 'Carregar dados de exemplo' para simular um restaurante movimentado.",
  logo: "",
  primaryColor: "#39D9E6",
  phone: "912 000 000",
  email: "demo@restaurante.pt",
  address: "Morada do Estabelecimento",
  hours: ["Segunda a Domingo: 12:00 - 23:00"],
  features: {
    qrOrders: true,
    callWaiter: true,
    requestBill: true,
    reservations: true,
  },
};

const sampleCategories: Category[] = [
  { id: "entradas", name: "Entradas", sortOrder: 1 },
  { id: "principais", name: "Pratos Principais", sortOrder: 2 },
  { id: "sobremesas", name: "Sobremesas", sortOrder: 3 },
  { id: "bebidas", name: "Bebidas & Vinhos", sortOrder: 4 },
];

const sampleProducts: Product[] = [
  {
    id: "demo-p1",
    name: "Pão de Fermentação Lenta & Azeite [DEMO]",
    description: "Com azeitonas temperadas.",
    price: 4.5,
    category: "Entradas",
    categoryId: "entradas",
    image: "demo:pao",
    available: true,
    featured: false,
  },
  {
    id: "demo-p2",
    name: "Cogumelos Salteados com Alho [DEMO]",
    description: "Com ervas frescas e tostas.",
    price: 8.5,
    category: "Entradas",
    categoryId: "entradas",
    image: "demo:cogumelos",
    available: true,
    featured: false,
  },
  {
    id: "demo-p3",
    name: "Bife da Casa Grelhado [DEMO]",
    description: "Com batata rústica e molho especial.",
    price: 19.5,
    category: "Pratos Principais",
    categoryId: "principais",
    image: "demo:bife",
    available: true,
    featured: true,
  },
  {
    id: "demo-p4",
    name: "Polvo à Lagareiro [DEMO]",
    description: "Assado com batata a murro e azeite virgem.",
    price: 22.0,
    category: "Pratos Principais",
    categoryId: "principais",
    image: "demo:polvo",
    available: true,
    featured: true,
  },
  {
    id: "demo-p5",
    name: "Bacalhau Confitado [DEMO]",
    description: "Com batata nova e grelos salteados.",
    price: 20.5,
    category: "Pratos Principais",
    categoryId: "principais",
    image: "demo:bacalhau",
    available: true,
    featured: false,
  },
  {
    id: "demo-p6",
    name: "Risotto de Cogumelos da Época [DEMO]",
    description: "Arroz cremoso com queijo curado.",
    price: 17.0,
    category: "Pratos Principais",
    categoryId: "principais",
    image: "demo:risotto",
    available: true,
    featured: false,
  },
  {
    id: "demo-p7",
    name: "Mousse de Chocolate Negro [DEMO]",
    description: "Com flor de sal e azeite.",
    price: 6.0,
    category: "Sobremesas",
    categoryId: "sobremesas",
    image: "demo:mousse",
    available: true,
    featured: false,
  },
  {
    id: "demo-p8",
    name: "Limonada com Hortelã [DEMO]",
    description: "Feita na hora.",
    price: 3.5,
    category: "Bebidas & Vinhos",
    categoryId: "bebidas",
    image: "demo:limonada",
    available: true,
    featured: false,
  },
];

const sampleTables: Table[] = [
  { id: "demo-t1", number: 1, name: "Mesa 1", slug: "mesa-1", seats: 2, active: true },
  { id: "demo-t2", number: 2, name: "Mesa 2", slug: "mesa-2", seats: 4, active: true },
  { id: "demo-t3", number: 3, name: "Mesa 3", slug: "mesa-3", seats: 2, active: true },
  { id: "demo-t4", number: 4, name: "Mesa 4", slug: "mesa-4", seats: 6, active: true },
  { id: "demo-t5", number: 5, name: "Mesa 5", slug: "mesa-5", seats: 4, active: true },
];

export type DemoStaffMember = {
  id: string;
  user_id: string;
  role: "proprietario" | "gerente" | "cozinha" | "sala";
  ativo: boolean;
  criado_em: string;
  profiles: {
    nome: string;
    email: string;
    foto_url: string;
  };
};

const initialStaff: DemoStaffMember[] = [
  {
    id: "staff-demo-admin",
    user_id: "demo-admin-id",
    role: "proprietario",
    ativo: true,
    criado_em: new Date().toISOString(),
    profiles: {
      nome: "Gonçalo (Administrador Demo)",
      email: "admin.demo@novawebstudio.pt",
      foto_url: "",
    },
  },
];

const sampleStaff: DemoStaffMember[] = [
  {
    id: "staff-demo-admin",
    user_id: "demo-admin-id",
    role: "proprietario",
    ativo: true,
    criado_em: new Date().toISOString(),
    profiles: {
      nome: "Gonçalo (Administrador Demo)",
      email: "admin.demo@novawebstudio.pt",
      foto_url: "",
    },
  },
  {
    id: "staff-demo-sala",
    user_id: "demo-staff-sala",
    role: "sala",
    ativo: true,
    criado_em: new Date().toISOString(),
    profiles: {
      nome: "Tiago Silva (Chefe de Sala [DEMO])",
      email: "tiago.sala@demo-exemplo.pt",
      foto_url: "",
    },
  },
  {
    id: "staff-demo-cozinha",
    user_id: "demo-staff-cozinha",
    role: "cozinha",
    ativo: true,
    criado_em: new Date().toISOString(),
    profiles: {
      nome: "Chef Miguel (Cozinha [DEMO])",
      email: "cozinha@demo-exemplo.pt",
      foto_url: "",
    },
  },
];

// ============================================================================
// DADOS FICTÍCIOS DO CRM
// ============================================================================

/** Mantém os objetos DEMO com a mesma estrutura dos registos reais do CRM. */
const demoBusinessDefaults: Pick<
  Business,
  | "contactado_por"
  | "criado_por"
  | "data_seguimento"
  | "encontrado_por"
  | "pessoa_contacto"
  | "proxima_acao"
  | "ultima_interacao"
> = {
  contactado_por: null,
  criado_por: null,
  data_seguimento: null,
  encontrado_por: null,
  pessoa_contacto: null,
  proxima_acao: null,
  ultima_interacao: null,
};

const sampleBusinesses: Business[] = [
  {
    ...demoBusinessDefaults,
    id: "demo-biz-1",
    nome: "Restaurante Exemplo [DEMO]",
    categoria: "Restauração",
    localidade: "Lisboa",
    telefone: "213 456 789",
    email: "geral@demo-restaurante.pt",
    website: "https://demo.pt",
    website_dominio: "demo.pt",
    google_maps: "",
    responsavel_nome: "Henrique Vale",
    estado: "aceite",
    prioridade: "alta",
    valor_estimado: 3200,
    notas: "Cliente fictício para demonstração do NWS Restaurantes.",
    origem: "manual",
    is_demo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    ...demoBusinessDefaults,
    id: "demo-biz-2",
    nome: "Clube Desportivo Teste [DEMO]",
    categoria: "Desporto",
    localidade: "Porto",
    telefone: "912 345 678",
    email: "direcao@demo-clube.pt",
    website: "",
    website_dominio: null,
    google_maps: "",
    responsavel_nome: "Treinador Pedro",
    estado: "proposta_enviada",
    prioridade: "alta",
    valor_estimado: 2400,
    notas: "Interesse na futura plataforma desportiva NWS Match.",
    origem: "manual",
    is_demo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const sampleTasks: Task[] = [
  {
    concluida_em: null,
    criado_por: null,
    responsavel: null,
    id: "demo-task-1",
    business_id: "demo-biz-1",
    tipo: "ligar",
    titulo: "Apresentar demonstração do NWS Workspace",
    notas: "Apresentar os 4 módulos integrados.",
    prioridade: "alta",
    data_hora: new Date(Date.now() + 4 * 3600000).toISOString(),
    estado: "pendente",
    is_demo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const sampleWebsiteRequests: WebsiteRequest[] = [
  {
    business_id: null,
    quer_reuniao: false,
    id: "demo-req-1",
    nome: "Contacto Fictício Teste",
    empresa: "Empresa de Demonstração Lda",
    email: "contacto@demo-exemplo.pt",
    telefone: "918 000 111",
    tipo_projeto: "Website + Ementa Digital",
    orcamento: "2.000 € - 5.000 €",
    mensagem: "Pedido de contacto simulado para demonstração do CRM.",
    tratado: false,
    created_at: new Date().toISOString(),
  },
];

const sampleSurveys: SatisfactionSurvey[] = [
  {
    id: "demo-survey-1",
    business_id: "demo-biz-1",
    token: "a".repeat(64),
    client_display_name: "Restaurante Demo",
    project_name: "Website & Ementa Digital",
    active: true,
    responded_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    recommendation_score: 19,
    service_score: 10,
    result_score: 10,
    communication_score: 9,
    deadlines_score: 9,
    ease_score: 10,
    liked_text: "A clareza do processo e a rapidez das revisões.",
    improvement_text: "Nada de relevante a apontar nesta demonstração.",
    testimonial:
      "A Nova Web Studio tornou a nossa presença digital muito mais clara e fácil de usar.",
    testimonial_authorized: true,
    portfolio_authorized: true,
    created_by: "demo-admin-id",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "demo-survey-2",
    business_id: "demo-biz-2",
    token: "b".repeat(64),
    client_display_name: "Clube Demo",
    project_name: "Plataforma Digital",
    active: true,
    responded_at: null,
    recommendation_score: null,
    service_score: null,
    result_score: null,
    communication_score: null,
    deadlines_score: null,
    ease_score: null,
    liked_text: null,
    improvement_text: null,
    testimonial: null,
    testimonial_authorized: false,
    portfolio_authorized: false,
    created_by: "demo-admin-id",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// ============================================================================
// STORE EM MEMÓRIA (INICIALIZA VAZIO POR OMISSÃO PARA FIDELIDADE AOS DADOS REAIS)
// ============================================================================

const LOCAL_TEST_TABLES_KEY = "nws-test-restaurant-tables-v1";

function restoreLocalTestTables(): Table[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_TEST_TABLES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (v): v is Table =>
          v !== null &&
          typeof v === "object" &&
          typeof v.id === "string" &&
          Number.isSafeInteger(v.number) &&
          v.number > 0 &&
          Number.isSafeInteger(v.seats) &&
          v.seats >= 1 &&
          typeof v.active === "boolean",
      )
      .slice(0, 200)
      .map((t) => ({ ...t, name: `Mesa ${t.number}`, slug: `mesa-${t.number}` }));
  } catch {
    return [];
  }
}

class DemoStore {
  isPopulated = false;
  settings: Settings = { ...cleanSettings };
  categories: Category[] = [];
  products: Product[] = [];
  tables: Table[] = restoreLocalTestTables();
  orders: Order[] = [];
  requests: TableRequest[] = [];
  reservations: Reservation[] = [];
  staff: DemoStaffMember[] = [...initialStaff];
  businesses: Business[] = [...sampleBusinesses];
  tasks: Task[] = [...sampleTasks];
  websiteRequests: WebsiteRequest[] = [...sampleWebsiteRequests];
  satisfactionSurveys: SatisfactionSurvey[] = [...sampleSurveys];

  loadSampleData() {
    const now = Date.now();
    this.isPopulated = true;
    this.settings = { ...sampleSettings };
    this.categories = [...sampleCategories];
    this.products = [...sampleProducts];
    this.tables = [...sampleTables];
    this.staff = [...sampleStaff];
    this.satisfactionSurveys = [...sampleSurveys];

    this.orders = [
      {
        id: "demo-o1",
        code: 1001,
        tableId: "demo-t2",
        tableNumber: 2,
        note: "Sem cebola [DEMO]",
        total: 41.5,
        status: "recebido",
        closed: false,
        createdAt: now - 5 * 60000,
        items: [
          { productId: "demo-p3", name: "Bife da Casa Grelhado [DEMO]", price: 19.5, qty: 1 },
          { productId: "demo-p4", name: "Polvo à Lagareiro [DEMO]", price: 22.0, qty: 1 },
        ],
      },
      {
        id: "demo-o2",
        code: 1002,
        tableId: "demo-t4",
        tableNumber: 4,
        note: "",
        total: 37.5,
        status: "preparacao",
        closed: false,
        createdAt: now - 16 * 60000,
        items: [
          { productId: "demo-p6", name: "Risotto de Cogumelos [DEMO]", price: 17.0, qty: 2 },
          { productId: "demo-p8", name: "Limonada com Hortelã [DEMO]", price: 3.5, qty: 1 },
        ],
      },
    ];

    this.requests = [
      {
        id: "demo-req1",
        tableId: "demo-t1",
        tableNumber: 1,
        type: "empregado",
        createdAt: now - 2 * 60000,
        resolved: false,
      },
    ];

    this.reservations = [
      {
        id: "demo-res1",
        name: "Cliente Exemplo [DEMO]",
        phone: "912 345 678",
        email: "cliente.demo@exemplo.pt",
        date: todayISO(),
        time: "20:30",
        guests: 4,
        tableNumber: 4,
        notes: "Reserva de demonstração.",
        origin: "online",
        status: "confirmada",
        createdAt: now - 3600000,
      },
    ];
    this.persistLocalTestTables();
  }

  /** Carrega apenas o menu de exemplo, mantendo as mesas, pedidos e reservas atuais. */
  loadSampleMenu() {
    this.categories = [...sampleCategories];
    this.products = [...sampleProducts];
  }

  resetDemo() {
    this.isPopulated = false;
    this.settings = { ...cleanSettings };
    this.categories = [];
    this.products = [];
    this.tables = [];
    this.orders = [];
    this.requests = [];
    this.reservations = [];
    this.staff = [...initialStaff];
    this.satisfactionSurveys = [];
    this.persistLocalTestTables();
  }

  getAdminData(restaurantId: string): AdminData {
    return {
      restaurantId,
      slug: restaurantId,
      settings: this.settings,
      categories: this.categories,
      products: this.products,
      tables: this.tables,
      orders: this.orders,
      requests: this.requests,
      reservations: this.reservations,
    };
  }

  setOrderStatus(orderId: string, status: OrderStatus) {
    const isDelivered = status === "entregue";
    this.orders = this.orders.map((o) =>
      o.id === orderId ? { ...o, status, closed: isDelivered } : o,
    );
  }

  resolveRequest(requestId: string) {
    this.requests = this.requests.map((r) => (r.id === requestId ? { ...r, resolved: true } : r));
  }

  freeTable(tableNumber: number) {
    this.orders = this.orders.map((o) =>
      o.tableNumber === tableNumber ? { ...o, closed: true, status: "entregue" } : o,
    );
    this.requests = this.requests.map((r) =>
      r.tableNumber === tableNumber ? { ...r, resolved: true } : r,
    );
  }

  simulateCustomerOrder(tableNum?: number): Order {
    const tableNumber =
      tableNum ??
      (this.tables.length > 0
        ? this.tables[Math.floor(Math.random() * this.tables.length)].number
        : 1);
    const tableId =
      this.tables.find((t) => t.number === tableNumber)?.id ?? `demo-t-${tableNumber}`;
    const prods = this.products.length > 0 ? this.products : sampleProducts;

    const chosen = [
      prods[Math.floor(Math.random() * prods.length)],
      prods[Math.floor(Math.random() * prods.length)],
    ];

    const orderNumber = 1000 + this.orders.length + 1;
    const items = chosen.map((p) => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      qty: Math.floor(Math.random() * 2) + 1,
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const newOrder: Order = {
      id: `demo-o-${Date.now()}`,
      code: orderNumber,
      tableId,
      tableNumber,
      note: "Pedido simulado via QR Code [DEMO]",
      total,
      status: "recebido",
      closed: false,
      createdAt: Date.now(),
      items,
    };

    this.orders = [newOrder, ...this.orders];
    return newOrder;
  }

  simulateTableRequest(type: "empregado" | "conta" = "empregado", tableNum?: number): TableRequest {
    const tableNumber =
      tableNum ??
      (this.tables.length > 0
        ? this.tables[Math.floor(Math.random() * this.tables.length)].number
        : 1);
    const tableId =
      this.tables.find((t) => t.number === tableNumber)?.id ?? `demo-t-${tableNumber}`;

    const newReq: TableRequest = {
      id: `demo-req-${Date.now()}`,
      tableId,
      tableNumber,
      type,
      createdAt: Date.now(),
      resolved: false,
    };

    this.requests = [newReq, ...this.requests];
    return newReq;
  }

  private persistLocalTestTables() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LOCAL_TEST_TABLES_KEY, JSON.stringify(this.tables));
    } catch {
      // Armazenamento desativado ou sem espaco: o teste continua em memoria.
    }
  }

  saveTable(t: { id?: string; number: number; seats: number; active: boolean }): string {
    if (t.id) {
      this.tables = this.tables.map((table) =>
        table.id === t.id
          ? {
              ...table,
              number: t.number,
              seats: t.seats,
              active: t.active,
              name: `Mesa ${t.number}`,
              slug: `mesa-${t.number}`,
            }
          : table,
      );
      this.persistLocalTestTables();
      return t.id;
    } else {
      const newId = `demo-t-${Date.now()}`;
      this.tables.push({
        id: newId,
        number: t.number,
        seats: t.seats,
        active: t.active,
        name: `Mesa ${t.number}`,
        slug: `mesa-${t.number}`,
      });
      this.persistLocalTestTables();
      return newId;
    }
  }

  setTableActive(tableId: string, active: boolean) {
    this.tables = this.tables.map((t) => (t.id === tableId ? { ...t, active } : t));
    this.persistLocalTestTables();
  }

  removeTable(tableId: string) {
    this.tables = this.tables.filter((t) => t.id !== tableId);
    this.persistLocalTestTables();
  }

  saveProduct(p: {
    id?: string;
    name: string;
    description: string;
    price: number;
    categoryId: string | null;
    image: string;
    available: boolean;
    featured?: boolean;
  }): string {
    const cat = this.categories.find((c) => c.id === p.categoryId)?.name ?? "Outros";
    if (p.id) {
      this.products = this.products.map((prod) =>
        prod.id === p.id ? { ...prod, ...p, category: cat, featured: p.featured ?? false } : prod,
      );
      return p.id;
    } else {
      const newId = `demo-prod-${Date.now()}`;
      this.products.push({
        id: newId,
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: p.categoryId,
        category: cat,
        image: p.image || "demo:pao",
        available: p.available,
        featured: p.featured ?? false,
      });
      return newId;
    }
  }

  setProductAvailable(productId: string, available: boolean) {
    this.products = this.products.map((p) => (p.id === productId ? { ...p, available } : p));
  }

  removeProduct(productId: string) {
    this.products = this.products.filter((p) => p.id !== productId);
  }

  saveCategory(c: { id?: string; name: string; sortOrder?: number }): string {
    if (c.id) {
      this.categories = this.categories.map((cat) =>
        cat.id === c.id
          ? {
              ...cat,
              name: c.name,
              ...(c.sortOrder !== undefined ? { sortOrder: c.sortOrder } : {}),
            }
          : cat,
      );
      return c.id;
    } else {
      const newId = `demo-cat-${Date.now()}`;
      this.categories.push({
        id: newId,
        name: c.name,
        sortOrder: c.sortOrder ?? this.categories.length + 1,
      });
      return newId;
    }
  }

  removeCategory(categoryId: string) {
    this.categories = this.categories.filter((c) => c.id !== categoryId);
  }

  saveSettings(s: Settings) {
    this.settings = { ...s };
  }

  addReservation(r: {
    name: string;
    phone: string;
    email: string;
    date: string;
    time: string;
    guests: number;
    tableNumber?: number;
    notes: string;
    status?: ReservationStatus;
  }): string {
    const newId = `demo-res-${Date.now()}`;
    this.reservations.push({
      id: newId,
      name: r.name,
      phone: r.phone,
      email: r.email,
      date: r.date,
      time: r.time,
      guests: r.guests,
      tableNumber: r.tableNumber,
      notes: r.notes,
      origin: "telefone",
      status: r.status ?? "confirmada",
      createdAt: Date.now(),
    });
    return newId;
  }

  updateReservation(id: string, patch: Partial<Omit<Reservation, "id" | "createdAt">>) {
    this.reservations = this.reservations.map((r) =>
      r.id === id
        ? {
            ...r,
            ...(patch.name !== undefined ? { name: patch.name } : {}),
            ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
            ...(patch.email !== undefined ? { email: patch.email } : {}),
            ...(patch.date !== undefined ? { date: patch.date } : {}),
            ...(patch.time !== undefined ? { time: patch.time } : {}),
            ...(patch.guests !== undefined ? { guests: patch.guests } : {}),
            ...(patch.tableNumber !== undefined
              ? { tableNumber: patch.tableNumber ?? undefined }
              : {}),
            ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
            ...(patch.status !== undefined ? { status: patch.status } : {}),
            ...(patch.origin !== undefined ? { origin: patch.origin } : {}),
          }
        : r,
    );
  }

  setReservationStatus(reservationId: string, status: ReservationStatus) {
    this.reservations = this.reservations.map((r) =>
      r.id === reservationId ? { ...r, status } : r,
    );
  }

  removeReservation(reservationId: string) {
    this.reservations = this.reservations.filter((r) => r.id !== reservationId);
  }

  inviteStaff(s: { email: string; role: DemoStaffMember["role"] }) {
    const newId = `demo-staff-${Date.now()}`;
    this.staff.push({
      id: newId,
      user_id: newId,
      role: s.role,
      ativo: true,
      criado_em: new Date().toISOString(),
      profiles: {
        nome: s.email.split("@")[0],
        email: s.email,
        foto_url: "",
      },
    });
  }

  revokeStaff(staffId: string) {
    this.staff = this.staff.filter((s) => s.id !== staffId);
  }

  createBusiness(b: Partial<Business> & { nome: string }): Business {
    const newBiz: Business = {
      ...demoBusinessDefaults,
      id: `demo-biz-${Date.now()}`,
      nome: b.nome,
      categoria: b.categoria ?? "Geral",
      localidade: b.localidade ?? "Portugal",
      telefone: b.telefone ?? "",
      email: b.email ?? "",
      website: b.website ?? null,
      website_dominio: null,
      google_maps: "",
      responsavel_nome: b.responsavel_nome ?? "",
      estado: b.estado ?? "por_contactar",
      prioridade: b.prioridade ?? "media",
      valor_estimado: b.valor_estimado ?? 0,
      notas: b.notas ?? "",
      origem: "manual",
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.businesses.unshift(newBiz);
    return newBiz;
  }

  updateBusiness(id: string, patch: Partial<Business>): Business {
    this.businesses = this.businesses.map((b) =>
      b.id === id ? { ...b, ...patch, updated_at: new Date().toISOString() } : b,
    );
    return this.businesses.find((b) => b.id === id)!;
  }

  deleteBusiness(id: string) {
    this.businesses = this.businesses.filter((b) => b.id !== id);
  }

  getSatisfactionSurveys(businessId?: string): SatisfactionSurvey[] {
    const list = businessId
      ? this.satisfactionSurveys.filter((s) => s.business_id === businessId)
      : this.satisfactionSurveys;
    return list.map((s) => {
      const biz = this.businesses.find((b) => b.id === s.business_id);
      return {
        ...s,
        business: biz
          ? { id: biz.id, nome: biz.nome, categoria: biz.categoria, localidade: biz.localidade }
          : null,
      };
    });
  }

  createSatisfactionSurvey(data: {
    businessId: string;
    clientDisplayName: string;
    projectName: string;
  }): SatisfactionSurvey {
    const biz = this.businesses.find((b) => b.id === data.businessId);
    const tokenBytes = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    const now = new Date().toISOString();
    const newSurvey: SatisfactionSurvey = {
      id: `demo-survey-${Date.now()}`,
      business_id: data.businessId,
      token: tokenBytes,
      client_display_name: data.clientDisplayName || biz?.nome || "Cliente",
      project_name: data.projectName || "Projeto Nova Web Studio",
      active: true,
      responded_at: null,
      recommendation_score: null,
      service_score: null,
      result_score: null,
      communication_score: null,
      deadlines_score: null,
      ease_score: null,
      liked_text: null,
      improvement_text: null,
      testimonial: null,
      testimonial_authorized: false,
      portfolio_authorized: false,
      created_by: "demo-admin-id",
      created_at: now,
      updated_at: now,
      business: biz
        ? { id: biz.id, nome: biz.nome, categoria: biz.categoria, localidade: biz.localidade }
        : null,
    };
    this.satisfactionSurveys.unshift(newSurvey);
    return newSurvey;
  }

  toggleSatisfactionSurvey(id: string, active: boolean): SatisfactionSurvey {
    const target = this.satisfactionSurveys.find((survey) => survey.id === id);
    if (!target) throw new Error("Inquérito não encontrado.");
    if (target.responded_at) {
      throw new Error("Um inquérito respondido fica preservado no histórico.");
    }
    this.satisfactionSurveys = this.satisfactionSurveys.map((survey) =>
      survey.id === id
        ? { ...survey, active, updated_at: new Date().toISOString() }
        : survey,
    );
    return this.satisfactionSurveys.find((survey) => survey.id === id)!;
  }

  getPublicSurvey(token: string): PublicSurveyView | null {
    const survey = this.satisfactionSurveys.find((item) => item.token === token);
    if (!survey) return null;
    return {
      client_display_name: survey.client_display_name,
      project_name: survey.project_name,
      active: survey.active,
      responded: survey.responded_at !== null,
    };
  }

  submitPublicSurvey(
    data: SubmitSurveyPayload,
  ): { ok: boolean } {
    const survey = this.satisfactionSurveys.find((item) => item.token === data.token);
    if (!survey || !survey.active || survey.responded_at) {
      throw new Error(
        "Este inquérito já foi respondido, foi desativado ou a ligação deixou de ser válida.",
      );
    }

    survey.responded_at = new Date().toISOString();
    survey.recommendation_score = data.recommendation_score;
    survey.service_score = data.service_score;
    survey.result_score = data.result_score;
    survey.communication_score = data.communication_score;
    survey.deadlines_score = data.deadlines_score;
    survey.ease_score = data.ease_score;
    survey.liked_text = data.liked_text?.trim() || null;
    survey.improvement_text = data.improvement_text?.trim() || null;
    survey.testimonial = data.testimonial?.trim() || null;
    survey.testimonial_authorized =
      Boolean(data.testimonial_authorized) && Boolean(survey.testimonial);
    survey.portfolio_authorized = Boolean(data.portfolio_authorized);
    survey.updated_at = new Date().toISOString();

    return { ok: true };
  }

}

export const demoStore = new DemoStore();

/** Fictício e LOCAL: apenas outros separadores do mesmo navegador partilham estes dados. */
export const LOCAL_RESTAURANT_STORAGE_KEY = "nws-workspace:restaurante-teste:v1";
let localRestaurantHydrated = false;

export function hydrateLocalRestaurantDemo() {
  if (localRestaurantHydrated || typeof window === "undefined") return;
  localRestaurantHydrated = true;
  try {
    const text = localStorage.getItem(LOCAL_RESTAURANT_STORAGE_KEY);
    if (!text) return;
    const state: unknown = JSON.parse(text);
    if (!state || typeof state !== "object") return;
    const d = state as Record<string, unknown>;
    if (
      d.version !== 1 ||
      !d.settings ||
      !Array.isArray(d.categories) ||
      !Array.isArray(d.products) ||
      !Array.isArray(d.tables) ||
      !Array.isArray(d.orders) ||
      !Array.isArray(d.requests) ||
      !Array.isArray(d.reservations)
    )
      return;
    demoStore.settings = d.settings as Settings;
    demoStore.categories = d.categories as Category[];
    demoStore.products = d.products as Product[];
    demoStore.tables = d.tables as Table[];
    demoStore.orders = d.orders as Order[];
    demoStore.requests = d.requests as TableRequest[];
    demoStore.reservations = d.reservations as Reservation[];
  } catch (error) {
    console.warn("[NWS] O estado local de testes não pôde ser carregado:", error);
  }
}

export function reloadLocalRestaurantDemo() {
  localRestaurantHydrated = false;
  hydrateLocalRestaurantDemo();
}

export function persistLocalRestaurantDemo() {
  if (typeof window === "undefined") return;
  const state = {
    version: 1,
    settings: demoStore.settings,
    categories: demoStore.categories,
    products: demoStore.products,
    tables: demoStore.tables,
    orders: demoStore.orders,
    requests: demoStore.requests,
    reservations: demoStore.reservations,
  };
  try {
    localStorage.setItem(LOCAL_RESTAURANT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    throw new Error(
      "Armazenamento deste browser cheio. Reduz as fotografias do menu ou remove dados de testes antes de continuar.",
    );
  }
  window.dispatchEvent(new Event("nws:local-rest-changed"));
}
