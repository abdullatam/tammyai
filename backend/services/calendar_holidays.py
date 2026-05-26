import requests
from datetime import date, timedelta
import json

ALADHAN_BASE = "https://api.aladhan.com/v1"

def get_hijri_to_gregorian(hijri_year: int, hijri_month: int, hijri_day: int) -> str:
    """Convert Hijri date to Gregorian using Aladhan API"""
    try:
        url = f"{ALADHAN_BASE}/hToG/{hijri_day}-{hijri_month}-{hijri_year}"
        res = requests.get(url, timeout=5)
        data = res.json()
        if data["code"] == 200:
            d = data["data"]["gregorian"]
            return f"{d['year']}-{int(d['month']['number']):02d}-{int(d['day']):02d}"
    except Exception as e:
        print(f"Aladhan API error: {e}")
    return None

def get_islamic_year_for_gregorian(gregorian_year: int) -> int:
    """Get the approximate Hijri year for a Gregorian year"""
    return gregorian_year - 579

def get_all_holidays(year: int) -> list:
    events = []
    hijri_year = get_islamic_year_for_gregorian(year)

    # ─── FETCH ISLAMIC DATES FROM ALADHAN API ───
    islamic_dates = {
        "ramadan_start": get_hijri_to_gregorian(hijri_year, 9, 1),
        "eid_fitr": get_hijri_to_gregorian(hijri_year, 10, 1),
        "eid_adha": get_hijri_to_gregorian(hijri_year, 12, 10),
        "islamic_new_year": get_hijri_to_gregorian(hijri_year, 1, 1),
    }

    # ─── ISLAMIC HOLIDAYS ───
    if islamic_dates["ramadan_start"]:
        events.append({
            "title": "بداية شهر رمضان الكريم 🌙",
            "date": islamic_dates["ramadan_start"],
            "duration_days": 30,
            "type": "ramadan",
            "color": "#6B3FA0",
            "emoji": "🌙"
        })

    if islamic_dates["eid_fitr"]:
        events.append({
            "title": "عيد الفطر المبارك 🎉",
            "date": islamic_dates["eid_fitr"],
            "duration_days": 3,
            "type": "islamic",
            "color": "#E8A24B",
            "emoji": "🎉"
        })

    if islamic_dates["eid_adha"]:
        events.append({
            "title": "عيد الأضحى المبارك 🐑",
            "date": islamic_dates["eid_adha"],
            "duration_days": 4,
            "type": "islamic",
            "color": "#E8A24B",
            "emoji": "🐑"
        })

    if islamic_dates["islamic_new_year"]:
        events.append({
            "title": "رأس السنة الهجرية 🌙",
            "date": islamic_dates["islamic_new_year"],
            "duration_days": 1,
            "type": "islamic",
            "color": "#E8A24B",
            "emoji": "🌙"
        })

    # Remove None dates
    events = [e for e in events if e.get("date")]
    
    # Sort by date
    events.sort(key=lambda x: x["date"])
    
    return events
