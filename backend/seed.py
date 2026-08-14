import datetime
from database import Base, engine, SessionLocal
from models import User, Customer, Order, OrderEvent, ShopSettings
from auth import hash_password

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Seed Shop Settings
    if not db.query(ShopSettings).first():
        settings = ShopSettings(
            shop_name="Sri Krishna Garments",
            shop_phone="+91 98765 00000",
            whatsapp_number="+91 98765 00000",
            address="12 MG Road, Park Street area, Kolkata, West Bengal 700016",
            default_country_code="+91",
            currency="INR",
            timezone="Asia/Kolkata"
        )
        db.add(settings)
        
    # 2. Seed Users
    if not db.query(User).filter(User.email == "staff@srikrishna.com").first():
        staff = User(
            name="Rahul Sen",
            email="staff@srikrishna.com",
            hashed_password=hash_password("password123"),
            role="STAFF"
        )
        owner = User(
            name="Sri Krishna Garments Admin",
            email="owner@srikrishna.com",
            hashed_password=hash_password("password123"),
            role="OWNER"
        )
        db.add_all([staff, owner])
        db.flush()
        
    # 3. Seed Customers (10 Indian customers)
    customers_data = [
        {"name": "Ananya Das", "phone": "+919876543210", "address": "Flat 4B, Greenview Apartments, Salt Lake Sector 1, Kolkata, WB 700064", "city": "Kolkata", "state": "West Bengal", "pincode": "700064"},
        {"name": "Priya Sharma", "phone": "+919830112233", "address": "15/A Gariahat Road, Near Mall, Kolkata, WB 700019", "city": "Kolkata", "state": "West Bengal", "pincode": "700019"},
        {"name": "Sunita Patel", "phone": "+919825098765", "address": "72 CG Road, Navrangpura, Ahmedabad, Gujarat 380009", "city": "Ahmedabad", "state": "Gujarat", "pincode": "380009"},
        {"name": "Kavita Roy", "phone": "+919845012345", "address": "204 Sunrise Towers, Indiranagar 100ft Road, Bengaluru, KA 560038", "city": "Bengaluru", "state": "Karnataka", "pincode": "560038"},
        {"name": "Meera Mukherjee", "phone": "+919748054321", "address": "88 Rashbehari Avenue, Kalighat, Kolkata, WB 700026", "city": "Kolkata", "state": "West Bengal", "pincode": "700026"},
        {"name": "Sneha Banerjee", "phone": "+919831099887", "address": "12 New Alipore Block M, Kolkata, WB 700053", "city": "Kolkata", "state": "West Bengal", "pincode": "700053"},
        {"name": "Ritu Ghosh", "phone": "+919804077665", "address": "45 Lake Gardens, Near Swimming Club, Kolkata, WB 700045", "city": "Kolkata", "state": "West Bengal", "pincode": "700045"},
        {"name": "Pooja Verma", "phone": "+919910011224", "address": "B-102 Vasant Kunj, Sector B, New Delhi 110070", "city": "New Delhi", "state": "Delhi", "pincode": "110070"},
        {"name": "Deepa Sundaram", "phone": "+919840033445", "address": "56 T. Nagar, Usman Road, Chennai, Tamil Nadu 600017", "city": "Chennai", "state": "Tamil Nadu", "pincode": "600017"},
        {"name": "Bhaswati Roy", "phone": "+919830567890", "address": "33 Jodhpur Park, Near Select Bookshop, Kolkata, WB 700068", "city": "Kolkata", "state": "West Bengal", "pincode": "700068"},
    ]

    customer_map = {}
    for c_data in customers_data:
        existing = db.query(Customer).filter(Customer.phone == c_data["phone"]).first()
        if not existing:
            c = Customer(
                name=c_data["name"],
                phone=c_data["phone"],
                whatsapp_phone=c_data["phone"],
                address=c_data["address"],
                city=c_data["city"],
                state=c_data["state"],
                pincode=c_data["pincode"]
            )
            db.add(c)
            db.flush()
            customer_map[c_data["phone"]] = c
        else:
            customer_map[c_data["phone"]] = existing
            
    db.commit()

    # 4. Seed 20 Orders
    if db.query(Order).count() == 0:
        now = datetime.datetime.utcnow()
        orders_spec = [
            # NEW ORDERS (6)
            {"cust": "+919876543210", "num": "ORD-0001", "prod": "Silk Cotton Churidar Set", "size": "M", "colour": "Maroon", "qty": 1, "price": 899.0, "source": "Instagram Live", "status": "NEW", "hours_ago": 2},
            {"cust": "+919830112233", "num": "ORD-0002", "prod": "Designer Anarkali Suit", "size": "L", "colour": "Royal Blue", "qty": 1, "price": 1499.0, "source": "Facebook Live", "status": "NEW", "hours_ago": 3},
            {"cust": "+919825098765", "num": "ORD-0003", "prod": "Bandhani Printed Kurti", "size": "S", "colour": "Mustard Yellow", "qty": 2, "price": 699.0, "source": "WhatsApp", "status": "NEW", "hours_ago": 5},
            {"cust": "+919845012345", "num": "ORD-0004", "prod": "Embroidery Chanderi Churidar", "size": "XL", "colour": "Emerald Green", "qty": 1, "price": 1299.0, "source": "Facebook Live", "status": "NEW", "hours_ago": 6},
            {"cust": "+919748054321", "num": "ORD-0005", "prod": "Georgette Straight Fit Kurti Set", "size": "XXL", "colour": "Peach", "qty": 1, "price": 999.0, "source": "Instagram Live", "status": "NEW", "hours_ago": 8},
            {"cust": "+919831099887", "num": "ORD-0006", "prod": "Rayon Festive Wear Churidar", "size": "M", "colour": "Wine Red", "qty": 1, "price": 799.0, "source": "WhatsApp", "status": "NEW", "hours_ago": 12},

            # SHIFTED ORDERS (7)
            {"cust": "+919804077665", "num": "ORD-0007", "prod": "Cotton Dailywear Churidar", "size": "L", "colour": "Navy Blue", "qty": 1, "price": 650.0, "source": "Facebook Live", "status": "SHIFTED", "courier": "DTDC", "tracking": "D88764210", "notified": True, "hours_ago": 24},
            {"cust": "+919910011224", "num": "ORD-0008", "prod": "Heavy Dupatta Dress Material", "size": "XL", "colour": "Magenta", "qty": 1, "price": 1850.0, "source": "Instagram Live", "status": "SHIFTED", "courier": "Delhivery", "tracking": "DEL10998234", "notified": False, "hours_ago": 30},
            {"cust": "+919840033445", "num": "ORD-0009", "prod": "Traditional Silk Blend Set", "size": "M", "colour": "Purple", "qty": 1, "price": 1599.0, "source": "WhatsApp", "status": "SHIFTED", "courier": "India Post", "tracking": "EW987123456IN", "notified": True, "hours_ago": 36},
            {"cust": "+919830567890", "num": "ORD-0010", "prod": "Floral Printed Kurti Set", "size": "S", "colour": "Sky Blue", "qty": 2, "price": 750.0, "source": "Facebook Live", "status": "SHIFTED", "courier": "DTDC", "tracking": "D99812401", "notified": False, "hours_ago": 40},
            {"cust": "+919876543210", "num": "ORD-0011", "prod": "Chanderi Silk Saree with Blouse", "size": "Free Size", "colour": "Beige Gold", "qty": 1, "price": 2200.0, "source": "Instagram Live", "status": "SHIFTED", "courier": "DTDC", "tracking": "D99812455", "notified": True, "hours_ago": 48},
            {"cust": "+919830112233", "num": "ORD-0012", "prod": "Palazzo Pant Churidar Set", "size": "L", "colour": "Teal", "qty": 1, "price": 1150.0, "source": "Facebook Live", "status": "SHIFTED", "courier": "Delhivery", "tracking": "DEL8821045", "notified": False, "hours_ago": 52},
            {"cust": "+919825098765", "num": "ORD-0013", "prod": "Gota Patti Work Suit", "size": "XXL", "colour": "Pink", "qty": 1, "price": 1399.0, "source": "WhatsApp", "status": "SHIFTED", "courier": "DTDC", "tracking": "D10023948", "notified": True, "hours_ago": 60},

            # DELIVERED ORDERS (7)
            {"cust": "+919845012345", "num": "ORD-0014", "prod": "Printed Rayon Kurti", "size": "XL", "colour": "Olive Green", "qty": 1, "price": 599.0, "source": "Facebook Live", "status": "DELIVERED", "courier": "DTDC", "tracking": "D7761023", "notified": True, "hours_ago": 96},
            {"cust": "+919748054321", "num": "ORD-0015", "prod": "Designer Churidar Dupatta Set", "size": "M", "colour": "Rust", "qty": 1, "price": 1100.0, "source": "Instagram Live", "status": "DELIVERED", "courier": "Delhivery", "tracking": "DEL5540192", "notified": True, "hours_ago": 120},
            {"cust": "+919831099887", "num": "ORD-0016", "prod": "Silk Anarkali Gown", "size": "L", "colour": "Navy", "qty": 1, "price": 2100.0, "source": "WhatsApp", "status": "DELIVERED", "courier": "DTDC", "tracking": "D6630198", "notified": True, "hours_ago": 140},
            {"cust": "+919804077665", "num": "ORD-0017", "prod": "Simple Daily Churidar", "size": "S", "colour": "Off White", "qty": 2, "price": 499.0, "source": "Facebook Live", "status": "DELIVERED", "courier": "India Post", "tracking": "EW102938475IN", "notified": True, "hours_ago": 160},
            {"cust": "+919910011224", "num": "ORD-0018", "prod": "Party Wear Georgette Kurti", "size": "XXL", "colour": "Black Gold", "qty": 1, "price": 1699.0, "source": "Instagram Live", "status": "DELIVERED", "courier": "Delhivery", "tracking": "DEL9920144", "notified": True, "hours_ago": 180},
            {"cust": "+919840033445", "num": "ORD-0019", "prod": "Casual Cotton Set", "size": "M", "colour": "Yellow", "qty": 1, "price": 699.0, "source": "WhatsApp", "status": "DELIVERED", "courier": "DTDC", "tracking": "D4490123", "notified": True, "hours_ago": 200},
            {"cust": "+919876543210", "num": "ORD-0020", "prod": "Embroidered Kurti Pants", "size": "M", "colour": "Coral", "qty": 1, "price": 899.0, "source": "Instagram Live", "status": "DELIVERED", "courier": "DTDC", "tracking": "D3320981", "notified": True, "hours_ago": 240},
        ]

        for spec in orders_spec:
            customer = customer_map[spec["cust"]]
            created_dt = now - datetime.timedelta(hours=spec["hours_ago"])
            shipped_dt = created_dt + datetime.timedelta(hours=4) if spec["status"] in ["SHIFTED", "DELIVERED"] else None
            delivered_dt = shipped_dt + datetime.timedelta(days=2) if spec["status"] == "DELIVERED" else None
            notified_dt = shipped_dt + datetime.timedelta(minutes=15) if spec.get("notified") else None

            tot = round(spec["qty"] * spec["price"], 2)
            order = Order(
                order_number=spec["num"],
                customer_id=customer.id,
                product_name=spec["prod"],
                product_sku=f"SKU-{spec['num']}",
                size=spec["size"],
                colour=spec["colour"],
                quantity=spec["qty"],
                price=spec["price"],
                total_amount=tot,
                source=spec["source"],
                status=spec["status"],
                courier=spec.get("courier"),
                tracking_number=spec.get("tracking"),
                shipping_date=shipped_dt,
                delivered_date=delivered_dt,
                notification_sent=spec.get("notified", False),
                notification_sent_at=notified_dt,
                created_at=created_dt,
                updated_at=created_dt
            )
            db.add(order)
            db.flush()

            # Add Timeline Events
            db.add(OrderEvent(
                order_id=order.id,
                event_type="ORDER_CREATED",
                description=f"Order {order.order_number} created for {customer.name}",
                created_at=created_dt,
                created_by="Rahul Sen"
            ))

            if shipped_dt:
                db.add(OrderEvent(
                    order_id=order.id,
                    event_type="ORDER_SHIFTED",
                    description=f"Order marked as Shifted via {order.courier} (Tracking: {order.tracking_number})",
                    created_at=shipped_dt,
                    created_by="Rahul Sen"
                ))

            if notified_dt:
                db.add(OrderEvent(
                    order_id=order.id,
                    event_type="CUSTOMER_NOTIFIED",
                    description="WhatsApp customer shipping notification marked as sent",
                    created_at=notified_dt,
                    created_by="Rahul Sen"
                ))

            if delivered_dt:
                db.add(OrderEvent(
                    order_id=order.id,
                    event_type="ORDER_DELIVERED",
                    description="Order successfully marked as DELIVERED to customer",
                    created_at=delivered_dt,
                    created_by="Rahul Sen"
                ))

        db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
