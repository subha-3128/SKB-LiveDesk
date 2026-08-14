export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
}

export interface OrderEvent {
  id: number;
  order_id: number;
  event_type: 'ORDER_CREATED' | 'ORDER_PACKED' | 'ORDER_SHIFTED' | 'CUSTOMER_NOTIFIED' | 'ORDER_DELIVERED';
  description: string;
  created_at: string;
  created_by: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name: string;
  phone: string;
  display_phone: string;
  whatsapp_phone?: string;
  address: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  
  product_name: string;
  product_sku?: string;
  size: string;
  colour: string;
  quantity: number;
  price: number;
  total_amount: number;
  
  source: 'Facebook Live' | 'Instagram Live' | 'WhatsApp' | 'Other';
  status: 'NEW' | 'SHIFTED' | 'DELIVERED';
  
  courier?: string;
  tracking_number?: string;
  shipping_date?: string;
  delivered_date?: string;
  
  notification_sent: boolean;
  notification_sent_at?: string;
  
  customer_notes?: string;
  internal_notes?: string;
  screenshot_url?: string;
  
  created_at: string;
  updated_at: string;
  
  whatsapp_message?: string;
  whatsapp_link?: string;
  events?: OrderEvent[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  display_phone?: string;
  whatsapp_phone?: string;
  address: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  created_at: string;
  updated_at?: string;
  order_count?: number;
  total_spent?: number;
}

export interface CustomerProfile {
  customer: {
    id: number;
    name: string;
    phone: string;
    display_phone: string;
    whatsapp_phone?: string;
    address: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
    created_at: string;
    total_orders: number;
    delivered_orders: number;
    active_orders: number;
    total_spent: number;
  };
  orders: Order[];
}

export interface DashboardStats {
  new_orders: number;
  shifted_orders: number;
  delivered_orders: number;
  todays_orders: number;
}

export interface NeedsAttentionItem {
  type: 'UNNOTIFIED' | 'READY_TO_SHIFT' | 'MISSING_TRACKING';
  severity: 'red' | 'amber' | 'orange';
  count: number;
  message: string;
}

export interface ShopSettings {
  shop_name: string;
  shop_phone: string;
  whatsapp_number: string;
  address: string;
  default_country_code: string;
  currency: string;
  timezone: string;
}

export interface OrderCreateData {
  customer_name: string;
  phone: string;
  whatsapp_phone: string;
  address: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  
  product_name?: string;
  product_sku?: string;
  size?: string;
  colour?: string;
  quantity?: number;
  price: number;
  
  source: string;
  customer_notes?: string;
  internal_notes?: string;
  screenshot_url?: string;
  existing_customer_id?: number;
}

export interface OrderShiftData {
  courier: string;
  tracking_number: string;
  shipping_charge?: number;
  internal_notes?: string;
}
