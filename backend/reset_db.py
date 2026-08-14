import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models import User, Customer, Order, OrderEvent, ShopSettings
from auth import hash_password

def reset_database(keep_admin_user: bool = True):
    db = SessionLocal()
    
    print("Clearing all orders, order events, and customers...")
    db.query(OrderEvent).delete()
    db.query(Order).delete()
    db.query(Customer).delete()
    db.query(User).delete()
    
    db.commit()
    
    if keep_admin_user:
        print("Creating account for bepari@gmail.com...")
        user = User(
            name="Bepari & Brothers",
            email="bepari@gmail.com",
            hashed_password=hash_password("Subho@123"),
            role="OWNER"
        )
        db.add(user)
        db.commit()
        print("User created: bepari@gmail.com / Subho@123")
        
    print("Database reset to clean state successfully!")
    db.close()

if __name__ == "__main__":
    reset_database()
