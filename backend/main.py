from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from database import engine, Base, get_db
from models import User, Customer, Order, ShopSettings
from schemas import (
    UserLogin, Token, UserResponse,
    OrderCreate, OrderShiftRequest, OrderResponse,
    CustomerResponse, DashboardStats, NeedsAttentionResponse,
    ShopSettingsSchema
)
from auth import verify_password, create_access_token, get_current_user
import crud

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bepari & Brothers - Order Management API",
    version="1.0.0",
    description="Internal order tracking system for garment live selling"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    from auth import hash_password
    db = next(get_db())
    try:
        user = db.query(User).filter(User.email == "bepari@gmail.com").first()
        if not user:
            db_user = User(
                name="Bepari & Brothers",
                email="bepari@gmail.com",
                hashed_password=hash_password("Subho@123"),
                role="OWNER"
            )
            db.add(db_user)
            db.commit()
    except Exception as e:
        print(f"Startup seed exception: {e}")
    finally:
        db.close()

# Authentication Routes
@app.post("/api/auth/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    from auth import hash_password
    clean_email = login_data.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    # Fail-safe owner account auto-creation & password sync for cloud deployment
    if clean_email == "bepari@gmail.com" and login_data.password == "Subho@123":
        if not user:
            user = User(
                name="Bepari & Brothers",
                email="bepari@gmail.com",
                hashed_password=hash_password("Subho@123"),
                role="OWNER"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            user.hashed_password = hash_password("Subho@123")
            db.commit()
            db.refresh(user)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: Optional[User] = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

# Dashboard Endpoints
@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)

@app.get("/api/dashboard/attention", response_model=NeedsAttentionResponse)
def get_dashboard_attention(db: Session = Depends(get_db)):
    return crud.get_needs_attention(db)

# Order Endpoints
@app.get("/api/orders", response_model=List[OrderResponse])
def list_orders(
    search: Optional[str] = None,
    status: Optional[str] = None,
    source: Optional[str] = None,
    courier: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    return crud.get_orders(
        db, search=search, status=status, source=source, courier=courier, limit=limit, offset=offset
    )

@app.get("/api/orders/check-duplicate")
def check_duplicate_customer(phone: str = Query(...), db: Session = Depends(get_db)):
    res = crud.check_duplicate_customer(db, phone)
    if not res:
        return {"exists": False}
    return {"exists": True, "customer": res}

@app.post("/api/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    staff_name = current_user.name if current_user else "Staff"
    try:
        order = crud.create_order(db, order_data, created_by=staff_name)
        return crud.enrich_order_response(order, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/orders/{order_id}", response_model=OrderResponse)
def get_order_details(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return crud.enrich_order_response(order, db)

@app.post("/api/orders/{order_id}/shift", response_model=OrderResponse)
def shift_order(
    order_id: int,
    shift_data: OrderShiftRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    staff_name = current_user.name if current_user else "Staff"
    try:
        order = crud.shift_order(db, order_id, shift_data, updated_by=staff_name)
        return crud.enrich_order_response(order, db)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to shift order")

@app.post("/api/orders/{order_id}/notify", response_model=OrderResponse)
def notify_customer(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    staff_name = current_user.name if current_user else "Staff"
    try:
        order = crud.mark_notification_sent(db, order_id, updated_by=staff_name)
        return crud.enrich_order_response(order, db)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@app.post("/api/orders/{order_id}/deliver", response_model=OrderResponse)
def deliver_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    staff_name = current_user.name if current_user else "Staff"
    try:
        order = crud.deliver_order(db, order_id, updated_by=staff_name)
        return crud.enrich_order_response(order, db)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@app.delete("/api/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    try:
        crud.delete_order(db, order_id)
        return {"success": True, "message": f"Order #{order_id} deleted successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

# Customer Endpoints
@app.get("/api/customers", response_model=List[CustomerResponse])
def list_customers(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Customer)
    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (Customer.name.ilike(s)) | (Customer.phone.ilike(s))
        )
    customers = query.order_by(Customer.name.asc()).all()
    
    result = []
    for c in customers:
        orders = db.query(Order).filter(Order.customer_id == c.id).all()
        total_spent = sum(o.total_amount for o in orders)
        result.append({
            "id": c.id,
            "name": c.name,
            "phone": crud.format_phone_display(c.phone),
            "whatsapp_phone": c.whatsapp_phone,
            "address": c.address,
            "landmark": c.landmark,
            "city": c.city,
            "state": c.state,
            "pincode": c.pincode,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "order_count": len(orders),
            "total_spent": total_spent
        })
    return result

@app.get("/api/customers/{customer_id}")
def get_customer_profile(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    orders = db.query(Order).filter(Order.customer_id == customer_id).order_by(Order.created_at.desc()).all()
    enriched_orders = [crud.enrich_order_response(o, db) for o in orders]
    
    delivered_count = sum(1 for o in orders if o.status == "DELIVERED")
    active_count = sum(1 for o in orders if o.status in ["NEW", "SHIFTED"])
    total_spent = sum(o.total_amount for o in orders)
    
    return {
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "display_phone": crud.format_phone_display(customer.phone),
            "whatsapp_phone": customer.whatsapp_phone,
            "address": customer.address,
            "landmark": customer.landmark,
            "city": customer.city,
            "state": customer.state,
            "pincode": customer.pincode,
            "created_at": customer.created_at,
            "total_orders": len(orders),
            "delivered_orders": delivered_count,
            "active_orders": active_count,
            "total_spent": total_spent
        },
        "orders": enriched_orders
    }

# Settings Endpoints
@app.get("/api/settings", response_model=ShopSettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    return crud.get_shop_settings(db)

@app.put("/api/settings", response_model=ShopSettingsSchema)
def update_settings(data: ShopSettingsSchema, db: Session = Depends(get_db)):
    s = crud.get_shop_settings(db)
    s.shop_name = data.shop_name
    s.shop_phone = data.shop_phone
    s.whatsapp_number = data.whatsapp_number
    s.address = data.address
    s.default_country_code = data.default_country_code
    s.currency = data.currency
    s.timezone = data.timezone
    db.commit()
    db.refresh(s)
    return s
