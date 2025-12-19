import { useEffect, useState } from 'react';
import { getProducts, type AdminProduct } from '../services/admin';
import { WholesaleTable } from '../components/wholesale/WholesaleTable';
import { useWholesaleCart } from '../hooks/useWholesaleCart';

export default function WholesaleView() {
  const handleSendWhatsApp = () => {
  if (cart.length === 0) return;

  const phoneNumber = "573043602980"; // Reemplaza con tu número real
  let message = "¡Hola! Quisiera realizar un pedido mayorista:%0A%0A";

  cart.forEach((item) => {
    message += `• *${item.name}* (${item.flavor})%0A`;
    message += `  Cantidad: ${item.quantity} | Precio Unit: $${item.totalPriceWithDiscount.toLocaleString()}%0A`;
  });

  message += `%0A*TOTAL ESTIMADO: $${total.toLocaleString()}*`;

  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
};
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const { cart, addToCart, total } = useWholesaleCart();

  useEffect(() => {
    async function load() {
      const data = await getProducts();
      // FILTRO: No mostrar productos de categorías "Promociones" o "Combos"
      const filtered = data.filter(p => 
        p.category?.toLowerCase() !== 'promociones' && 
        p.category?.toLowerCase() !== 'combos'
      );
      setProducts(filtered);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Portal Mayorista
          </h1>
          <p className="text-zinc-400 mt-2">Descuentos automáticos a partir de 10 unidades.</p>
        </div>
        
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase">Subtotal Pedido</p>
          <p className="text-2xl font-mono text-emerald-400">${total.toLocaleString()}</p>
        </div>
      </header>

      <WholesaleTable products={products} onAdd={addToCart} />

      {cart.length > 0 && (
        <div className="fixed bottom-8 right-8">
          <button 
          onClick={handleSendWhatsApp}
          className="bg-white text-black px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 transition">
            Finalizar Pedido ({cart.length})
          </button>
        </div>
      )}
    </div>
  );
}