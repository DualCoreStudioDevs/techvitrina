// src/pages/Dashboard.jsx
import { useState, useRef } from "react";
import {
  Plus, Pencil, Trash2, Upload, X, Check,
  Package, Tag, DollarSign, Layers, ToggleLeft,
  LogOut, ShoppingBag, AlertCircle, ImageIcon,
  ShoppingCart, BarChart2,
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useVentas }   from "../hooks/useVentas";
import { useAuth }     from "../hooks/useAuth";
import SaleModal       from "../components/SaleModal";
import Receipt         from "../components/Receipt";
import SalesDashboard  from "../components/SalesDashboard";

// ── Constants ─────────────────────────────────────────────────────────────
const CATEGORIES = ["Móviles", "Accesorios", "Piezas"];
const BRANDS     = ["Apple", "Samsung", "Xiaomi", "Huawei", "OnePlus", "Motorola", "Otro"];
const EMPTY_FORM = {
  name: "", brand: "", category: "Móviles",
  price: "", stock: "", condition: "Nuevo", description: "",
};

// ── Sub-components ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-zinc-400 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-white text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ImageDropzone({ preview, onChange, onClear }) {
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);
  const handleFile = (file) => { if (file?.type.startsWith("image/")) onChange(file); };
  return (
    <div
      onClick={() => fileRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      className={`relative border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all
        ${dragging ? "border-violet-500 bg-violet-500/10" : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"}`}
    >
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFile(e.target.files[0])} />
      {preview ? (
        <>
          <img src={preview} alt="preview" className="h-full w-full object-cover rounded-xl opacity-80" />
          <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-2 right-2 bg-zinc-900 border border-zinc-700 rounded-full p-1 hover:bg-red-900/60 transition-colors">
            <X size={14} className="text-zinc-300" />
          </button>
        </>
      ) : (
        <>
          <ImageIcon size={28} className="text-zinc-600 mb-2" />
          <p className="text-zinc-500 text-sm">Arrastra una imagen o haz clic</p>
          <p className="text-zinc-700 text-xs mt-1">PNG, JPG, WEBP</p>
        </>
      )}
    </div>
  );
}

