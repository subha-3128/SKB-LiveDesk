import pytest
from fastapi.testclient import TestClient
from main import app
from database import engine, Base
from utils import normalize_phone, build_shipping_whatsapp_message

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_utils():
    norm = normalize_phone("+91 9876543210")
    assert "9876543210" in norm
    msg = build_shipping_whatsapp_message("Anita Roy", "ORD-0001", "eKart", "EK123456IN", "Bepari & Brothers")
    assert "Anita Roy" in msg
    assert "eKart" in msg
    assert "EK123456IN" in msg
    assert "Tracking Link: https://www.ekartlogistics.in/track-order" in msg
    assert "Bepari & Brothers" in msg

def test_create_shift_deliver_flow():
    payload = {
        "customer_name": "Sunita Das",
        "phone": "9876543210",
        "whatsapp_phone": "9876543210",
        "address": "Kolkata, WB",
        "price": 1200,
        "source": "Instagram Live"
    }
    res = client.post("/api/orders", json=payload)
    assert res.status_code in [200, 201]
    data = res.json()
    assert data["status"] == "NEW"
    order_id = data["id"]

    shift_res = client.post(f"/api/orders/{order_id}/shift", json={
        "courier": "eKart",
        "tracking_number": "EK123456IN"
    })
    assert shift_res.status_code == 200
    assert shift_res.json()["status"] == "SHIFTED"

    deliver_res = client.post(f"/api/orders/{order_id}/deliver")
    assert deliver_res.status_code == 200
    assert deliver_res.json()["status"] == "DELIVERED"

def test_dashboard_apis():
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    assert "new_orders" in res.json()

def test_delete_order():
    res = client.post("/api/orders", json={
        "customer_name": "Test Mistake Customer",
        "phone": "9998887776",
        "whatsapp_phone": "9998887776",
        "address": "Test Address",
        "price": 500,
        "source": "Instagram Live"
    })
    assert res.status_code in [200, 201]
    ord_id = res.json()["id"]

    del_res = client.delete(f"/api/orders/{ord_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    get_res = client.get(f"/api/orders/{ord_id}")
    assert get_res.status_code == 404
