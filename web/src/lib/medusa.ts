// Medusa API Client for FreshCatch Storefront

const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_427cce2a75049dde35ff19cb44f3fc18cc1109893df8c6870064cf64bbff283e';
const REGION_ID = 'reg_01KDCHTTP9F4462Q0CFSSERPNN'; // India region (Corrected)

// Request cache to prevent duplicate API calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private defaultTTL = 30000; // 30 seconds cache

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Auto-cleanup after TTL
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl || this.defaultTTL);
  }

  // Deduplicate in-flight requests
  async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached) return cached;

    // Check if request is already in flight
    const pending = this.pendingRequests.get(key);
    if (pending) return pending as Promise<T>;

    // Make new request
    const promise = fetcher().then((data) => {
      this.set(key, data);
      this.pendingRequests.delete(key);
      return data;
    }).catch((error) => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    // Invalidate keys matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const requestCache = new RequestCache();

// Types
export interface Product {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  handle: string;
  thumbnail: string | null;
  images: { id: string; url: string }[];
  variants: ProductVariant[];
  options: ProductOption[];
  categories: ProductCategory[];
  tags: { id: string; value: string }[];
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CalculatedPrice {
  calculated_amount: number;
  original_amount: number;
  currency_code: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string | null;
  prices?: Price[];
  calculated_price?: CalculatedPrice;
  options: { id: string; value: string; option_id: string }[];
  inventory_quantity?: number;
  manage_inventory?: boolean;
  metadata: Record<string, unknown> | null;
}

export interface ProductOption {
  id: string;
  title: string;
  values: { id: string; value: string }[];
}

export interface ProductCategory {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  parent_category: ProductCategory | null;
  category_children: ProductCategory[];
  metadata: Record<string, unknown> | null;
}

export interface Price {
  id: string;
  amount: number;
  currency_code: string;
}

export interface Cart {
  id: string;
  email: string | null;
  items: LineItem[];
  region: Region | null;
  shipping_address: Address | null;
  billing_address: Address | null;
  shipping_methods: ShippingMethod[];
  payment_session: PaymentSession | null;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
}

export interface LineItem {
  id: string;
  cart_id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  total: number;
  variant: ProductVariant;
  product: Product;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries: Country[];
}

export interface Country {
  iso_2: string;
  name: string;
}

export interface Address {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address_1: string;
  address_2: string | null;
  city: string;
  province: string | null;
  postal_code: string;
  country_code: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
}

export interface PaymentSession {
  id: string;
  provider_id: string;
  status: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  billing_address?: Address | null;
  shipping_addresses?: Address[];
  addresses?: Address[]; // Medusa v2 format
  billing_address_id?: string;
  shipping_address_id?: string;
  has_account?: boolean;
  created_at?: string;
  metadata?: Record<string, unknown> | null;
}

export interface Order {
  id: string;
  display_id: number;
  status: string;
  fulfillment_status: string;
  payment_status: string;
  email: string;
  items: LineItem[];
  shipping_address: Address;
  billing_address: Address;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  created_at: string;
  // Additional Medusa v2 fields
  fulfillments?: Array<{
    id: string;
    status: string;
    shipped_at?: string;
    delivered_at?: string;
  }>;
  payment_collections?: Array<{
    id: string;
    status: string;
    captured_at?: string;
  }>;
}

// API Client class
class MedusaClient {
  private publishableKey: string;
  private authToken: string | null = null;

  constructor() {
    this.publishableKey = PUBLISHABLE_API_KEY;
    // Restore token from localStorage if available
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('medusa_auth_token');
    }
  }

  // Get base URL dynamically
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return '/api'; // Use Next.js API route proxy in browser
    }
    return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
  }

  // Set auth token
  setAuthToken(token: string | null) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('medusa_auth_token', token);
      } else {
        localStorage.removeItem('medusa_auth_token');
      }
    }
  }

  // Get auth token
  getAuthToken(): string | null {
    return this.authToken;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.publishableKey && { 'x-publishable-api-key': this.publishableKey }),
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    const baseUrl = this.getBaseUrl();

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Products - with caching and deduplication
  async getProducts(params?: {
    limit?: number;
    offset?: number;
    category_id?: string[];
    id?: string[];
    q?: string;
    order?: string;
  }): Promise<{ products: Product[]; count: number }> {
    try {
      const searchParams = new URLSearchParams();
      // Required for pricing
      searchParams.set('region_id', REGION_ID);
      searchParams.set('fields', '*variants.calculated_price,*categories');

      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());
      if (params?.category_id) {
        params.category_id.forEach(id => searchParams.append('category_id[]', id));
      }
      if (params?.id) {
        params.id.forEach(id => searchParams.append('id[]', id));
      }
      if (params?.q) searchParams.set('q', params.q);
      if (params?.order) searchParams.set('order', params.order);

      const query = searchParams.toString();
      return await this.fetch(`/store/products?${query}`);
    } catch {
      return { products: [], count: 0 };
    }
    // if (params?.q) searchParams.set('q', params.q);
    // if (params?.order) searchParams.set('order', params.order);

    // const query = searchParams.toString();
    // const cacheKey = `products:${query}`;

    // return requestCache.dedupe(cacheKey, async () => {
    //   try {
    //     return await this.fetch(`/store/products?${query}`);
    //   } catch {
    //     return { products: [], count: 0 };
    //   }
    // });
  }

  async getProduct(id: string): Promise<{ product: Product } | null> {
    try {
      return await this.fetch(`/store/products/${id}?region_id=${REGION_ID}&fields=*variants.calculated_price`);
    } catch {
      return null;
    }
  }

  async getProductByHandle(handle: string): Promise<{ products: Product[] }> {
    try {
      return await this.fetch(`/store/products?handle=${handle}&region_id=${REGION_ID}&fields=*variants.calculated_price`);
    } catch {
      return { products: [] };
    }
  }

  // Categories - with caching (categories rarely change)
  async getCategories(): Promise<{ product_categories: ProductCategory[] }> {
    const cacheKey = 'categories';

    return requestCache.dedupe(cacheKey, async () => {
      try {
        return await this.fetch('/store/product-categories');
      } catch {
        return { product_categories: [] };
      }
    });
  }

  async getCategory(id: string): Promise<{ product_category: ProductCategory } | null> {
    try {
      return await this.fetch(`/store/product-categories/${id}`);
    } catch {
      return null;
    }
  }

  // Cart
  async createCart(regionId: string = REGION_ID): Promise<{ cart: Cart } | null> {
    try {
      return await this.fetch('/store/carts', {
        method: 'POST',
        body: JSON.stringify({ region_id: regionId }),
      });
    } catch {
      return null;
    }
  }

  async getCart(cartId: string): Promise<{ cart: Cart } | null> {
    try {
      return await this.fetch(`/store/carts/${cartId}?fields=+items.*,+items.product,+items.variant`);
    } catch {
      return null;
    }
  }

  async addToCart(
    cartId: string,
    variantId: string,
    quantity: number
  ): Promise<{ cart: Cart } | null> {
    try {
      // Include product metadata for translations
      return await this.fetch(`/store/carts/${cartId}/line-items?fields=*items.product`, {
        method: 'POST',
        body: JSON.stringify({ variant_id: variantId, quantity }),
      });
    } catch {
      return null;
    }
  }

  async updateCartItem(
    cartId: string,
    lineItemId: string,
    quantity: number
  ): Promise<{ cart: Cart } | null> {
    try {
      // Include product metadata for translations
      return await this.fetch(`/store/carts/${cartId}/line-items/${lineItemId}?fields=*items.product`, {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      });
    } catch {
      return null;
    }
  }

  async removeFromCart(cartId: string, lineItemId: string): Promise<{ cart: Cart } | null> {
    try {
      // Include product metadata for translations
      return await this.fetch(`/store/carts/${cartId}/line-items/${lineItemId}?fields=*items.product`, {
        method: 'DELETE',
      });
    } catch {
      return null;
    }
  }

  async updateCart(
    cartId: string,
    data: {
      email?: string;
      customer_id?: string;
      shipping_address?: Partial<Address>;
      billing_address?: Partial<Address>;
    }
  ): Promise<{ cart: Cart } | null> {
    try {
      return await this.fetch(`/store/carts/${cartId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Medusa updateCart failed:', error);
      return null;
    }
  }

  async addShippingMethod(
    cartId: string,
    optionId: string
  ): Promise<{ cart: Cart } | null> {
    try {
      return await this.fetch(`/store/carts/${cartId}/shipping-methods`, {
        method: 'POST',
        body: JSON.stringify({ option_id: optionId }),
      });
    } catch {
      return null;
    }
  }


  // Medusa v2 Payment Collection methods
  async createPaymentCollection(cartId: string): Promise<{ payment_collection: { id: string; payment_sessions: Array<{ id: string; provider_id: string }> } } | null> {
    try {
      return await this.fetch('/store/payment-collections', {
        method: 'POST',
        body: JSON.stringify({ cart_id: cartId }),
      });
    } catch {
      return null;
    }
  }

  async initializePaymentSession(
    paymentCollectionId: string,
    providerId: string = 'pp_system_default'
  ): Promise<{ payment_collection: { id: string; payment_sessions: Array<{ id: string; provider_id: string; status: string }> } } | null> {
    try {
      return await this.fetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
        method: 'POST',
        body: JSON.stringify({ provider_id: providerId }),
      });
    } catch {
      return null;
    }
  }

  // Legacy methods for backward compatibility
  async createPaymentSessions(cartId: string): Promise<{ cart: Cart } | null> {
    try {
      return await this.fetch(`/store/carts/${cartId}/payment-sessions`, {
        method: 'POST',
      });
    } catch {
      return null;
    }
  }

  async setPaymentSession(
    cartId: string,
    providerId: string
  ): Promise<{ cart: Cart } | null> {
    try {
      return await this.fetch(`/store/carts/${cartId}/payment-session`, {
        method: 'POST',
        body: JSON.stringify({ provider_id: providerId }),
      });
    } catch {
      return null;
    }
  }

  async completeCart(cartId: string): Promise<{ type: string; data: Order } | null> {
    try {
      return await this.fetch(`/store/carts/${cartId}/complete`, {
        method: 'POST',
      });
    } catch {
      return null;
    }
  }

  // Regions
  async getRegions(): Promise<{ regions: Region[] }> {
    try {
      return await this.fetch('/store/regions');
    } catch {
      return { regions: [] };
    }
  }

  // Shipping Options
  async getShippingOptions(cartId: string): Promise<{ shipping_options: ShippingMethod[] }> {
    try {
      return await this.fetch(`/store/shipping-options?cart_id=${cartId}`);
    } catch {
      return { shipping_options: [] };
    }
  }

  // Customer / Auth
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<{ customer: Customer } | null> {
    try {
      return await this.fetch('/store/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return null;
    }
  }

  async login(email: string, password: string): Promise<{ customer: Customer } | null> {
    try {
      // Medusa v2 auth endpoint - returns { token: "..." }
      const authResponse = await this.fetch<{ token: string }>('/auth/customer/emailpass', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (authResponse.token) {
        // Store the token for subsequent requests
        this.setAuthToken(authResponse.token);
      }

      // After successful auth, get customer data
      const customerResponse = await this.getCustomer();
      return customerResponse;
    } catch {
      return null;
    }
  }

  async getCustomer(): Promise<{ customer: Customer } | null> {
    try {
      // Include addresses in the response
      return await this.fetch('/store/customers/me?fields=*addresses');
    } catch {
      return null;
    }
  }

  async updateCustomer(data: Partial<Customer>): Promise<{ customer: Customer } | null> {
    try {
      return await this.fetch('/store/customers/me', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return null;
    }
  }

  async logout(): Promise<boolean> {
    console.log('[Medusa Debug] Logout called. Attempting to clear server session...');
    try {
      // Clear server-side session (cookies)
      const res = await this.fetch('/auth/session', {
        method: 'DELETE',
      });
      console.log('[Medusa Debug] Server session cleared response:', res);
    } catch (error) {
      console.warn('[Medusa Debug] Logout endpoint failed:', error);
    }

    // Clear client-side state
    this.setAuthToken(null);
    return true;
  }

  // Orders
  async getOrders(): Promise<{ orders: Order[] }> {
    try {
      // Include payment, fulfillment status fields, and product metadata for translations
      return await this.fetch('/store/orders?fields=*payment_collections,*fulfillments,*items.product,*items.variant.product');
    } catch {
      return { orders: [] };
    }
  }

  async getOrder(id: string): Promise<{ order: Order } | null> {
    try {
      // Include payment, fulfillment details, and product metadata for translations
      return await this.fetch(`/store/orders/${id}?fields=*payment_collections,*fulfillments,*items.product,*items.variant.product`);
    } catch {
      return null;
    }
  }

  async cancelOrder(id: string): Promise<{ order: Order } | null> {
    try {
      return await this.fetch(`/store/orders/${id}/cancel`, {
        method: 'POST',
      });
    } catch {
      return null;
    }
  }

  // Addresses - Medusa v2 format (pass address fields directly)
  async addAddress(address: Partial<Address>): Promise<{ customer: Customer } | null> {
    try {
      return await this.fetch('/store/customers/me/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      });
    } catch {
      return null;
    }
  }

  async updateAddress(
    addressId: string,
    address: Partial<Address>
  ): Promise<{ customer: Customer } | null> {
    try {
      return await this.fetch(`/store/customers/me/addresses/${addressId}`, {
        method: 'POST',
        body: JSON.stringify(address),
      });
    } catch {
      return null;
    }
  }

  async deleteAddress(addressId: string): Promise<{ customer: Customer } | null> {
    try {
      return await this.fetch(`/store/customers/me/addresses/${addressId}`, {
        method: 'DELETE',
      });
    } catch {
      return null;
    }
  }

  async setDefaultAddress(addressId: string): Promise<{ customer: Customer } | null> {
    try {
      // Set both billing and shipping address to the selected address
      return await this.updateCustomer({
        billing_address_id: addressId,
        shipping_address_id: addressId,
      });
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const medusa = new MedusaClient();

// Export cache invalidation for manual cache clearing
export const invalidateCache = (pattern?: string) => requestCache.invalidate(pattern);

// Helper function to format price
export function formatPrice(amount: number, currencyCode: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(amount / 100); // Medusa stores amounts in smallest currency unit
}

// Helper to get variant price (uses calculated_price from Medusa v2)
export function getVariantPrice(variant: ProductVariant, currencyCode: string = 'inr'): number {
  // First try calculated_price (Medusa v2)
  if (variant.calculated_price) {
    return variant.calculated_price.calculated_amount || 0;
  }
  // Fallback to prices array (Medusa v1 style)
  const price = variant.prices?.find(p => p.currency_code === currencyCode);
  return price?.amount || 0;
}
