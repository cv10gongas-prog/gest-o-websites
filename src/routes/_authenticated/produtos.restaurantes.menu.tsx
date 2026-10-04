import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Check,
  FolderPlus,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  PanelHeader,
  RestaurantCard,
  fieldClass,
} from "@/components/restaurant/RestaurantBits";
import { resolveImage, type Category, type Product } from "@/lib/restaurant/demo-data";
import { adminActions, formatPrice, uploadImage, useAdmin } from "@/lib/restaurant/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/produtos/restaurantes/menu")({
  component: RestaurantMenuAdmin,
});

function RestaurantMenuAdmin() {
  const {
    data: { products, categories },
    restaurantId,
  } = useAdmin();

  const [pesquisa, setPesquisa] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("todas");
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);

  const unavailableCount = useMemo(() => products.filter((p) => !p.available).length, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCat !== "todas" && p.categoryId !== selectedCat) {
        return false;
      }
      if (pesquisa.trim()) {
        const q = pesquisa.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [products, selectedCat, pesquisa]);

  const uncategorized = filteredProducts.filter(
    (p) => !p.categoryId || !categories.some((c) => c.id === p.categoryId),
  );

  async function saveCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name")).trim().slice(0, 40);
    if (!name) return;

    try {
      await adminActions.saveCategory(restaurantId, {
        id: editingCat?.id,
        name,
        sortOrder: categories.length + 1,
      });
      toast.success(editingCat?.id ? "Categoria atualizada." : "Categoria criada.");
      setEditingCat(null);
    } catch (err) {
      toast.error(`Não foi possível guardar a categoria: ${(err as Error).message}`);
    }
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* CABEÇALHO */}
      <PanelHeader
        title="Menu & Ementa Digital"
        subtitle="Organiza categorias, pratos, bebidas, preços e disponibilidade do restaurante de testes, sem afetar clientes reais."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setEditingCat({})}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface-strong px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface transition"
            >
              <FolderPlus className="size-4 text-primary" />
              <span>Nova Categoria</span>
            </button>

            <button
              type="button"
              disabled={!categories.length}
              onClick={() =>
                setEditingProduct({
                  categoryId: categories[0]?.id ?? null,
                  available: true,
                  featured: false,
                  image: "",
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="size-4" />
              <span>Novo Prato / Produto</span>
            </button>
          </div>
        }
      />

      {/* BARRA DE FILTROS, PESQUISA E CONTAGEM DE ESGOTADOS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface/50 p-3 rounded-2xl border border-border/70 backdrop-blur-md">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar prato ou ingrediente..."
            className="w-full h-9 rounded-xl border border-border/80 bg-surface pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Categoria */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="h-9 rounded-xl border border-border/80 bg-surface px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="todas">Todas as Categorias ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({products.filter((p) => p.categoryId === c.id).length})
              </option>
            ))}
          </select>

          {unavailableCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-danger/15 border border-danger/30 px-3 py-1 text-xs font-bold text-danger">
              <AlertCircle className="size-3.5" />
              <span>{unavailableCount} esgotados</span>
            </span>
          )}
        </div>
      </div>

      {categories.length === 0 && (
        <RestaurantCard className="p-12 text-center text-muted-foreground space-y-3">
          <UtensilsCrossed className="size-10 mx-auto opacity-40" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              A ementa ainda não tem categorias criadas.
            </p>
            <p className="text-xs mt-1">
              Comece por criar a primeira categoria (ex.: Entradas, Carnes, Peixes, Sobremesas) para
              adicionar pratos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingCat({})}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            <FolderPlus className="size-4" />
            <span>Adicionar Primeira Categoria</span>
          </button>
        </RestaurantCard>
      )}

      {/* SEÇÕES DE CATEGORIAS E PRATOS */}
      {[
        ...categories
          .filter((c) => selectedCat === "todas" || c.id === selectedCat)
          .map((c) => ({
            c,
            list: filteredProducts.filter((p) => p.categoryId === c.id),
          })),
        ...(uncategorized.length && selectedCat === "todas"
          ? [
              {
                c: {
                  id: "",
                  name: "Sem Categoria Definida",
                  sortOrder: 999,
                } as Category,
                list: uncategorized,
              },
            ]
          : []),
      ].map(({ c, list }) => (
        <section key={c.id || "uncategorized"} className="space-y-3">
          {/* Cabeçalho da Categoria */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {c.name}
              </h2>
              <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground">
                {list.length} {list.length === 1 ? "item" : "itens"}
              </span>
            </div>

            {c.id && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingCat(c)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
                  title={`Editar Categoria ${c.name}`}
                >
                  <Pencil className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `Apagar a categoria "${c.name}"? Os produtos ficarão sem categoria mas não serão apagados.`,
                      )
                    ) {
                      adminActions
                        .removeCategory(c.id, restaurantId)
                        .then(() => toast.success("Categoria removida."))
                        .catch((e: Error) => toast.error(e.message));
                    }
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger transition"
                  title={`Apagar Categoria ${c.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Grelha de Produtos da Categoria */}
          <RestaurantCard className="divide-y divide-border/40 overflow-hidden">
            {list.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground">
                Sem produtos correspondentes nesta categoria.
              </p>
            ) : (
              list.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 p-3.5 transition hover:bg-surface-strong/40"
                >
                  {/* Imagem e Dados do Produto */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {p.image ? (
                      <img
                        src={resolveImage(p.image)}
                        alt={p.name}
                        className="size-14 rounded-xl object-cover shrink-0 border border-border/60 shadow-sm"
                      />
                    ) : (
                      <span className="grid size-14 place-items-center rounded-xl bg-surface-strong text-muted-foreground shrink-0 border border-border/40">
                        <UtensilsCrossed className="size-5" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground truncate">{p.name}</p>
                        {p.featured && (
                          <span className="rounded bg-primary/15 px-1.5 py-0.2 text-[9px] font-bold text-primary uppercase">
                            Destaque
                          </span>
                        )}
                      </div>

                      {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {p.description}
                        </p>
                      )}

                      <p className="text-xs font-mono font-bold text-foreground mt-1">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>

                  {/* Interruptor de Disponibilidade e Ações */}
                  <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                      <span
                        className={cn(
                          "text-[11px] font-bold uppercase",
                          p.available ? "text-success" : "text-danger",
                        )}
                      >
                        {p.available ? "Disponível" : "Esgotado"}
                      </span>
                      <Switch
                        checked={p.available}
                        onCheckedChange={(v) =>
                          adminActions
                            .setAvailable(p.id, v, restaurantId)
                            .then(() =>
                              toast.success(
                                `${p.name} marcado como ${v ? "Disponível" : "Esgotado"}.`,
                              ),
                            )
                            .catch((e: Error) => toast.error(e.message))
                        }
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setEditingProduct(p)}
                      className="rounded-xl border border-border/70 bg-surface-strong p-2 text-muted-foreground hover:text-foreground transition"
                      title={`Editar ${p.name}`}
                    >
                      <Pencil className="size-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Eliminar "${p.name}" da ementa?`)) {
                          adminActions
                            .removeProduct(p.id, restaurantId)
                            .then(() => toast.success("Produto eliminado."))
                            .catch((e: Error) => toast.error(e.message));
                        }
                      }}
                      className="rounded-xl border border-border/70 bg-surface-strong p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger transition"
                      title={`Eliminar ${p.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </RestaurantCard>
        </section>
      ))}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE PRODUTO */}
      <Dialog open={!!editingProduct} onOpenChange={(o) => !o && setEditingProduct(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-surface border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.id ? "Editar Prato / Produto" : "Novo Prato / Produto"}
            </DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <ProductForm
              product={editingProduct}
              categories={categories}
              restaurantId={restaurantId}
              onDone={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL DE CATEGORIA */}
      <Dialog open={!!editingCat} onOpenChange={(o) => !o && setEditingCat(null)}>
        <DialogContent className="max-w-sm bg-surface border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle>{editingCat?.id ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>

          {editingCat && (
            <form onSubmit={saveCategory} className="space-y-4 pt-2">
              <Field label="Nome da Categoria">
                <input
                  name="name"
                  required
                  maxLength={40}
                  defaultValue={editingCat.name}
                  placeholder="Ex.: Carnes Grelhadas"
                  className={fieldClass}
                />
              </Field>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="rounded-xl border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  Guardar Categoria
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  restaurantId,
  onDone,
}: {
  product: Partial<Product>;
  categories: Category[];
  restaurantId: string;
  onDone: () => void;
}) {
  const [image, setImage] = useState(product.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState(product.available ?? true);
  const [featured, setFeatured] = useState(product.featured ?? false);

  async function pickFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadImage(restaurantId, file, 900);
      setImage(url);
      toast.success("Fotografia carregada com sucesso.");
    } catch (e) {
      toast.error(`Erro ao carregar imagem: ${(e as Error).message}`);
    }
    setUploading(false);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const priceStr = String(f.get("price")).replace(",", ".");
    const price = Number(priceStr);

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Preço inválido.");
      return;
    }

    setSaving(true);
    try {
      await adminActions.saveProduct(restaurantId, {
        id: product.id,
        name: String(f.get("name")).trim().slice(0, 80),
        description: String(f.get("description")).trim().slice(0, 240),
        price: Math.round(price * 100) / 100,
        categoryId: String(f.get("category")) || null,
        image,
        available,
        featured,
      });
      toast.success(product.id ? "Produto atualizado com sucesso." : "Produto criado com sucesso.");
      onDone();
    } catch (err) {
      toast.error(`Erro ao guardar produto: ${(err as Error).message}`);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4 pt-2">
      {/* Upload de Imagem com Preview */}
      <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-surface-strong/50 p-3">
        {image ? (
          <img
            src={resolveImage(image)}
            alt=""
            className="size-20 rounded-xl object-cover border border-border/80"
          />
        ) : (
          <span className="grid size-20 place-items-center rounded-xl bg-surface border border-dashed border-border/80 text-muted-foreground">
            <UtensilsCrossed className="size-6" />
          </span>
        )}

        <div className="space-y-1.5">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-strong transition">
            <ImagePlus className="size-4 text-primary" />
            <span>{uploading ? "A carregar..." : "Carregar Fotografia"}</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) pickFile(file);
              }}
            />
          </label>
          {image && (
            <button
              type="button"
              onClick={() => setImage("")}
              className="block text-[11px] text-danger hover:underline font-medium"
            >
              Remover fotografia
            </button>
          )}
        </div>
      </div>

      <Field label="Nome do Prato / Bebida">
        <input
          name="name"
          required
          maxLength={80}
          defaultValue={product.name}
          placeholder="Ex.: Bacalhau com Broa no Forno"
          className={fieldClass}
        />
      </Field>

      <Field label="Descrição dos Ingredientes">
        <textarea
          name="description"
          rows={2}
          maxLength={240}
          defaultValue={product.description}
          placeholder="Ex.: Lombo de bacalhau fresco com crosta de broa de milho, batata a murro e grelos."
          className={`${fieldClass} h-auto py-2`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço (€)">
          <input
            name="price"
            inputMode="decimal"
            required
            defaultValue={product.price?.toFixed(2).replace(".", ",")}
            placeholder="0,00"
            className={fieldClass}
          />
        </Field>

        <Field label="Categoria">
          <select name="category" defaultValue={product.categoryId ?? ""} className={fieldClass}>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-surface">
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="space-y-2 pt-1">
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <Switch checked={available} onCheckedChange={setAvailable} />
          <span>Disponível para Pedidos</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <Switch checked={featured} onCheckedChange={setFeatured} />
          <span>Destacar na Ementa Principal / Home</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "A guardar..." : "Guardar Produto"}
        </button>
      </div>
    </form>
  );
}
