import { useState, useEffect } from 'react';

export interface CartItem {
  listingId: number;
  productName: string;
  sellerName: string;
  quantity: number;
  priceCents: number;
  totalCents: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'totalCents'>) => void;
  removeItem: (listingId: number) => void;
  updateQuantity: (listingId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CART_STORAGE_KEY = 'natenghub_cart';

export function useCart(): CartContextType {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (item: Omit<CartItem, 'totalCents'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.listingId === item.listingId);
      if (existing) {
        return prev.map((i) =>
          i.listingId === item.listingId
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                totalCents: (i.quantity + item.quantity) * item.priceCents,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          totalCents: item.quantity * item.priceCents,
        },
      ];
    });
  };

  const removeItem = (listingId: number) => {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId));
  };

  const updateQuantity = (listingId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(listingId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.listingId === listingId
          ? {
              ...i,
              quantity,
              totalCents: quantity * i.priceCents,
            }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + item.totalCents, 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
  };
}
