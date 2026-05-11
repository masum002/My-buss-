import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        const addQty = item.quantity || 1;
        
        // Ensure price is a clean number
        const cleanPrice = typeof item.price === 'number' 
          ? item.price 
          : Number(String(item.price).replace(/[^0-9.]/g, '')) || 0;

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + addQty, price: cleanPrice } : i
            ),
          });
        } else {
          set({ items: [...currentItems, { ...item, price: cleanPrice, quantity: addQty }] });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
          ).filter(i => i.quantity > 0),
        }),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items;
        return items.reduce((acc, item) => {
          const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
          const itemQuantity = typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity)) || 0;
          return acc + (itemPrice * itemQuantity);
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