function FormField({ label, icon: Icon, children, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon size={12} />} {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function Dashboard() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { registrarVenta } = useVentas();
  const { logout, user }   = useAuth();

  // Tabs
  const [activeTab, setActiveTab] = useState("inventario"); // "inventario" | "ventas"

  // Product form state
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState("");
  const [editingId,     setEditingId]     = useState(null);
  const [uploadProgress,setUploadProgress]= useState(0);
  const [saving,        setSaving]        = useState(false);
  const [errors,        setErrors]        = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [filterCat,     setFilterCat]     = useState("Todos");

  // Sale state
  const [saleProduct,   setSaleProduct]   = useState(null);
  const [savingSale,    setSavingSale]    = useState(false);
  const [ventaRecibo,   setVentaRecibo]   = useState(null);

  // Stats
  const totalProducts = products.length;
  const inStock       = products.filter((p) => Number(p.stock) > 0).length;
  const totalValue    = products.reduce((s, p) => s + Number(p.price) * Number(p.stock || 0), 0);

  // Validation
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Requerido";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Precio inválido";
    if (form.stock === "" || isNaN(form.stock) || Number(form.stock) < 0) e.stock = "Stock inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageSelect = (file) => { setImageFile(file); setImagePreview(URL.createObjectURL(file)); };
  const handleImageClear  = ()     => { setImageFile(null); setImagePreview(""); };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name || "", brand: product.brand || "", category: product.category || "Móviles",
      price: product.price || "", stock: product.stock || "", condition: product.condition || "Nuevo",
      description: product.description || "" });
    setImagePreview(product.imageUrl || "");
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null); setForm(EMPTY_FORM); handleImageClear(); setErrors({});
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setUploadProgress(0);
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editingId) {
        await updateProduct(editingId, data, imageFile, setUploadProgress);
        showSuccess("Producto actualizado.");
        setEditingId(null);
      } else {
        await addProduct(data, imageFile, setUploadProgress);
        showSuccess("Producto añadido.");
      }
      setForm(EMPTY_FORM); handleImageClear(); setErrors({});
    } catch (err) { console.error(err); }
    finally { setSaving(false); setUploadProgress(0); }
  };

  const handleDelete = async (id, imagePath) => {
    await deleteProduct(id, imagePath);
    setDeleteConfirm(null);
    showSuccess("Producto eliminado.");
  };

  // ── Sale handlers ────────────────────────────────────────────────────────
  const handleSaleConfirm = async ({ cantidad, nota }) => {
    setSavingSale(true);
    try {
      const ventaId = await registrarVenta({ producto: saleProduct, cantidad, nota });
      const ventaData = {
        id:             ventaId,
        productoNombre: saleProduct.name,
        productoPrecio: Number(saleProduct.price),
        marca:          saleProduct.brand,
        categoria:      saleProduct.category,
        cantidad,
        precioTotal:    Number(saleProduct.price) * cantidad,
        nota,
        fecha:          { toDate: () => new Date() },
      };
      setSaleProduct(null);
      setVentaRecibo(ventaData);
      showSuccess("¡Venta registrada exitosamente!");
    } catch (err) {
      console.error("Error registrando venta:", err);
    } finally {
      setSavingSale(false);
    }
  };

  const filteredProducts = filterCat === "Todos"
    ? products
    : products.filter((p) => p.category === filterCat);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Topbar */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 p-2 rounded-lg">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white leading-none">TechVitrina</h1>
              <p className="text-zinc-500 text-xs">Panel de administración</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-zinc-400 text-sm">{user?.email}</span>
            <button onClick={logout}
              className="flex items-center gap-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg text-sm transition-all">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 pb-0">
          {[
            { id: "inventario", label: "Inventario",    icon: Package },
            { id: "ventas",     label: "Ventas",        icon: BarChart2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-all
                ${activeTab === id
                  ? "border-violet-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Toast */}
        {successMsg && (
          <div className="fixed bottom-6 right-6 bg-emerald-900/90 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 shadow-xl z-50 animate-fade-in">
            <Check size={16} /> {successMsg}
          </div>
        )}

        {/* ══ TAB: INVENTARIO ══════════════════════════════════════════════ */}
        {activeTab === "inventario" && (
          <>
            {/* Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={Package}    label="Total productos"       value={totalProducts}                                     color="bg-violet-600" />
              <StatCard icon={Layers}     label="En stock"              value={inStock}                                           color="bg-emerald-700" />
              <StatCard icon={DollarSign} label="Valor total inventario" value={`$${totalValue.toLocaleString("es-DO")}`}          color="bg-amber-700" />
            </section>

            {/* Form */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  {editingId
                    ? <><Pencil size={16} className="text-violet-400" /> Editar producto</>
                    : <><Plus   size={16} className="text-violet-400" /> Nuevo producto</>}
                </h2>
                {editingId && (
                  <button onClick={handleCancel} className="text-zinc-400 hover:text-white text-sm flex items-center gap-1">
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left */}
                <div className="space-y-5">
                  <FormField label="Nombre del producto" icon={Tag} error={errors.name}>
                    <input type="text" placeholder="Ej: iPhone 15 Pro 256GB" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors w-full placeholder:text-zinc-600" />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Marca" icon={Tag}>
                      <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        className="bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors w-full">
                        <option value="">Seleccionar</option>
                        {BRANDS.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Categoría" icon={Layers}>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors w-full">
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Precio (RD$)" icon={DollarSign} error={errors.price}>
                      <input type="number" min="0" step="0.01" placeholder="0.00" value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors w-full" />
                    </FormField>
                    <FormField label="Stock" icon={Package} error={errors.stock}>
                      <input type="number" min="0" placeholder="0" value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        className="bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors w-full" />
                    </FormField>
                  </div>

                  <FormField label="Estado" icon={ToggleLeft}>
                    <div className="flex gap-3">
                      {["Nuevo", "Usado"].map((c) => (
                        <button key={c} type="button" onClick={() => setForm({ ...form, condition: c })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                            ${form.condition === c ? "bg-violet-600 border-violet-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Descripción (opcional)">
                    <textarea rows={3} placeholder="Características, accesorios incluidos…" value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors w-full resize-none placeholder:text-zinc-600" />
                  </FormField>
                </div>

                {/* Right */}
                <div className="space-y-5">
                  <FormField label="Imagen del producto" icon={ImageIcon}>
                    <ImageDropzone preview={imagePreview} onChange={handleImageSelect} onClear={handleImageClear} />
                  </FormField>

                  {saving && uploadProgress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>Subiendo…</span><span>{uploadProgress}%</span>
                      </div>
                      <div className="bg-zinc-800 rounded-full h-1.5">
                        <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {(form.name || imagePreview) && (
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Vista previa</p>
                      <div className="flex gap-3 items-start">
                        {imagePreview && <img src={imagePreview} alt="" className="w-14 h-14 object-cover rounded-lg" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{form.name || "—"}</p>
                          <p className="text-zinc-400 text-xs">{form.brand} · {form.category}</p>
                          {form.price && <p className="text-violet-400 text-sm font-semibold mt-1">RD$ {Number(form.price).toLocaleString("es-DO")}</p>}
                          <div className="flex gap-2 mt-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${form.condition === "Nuevo" ? "bg-emerald-900/60 text-emerald-400" : "bg-amber-900/60 text-amber-400"}`}>{form.condition}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${Number(form.stock) > 0 ? "bg-blue-900/60 text-blue-400" : "bg-red-900/60 text-red-400"}`}>{Number(form.stock) > 0 ? `${form.stock} en stock` : "Sin stock"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={saving}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    {saving
                      ? <><Upload size={16} className="animate-bounce" /> Guardando…</>
                      : editingId
                        ? <><Check size={16} /> Actualizar producto</>
                        : <><Plus  size={16} /> Agregar producto</>}
                  </button>
                </div>
              </form>
            </section>

            {/* Products table */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="font-semibold text-white">
                  Inventario
                  <span className="ml-2 text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
                  </span>
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {["Todos", ...CATEGORIES].map((cat) => (
                    <button key={cat} onClick={() => setFilterCat(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all
                        ${filterCat === cat ? "bg-violet-600 border-violet-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-zinc-500 text-sm">Cargando inventario…</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <Package size={36} className="text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">No hay productos en esta categoría.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                        <th className="text-left px-6 py-3 font-medium">Producto</th>
                        <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Categoría</th>
                        <th className="text-right px-4 py-3 font-medium">Precio</th>
                        <th className="text-center px-4 py-3 font-medium">Stock</th>
                        <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Estado</th>
                        <th className="text-center px-4 py-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              {p.imageUrl
                                ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-zinc-800 flex-shrink-0" />
                                : <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0"><Package size={16} className="text-zinc-600" /></div>
                              }
                              <div className="min-w-0">
                                <p className="text-white font-medium truncate max-w-[180px]">{p.name}</p>
                                <p className="text-zinc-500 text-xs">{p.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">{p.category}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-violet-400 font-semibold whitespace-nowrap">
                            RD$ {Number(p.price).toLocaleString("es-DO")}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${Number(p.stock) > 0 ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center hidden md:table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${p.condition === "Nuevo" ? "bg-blue-900/50 text-blue-400" : "bg-amber-900/50 text-amber-400"}`}>
                              {p.condition}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {/* Registrar venta */}
                              <button
                                onClick={() => setSaleProduct(p)}
                                disabled={Number(p.stock) <= 0}
                                className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-900/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all"
                                title="Registrar venta"
                              >
                                <ShoppingCart size={14} />
                              </button>
                              {/* Editar */}
                              <button onClick={() => handleEdit(p)}
                                className="p-1.5 text-zinc-400 hover:text-violet-400 hover:bg-violet-900/30 rounded-lg transition-all" title="Editar">
                                <Pencil size={14} />
                              </button>
                              {/* Eliminar */}
                              {deleteConfirm === p.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDelete(p.id, p.imagePath)}
                                    className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-all" title="Confirmar">
                                    <Check size={14} />
                                  </button>
                                  <button onClick={() => setDeleteConfirm(null)}
                                    className="p-1.5 text-zinc-400 hover:bg-zinc-800 rounded-lg transition-all" title="Cancelar">
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(p.id)}
                                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all" title="Eliminar">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* ══ TAB: VENTAS ══════════════════════════════════════════════════ */}
        {activeTab === "ventas" && <SalesDashboard />}
      </main>

      {/* Sale modal */}
      {saleProduct && (
        <SaleModal
          product={saleProduct}
          onConfirm={handleSaleConfirm}
          onClose={() => setSaleProduct(null)}
          saving={savingSale}
        />
      )}

      {/* Receipt modal */}
      {ventaRecibo && (
        <Receipt venta={ventaRecibo} onClose={() => setVentaRecibo(null)} />
      )}
    </div>
  );
}
