const translations = {
  en: {
    subtitle:"Renewable energy intelligence", live:"Live dashboard", eyebrow:"RENEWABLE ENERGY MANAGEMENT",
    heading:"Smart energy. Smarter hydrogen.", intro:"Monitor solar and wind production, demand and green hydrogen flow.",
    city:"Moroccan city", horizon:"Forecast", temperature:"Temperature", cloud:"Cloud cover", windSpeed:"Wind speed",
    weatherSource:"Weather source", overview:"SYSTEM OVERVIEW", performance:"Energy performance",
    solar:"Solar production", wind:"Wind production", demand:"Energy demand", hydrogen:"Green hydrogen",
    forecastTotal:"forecast total", estimated:"estimated", productionDemand:"Production vs demand",
    productionDesc:"Hourly renewable energy balance", optimizer:"Smart optimizer",
    optimizerDesc:"Hydrogen storage strategy", renewables:"Renewables",
    renewablesDesc:"Solar + wind generation", electrolyzer:"Electrolyzer",
    electrolyzerDesc:"Surplus electricity → H₂", smartDispatch:"Smart dispatch",
    storage:"Hydrogen storage", storageLevel:"Illustrative stored energy", systemStatus:"System status",
    forecastTitle:"Forecast details", forecastDesc:"Expected hourly generation and operating condition",
    time:"Time", status:"Status", surplus:"Surplus", deficit:"Deficit", balanced:"Balanced",
    disclaimer:"Educational prototype · Energy and hydrogen values are simplified estimates."
  },
  fr: {
    subtitle:"Intelligence des énergies renouvelables", live:"Tableau de bord en direct", eyebrow:"GESTION DES ÉNERGIES RENOUVELABLES",
    heading:"Énergie intelligente. Hydrogène intelligent.", intro:"Suivez la production solaire et éolienne, la demande et le flux d’hydrogène vert.",
    city:"Ville marocaine", horizon:"Prévision", temperature:"Température", cloud:"Couverture nuageuse", windSpeed:"Vitesse du vent",
    weatherSource:"Source météo", overview:"VUE D’ENSEMBLE", performance:"Performance énergétique",
    solar:"Production solaire", wind:"Production éolienne", demand:"Demande énergétique", hydrogen:"Hydrogène vert",
    forecastTotal:"total prévu", estimated:"estimé", productionDemand:"Production vs demande",
    productionDesc:"Bilan horaire des énergies renouvelables", optimizer:"Optimiseur intelligent",
    optimizerDesc:"Stratégie de stockage d’hydrogène", renewables:"Énergies renouvelables",
    renewablesDesc:"Production solaire + éolienne", electrolyzer:"Électrolyseur",
    electrolyzerDesc:"Électricité excédentaire → H₂", smartDispatch:"Gestion intelligente",
    storage:"Stockage d’hydrogène", storageLevel:"Stockage illustratif", systemStatus:"État du système",
    forecastTitle:"Détails des prévisions", forecastDesc:"Production horaire prévue et état de fonctionnement",
    time:"Heure", status:"État", surplus:"Excédent", deficit:"Déficit", balanced:"Équilibré",
    disclaimer:"Prototype éducatif · Les valeurs d’énergie et d’hydrogène sont des estimations simplifiées."
  },
  ar: {
    subtitle:"ذكاء الطاقات المتجددة", live:"لوحة تحكم مباشرة", eyebrow:"تدبير الطاقات المتجددة",
    heading:"طاقة ذكية، وهيدروجين أكثر ذكاءً.", intro:"تتبع إنتاج الطاقة الشمسية والريحية والطلب وتدفق الهيدروجين الأخضر.",
    city:"مدينة مغربية", horizon:"التوقعات", temperature:"درجة الحرارة", cloud:"الغطاء السحابي", windSpeed:"سرعة الرياح",
    weatherSource:"مصدر الطقس", overview:"نظرة عامة على النظام", performance:"أداء الطاقة",
    solar:"إنتاج الطاقة الشمسية", wind:"إنتاج طاقة الرياح", demand:"الطلب على الطاقة", hydrogen:"الهيدروجين الأخضر",
    forecastTotal:"إجمالي التوقعات", estimated:"تقديري", productionDemand:"الإنتاج مقابل الطلب",
    productionDesc:"توازن الطاقات المتجددة حسب الساعة", optimizer:"المحسّن الذكي",
    optimizerDesc:"استراتيجية تخزين الهيدروجين", renewables:"الطاقات المتجددة",
    renewablesDesc:"إنتاج الطاقة الشمسية والريحية", electrolyzer:"المحلل الكهربائي",
    electrolyzerDesc:"الكهرباء الفائضة ← H₂", smartDispatch:"تدبير ذكي",
    storage:"تخزين الهيدروجين", storageLevel:"مستوى تخزين توضيحي", systemStatus:"حالة النظام",
    forecastTitle:"تفاصيل التوقعات", forecastDesc:"الإنتاج المتوقع كل ساعة وحالة التشغيل",
    time:"الوقت", status:"الحالة", surplus:"فائض الطاقة", deficit:"عجز الطاقة", balanced:"تشغيل متوازن",
    disclaimer:"نموذج تعليمي أولي · قيم الطاقة والهيدروجين تقديرية ومبسطة."
  }
};

