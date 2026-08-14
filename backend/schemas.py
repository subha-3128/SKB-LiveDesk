from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    phone: str
    whatsapp_phone: Optional[str] = None
    address: str
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    order_count: Optional[int] = 0
    total_spent: Optional[float] = 0.0

# Order Event Schemas
class OrderEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    event_type: str
    description: str
    created_at: datetime
    created_by: str

# Order Schemas
class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    whatsapp_phone: str  # Required WhatsApp Number *
    address: str
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    
    product_name: Optional[str] = "Garment Item"
    product_sku: Optional[str] = None
    size: Optional[str] = "Standard"
    colour: Optional[str] = "As Ordered"
    quantity: int = Field(default=1, gt=0)
    price: float = Field(ge=0.0)
    
    source: str = "WhatsApp"  # Facebook Live, Instagram Live, WhatsApp, Other
    customer_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    screenshot_url: Optional[str] = None
    
    existing_customer_id: Optional[int] = None

class OrderShiftRequest(BaseModel):
    courier: str
    tracking_number: str
    shipping_charge: Optional[float] = 0.0
    internal_notes: Optional[str] = None

class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    customer_id: int
    customer_name: str
    phone: str
    display_phone: str
    whatsapp_phone: Optional[str] = None
    address: str
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    
    product_name: str
    product_sku: Optional[str] = None
    size: str
    colour: str
    quantity: int
    price: float
    total_amount: float
    
    source: str
    status: str
    
    courier: Optional[str] = None
    tracking_number: Optional[str] = None
    shipping_date: Optional[datetime] = None
    delivered_date: Optional[datetime] = None
    
    notification_sent: bool
    notification_sent_at: Optional[datetime] = None
    
    customer_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    screenshot_url: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    
    whatsapp_message: Optional[str] = None
    whatsapp_link: Optional[str] = None
    events: List[OrderEventResponse] = []

# Dashboard Stats & Attention Schemas
class DashboardStats(BaseModel):
    new_orders: int
    shifted_orders: int
    delivered_orders: int
    todays_orders: int

class NeedsAttentionItem(BaseModel):
    type: str  # UNNOTIFIED, READY_TO_SHIFT, MISSING_TRACKING
    severity: str  # red, amber, orange
    count: int
    message: str

class NeedsAttentionResponse(BaseModel):
    attention_items: List[NeedsAttentionItem]

class ShopSettingsSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    shop_name: str
    shop_phone: str
    whatsapp_number: str
    address: str
    default_country_code: str
    currency: str
    timezone: str
