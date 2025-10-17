import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl: string;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId);
        
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.stock) }
                : i
            ),
          };
        }
        
        return { items: [...state.items, item] };
      }),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId),
      })),
      
      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(i => i.productId !== productId) };
        }
        
        return {
          items: state.items.map(i =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        };
      }),
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          return total + (parseFloat(item.price) * item.quantity);
        }, 0);
      },
      
      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'casino-cart-storage',
    }
  )
);