let energyChart = null;
let currentData = null;
let currentLanguage = "en";

function setLanguage(lang) {
  currentLanguage = translations[lang] ? lang : "en";
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[currentLanguage][key]) el.textContent = translations[currentLanguage][key];
  });
  if (currentData) renderForecast(currentData);
  updateChartLanguage();
}

function statusLabel(status) {
  return translations[currentLanguage][status] || status;
}

function renderForecast(data) {
  currentData = data;
  const t = translations[currentLanguage];
  document.getElementById("temperature").textContent = `${data.weather.temperature} °C`;
  document.getElementById("cloud").textContent = `${data.weather.cloud} %`;
  document.getElementById("windSpeed").textContent = `${data.weather.wind} km/h`;
  document.getElementById("weatherSource").textContent = data.weather.source;
  document.getElementById("solarKpi").textContent = data.totals.solar.toLocaleString();
  document.getElementById("windKpi").textContent = data.totals.wind.toLocaleString();
  document.getElementById("demandKpi").textContent = data.totals.demand.toLocaleString();
  document.getElementById("hydrogenKpi").textContent = data.totals.hydrogen.toLocaleString();
  document.getElementById("renewableTotal").textContent = `${(data.totals.solar + data.totals.wind).toLocaleString()} kWh`;
  document.getElementById("storageKpi").textContent = `${data.storage} kWh`;
  const sum = data.totals.solar + data.totals.wind - data.totals.demand;
  const overall = sum > 20 ? "surplus" : sum < -20 ? "deficit" : "balanced";
  const statusEl = document.getElementById("systemStatus");
  statusEl.textContent = statusLabel(overall);
  statusEl.className = `status ${overall}`;
  document.getElementById("forecastBadge").textContent = `${data.times.length} h`;
  document.getElementById("updated").textContent = new Date().toLocaleTimeString();
  const rows = data.times.map((time, i) => `
    <tr><td>${String(time).slice(-5)}</td><td>${data.solar[i]} kWh</td>
    <td>${data.wind[i]} kWh</td><td>${data.demand[i]} kWh</td>
    <td>${data.hydrogen[i]} kg</td><td><span class="status ${data.status[i]}">${statusLabel(data.status[i])}</span></td></tr>`).join("");
  document.getElementById("forecastRows").innerHTML = rows;
  drawChart(data);
}

function drawChart(data) {
  const ctx = document.getElementById("energyChart");
  if (energyChart) energyChart.destroy();
  energyChart = new Chart(ctx, {
    type: "line",
    data: { labels: data.times.map(x => String(x).slice(-5)), datasets: [
      { label: translations[currentLanguage].solar, data: data.solar, borderColor:"#e9a23b", backgroundColor:"rgba(233,162,59,.12)", fill:true, tension:.35 },
      { label: translations[currentLanguage].wind, data: data.wind, borderColor:"#27a99a", backgroundColor:"rgba(39,169,154,.08)", fill:true, tension:.35 },
      { label: translations[currentLanguage].demand, data: data.demand, borderColor:"#64748b", borderDash:[6,5], fill:false, tension:.3 }
    ]},
    options: { responsive:true, maintainAspectRatio:false, interaction:{mode:"index",intersect:false},
      plugins:{legend:{position:"bottom"}}, scales:{y:{beginAtZero:true,title:{display:true,text:"kWh"}},x:{ticks:{maxTicksLimit:12,maxRotation:0}}}}
  });
}

function updateChartLanguage() {
  if (currentData) drawChart(currentData);
}

async function loadDashboard() {
  const city = document.getElementById("city").value;
  const hours = document.getElementById("horizon").value;
  try {
    const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}&hours=${hours}`);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();
    renderForecast(data);
  } catch (error) {
    console.error("Dashboard loading failed:", error);
    document.getElementById("forecastRows").innerHTML = `<tr><td colspan="6">Unable to load data. Check that the Flask server is running.</td></tr>`;
  }
}

document.getElementById("language").addEventListener("change", e => setLanguage(e.target.value));
document.getElementById("city").addEventListener("change", loadDashboard);
document.getElementById("horizon").addEventListener("change", loadDashboard);
setLanguage("en");
loadDashboard();
