  import { useState } from "react";
  import type { AdminProduct, CreateProductPayload } from "../../../services/admin";
  // Importar SÓLO lo necesario para la creación, edición y eliminación.
  import { createProduct, patchProductImage, deleteProduct } from "../../../services/admin"; 
  import { ProductTable } from "../componentes/admin/products/ProducTable";
  import { ProductCreateModal } from "../componentes/admin/products/ProductCreateModal"; // Modal de creación (detallado)
  import { ProductEditModal } from "../componentes/admin/products/ProductEditModal"; // Modal de edición
  // Asegúrate de que este tipo esté completo

  interface ProductsSectionProps {
    items: AdminProduct[];
    setItems: React.Dispatch<React.SetStateAction<AdminProduct[]>>;
    loading: boolean;
  }

  export function ProductsSection({ items, setItems, loading }: ProductsSectionProps) {
    // ESTADO DE CREACIÓN (Devuelto desde AdminDashboard)
    const [showCreate, setShowCreate] = useState(false); 

    // ESTADO DE EDICIÓN (Mantenido aquí)
    const [productToEdit, setProductToEdit] = useState<AdminProduct | null>(null);


    // LÓGICA DE CREACIÓN (Devuelta desde AdminDashboard)
    const onCreate = async (data: CreateProductPayload) => {
      try {
        // Usamos todos los datos completos que vienen del modal detallado
        const newP = await createProduct({
          sku: data.sku,
          name: data.name,
          price: data.price,
          image: data.image ?? null,
          
          description: data.description, 
          stock: data.stock,
          puffs: data.puffs,
          ml: data.ml,
          visible: data.visible,
          category: data.category,
          flavors: data.flavors,
          hasFlavors: data.hasFlavors,
          pluses: data.pluses,
        });

        setItems(prev => [...prev, newP]);
        setShowCreate(false); // Cierra el modal
      } catch (err) {
        console.error(err);
        alert("Error creando producto");
      }
    };


    // LÓGICA DE EDICIÓN (Mantenida aquí)
    const handleRowClick = (product: AdminProduct) => {
      setProductToEdit(product);
    };
    
    const onUpdateProduct = (updatedProduct: AdminProduct) => {
      setItems(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
      setProductToEdit(null);
    };


    return (
      <section className="space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-100">Productos</h2>

          {/* BOTÓN AGREGAR PRODUCTO (Devuelto aquí) */}
          <button
            onClick={() => setShowCreate(true)}
            className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-white text-sm font-medium"
          >
            + Agregar Producto
          </button>
        </div>

        <ProductTable
          items={items}
          loading={loading}
          onUploadImage={async (id, file) => {
            const updated = await patchProductImage(id, file);
            setItems(prev => prev.map(p => (p.id === id ? updated : p)));
          }}
          onDelete={async (id) => {
            await deleteProduct(id);
            setItems(prev => prev.filter(p => p.id !== id));
          }}
          onRowClick={handleRowClick}
        />

        {/* MODAL DE CREACIÓN (Devuelto aquí) */}
        {showCreate && (
          <ProductCreateModal
            onClose={() => setShowCreate(false)}
            onCreate={onCreate}
          />
        )}

        {/* MODAL DE EDICIÓN */}
        {productToEdit && (
          <ProductEditModal
            product={productToEdit}
            onClose={() => setProductToEdit(null)}
            onSave={onUpdateProduct}
          />
        )}

      </section>
    );
  }