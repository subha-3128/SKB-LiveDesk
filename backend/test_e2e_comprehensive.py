import pytest
import time
from fastapi.testclient import TestClient
from main import app
from database import engine, Base, SessionLocal
from models import User
from auth import hash_password
from utils import normalize_phone, format_phone_display, build_shipping_whatsapp_message, generate_whatsapp_link

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_e2e_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    u = db.query(User).filter(User.email == "bepari@gmail.com").first()
    if not u:
        u = User(name="Bepari & Brothers", email="bepari@gmail.com", hashed_password=hash_password("Subho@123"))
        db.add(u)
        db.commit()
    db.close()
    yield

def test_10_year_qa_suite():
    print("\n--- 🕵️ Enterprise QA Test Suite Initialization ---")

    # 1. Phone Normalization Edge Cases
    assert normalize_phone("9876543210") == "+919876543210"
    assert normalize_phone("+91 98765 43210") == "+919876543210"
    assert normalize_phone("91 9876543210") == "+919876543210"
    assert format_phone_display("+919876543210") == "+91 98765 43210"
    
    # 2. Authentication Test
    login_res = client.post("/api/auth/login", json={"email": "bepari@gmail.com", "password": "Subho@123"})
    assert login_res.status_code == 200, "Login failed with valid credentials"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Bepari & Brothers"
    
    # Generate unique test phone
    unique_digits = str(int(time.time() * 1000))[-5:]
    test_phone = f"98765{unique_digits}"
    
    # 3. Duplicate Customer Lookup (Before order creation)
    dup_pre = client.get(f"/api/orders/check-duplicate?phone={test_phone}")
    assert dup_pre.status_code == 200
    assert dup_pre.json()["exists"] is False
    
    # 4. Create Order #1 (Customer: Smt. Priya Roy)
    order_payload = {
        "customer_name": "Priya Roy",
        "phone": test_phone,
        "whatsapp_phone": test_phone,
        "address": "74/A Gariahat Road, Ballygunge",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700019",
        "price": 1499,
        "source": "Instagram Live",
        "customer_notes": "Urgent delivery requested"
    }
    create_res = client.post("/api/orders", json=order_payload, headers=headers)
    assert create_res.status_code in [200, 201]
    ord_data = create_res.json()
    assert ord_data["status"] == "NEW"
    assert ord_data["total_amount"] == 1499.0
    order_id = ord_data["id"]
    
    # 5. Duplicate Customer Lookup (After order creation)
    dup_post = client.get(f"/api/orders/check-duplicate?phone={test_phone}")
    assert dup_post.status_code == 200
    assert dup_post.json()["exists"] is True
    assert dup_post.json()["customer"]["name"] == "Priya Roy"
    
    # 6. Shift Order via Courier
    shift_payload = {
        "courier": "eKart",
        "tracking_number": "EK99887766IN",
        "internal_notes": "Packed in bubble wrap"
    }
    shift_res = client.post(f"/api/orders/{order_id}/shift", json=shift_payload, headers=headers)
    assert shift_res.status_code == 200
    assert shift_res.json()["status"] == "SHIFTED"
    assert shift_res.json()["courier"] == "eKart"
    assert shift_res.json()["tracking_number"] == "EK99887766IN"
    
    # 7. WhatsApp Link Generator Verification
    wa_msg = build_shipping_whatsapp_message(
        customer_name="Priya Roy",
        order_number=ord_data["order_number"],
        courier="eKart",
        tracking_number="EK99887766IN",
        shop_name="Bepari & Brothers"
    )
    assert "https://www.ekartlogistics.in/track-order" in wa_msg
    assert "eKart" in wa_msg
    assert "EK99887766IN" in wa_msg
    
    # 8. Mark Notification Sent
    notify_res = client.post(f"/api/orders/{order_id}/notify", headers=headers)
    assert notify_res.status_code == 200
    assert notify_res.json()["notification_sent"] is True
    
    # 9. Deliver Order
    deliver_res = client.post(f"/api/orders/{order_id}/deliver", headers=headers)
    assert deliver_res.status_code == 200
    assert deliver_res.json()["status"] == "DELIVERED"
    
    # 10. Check Order Timeline Events
    get_order_res = client.get(f"/api/orders/{order_id}", headers=headers)
    assert get_order_res.status_code == 200
    events = get_order_res.json()["events"]
    assert len(events) >= 4
    event_types = [e["event_type"] for e in events]
    assert "ORDER_CREATED" in event_types
    assert "ORDER_SHIFTED" in event_types
    assert "CUSTOMER_NOTIFIED" in event_types
    assert "ORDER_DELIVERED" in event_types
    
    # 11. Search Order API
    search_res = client.get(f"/api/orders?search={test_phone}", headers=headers)
    assert search_res.status_code == 200
    assert len(search_res.json()) >= 1
    
    # 12. Dashboard Metrics Verification
    stats_res = client.get("/api/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    assert stats_res.json()["delivered_orders"] >= 1
    
    print("✅ All 12 Enterprise QA Integration Test Stages Passed 100% Cleanly!")
