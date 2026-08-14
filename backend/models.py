import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="STAFF")  # OWNER, STAFF
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    whatsapp_phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=False)
    landmark = Column(String(150), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    
    product_name = Column(String(200), nullable=False)
    product_sku = Column(String(50), nullable=True)
    size = Column(String(20), nullable=False)
    colour = Column(String(50), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    source = Column(String(50), default="WhatsApp")  # Facebook Live, Instagram Live, WhatsApp, Other
    status = Column(String(50), default="NEW", index=True)  # NEW, SHIFTED, DELIVERED
    
    courier = Column(String(100), nullable=True)  # DTDC, Delhivery, India Post, Other
    tracking_number = Column(String(100), nullable=True, index=True)
    shipping_date = Column(DateTime, nullable=True)
    delivered_date = Column(DateTime, nullable=True)
    
    notification_sent = Column(Boolean, default=False)
    notification_sent_at = Column(DateTime, nullable=True)
    
    customer_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    screenshot_url = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")
    events = relationship("OrderEvent", back_populates="order", cascade="all, delete-orphan", order_by="OrderEvent.created_at.asc()")

class OrderEvent(Base):
    __tablename__ = "order_events"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)  # ORDER_CREATED, ORDER_PACKED, ORDER_SHIFTED, CUSTOMER_NOTIFIED, ORDER_DELIVERED
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_by = Column(String(100), default="System")

    order = relationship("Order", back_populates="events")

class ShopSettings(Base):
    __tablename__ = "shop_settings"

    id = Column(Integer, primary_key=True, default=1)
    shop_name = Column(String(150), default="Sri Krishna Garments")
    shop_phone = Column(String(20), default="+91 98765 00000")
    whatsapp_number = Column(String(20), default="+91 98765 00000")
    address = Column(Text, default="123 MG Road, Kolkata, West Bengal 700001")
    default_country_code = Column(String(10), default="+91")
    currency = Column(String(10), default="INR")
    timezone = Column(String(50), default="Asia/Kolkata")
