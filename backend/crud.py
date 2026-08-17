import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, and_
from models import User, Customer, Order, OrderEvent, ShopSettings
from schemas import OrderCreate, OrderShiftRequest
from utils import normalize_phone, format_phone_display, build_shipping_whatsapp_message, generate_whatsapp_link

def get_shop_settings(db: Session) -> ShopSettings:
    settings = db.query(ShopSettings).first()
    if not settings:
        settings = ShopSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def generate_order_number(db: Session) -> str:
    """Generates unique ORD-0001 format order number."""
    last_order = db.query(Order).order_by(Order.id.desc()).first()
    if not last_order:
        return "ORD-0001"
    
    try:
        current_num = int(last_order.order_number.replace("ORD-", ""))
        new_num = current_num + 1
        return f"ORD-{new_num:04d}"
    except ValueError:
        return f"ORD-{last_order.id + 1:04d}"

def get_customer_by_phone(db: Session, phone: str):
    norm_phone = normalize_phone(phone)
    if not norm_phone:
        return None
    return db.query(Customer).filter(Customer.phone == norm_phone).first()

def check_duplicate_customer(db: Session, phone: str):
    norm_phone = normalize_phone(phone)
    if not norm_phone:
        return None
    customer = db.query(Customer).filter(Customer.phone == norm_phone).first()
    if not customer:
        return None
    
    order_count = db.query(Order).filter(Order.customer_id == customer.id).count()
    return {
        "id": customer.id,
        "name": customer.name,
        "phone": customer.phone,
        "whatsapp_phone": customer.whatsapp_phone,
        "address": customer.address,
        "order_count": order_count
    }

def create_order(db: Session, data: OrderCreate, created_by: str = "Staff") -> Order:
    norm_phone = normalize_phone(data.phone)
    norm_wa_phone = normalize_phone(data.whatsapp_phone) if data.whatsapp_phone else norm_phone
    
    customer = None
    if data.existing_customer_id:
        customer = db.query(Customer).filter(Customer.id == data.existing_customer_id).first()
    
    if not customer and norm_phone:
        customer = db.query(Customer).filter(Customer.phone == norm_phone).first()
        
    if not customer:
        customer = Customer(
            name=data.customer_name.strip(),
            phone=norm_phone,
            whatsapp_phone=norm_wa_phone,
            address=data.address.strip(),
            landmark=data.landmark.strip() if data.landmark else None,
            city=data.city.strip() if data.city else None,
            state=data.state.strip() if data.state else None,
            pincode=data.pincode.strip() if data.pincode else None,
        )
        db.add(customer)
        db.flush()
    else:
        if norm_wa_phone:
            customer.whatsapp_phone = norm_wa_phone
        if data.address and not customer.address:
            customer.address = data.address.strip()
        db.flush()

    order_num = generate_order_number(db)
    prod_name = (data.product_name or "Garment Item").strip()
    size_val = (data.size or "Standard").strip()
    colour_val = (data.colour or "As Ordered").strip()
    qty_val = data.quantity if data.quantity else 1
    price_val = data.price if data.price is not None else 0.0
    total = round(qty_val * price_val, 2)
    
    order = Order(
        order_number=order_num,
        customer_id=customer.id,
        product_name=prod_name,
        product_sku=data.product_sku.strip() if data.product_sku else None,
        size=size_val,
        colour=colour_val,
        quantity=qty_val,
        price=price_val,
        total_amount=total,
        source=data.source,
        status="NEW",
        customer_notes=data.customer_notes.strip() if data.customer_notes else None,
        internal_notes=data.internal_notes.strip() if data.internal_notes else None,
        screenshot_url=data.screenshot_url,
        notification_sent=False
    )
    db.add(order)
    db.flush()
    
    event = OrderEvent(
        order_id=order.id,
        event_type="ORDER_CREATED",
        description=f"Order {order_num} created for {customer.name}",
        created_by=created_by
    )
    db.add(event)
    db.commit()
    db.refresh(order)
    return order

