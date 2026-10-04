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

export function isDemoMode(): boolean {
  // Preview opt-in ONLY. Neither localhost nor a query string can grant admin access.
  const requested = import.meta.env["VITE_DEMO_MODE"] === "true";
  const preview = import.meta.env["VITE_DEPLOYMENT_ENV"] === "preview";
  if (typeof window === "undefined") {
    // A Vercel Production deployment is never allowed to bypass real auth.
    if (process.env["VERCEL_ENV"] === "production") return false;
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

// ============================================================================
// STORE EM MEMÓRIA (INICIALIZA VAZIO POR OMISSÃO PARA FIDELIDADE AOS DADOS REAIS)
// ============================================================================

class DemoStore {
  isPopulated = false;
  settings: Settings = { ...cleanSettings };
  categories: Category[] = [];
  products: Product[] = [];
  tables: Table[] = [];
  orders: Order[] = [];
  requests: TableRequest[] = [];
  reservations: Reservation[] = [];
  staff: DemoStaffMember[] = [...initialStaff];
  businesses: Business[] = [...sampleBusinesses];
  tasks: Task[] = [...sampleTasks];
  websiteRequests: WebsiteRequest[] = [...sampleWebsiteRequests];

  loadSampleData() {
    const now = Date.now();
    this.isPopulated = true;
    this.settings = { ...sampleSettings };
    this.categories = [...sampleCategories];
    this.products = [...sampleProducts];
    this.tables = [...sampleTables];
    this.staff = [...sampleStaff];

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

  saveTable(t: { id?: string; number: number; seats: number; active: boolean }) {
    if (t.id) {
      this.tables = this.tables.map((table) =>
        table.id === t.id
          ? {
              ...table,
              number: t.number,
              seats: t.seats,
              active: t.active,
              name: `Mesa ${t.number}`,
            }
          : table,
      );
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
    }
  }

  setTableActive(tableId: string, active: boolean) {
    this.tables = this.tables.map((t) => (t.id === tableId ? { ...t, active } : t));
  }

  removeTable(tableId: string) {
    this.tables = this.tables.filter((t) => t.id !== tableId);
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
  }) {
    const cat = this.categories.find((c) => c.id === p.categoryId)?.name ?? "Outros";
    if (p.id) {
      this.products = this.products.map((prod) =>
        prod.id === p.id ? { ...prod, ...p, category: cat, featured: p.featured ?? false } : prod,
      );
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
    }
  }

  setProductAvailable(productId: string, available: boolean) {
    this.products = this.products.map((p) => (p.id === productId ? { ...p, available } : p));
  }

  removeProduct(productId: string) {
    this.products = this.products.filter((p) => p.id !== productId);
  }

  saveCategory(c: { id?: string; name: string; sortOrder?: number }) {
    if (c.id) {
      this.categories = this.categories.map((cat) =>
        cat.id === c.id ? { ...cat, name: c.name } : cat,
      );
    } else {
      const newId = `demo-cat-${Date.now()}`;
      this.categories.push({
        id: newId,
        name: c.name,
        sortOrder: c.sortOrder ?? this.categories.length + 1,
      });
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
  }) {
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
}

export const demoStore = new DemoStore();
