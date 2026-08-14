import re
import urllib.parse

def normalize_phone(phone: str) -> str:
    """
    Normalizes phone number to standard E.164 string format (+91XXXXXXXXXX).
    Removes spaces, hyphens, and leading zeros.
    """
    if not phone:
        return ""
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        return f"+91{digits}"
    elif len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    elif phone.startswith("+"):
        return f"+{digits}"
    return f"+91{digits}" if digits else ""

def format_phone_display(phone: str) -> str:
    """
    Formats normalized +91XXXXXXXXXX to '+91 98765 43210' for display.
    """
    norm = normalize_phone(phone)
    if norm.startswith("+91") and len(norm) == 13:
        p = norm[3:]
        return f"+91 {p[:5]} {p[5:]}"
    return phone

def generate_whatsapp_link(phone: str, message: str = "") -> str:
    """
    Generates wa.me deep link.
    """
    norm = normalize_phone(phone)
    clean_num = norm.lstrip("+")
    if message:
        encoded_msg = urllib.parse.quote(message)
        return f"https://wa.me/{clean_num}?text={encoded_msg}"
    return f"https://wa.me/{clean_num}"

def build_shipping_whatsapp_message(customer_name: str, order_number: str, courier: str, tracking_number: str, shop_name: str = "Bepari & Brothers") -> str:
    """
    Builds customer shipping WhatsApp pre-filled message with tracking link.
    """
    tracking_link = "https://www.ekartlogistics.in/track-order"
    return (
        f"Hello {customer_name},\n\n"
        f"Your order has been shipped.\n\n"
        f"Courier: {courier}\n"
        f"Tracking ID: {tracking_number}\n"
        f"Tracking Link: {tracking_link}\n\n"
        f"Thank you for shopping with us ❤️\n"
        f"{shop_name}"
    )