def shift_order(db: Session, order_id: int, shift_data: OrderShiftRequest, updated_by: str = "Staff") -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")
    if not shift_data.courier.strip():
        raise ValueError("Courier name is required to shift order")
    if not shift_data.tracking_number.strip():
        raise ValueError("Tracking number is required to shift order")
    
    order.status = "SHIFTED"
    order.courier = shift_data.courier.strip()
    order.tracking_number = shift_data.tracking_number.strip()
    order.shipping_date = datetime.datetime.utcnow()
    if shift_data.internal_notes:
        existing = order.internal_notes or ""
        order.internal_notes = f"{existing}\n[Shift Notes]: {shift_data.internal_notes.strip()}".strip()
    
    event = OrderEvent(
        order_id=order.id,
        event_type="ORDER_SHIFTED",
        description=f"Order marked as Shifted via {order.courier} (Tracking: {order.tracking_number})",
        created_by=updated_by
    )
    db.add(event)
    db.commit()
    db.refresh(order)
    return order

def mark_notification_sent(db: Session, order_id: int, updated_by: str = "Staff") -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")
    
    order.notification_sent = True
    order.notification_sent_at = datetime.datetime.utcnow()
    
    event = OrderEvent(
        order_id=order.id,
        event_type="CUSTOMER_NOTIFIED",
        description=f"WhatsApp customer shipping notification marked as sent",
        created_by=updated_by
    )
    db.add(event)
    db.commit()
    db.refresh(order)
    return order

def deliver_order(db: Session, order_id: int, updated_by: str = "Staff") -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")
    
    if order.status == "NEW":
        order.courier = order.courier or "eKart"
        order.tracking_number = order.tracking_number or f"EK{order.id:06d}IN"
        order.shipping_date = datetime.datetime.utcnow()
    
    order.status = "DELIVERED"
    order.delivered_date = datetime.datetime.utcnow()
    
    event = OrderEvent(
        order_id=order.id,
        event_type="ORDER_DELIVERED",
        description="Order successfully marked as DELIVERED to customer",
        created_by=updated_by
    )
    db.add(event)
    db.commit()
    db.refresh(order)
    return order

def delete_order(db: Session, order_id: int) -> bool:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")
    
    db.query(OrderEvent).filter(OrderEvent.order_id == order_id).delete()
    db.delete(order)
    db.commit()
    return True

def delete_customer(db: Session, customer_id: int) -> bool:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise ValueError("Customer not found")
    
    # Cascade delete orders and their events manually for extra safety
    orders = db.query(Order).filter(Order.customer_id == customer_id).all()
    for o in orders:
        db.query(OrderEvent).filter(OrderEvent.order_id == o.id).delete()
        db.delete(o)
        
    db.delete(customer)
    db.commit()
    return True

def enrich_order_response(order: Order, db: Session) -> dict:
    c = order.customer
    settings = get_shop_settings(db)
    
    wa_msg = ""
    wa_link = ""
    if order.courier and order.tracking_number:
        wa_msg = build_shipping_whatsapp_message(
            customer_name=c.name if c else "Customer",
            order_number=order.order_number,
            courier=order.courier,
            tracking_number=order.tracking_number,
            shop_name=settings.shop_name
        )
        phone_target = c.whatsapp_phone or c.phone if c else ""
        wa_link = generate_whatsapp_link(phone_target, wa_msg)
    elif c:
        phone_target = c.whatsapp_phone or c.phone
        wa_link = generate_whatsapp_link(phone_target)
        
    return {
        "id": order.id,
        "order_number": order.order_number,
        "customer_id": order.customer_id,
        "customer_name": c.name if c else "",
        "phone": c.phone if c else "",
        "display_phone": format_phone_display(c.phone) if c else "",
        "whatsapp_phone": c.whatsapp_phone if c else None,
        "address": c.address if c else "",
        "landmark": c.landmark if c else None,
        "city": c.city if c else None,
        "state": c.state if c else None,
        "pincode": c.pincode if c else None,
        
        "product_name": order.product_name,
        "product_sku": order.product_sku,
        "size": order.size,
        "colour": order.colour,
        "quantity": order.quantity,
        "price": order.price,
        "total_amount": order.total_amount,
        
        "source": order.source,
        "status": order.status,
        
        "courier": order.courier,
        "tracking_number": order.tracking_number,
        "shipping_date": order.shipping_date,
        "delivered_date": order.delivered_date,
        
        "notification_sent": order.notification_sent,
        "notification_sent_at": order.notification_sent_at,
        
        "customer_notes": order.customer_notes,
        "internal_notes": order.internal_notes,
        "screenshot_url": order.screenshot_url,
        
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        
        "whatsapp_message": wa_msg,
        "whatsapp_link": wa_link,
        "events": order.events
    }

