  import { useState } from "react";
  import type { AdminCategory, AdminProduct, CreateProductPayload } from "../../../services/admin";
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
    categories: AdminCategory[]; // Añadimos categorías como prop para pasarlas a ProductEditModal
  }

  export function ProductsSection({ items, setItems, loading,categories }: ProductsSectionProps) {
    // ESTADO DE CREACIÓN (Devuelto desde AdminDashboard)
    const [showCreate, setShowCreate] = useState(false); 

    // ESTADO DE EDICIÓN (Mantenido aquí)
    const [productToEdit, setProductToEdit] = useState<AdminProduct | null>(null);


    const onCreate = async (data: CreateProductPayload) => {
    try {
      // 3. Como ahora los tipos coinciden, puedes pasar 'data' directamente
      const newP = await createProduct(data);

      setItems(prev => [...prev, newP]);
      setShowCreate(false); 
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
            categories={categories}
            onClose={() => setProductToEdit(null)}
            onSave={onUpdateProduct}
          />
        )}

      </section>
    );
  }