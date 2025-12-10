// =========================
// AdminDashboard.tsx FINAL
// =========================

import { useEffect, useState } from "react";

//Types
import type { BannerWeek } from "../../types/banner";

// Servicios
import {
  getProducts,
  type AdminProduct,
  getCategories,
  type AdminCategory,
  getPluses,
  type AdminPlus,
  createProduct,
} from "../../services/admin";

import { getBanner } from "../../services/banner_services";

// Secciones (tú ya las tienes creadas)
import { ProductsSection } from "./sections/ProductsSection";
import { CategoriesSection } from "./sections/CategoriesSection"; // Usado dentro del modal
import { PlusesSection } from "./sections/PlusesSection"; // Usado dentro del modal
import { BannerSection } from "./sections/BannerSection";
import { ProductCreateModal } from "./componentes/admin/products/ProductCreateModal.tsx"; // Importación correcta

// =======================
// INTERFACE Y COMPONENTE MODAL GENÉRICO
// Lo definimos aquí para usarlo en Categorías y Pluses.
// =======================
interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}

const GenericModalWrapper = ({ children, onClose, title }: ModalProps) => {
  // NOTA: Asegúrate de que estos estilos coincidan con los de tu aplicación (Tailwind CSS)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-[#0f1113] p-6 rounded-xl border border-stone-800 space-y-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-stone-700">
            <h3 className="text-xl font-semibold text-zinc-100">{title}</h3>
            <button className="text-zinc-400 hover:text-zinc-100" onClick={onClose}>
                &times; {/* Icono de cerrar */}
            </button>
        </div>
        <div>
            {children}
        </div>
      </div>
    </div>
  );
};


export default function AdminDashboard() {
  // =======================
  // ESTADO: Productos
  // =======================
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // =======================
  // ESTADO: Categorías
  // =======================
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // =======================
  // ESTADO: Pluses
  // =======================
  const [pluses, setPluses] = useState<AdminPlus[]>([]);
  const [plusesLoading, setPlusesLoading] = useState(true);

  // =======================
  // ESTADO: Banner
  // =======================
  const [bannerData, setBannerData] = useState<BannerWeek | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // =======================
  // ESTADO: Búsqueda y Modales de Gestión (AÑADIDO)
  // =======================
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showPlusesModal, setShowPlusesModal] = useState(false);
  
  // =======================
  // LOAD DATA
  // =======================
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setProductsLoading(false);
      }
    }

    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    }

    async function loadPluses() {
      try {
        const data = await getPluses();
        setPluses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setPlusesLoading(false);
      }
    }

    async function loadBanner() {
      try {
        const data = await getBanner();
        setBannerData(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadProducts();
    loadCategories();
    loadPluses();
    loadBanner();
  }, []);
  


  // =======================
  // FILTRADO DE PRODUCTOS (Usa searchTerm)
  // =======================

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


  // =======================
  // RENDER
  // =======================
return (
    <div className="px-4 py-6">

      {/* HEADER: Nuevo diseño con título, búsqueda y botones */}
      <div className="mb-8 flex items-center justify-between gap-4">
        
        {/* Título (Panel de administración) */}
        <h1 className="text-2xl font-bold text-zinc-100 flex-shrink-0">
          Panel de administración
        </h1>

        {/* Campo de Búsqueda */}
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full max-w-lg rounded-lg border-none bg-[#1e1e1e] p-3 text-zinc-200 placeholder:text-zinc-500 focus:ring-purple-600 focus:ring-2"
        />

        {/* Contenedor de Botones */}
        <div className="flex gap-2 flex-wrap flex-shrink-0">
          
          {/* Botón Banner */}
          <button
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 transition"
            onClick={() => setShowBanner(true)}
          >
            Banner
          </button>

          {/* Botón Categorías (ABRE MODAL DE GESTIÓN) */}
          <button
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition"
            onClick={() => setShowCategoriesModal(true)}
          >
            Categorías
          </button>
          
          {/* Botón Pluses (ABRE MODAL DE GESTIÓN) */}
          <button
            className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-600 transition"
            onClick={() => setShowPlusesModal(true)}
          >
            Pluses
          </button>

          {/* Botón Agregar producto (ABRE MODAL DE CREACIÓN) */}
          <button
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
            onClick={() => setShowAddProductModal(true)}
          >
            + Agregar producto
          </button>

          {/* Botón Cerrar sesión */}
          <button
            className="rounded-lg bg-[#2a2a28] border border-stone-700 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-[#323230] transition"
            onClick={() => {
              localStorage.removeItem("admin_token");
              location.href = "/";
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ======================= */}
      {/* SECCIÓN PRODUCTOS (Se queda en la vista principal) */}
      {/* ======================= */}
      <ProductsSection
        items={filteredProducts}
        setItems={setProducts}
        loading={productsLoading}
      />

      {/* NOTA: Se eliminaron las Secciones de Categorías y Pluses 
        de la vista principal, ya que ahora solo se muestran dentro de sus modales.
      */}

      {/* ======================= */}
      {/* MODAL BANNER */}
      {/* ======================= */}
      {showBanner && (
        <BannerSection
        show={showBanner}
        onClose={() => setShowBanner(false)}
        categories={categories}
        products={products}
        initialBanner={bannerData}
      />
      )}

      {/* ======================= */}
      {/* MODAL AGREGAR PRODUCTO */}
      {/* ======================= */}
      {showAddProductModal && (
        <ProductCreateModal
          onClose={() => setShowAddProductModal(false)}
          onCreate={createProduct}
        />
      )}

      {/* ======================= */}
      {/* MODAL GESTIÓN CATEGORÍAS */}
      {/* ======================= */}
      {showCategoriesModal && (
        <GenericModalWrapper title="Gestión de Categorías" onClose={() => setShowCategoriesModal(false)}>
          <CategoriesSection
            items={categories}
            setItems={setCategories}
            loading={categoriesLoading}
          />
        </GenericModalWrapper>
      )}

      {/* ======================= */}
      {/* MODAL GESTIÓN PLUSES */}
      {/* ======================= */}
      {showPlusesModal && (
        <GenericModalWrapper title="Gestión de Pluses" onClose={() => setShowPlusesModal(false)}>
          <PlusesSection
            items={pluses}
            setItems={setPluses}
            loading={plusesLoading}
          />
        </GenericModalWrapper>
      )}

    </div>
  );
}