def get_orders(db: Session, search: str = None, status: str = None, source: str = None, courier: str = None, limit: int = 100, offset: int = 0):
    query = db.query(Order).join(Customer)
    
    if search and search.strip():
        s = f"%{search.strip()}%"
        norm_search = normalize_phone(search.strip())
        norm_pattern = f"%{norm_search}%" if norm_search else None
        
        conditions = [
            Order.order_number.ilike(s),
            Customer.name.ilike(s),
            Customer.phone.ilike(s),
            Order.tracking_number.ilike(s),
            Order.product_name.ilike(s)
        ]
        if norm_pattern:
            conditions.append(Customer.phone.ilike(norm_pattern))
        query = query.filter(or_(*conditions))
        
    if status and status.strip() and status.upper() != "ALL":
        query = query.filter(Order.status == status.upper())
        
    if source and source.strip() and source.lower() != "all":
        query = query.filter(Order.source == source)
        
    if courier and courier.strip() and courier.lower() != "all":
        query = query.filter(Order.courier == courier)
        
    orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
    return [enrich_order_response(o, db) for o in orders]

def get_dashboard_stats(db: Session):
    new_count = db.query(Order).filter(Order.status == "NEW").count()
    shifted_count = db.query(Order).filter(Order.status == "SHIFTED").count()
    delivered_count = db.query(Order).filter(Order.status == "DELIVERED").count()
    
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    todays_count = db.query(Order).filter(Order.created_at >= today_start).count()
    
    return {
        "new_orders": new_count,
        "shifted_orders": shifted_count,
        "delivered_orders": delivered_count,
        "todays_orders": todays_count
    }

def get_needs_attention(db: Session):
    items = []
    
    unnotified_count = db.query(Order).filter(
        and_(Order.status == "SHIFTED", Order.notification_sent == False)
    ).count()
    if unnotified_count > 0:
        items.append({
            "type": "UNNOTIFIED",
            "severity": "red",
            "count": unnotified_count,
            "message": f"{unnotified_count} shifted {'order has' if unnotified_count == 1 else 'orders have'} not been notified to customer"
        })
        
    new_count = db.query(Order).filter(Order.status == "NEW").count()
    if new_count > 0:
        items.append({
            "type": "READY_TO_SHIFT",
            "severity": "amber",
            "count": new_count,
            "message": f"{new_count} new {'order is' if new_count == 1 else 'orders are'} waiting to be shifted"
        })
        
    missing_tracking_count = db.query(Order).filter(
        and_(Order.status == "SHIFTED", or_(Order.tracking_number == None, Order.tracking_number == ""))
    ).count()
    if missing_tracking_count > 0:
        items.append({
            "type": "MISSING_TRACKING",
            "severity": "orange",
            "count": missing_tracking_count,
            "message": f"{missing_tracking_count} shifted {'order is' if missing_tracking_count == 1 else 'orders are'} missing tracking numbers"
        })
        
    return {"attention_items": items}
