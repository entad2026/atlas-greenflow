# Smart H2 Flow Forecast

A local Flask dashboard prototype for renewable-energy monitoring and simplified green-hydrogen flow forecasting.

## Features
- Arabic, French and English interface with RTL support for Arabic.
- Moroccan city selector.
- Weather forecast data from Open-Meteo when internet is available.
- Offline demo fallback if the weather service cannot be reached.
- Illustrative solar, wind, demand and hydrogen estimates.
- 24-hour and 48-hour forecast views.
- Chart.js visualization and translated operating statuses.

## Run on Windows
1. Install Python 3.10 or newer.
2. Open Command Prompt in this folder.
3. Create an environment:
   `py -m venv .venv`
4. Activate it:
   `.venv\Scripts\activate`
5. Install dependencies:
   `pip install -r requirements.txt`
6. Start:
   `python app.py`
7. Open `http://127.0.0.1:5000`

## Notes
This is an educational prototype, not an industrial energy-management controller. Solar, wind, demand, storage and hydrogen calculations are simplified illustrative estimates. Weather inputs are retrieved from Open-Meteo; if unavailable, demo weather values are used. Do not use these outputs for operational or safety-critical decisions.
