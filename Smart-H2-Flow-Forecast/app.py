from flask import Flask, jsonify, render_template, request
from datetime import datetime, timezone
import math, random, requests

app = Flask(__name__)

CITIES = {
    "Rabat": {"name": "Rabat", "lat": 34.0209, "lon": -6.8416},
    "Casablanca": {"name": "Casablanca", "lat": 33.5731, "lon": -7.5898},
    "Tangier": {"name": "Tangier", "lat": 35.7595, "lon": -5.8340},
    "Marrakech": {"name": "Marrakech", "lat": 31.6295, "lon": -7.9811},
    "Agadir": {"name": "Agadir", "lat": 30.4278, "lon": -9.5981},
    "Dakhla": {"name": "Dakhla", "lat": 23.6848, "lon": -15.9570},
    "Laayoune": {"name": "Laayoune", "lat": 27.1536, "lon": -13.2033},
    "Fes": {"name": "Fes", "lat": 34.0331, "lon": -5.0003},
    "Oujda": {"name": "Oujda", "lat": 34.6814, "lon": -1.9086},
    "Essaouira": {"name": "Essaouira", "lat": 31.5085, "lon": -9.7595},
}

def weather_for(city):
    place = CITIES.get(city, CITIES["Rabat"])
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": place["lat"], "longitude": place["lon"],
        "current": "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,wind_direction_10m",
        "hourly": "shortwave_radiation,wind_speed_10m,temperature_2m,cloud_cover",
        "forecast_days": 2, "timezone": "Africa/Casablanca"
    }
    try:
        response = requests.get(url, params=params, timeout=7)
        response.raise_for_status()
        data = response.json()
        current = data.get("current", {})
        hourly = data.get("hourly", {})
        return {
            "source": "Open-Meteo",
            "temperature": current.get("temperature_2m", 22),
            "humidity": current.get("relative_humidity_2m", 45),
            "cloud": current.get("cloud_cover", 20),
            "wind": current.get("wind_speed_10m", 15),
            "wind_direction": current.get("wind_direction_10m", 0),
            "times": hourly.get("time", []),
            "radiation": hourly.get("shortwave_radiation", []),
            "winds": hourly.get("wind_speed_10m", []),
            "clouds": hourly.get("cloud_cover", []),
            "temperatures": hourly.get("temperature_2m", []),
        }
    except Exception:
        # Stable fallback keeps the dashboard usable without internet.
        seed = sum(ord(c) for c in city)
        rng = random.Random(seed)
        times = [f"{h:02d}:00" for h in range(48)]
        radiation = [max(0, 650 * math.sin(math.pi * ((h % 24) - 6) / 12)) if 6 <= h % 24 <= 18 else 0 for h in range(48)]
        winds = [round(10 + 8 * rng.random(), 1) for _ in range(48)]
        clouds = [round(15 + 55 * rng.random()) for _ in range(48)]
        return {
            "source": "Demo data (offline)", "temperature": 23, "humidity": 48,
            "cloud": 25, "wind": 14, "wind_direction": 270,
            "times": times, "radiation": radiation, "winds": winds,
            "clouds": clouds, "temperatures": [23 + 3 * math.sin(h / 24 * math.pi) for h in range(48)]
        }

def build_state(city="Rabat", hours=24):
    weather = weather_for(city)
    count = min(max(int(hours), 24), 48)
    times = weather["times"][:count]
    radiation = weather["radiation"][:count]
    winds = weather["winds"][:count]
    clouds = weather["clouds"][:count]
    solar, wind, demand, h2, status = [], [], [], [], []
    stored = 120.0  # kWh equivalent; illustrative initial storage
    for i in range(count):
        irr = float(radiation[i] or 0) if i < len(radiation) else 0
        ws = float(winds[i] or weather["wind"]) if i < len(winds) else weather["wind"]
        cloud = float(clouds[i] or 0) if i < len(clouds) else 0
        pv = max(0, 0.42 * irr * (1 - cloud / 150))  # illustrative 420 kWp plant
        wt = max(0, min(260, 0.55 * max(0, ws - 2) ** 2))  # illustrative wind curve
        load = 115 + 22 * (1 + math.sin((i % 24 - 7) * math.pi / 12)) + (18 if 18 <= i % 24 <= 22 else 0)
        balance = pv + wt - load
        if balance > 0:
            stored = min(300, stored + balance * 0.68)
            h2prod = balance * 0.32 / 52.0  # kg H2, simplified 52 kWh/kg
            label = "surplus"
        else:
            used = min(stored, abs(balance) * 0.75)
            stored -= used
            h2prod = 0
            label = "deficit" if abs(balance) > 10 else "balanced"
        solar.append(round(pv, 1)); wind.append(round(wt, 1))
        demand.append(round(load, 1)); h2.append(round(h2prod, 2)); status.append(label)
    return {
        "city": city, "weather": {k: weather[k] for k in ("source","temperature","humidity","cloud","wind","wind_direction")},
        "times": times, "solar": solar, "wind": wind, "demand": demand,
        "hydrogen": h2, "status": status, "storage": round(stored, 1),
        "totals": {
            "solar": round(sum(solar), 1), "wind": round(sum(wind), 1),
            "demand": round(sum(demand), 1), "hydrogen": round(sum(h2), 2)
        }
    }

@app.route("/")
def index():
    return render_template("index.html", cities=sorted(CITIES.keys()))

@app.route("/api/state")
def api_state():
    city = request.args.get("city", "Rabat")
    return jsonify(build_state(city, 24))

@app.route("/api/forecast")
def api_forecast():
    city = request.args.get("city", "Rabat")
    hours = request.args.get("hours", "24")
    try:
        hours = int(hours)
    except ValueError:
        hours = 24
    return jsonify(build_state(city, hours))

@app.route("/api/cities")
def api_cities():
    return jsonify(sorted(CITIES.keys()))

@app.route("/health")
def health():
    return jsonify({"status": "ok", "app": "Smart H2 Flow Forecast"})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
