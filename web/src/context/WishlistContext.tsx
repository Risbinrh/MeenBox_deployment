'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface WishlistContextType {
    wishlistItems: string[];
    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    toggleWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_KEY = 'freshcatch_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);

    // Load wishlist from local storage on mount
    useEffect(() => {
        const storedWishlist = localStorage.getItem(WISHLIST_KEY);
        if (storedWishlist) {
            try {
                setWishlistItems(JSON.parse(storedWishlist));
            } catch (e) {
                console.error('Failed to parse wishlist from local storage', e);
                localStorage.removeItem(WISHLIST_KEY);
            }
        }
    }, []);

    // Update local storage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = useCallback((productId: string) => {
        setWishlistItems((prev) => {
            if (!prev.includes(productId)) {
                return [...prev, productId];
            }
            return prev;
        });
    }, []);

    const removeFromWishlist = useCallback((productId: string) => {
        setWishlistItems((prev) => prev.filter((id) => id !== productId));
    }, []);

    const toggleWishlist = useCallback((productId: string) => {
        setWishlistItems((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    }, []);

    const isInWishlist = useCallback((productId: string) => {
        return wishlistItems.includes(productId);
    }, [wishlistItems]);

    const clearWishlist = useCallback(() => {
        setWishlistItems([]);
    }, []);

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
