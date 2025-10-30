import React, { createContext, useContext, useEffect, useReducer } from "react";

export interface CartItem {
  _id?: string; 
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM_BY_INDEX"; payload: number }
  | { type: "REMOVE_ITEM_BY_ID"; payload: string } 
  | { type: "UPDATE_QUANTITY"; payload: { itemId?: string; productId?: string; quantity: number } }
  | { type: "CLEAR_CART" };

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem("cart") || "null") || [],
};

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload };
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(i => i.productId === action.payload.productId);
      if (existingIndex !== -1) {
        const arr = [...state.items];
        arr[existingIndex] = { ...arr[existingIndex], quantity: arr[existingIndex].quantity + action.payload.quantity };
        return { ...state, items: arr };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM_BY_INDEX": {
      const arr = [...state.items];
      arr.splice(action.payload, 1);
      return { ...state, items: arr };
    }
    case "REMOVE_ITEM_BY_ID": {
      const arr = state.items.filter(i => i._id !== action.payload);
      return { ...state, items: arr };
    }
    case "UPDATE_QUANTITY": {
      const { itemId, productId, quantity } = action.payload;
      const arr = [...state.items];
      const idx = itemId ? arr.findIndex(i => i._id === itemId) : arr.findIndex(i => i.productId === productId);
      if (idx === -1) return state;
      arr[idx] = { ...arr[idx], quantity };
      return { ...state, items: arr };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  addItem: (item: CartItem) => Promise<void>;
  removeItemByIndex: (index: number) => Promise<void>;
  removeItemById: (id: string) => Promise<void>;
  updateQuantity: (params: { itemId?: string; productId?: string; quantity: number }) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(state.items));
    } catch (err) {
      //ignore
    }
  }, [state.items]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  };

  const callBackend = async (url: string, init?: RequestInit) => {
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err = new Error(`Backend error ${res.status}: ${text}`);
        (err as any).status = res.status;
        throw err;
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const refreshFromServer = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return; // nothing to do
    try {
      const res = await callBackend("/api/cart", { method: "GET", headers: getAuthHeaders() });
      const cart = await res.json();
      const items: CartItem[] = (cart?.items || []).map((it: any) => ({
        _id: String((it as any)._id || ""),
        productId: String((it as any).productId || ""),
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      }));
      dispatch({ type: "SET_CART", payload: items });
    } catch (err) {
      // ignore 
    }
  };

  const addItem = async (item: CartItem) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const body = JSON.stringify({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        });
        const res = await callBackend("/api/cart", { method: "POST", headers: getAuthHeaders(), body });
        const savedCart = await res.json();
        const items: CartItem[] = (savedCart?.items || []).map((it: any) => ({
          _id: String((it as any)._id || ""),
          productId: String((it as any).productId || ""),
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        }));
        dispatch({ type: "SET_CART", payload: items });
        return;
      } catch (err: any) {
        if ((err as any).status === 401 || (err as any).status === 403) {
          // token invalid
        } else {
          // network/other error
        }
      }
    }
    // Fallback
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItemByIndex = async (index: number) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const item = state.items[index];
      if (item && item._id) {
        try {
          await callBackend(`/api/cart/${item._id}`, { method: "DELETE", headers: getAuthHeaders() });
          await refreshFromServer();
          return;
        } catch {
          // fallback to LOCAL remove
        }
      }
    }
    // local remove
    dispatch({ type: "REMOVE_ITEM_BY_INDEX", payload: index });
  };

  const removeItemById = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await callBackend(`/api/cart/${id}`, { method: "DELETE", headers: getAuthHeaders() });
        await refreshFromServer();
        return;
      } catch {
        // fallback
      }
    }
    dispatch({ type: "REMOVE_ITEM_BY_ID", payload: id });
  };

  const updateQuantity = async (params: { itemId?: string; productId?: string; quantity: number }) => {
    const token = localStorage.getItem("accessToken");
    if (token && params.itemId) {
      try {
        await callBackend(`/api/cart/${params.itemId}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ quantity: params.quantity }),
        });
        await refreshFromServer();
        return;
      } catch {
        // fallback
      }
    }

    // fallback: update local
    dispatch({ type: "UPDATE_QUANTITY", payload: params });
  };

  const clearCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await callBackend("/api/cart/checkout", { method: "POST", headers: getAuthHeaders() });
        // backend will clear cart
        await refreshFromServer();
        return;
      } catch {
        // fallback
      }
    }
    dispatch({ type: "CLEAR_CART" });
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await refreshFromServer();
      }
    })();
  }, []);

  const value: CartContextValue = {
    state,
    addItem,
    removeItemByIndex,
    removeItemById,
    updateQuantity,
    clearCart,
    refreshFromServer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;