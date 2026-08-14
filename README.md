# Bepari &amp; Brothers — Live Stream Order Management System

A mobile-first internal order management web application built for **Bepari & Brothers** live stream selling (Instagram Live, Facebook Live, WhatsApp).

---

## 📌 Project Overview

This application streamlines post-receiving order tracking for retail garment sales:
- **Order Tracking**: Track order lifecycles from `NEW` → `SHIFTED` → `DELIVERED`.
- **Customer Management**: Automatic duplicate customer detection by phone number.
- **Shipping & WhatsApp Notifications**: Direct eKart tracking link integration and customer WhatsApp notification tracking.
- **Mobile Responsive Design**: Mobile top header, bottom navigation bar, and bottom-sheet touch controls.

---

## 🌟 Key Features

1. **Fast Order Entry**: Mandatory customer info, automatic phone lookup, and customizable order values.
2. **Order Lifecycle Control**:
   - `NEW`: Pending orders from live streams.
   - `SHIFTED`: Packed and dispatched orders with default eKart courier details & tracking IDs.
   - `DELIVERED`: Confirmed delivered customer orders.
3. **Customer WhatsApp Integration**: Generates ready-to-send WhatsApp messages with eKart order tracking links.
4. **Order Management & Safety**: Delete order capability for accidental entries with full history cleanup.
5. **Dashboard Analytics**: Real-time stats for pending, shifted, and delivered orders.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite
