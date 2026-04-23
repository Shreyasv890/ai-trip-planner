import { useState, useEffect, useRef } from "react";

const API = "https://ai-trip-backend-oxo5.onrender.com/api"; // Change if your backend is on a different URL

async function callGroq(prompt) {
  const res = await fetch(`${API}/auth/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "AI generation failed");
  return data.result;
}

function inp(extra = {}) {
  return {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", background: "#fff",
    color: "#1e293b", fontSize: 14, outline: "none",
    fontFamily: "inherit", transition: "border-color 0.2s", ...extra,
  };
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "22px 20px", boxShadow: "0 2px 20px rgba(0,0,0,0.08)", border: "1px solid #e8edf4", marginBottom: 18, ...style }}>
      {children}
    </div>
  );
}

function Badge({ text, color }) {
  return <span style={{ background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{text}</span>;
}

// ── AUTH PAGE ──────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch { setError("Cannot connect to server. Make sure backend is running on port 5000."); }
    setLoading(false);
  }

  async function handleSignup() {
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("Please fill all fields."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); setLoading(false); return; }
      setSuccess("Account created! Please login."); setTab("login");
      setForm(f => ({ ...f, password: "", confirm: "" }));
    } catch { setError("Cannot connect to server. Make sure backend is running on port 5000."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e3a8a,#1e293b,#312e81)", display: "flex", flexDirection: "column", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap'); *{box-sizing:border-box} input:focus{border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,0.15)}`}</style>
      <div style={{ padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✈️</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>AI Trip Planner</span>
        </div>
        <span style={{ fontSize: 11, background: "rgba(255,255,255,0.1)", color: "#94a3b8", padding: "4px 12px", borderRadius: 20, fontWeight: 700 }}>College Project</span>
      </div>
      <div style={{ textAlign: "center", padding: "24px 24px 16px" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🌍</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: "#fff" }}>Plan Trips with AI</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Itineraries · Maps · Weather · Hotels · Cost Estimation</p>
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "0 16px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", height: "fit-content" }}>
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {["login","signup"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", background: tab === t ? "#2563eb" : "none", color: tab === t ? "#fff" : "#64748b", transition: "all 0.2s" }}>
                {t === "login" ? "🔑 Login" : "📝 Sign Up"}
              </button>
            ))}
          </div>
          {success && <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "10px 14px", color: "#166534", fontWeight: 600, fontSize: 13, marginBottom: 14 }}>✅ {success}</div>}
          {error && <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontWeight: 600, fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}
          {tab === "login" ? (
            <>
              <h2 style={{ margin: "0 0 20px", fontWeight: 800, color: "#1e293b", fontSize: 20 }}>Welcome Back 👋</h2>
              {[["EMAIL","email","you@email.com","email"],["PASSWORD","password","••••••••","password"]].map(([label,key,ph,type]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.04em" }}>{label}</label>
                  <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleLogin()} style={inp()} />
                </div>
              ))}
              <button onClick={handleLogin} disabled={loading}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Logging in…" : "Login →"}
              </button>
              <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 16, marginBottom: 0 }}>
                No account? <button onClick={() => setTab("signup")} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign Up</button>
              </p>
            </>
          ) : (
            <>
              <h2 style={{ margin: "0 0 20px", fontWeight: 800, color: "#1e293b", fontSize: 20 }}>Create Account 🚀</h2>
              {[["FULL NAME","name","Your name","text"],["EMAIL","email","you@email.com","email"],["PASSWORD","password","••••••••","password"],["CONFIRM PASSWORD","confirm","••••••••","password"]].map(([label,key,ph,type]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.04em" }}>{label}</label>
                  <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleSignup()} style={inp()} />
                </div>
              ))}
              <button onClick={handleSignup} disabled={loading}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#059669,#0891b2)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Creating…" : "Create Account →"}
              </button>
              <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 16, marginBottom: 0 }}>
                Already registered? <button onClick={() => setTab("login")} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Login</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NAVBAR ─────────────────────────────────────────────────────
function Navbar({ user, activePage, setPage, onLogout }) {
  const menus = [
    { id: "home", label: "🏠 Home" },
    { id: "planner", label: "✈️ Plan Trip" },
    { id: "weather", label: "🌤️ Weather" },
    { id: "map", label: "🗺️ Map" },
    { id: "hotels", label: "🏨 Hotels" },
    { id: "profile", label: "👤 Profile" },
    { id: "about", label: "ℹ️ About" },
  ];
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✈️</div>
          <span style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>AI Trip Planner</span>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center", overflowX: "auto" }}>
          {menus.map(m => (
            <button key={m.id} onClick={() => setPage(m.id)}
              style={{ padding: "7px 10px", borderRadius: 9, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: activePage === m.id ? "#eff6ff" : "none", color: activePage === m.id ? "#2563eb" : "#64748b", whiteSpace: "nowrap" }}>
              {m.label}
            </button>
          ))}
          <div style={{ width: 1, height: 22, background: "#e2e8f0", margin: "0 4px" }} />
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
            {user.name[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>{user.name}</span>
          <button onClick={onLogout} style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", color: "#64748b", fontFamily: "inherit", whiteSpace: "nowrap" }}>Logout</button>
        </div>
      </div>
    </div>
  );
}

// ── HOME PAGE ──────────────────────────────────────────────────
function HomePage({ user, setPage }) {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#1e293b,#312e81)", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🌍</div>
        <h1 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 800, color: "#fff" }}>Welcome, {user.name}! 👋</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.6 }}>Your AI travel companion. Plan trips, check weather, find hotels — all in one place.</p>
        <button onClick={() => setPage("planner")} style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
          ✨ Plan a New Trip
        </button>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 16px" }}>
        <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 18, margin: "0 0 16px" }}>🚀 Quick Access</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
          {[{id:"planner",emoji:"✈️",title:"Plan Trip",desc:"AI itinerary",color:"#2563eb"},{id:"weather",emoji:"🌤️",title:"Weather",desc:"Live forecast",color:"#0ea5e9"},{id:"map",emoji:"🗺️",title:"Maps",desc:"Explore places",color:"#059669"},{id:"hotels",emoji:"🏨",title:"Hotels",desc:"Find stays",color:"#d97706"},{id:"profile",emoji:"👤",title:"Profile",desc:"Your history",color:"#7c3aed"}].map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ padding: "20px 16px", borderRadius: 16, border: `2px solid ${item.color}20`, background: `${item.color}08`, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontWeight: 800, color: item.color, fontSize: 14 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{item.desc}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 24, background: "#1e293b", borderRadius: 18, padding: "20px" }}>
          <h3 style={{ margin: "0 0 14px", fontWeight: 800, color: "#fff", fontSize: 15 }}>🧠 Tech Stack</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[{l:"Frontend",v:"React.js",e:"⚛️",c:"#61dafb"},{l:"Backend",v:"Node.js + Express",e:"🟢",c:"#86efac"},{l:"Database",v:"MongoDB",e:"🍃",c:"#4ade80"},{l:"AI",v:"Groq API (Free)",e:"🤖",c:"#a78bfa"},{l:"Maps",v:"Google Maps",e:"🗺️",c:"#fbbf24"},{l:"Weather",v:"Open-Meteo API",e:"🌤️",c:"#38bdf8"}].map(t => (
              <div key={t.l} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 12px", border: `1px solid ${t.c}30` }}>
                <div style={{ fontSize: 16 }}>{t.e}</div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 3 }}>{t.l}</div>
                <div style={{ fontWeight: 800, color: t.c, fontSize: 13 }}>{t.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WEATHER PAGE ───────────────────────────────────────────────
function WeatherPage({ defaultCity = "" }) {
  const [city, setCity] = useState(defaultCity);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (defaultCity) fetchWeather(defaultCity); }, [defaultCity]);

  async function fetchWeather(c = city) {
    if (!c) return;
    setLoading(true); setError(""); setData(null);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(c)}&count=1`);
      const geo = await geoRes.json();
      if (!geo.results?.length) { setError("City not found."); setLoading(false); return; }
      const { latitude, longitude, name, country } = geo.results[0];
      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=auto&forecast_days=5`);
      const w = await wRes.json();
      const cur = w.current; const d = w.daily;
      const decode = (code) => {
        if (code === 0) return { desc: "Clear Sky", emoji: "☀️" };
        if (code <= 3) return { desc: "Partly Cloudy", emoji: "⛅" };
        if (code <= 48) return { desc: "Foggy", emoji: "🌫️" };
        if (code <= 57) return { desc: "Drizzle", emoji: "🌦️" };
        if (code <= 67) return { desc: "Rain", emoji: "🌧️" };
        if (code <= 77) return { desc: "Snow", emoji: "❄️" };
        if (code <= 82) return { desc: "Rain Showers", emoji: "🌧️" };
        if (code <= 99) return { desc: "Thunderstorm", emoji: "⛈️" };
        return { desc: "Unknown", emoji: "🌡️" };
      };
      setData({
        city: name, country,
        temp: Math.round(cur.temperature_2m), feels: Math.round(cur.apparent_temperature),
        humidity: cur.relative_humidity_2m, wind: Math.round(cur.wind_speed_10m),
        visibility: cur.visibility ? Math.round(cur.visibility / 1000) : "N/A",
        ...decode(cur.weather_code),
        forecast: d.time.map((date, i) => ({ date, max: Math.round(d.temperature_2m_max[i]), min: Math.round(d.temperature_2m_min[i]), rain: d.precipitation_sum[i], ...decode(d.weather_code[i]) })),
      });
    } catch { setError("Failed to fetch weather."); }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 16px" }}>🌤️ Live Weather</h2>
      <Card>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchWeather()}
            placeholder="Enter city e.g. Mumbai, Tokyo" style={{ ...inp(), flex: 1 }} />
          <button onClick={() => fetchWeather()} style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0ea5e9,#2563eb)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            {loading ? "…" : "Search"}
          </button>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10, marginBottom: 0 }}>⚠️ {error}</p>}
      </Card>
      {data && (
        <>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 54 }}>{data.emoji}</div>
                <div style={{ fontWeight: 900, fontSize: 34, color: "#1e293b", lineHeight: 1 }}>{data.temp}°C</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{data.desc}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>{data.city}, {data.country}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                  {[["Feels Like",`${data.feels}°C`],["Humidity",`${data.humidity}%`],["Wind",`${data.wind} km/h`],["Visibility",`${data.visibility} km`]].map(([l,v]) => (
                    <div key={l} style={{ background: "#f1f5f9", borderRadius: 10, padding: "8px 12px" }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{l}</div>
                      <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          <h3 style={{ fontWeight: 800, color: "#1e293b", fontSize: 16, margin: "0 0 10px" }}>📅 5-Day Forecast</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {data.forecast.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "12px 6px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #e8edf4" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{new Date(f.date).toLocaleDateString("en", { weekday: "short" })}</div>
                <div style={{ fontSize: 24, margin: "6px 0" }}>{f.emoji}</div>
                <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>{f.max}°</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{f.min}°</div>
                {f.rain > 0 && <div style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 700, marginTop: 3 }}>💧{f.rain}mm</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── MAP PAGE ───────────────────────────────────────────────────
function MapPage({ defaultLocation = "India" }) {
  const [search, setSearch] = useState(defaultLocation);
  const [location, setLocation] = useState(defaultLocation);
  const query = encodeURIComponent(location);
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 16px" }}>🗺️ Explore on Map</h2>
      <Card>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && search.trim()) setLocation(search.trim()); }}
            placeholder="Search city e.g. Goa, India" style={{ ...inp(), flex: 1 }} />
          <button onClick={() => { if (search.trim()) setLocation(search.trim()); }}
            style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#059669,#0891b2)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            🔍 Search
          </button>
        </div>
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <iframe key={location} title="map" width="100%" height="400" frameBorder="0" style={{ display: "block" }}
            src={`https://maps.google.com/maps?q=${query}&output=embed&z=12`} allowFullScreen />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {[["🏨 Hotels","hotels"],["🍽️ Restaurants","restaurants"],["🏛️ Attractions","tourist attractions"],["🛍️ Shopping","shopping malls"],["🏥 Hospitals","hospitals"],["⛽ Petrol","petrol stations"]].map(([label, type]) => (
            <a key={type} href={`https://www.google.com/maps/search/${encodeURIComponent(type)}+in+${query}`} target="_blank" rel="noreferrer"
              style={{ padding: "7px 14px", borderRadius: 10, background: "#f1f5f9", color: "#475569", fontWeight: 700, fontSize: 12, textDecoration: "none", border: "1px solid #e2e8f0" }}>
              {label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── HOTELS PAGE ────────────────────────────────────────────────
function HotelsPage({ defaultCity = "" }) {
  const [city, setCity] = useState(defaultCity);
  const [budget, setBudget] = useState("mid");
  const [hotels, setHotels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (defaultCity) findHotels(defaultCity); }, [defaultCity]);

  async function findHotels(c = city) {
    if (!c) return;
    setLoading(true); setHotels(null); setError("");
    try {
      const prompt = `Suggest 6 real hotels in ${c} for ${budget} budget travelers.
Return ONLY valid JSON (no markdown):
{ "hotels": [{ "name":"Hotel Name", "type":"Budget", "price":"₹800/night", "area":"Area Name", "rating":"4.2/5", "highlight":"key feature", "amenities":["WiFi","AC","Breakfast"], "phone":"+91-XXXXXXXXXX", "website":"website.com", "description":"2 sentence description of the hotel" }] }`;
      const raw = await callGroq(prompt);
      const parsed = JSON.parse(raw);
      setHotels(parsed.hotels);
    } catch (e) { setError("Could not fetch hotels: " + e.message); }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 16px" }}>🏨 Hotel Suggestions</h2>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 12 }}>
          <input value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === "Enter" && findHotels()}
            placeholder="Enter city e.g. Goa, Mumbai, Delhi" style={inp()} />
          <select value={budget} onChange={e => setBudget(e.target.value)} style={{ ...inp(), width: 130 }}>
            <option value="budget">🎒 Budget</option>
            <option value="mid">🏨 Mid-Range</option>
            <option value="luxury">✨ Luxury</option>
          </select>
        </div>
        <button onClick={() => findHotels()} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#d97706,#dc2626)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          {loading ? "Finding hotels…" : "🏨 Find Hotels"}
        </button>
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10, marginBottom: 0 }}>⚠️ {error}</p>}
      </Card>
      {loading && <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: 40 }}>🏨</div><p style={{ color: "#64748b", marginTop: 12 }}>Finding best hotels in {city}…</p></div>}
      {hotels?.map((h, i) => {
        const c = h.type === "Budget" ? "#059669" : h.type === "Luxury" ? "#d97706" : "#2563eb";
        return (
          <Card key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, color: "#1e293b", fontSize: 15 }}>🏨 {h.name}</span>
                  <Badge text={h.type} color={c} />
                </div>
                <div style={{ fontSize: 13, color: "#64748b" }}>📍 {h.area} · ⭐ {h.rating}</div>
                {h.description && <div style={{ fontSize: 13, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{h.description}</div>}
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>✨ {h.highlight}</div>
                {h.phone && <div style={{ fontSize: 12, color: "#2563eb", marginTop: 3 }}>📞 {h.phone}</div>}
                {h.website && <div style={{ fontSize: 12, color: "#2563eb", marginTop: 2 }}>🌐 {h.website}</div>}
                {h.amenities?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {h.amenities.map((a, j) => <span key={j} style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>✓ {a}</span>)}
                  </div>
                )}
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name + " " + city)}`} target="_blank" rel="noreferrer"
                  style={{ display: "inline-block", marginTop: 10, padding: "6px 14px", borderRadius: 8, background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                  📍 View on Maps →
                </a>
              </div>
              <div style={{ fontWeight: 900, color: c, fontSize: 16, whiteSpace: "nowrap" }}>{h.price}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── PROFILE PAGE ───────────────────────────────────────────────
function ProfilePage({ user, setPage }) {
  const history = JSON.parse(localStorage.getItem("tripHistory") || "[]");

  function clearHistory() {
    localStorage.removeItem("tripHistory");
    window.location.reload();
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 16px" }}>👤 My Profile</h2>

      {/* User Info */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 28, flexShrink: 0 }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 20 }}>{user.name}</div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>📧 {user.email}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>🗓️ Member since {new Date().getFullYear()}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
          {[{ label: "Trips Planned", value: history.length, emoji: "✈️", color: "#2563eb" }, { label: "Cities Visited", value: [...new Set(history.map(h => h.location))].length, emoji: "🌍", color: "#059669" }, { label: "Days Planned", value: history.reduce((s, h) => s + (parseInt(h.days) || 0), 0), emoji: "📅", color: "#d97706" }].map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, borderRadius: 12, padding: "12px", textAlign: "center", border: `1.5px solid ${s.color}20` }}>
              <div style={{ fontSize: 22 }}>{s.emoji}</div>
              <div style={{ fontWeight: 900, color: s.color, fontSize: 22 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trip History */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontWeight: 800, color: "#1e293b", fontSize: 16 }}>📋 Trip History</h3>
          {history.length > 0 && (
            <button onClick={clearHistory} style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              🗑️ Clear All
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 40 }}>✈️</div>
            <p style={{ marginTop: 12, fontSize: 14 }}>No trips planned yet.</p>
            <button onClick={() => setPage("planner")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
              Plan Your First Trip
            </button>
          </div>
        ) : (
          history.slice().reverse().map((trip, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 15 }}>📍 {trip.location}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    📅 {trip.days} days · 👥 {trip.travelers} traveler(s) · 💰 {trip.currency} {trip.budget}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>🕐 {new Date(trip.date).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <Badge text={trip.tripType} color="#2563eb" />
              </div>
              {trip.title && <div style={{ fontSize: 13, color: "#475569", marginTop: 6, fontStyle: "italic" }}>"{trip.title}"</div>}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

// ── ABOUT PAGE ─────────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <Card style={{ background: "linear-gradient(135deg,#1e3a8a,#1e293b)", border: "none" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52 }}>✈️</div>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 22, margin: "10px 0 8px" }}>AI Trip Planner</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: 0 }}>An AI-powered travel planning web application built as a college project.</p>
        </div>
      </Card>
      <Card>
        <h3 style={{ fontWeight: 800, color: "#1e293b", fontSize: 16, margin: "0 0 14px" }}>🎯 Features</h3>
        {[["✈️ AI Trip Planner","Day-wise itineraries with hotels, maps & weather inside"],["🌤️ Live Weather","Real-time weather via Open-Meteo API (Free)"],["🗺️ Maps","Google Maps with nearby places search"],["🏨 Hotels","Full hotel details with phone, website & amenities"],["💰 Cost Estimation","Smart budget breakdown per category"],["📥 Download Trip","Download your trip as HTML file for offline use"],["👤 Profile","View trip history and user information"],["🔐 Auth System","Signup/Login with MongoDB + JWT tokens"]].map(([t,d]) => (
          <div key={t} style={{ display: "flex", gap: 12, marginBottom: 10, padding: "10px 14px", background: "#f8fafc", borderRadius: 10 }}>
            <div><div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{t}</div><div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{d}</div></div>
          </div>
        ))}
      </Card>
      <Card style={{ background: "#1e293b", border: "none" }}>
        <h3 style={{ fontWeight: 800, color: "#fff", fontSize: 15, margin: "0 0 14px" }}>🧠 Tech Stack</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{l:"Frontend",v:"React.js",e:"⚛️",c:"#61dafb"},{l:"Backend",v:"Node.js + Express",e:"🟢",c:"#86efac"},{l:"Database",v:"MongoDB",e:"🍃",c:"#4ade80"},{l:"Auth",v:"JWT + bcrypt",e:"🔐",c:"#f472b6"},{l:"AI Engine",v:"Groq API (Free)",e:"🤖",c:"#a78bfa"},{l:"Weather",v:"Open-Meteo API",e:"🌤️",c:"#38bdf8"}].map(t => (
            <div key={t.l} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 12px", border: `1px solid ${t.c}30` }}>
              <div style={{ fontSize: 16 }}>{t.e}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 3 }}>{t.l}</div>
              <div style={{ fontWeight: 800, color: t.c, fontSize: 13 }}>{t.v}</div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ textAlign: "center", padding: "10px", color: "#94a3b8", fontSize: 13 }}>🎓 Made with ❤️ as a College Project</div>
    </div>
  );
}

// ── DOWNLOAD TRIP ──────────────────────────────────────────────
function downloadTrip(result) {
  const r = result;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${r.title}</title>
<style>
  body{font-family:'Segoe UI',sans-serif;max-width:800px;margin:0 auto;padding:24px;background:#f8fafc;color:#1e293b}
  h1{color:#1e3a8a;font-size:28px;margin-bottom:8px}
  h2{color:#2563eb;font-size:20px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px}
  h3{color:#1e293b;font-size:16px}
  .summary{background:#eff6ff;border-radius:12px;padding:16px;margin-bottom:24px;color:#1e40af}
  .day{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);border-left:4px solid #2563eb}
  .activity{display:flex;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #f1f5f9}
  .activity:last-child{border-bottom:none;margin-bottom:0}
  .time{background:#eff6ff;color:#2563eb;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap}
  .cost{color:#059669;font-weight:700;font-size:13px;margin-top:4px}
  .tip{background:#fffbeb;border-left:3px solid #f59e0b;padding:8px 12px;border-radius:8px;font-size:13px;color:#92400e;margin-top:8px}
  .nearby{background:#f8fafc;border-radius:8px;padding:10px;margin-top:10px}
  .tag{display:inline-block;background:#e2e8f0;color:#475569;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;margin:2px}
  .budget{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
  .budget-item{background:#f8fafc;border-radius:10px;padding:12px;text-align:center}
  .budget-val{font-weight:900;font-size:18px;color:#2563eb}
  .hotel{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
  .total{background:linear-gradient(135deg,#1e293b,#1e3a8a);color:#fbbf24;font-size:22px;font-weight:900;padding:16px;border-radius:12px;text-align:center;margin-bottom:16px}
  footer{text-align:center;color:#94a3b8;margin-top:40px;font-size:13px;padding-top:20px;border-top:1px solid #e2e8f0}
  @media print{body{background:#fff} .day,.hotel{box-shadow:none;border:1px solid #e2e8f0}}
</style>
</head>
<body>
<h1>✈️ ${r.title}</h1>
<div class="summary">${r.summary}</div>
<p><strong>📍 Location:</strong> ${r.meta?.location} | <strong>📅 Days:</strong> ${r.meta?.days} | <strong>👥 Travelers:</strong> ${r.meta?.travelers} | <strong>💰 Budget:</strong> ${r.meta?.currency} ${r.meta?.budget}</p>

<h2>🌤️ Weather at ${r.meta?.location}</h2>
<p>Check live weather at: <a href="https://wttr.in/${encodeURIComponent(r.meta?.location || '')}" target="_blank">wttr.in/${r.meta?.location}</a></p>

<h2>🗺️ Map</h2>
<p>View on Google Maps: <a href="https://www.google.com/maps/search/${encodeURIComponent(r.meta?.location || '')}" target="_blank">Click here to open map</a></p>

<h2>📅 Day-wise Itinerary</h2>
${(r.days || []).map((day, i) => `
<div class="day">
  <h3>Day ${i+1}: ${day.title}</h3>
  <p style="color:#64748b;font-size:13px">${day.theme} | Est. cost: ${day.cost || 'N/A'}</p>
  ${(day.activities || []).map(a => `
  <div class="activity">
    <span style="font-size:22px">${a.emoji || '📍'}</span>
    <div style="flex:1">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <strong>${a.name}</strong>
        ${a.time ? `<span class="time">${a.time}</span>` : ''}
      </div>
      <p style="margin:4px 0;font-size:13px;color:#64748b">${a.description}</p>
      ${a.cost ? `<div class="cost">💰 ${a.cost}</div>` : ''}
      ${a.tip ? `<div class="tip">💡 Tip: ${a.tip}</div>` : ''}
    </div>
  </div>`).join('')}
  ${day.nearby?.length ? `
  <div class="nearby">
    <strong style="font-size:13px">📍 Nearby Places:</strong><br/>
    ${day.nearby.map(p => `<span class="tag">${p}</span>`).join('')}
  </div>` : ''}
</div>`).join('')}

<h2>🏨 Hotel Suggestions</h2>
${(r.hotels || []).map(h => `
<div class="hotel">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <strong style="font-size:15px">🏨 ${h.name}</strong>
      <span style="margin-left:8px;background:#eff6ff;color:#2563eb;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700">${h.type}</span>
    </div>
    <strong style="color:#2563eb">${h.price}</strong>
  </div>
  <p style="margin:6px 0;font-size:13px;color:#64748b">📍 ${h.area} · ⭐ ${h.rating}</p>
  ${h.description ? `<p style="font-size:13px;color:#475569;margin:4px 0">${h.description}</p>` : ''}
  <p style="font-size:13px;color:#64748b;margin:4px 0">✨ ${h.highlight}</p>
  ${h.phone ? `<p style="font-size:12px;color:#2563eb;margin:3px 0">📞 ${h.phone}</p>` : ''}
  ${h.website ? `<p style="font-size:12px;color:#2563eb;margin:3px 0">🌐 ${h.website}</p>` : ''}
  ${h.amenities?.length ? `<div style="margin-top:8px">${h.amenities.map(a => `<span class="tag">✓ ${a}</span>`).join('')}</div>` : ''}
  <a href="https://www.google.com/maps/search/${encodeURIComponent(h.name + ' ' + (r.meta?.location || ''))}" style="display:inline-block;margin-top:10px;color:#2563eb;font-size:12px;font-weight:700">📍 View on Google Maps →</a>
</div>`).join('')}

<h2>💰 Cost Breakdown</h2>
${r.cost_breakdown ? `
<div class="total">Total: ${r.cost_breakdown.total}</div>
<div class="budget">
  ${[['🏨 Accommodation', r.cost_breakdown.accommodation],['🍽️ Food', r.cost_breakdown.food],['🚌 Transport', r.cost_breakdown.transport],['🎯 Activities', r.cost_breakdown.activities],['🛍️ Misc', r.cost_breakdown.misc]].filter(x=>x[1]).map(([l,v]) => `
  <div class="budget-item"><div>${l}</div><div class="budget-val">${v}</div></div>`).join('')}
</div>
${r.cost_breakdown.notes ? `<p style="color:#64748b;font-size:13px;margin-top:12px">${r.cost_breakdown.notes}</p>` : ''}` : ''}

<h2>💡 Travel Tips</h2>
<ul>
${(r.tips || []).map(tip => `<li style="margin-bottom:8px;font-size:14px;color:#475569">${tip}</li>`).join('')}
</ul>

<footer>
  <p>Generated by AI Trip Planner · College Project</p>
  <p>🎓 React · Node.js · MongoDB · Groq AI</p>
  <p>Downloaded on ${new Date().toLocaleDateString("en", { day:"numeric", month:"long", year:"numeric" })}</p>
</footer>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trip-${(r.meta?.location || "plan").replace(/\s+/g, "-").toLowerCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── PLANNER PAGE ───────────────────────────────────────────────
function PlannerPage({ setPage }) {
  const [form, setForm] = useState({ location: "", days: "3", budget: "", currency: "INR", travelers: "1", tripType: "solo" });
  const [step, setStep] = useState("form");
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("itinerary");
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  async function fetchWeatherForTrip(location) {
    setWeatherLoading(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
      const geo = await geoRes.json();
      if (!geo.results?.length) return;
      const { latitude, longitude, name, country } = geo.results[0];
      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=auto&forecast_days=5`);
      const w = await wRes.json();
      const c = w.current; const d = w.daily;
      const decode = (code) => {
        if (code === 0) return { desc: "Clear Sky", emoji: "☀️" };
        if (code <= 3) return { desc: "Partly Cloudy", emoji: "⛅" };
        if (code <= 48) return { desc: "Foggy", emoji: "🌫️" };
        if (code <= 67) return { desc: "Rain", emoji: "🌧️" };
        if (code <= 77) return { desc: "Snow", emoji: "❄️" };
        if (code <= 99) return { desc: "Thunderstorm", emoji: "⛈️" };
        return { desc: "Unknown", emoji: "🌡️" };
      };
      setWeatherData({
        city: name, country, temp: Math.round(c.temperature_2m),
        feels: Math.round(c.apparent_temperature), humidity: c.relative_humidity_2m,
        wind: Math.round(c.wind_speed_10m), ...decode(c.weather_code),
        forecast: d.time.map((date, i) => ({ date, max: Math.round(d.temperature_2m_max[i]), min: Math.round(d.temperature_2m_min[i]), rain: d.precipitation_sum[i], ...decode(d.weather_code[i]) })),
      });
    } catch {}
    setWeatherLoading(false);
  }

  async function generate() {
    if (!form.location || !form.days || !form.budget) { setError("Please fill Location, Days and Budget."); return; }
    setError(""); setStep("loading");
    const msgs = [`Researching ${form.location}…`, "Building day-wise itinerary…", "Finding nearby places…", "Estimating costs…", "Adding hotel suggestions…"];
    let mi = 0; setProgress(msgs[0]);
    const iv = setInterval(() => { mi = (mi + 1) % msgs.length; setProgress(msgs[mi]); }, 2000);

    const prompt = `You are an expert travel planner. Create a complete trip plan for:
Location: ${form.location}, Days: ${form.days}, Budget: ${form.budget} ${form.currency}, Travelers: ${form.travelers} (${form.tripType}).
Return ONLY valid JSON (no markdown, no extra text):
{
  "title": "Trip Title",
  "summary": "2 sentence overview",
  "days": [
    {
      "title": "Day 1: Title",
      "theme": "Theme tagline",
      "cost": "estimated cost",
      "activities": [
        { "name": "Place", "time": "9:00 AM", "emoji": "🏛️", "description": "2 sentences", "cost": "cost", "tip": "tip" }
      ],
      "nearby": ["Place 1", "Place 2", "Place 3"]
    }
  ],
  "hotels": [
    { "name": "Hotel", "type": "Budget", "price": "price/night", "area": "area", "rating": "4.2/5", "highlight": "feature", "description": "2 sentence description", "phone": "+91-XXXXXXXXXX", "amenities": ["WiFi","AC","Breakfast"] }
  ],
  "cost_breakdown": { "total": "", "accommodation": "", "food": "", "transport": "", "activities": "", "misc": "", "notes": "saving tips" },
  "tips": ["tip1", "tip2", "tip3", "tip4"],
  "packing": ["item1", "item2", "item3", "item4", "item5", "item6"]
}`;

    try {
      const raw = await callGroq(prompt);
      clearInterval(iv);
      const parsed = JSON.parse(raw);
      const fullResult = { ...parsed, meta: form };
      setResult(fullResult);

      // Save to history
      const history = JSON.parse(localStorage.getItem("tripHistory") || "[]");
      history.push({ ...form, title: parsed.title, date: new Date().toISOString() });
      localStorage.setItem("tripHistory", JSON.stringify(history));

      // Fetch weather automatically
      fetchWeatherForTrip(form.location);
      setStep("result");
    } catch (e) {
      clearInterval(iv);
      setError("Generation failed: " + e.message);
      setStep("form");
    }
  }

  if (step === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 16px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", textAlign: "center", maxWidth: 300, width: "100%" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🌍</div>
        <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <h2 style={{ fontWeight: 800, fontSize: 18, color: "#1e293b", margin: "0 0 8px" }}>Planning Your Trip…</h2>
        <p style={{ color: "#64748b", fontSize: 14, animation: "pulse 2s ease-in-out infinite", margin: 0 }}>{progress}</p>
      </div>
    </div>
  );

  if (step === "result" && result) {
    const r = result;
    const colors = ["#2563eb","#7c3aed","#0ea5e9","#059669","#d97706","#dc2626"];
    const tabs = ["itinerary","weather","map","hotels","budget","tips"];

    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 0 40px" }}>
        {/* Result Hero */}
        <div style={{ background: "linear-gradient(135deg,#1e3a8a,#1e293b)", padding: "24px 20px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#fff" }}>{r.title}</h2>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 14px" }}>{r.summary}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {[{l:"Days",v:r.days?.length,e:"📅"},{l:"Travelers",v:r.meta?.travelers,e:"👥"},{l:r.meta?.currency,v:r.meta?.budget,e:"💰"}].map((s,i) => (
              <div key={i} style={{ padding:"6px 14px",borderRadius:10,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:13 }}>
                {s.e} <strong>{s.v}</strong> <span style={{color:"#94a3b8"}}>{s.l}</span>
              </div>
            ))}
          </div>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
            <button onClick={() => downloadTrip(r)}
              style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#059669,#0891b2)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              📥 Download Trip
            </button>
            <button onClick={() => { setStep("form"); setResult(null); setWeatherData(null); }}
              style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ← New Trip
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 16px", display: "flex", gap: 0, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: "14px 16px", border: "none", borderBottom: `3px solid ${activeTab === t ? "#2563eb" : "transparent"}`, background: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: activeTab === t ? "#2563eb" : "#64748b", whiteSpace: "nowrap", textTransform: "capitalize" }}>
              {t === "itinerary" ? "📅 Itinerary" : t === "weather" ? "🌤️ Weather" : t === "map" ? "🗺️ Map" : t === "hotels" ? "🏨 Hotels" : t === "budget" ? "💰 Budget" : "💡 Tips"}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 16px" }}>
          {/* ITINERARY TAB */}
          {activeTab === "itinerary" && (
            <div>
              {r.days?.map((day, i) => {
                const DayItem = () => {
                  const [open, setOpen] = useState(i === 0);
                  const accent = colors[i % colors.length];
                  return (
                    <div style={{ background: "#fff", borderRadius: 14, marginBottom: 12, border: `1.5px solid ${open ? accent : "#e8edf4"}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${accent},${accent}99)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>{day.title}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{day.theme}</div>
                        </div>
                        {day.cost && <Badge text={day.cost} color={accent} />}
                        <span style={{ color: accent, transform: open ? "rotate(180deg)" : "none", transition: "0.3s" }}>▾</span>
                      </button>
                      {open && (
                        <div style={{ padding: "0 16px 16px" }}>
                          {day.activities?.map((a, j) => (
                            <div key={j} style={{ display: "flex", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: j < day.activities.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{a.emoji || "📍"}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                                  <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{a.name}</div>
                                  {a.time && <span style={{ fontSize: 11, color: accent, fontWeight: 700, background: `${accent}15`, borderRadius: 6, padding: "2px 7px" }}>{a.time}</span>}
                                </div>
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.5 }}>{a.description}</div>
                                {a.cost && <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginTop: 3 }}>💰 {a.cost}</div>}
                                {a.tip && <div style={{ marginTop: 6, padding: "6px 10px", background: "#fffbeb", borderRadius: 7, fontSize: 11, color: "#92400e", borderLeft: "3px solid #f59e0b" }}>💡 {a.tip}</div>}
                              </div>
                            </div>
                          ))}
                          {day.nearby?.length > 0 && (
                            <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: 10 }}>
                              <div style={{ fontWeight: 700, fontSize: 12, color: "#475569", marginBottom: 6 }}>📍 Nearby Places</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{day.nearby.map((p, k) => <span key={k} style={{ fontSize: 11, background: "#e2e8f0", color: "#475569", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>{p}</span>)}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                };
                return <DayItem key={i} />;
              })}
              {r.packing?.length > 0 && (
                <Card>
                  <h3 style={{ margin: "0 0 12px", fontWeight: 800, color: "#1e293b", fontSize: 15 }}>🎒 Packing List</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {r.packing.map((item, i) => <span key={i} style={{ padding: "6px 14px", borderRadius: 20, background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#475569", fontSize: 13, fontWeight: 600 }}>✓ {item}</span>)}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* WEATHER TAB */}
          {activeTab === "weather" && (
            <div>
              {weatherLoading && <div style={{ textAlign: "center", padding: "40px" }}><div style={{ fontSize: 40 }}>🌤️</div><p style={{ color: "#64748b", marginTop: 12 }}>Fetching weather for {r.meta?.location}…</p></div>}
              {weatherData && (
                <>
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ textAlign: "center", minWidth: 90 }}>
                        <div style={{ fontSize: 54 }}>{weatherData.emoji}</div>
                        <div style={{ fontWeight: 900, fontSize: 34, color: "#1e293b", lineHeight: 1 }}>{weatherData.temp}°C</div>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{weatherData.desc}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>{weatherData.city}, {weatherData.country}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                          {[["Feels Like",`${weatherData.feels}°C`],["Humidity",`${weatherData.humidity}%`],["Wind",`${weatherData.wind} km/h`]].map(([l,v]) => (
                            <div key={l} style={{ background: "#f1f5f9", borderRadius: 10, padding: "8px 12px" }}>
                              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{l}</div>
                              <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                  <h3 style={{ fontWeight: 800, color: "#1e293b", fontSize: 16, margin: "0 0 10px" }}>📅 5-Day Forecast</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                    {weatherData.forecast.map((f, i) => (
                      <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "12px 6px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #e8edf4" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{new Date(f.date).toLocaleDateString("en", { weekday: "short" })}</div>
                        <div style={{ fontSize: 24, margin: "6px 0" }}>{f.emoji}</div>
                        <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>{f.max}°</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{f.min}°</div>
                        {f.rain > 0 && <div style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 700, marginTop: 3 }}>💧{f.rain}mm</div>}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {!weatherLoading && !weatherData && (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#94a3b8" }}>Weather not available for this location.</p>
                </div>
              )}
            </div>
          )}

          {/* MAP TAB */}
          {activeTab === "map" && (
            <Card>
              <h3 style={{ margin: "0 0 12px", fontWeight: 800, color: "#1e293b", fontSize: 16 }}>🗺️ {r.meta?.location}</h3>
              <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <iframe title="map" width="100%" height="400" frameBorder="0" style={{ display: "block" }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(r.meta?.location || "")}&output=embed&z=12`} allowFullScreen />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {[["🏨 Hotels","hotels"],["🍽️ Restaurants","restaurants"],["🏛️ Attractions","tourist attractions"],["🛍️ Shopping","shopping"]].map(([label, type]) => (
                  <a key={type} href={`https://www.google.com/maps/search/${encodeURIComponent(type)}+in+${encodeURIComponent(r.meta?.location || "")}`} target="_blank" rel="noreferrer"
                    style={{ padding: "7px 14px", borderRadius: 10, background: "#f1f5f9", color: "#475569", fontWeight: 700, fontSize: 12, textDecoration: "none", border: "1px solid #e2e8f0" }}>
                    {label}
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* HOTELS TAB */}
          {activeTab === "hotels" && (
            <div>
              {r.hotels?.map((h, i) => {
                const c = h.type === "Budget" ? "#059669" : h.type === "Luxury" ? "#d97706" : "#2563eb";
                return (
                  <Card key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, color: "#1e293b", fontSize: 15 }}>🏨 {h.name}</span>
                          <Badge text={h.type} color={c} />
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>📍 {h.area} · ⭐ {h.rating}</div>
                        {h.description && <div style={{ fontSize: 13, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{h.description}</div>}
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>✨ {h.highlight}</div>
                        {h.phone && <div style={{ fontSize: 12, color: "#2563eb", marginTop: 3 }}>📞 {h.phone}</div>}
                        {h.website && <div style={{ fontSize: 12, color: "#2563eb", marginTop: 2 }}>🌐 {h.website}</div>}
                        {h.amenities?.length > 0 && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                            {h.amenities.map((a, j) => <span key={j} style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>✓ {a}</span>)}
                          </div>
                        )}
                        <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name + " " + (r.meta?.location || ""))}`} target="_blank" rel="noreferrer"
                          style={{ display: "inline-block", marginTop: 10, padding: "6px 14px", borderRadius: 8, background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                          📍 View on Maps →
                        </a>
                      </div>
                      <div style={{ fontWeight: 900, color: c, fontSize: 16, whiteSpace: "nowrap" }}>{h.price}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* BUDGET TAB */}
          {activeTab === "budget" && r.cost_breakdown && (
            <Card>
              <h3 style={{ margin: "0 0 14px", fontWeight: 800, color: "#1e293b", fontSize: 16 }}>💰 Cost Breakdown</h3>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg,#1e293b,#1e3a8a)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ color: "#94a3b8", fontWeight: 700 }}>Total Budget</span>
                <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: 22 }}>{r.cost_breakdown.total}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[{l:"Accommodation",v:r.cost_breakdown.accommodation,e:"🏨",c:"#2563eb"},{l:"Food",v:r.cost_breakdown.food,e:"🍽️",c:"#dc2626"},{l:"Transport",v:r.cost_breakdown.transport,e:"🚌",c:"#d97706"},{l:"Activities",v:r.cost_breakdown.activities,e:"🎯",c:"#7c3aed"},{l:"Misc",v:r.cost_breakdown.misc,e:"🛍️",c:"#059669"}].filter(x => x.v).map(item => (
                  <div key={item.l} style={{ padding: "14px", borderRadius: 12, background: `${item.c}08`, border: `1.5px solid ${item.c}25`, textAlign: "center" }}>
                    <div style={{ fontSize: 24 }}>{item.e}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginTop: 4 }}>{item.l}</div>
                    <div style={{ fontWeight: 900, color: item.c, fontSize: 16, marginTop: 4 }}>{item.v}</div>
                  </div>
                ))}
              </div>
              {r.cost_breakdown.notes && <p style={{ fontSize: 13, color: "#64748b", marginTop: 14, lineHeight: 1.6, background: "#f8fafc", borderRadius: 10, padding: "10px 14px" }}>💡 {r.cost_breakdown.notes}</p>}
            </Card>
          )}

          {/* TIPS TAB */}
          {activeTab === "tips" && (
            <Card>
              <h3 style={{ margin: "0 0 14px", fontWeight: 800, color: "#1e293b", fontSize: 16 }}>💡 Travel Tips</h3>
              {r.tips?.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, padding: "12px 14px", borderRadius: 12, background: i % 2 === 0 ? "#f8fafc" : "#fff", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <span style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{tip}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    );
  }

  // FORM
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 16px" }}>✈️ Plan Your Trip</h2>
      <Card>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.04em" }}>LOCATION *</label>
          <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Goa, India" style={inp()} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.04em" }}>DAYS *</label>
            <input type="number" min="1" max="30" value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))} style={inp()} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.04em" }}>BUDGET *</label>
            <div style={{ display: "flex", gap: 6 }}>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={{ ...inp(), width: 72, flexShrink: 0 }}>
                {["INR","USD","EUR","GBP","AUD"].map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="10000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} style={{ ...inp(), flex: 1 }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.04em" }}>TRAVELERS</label>
            <input type="number" min="1" max="20" value={form.travelers} onChange={e => setForm(f => ({ ...f, travelers: e.target.value }))} style={inp()} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.04em" }}>TRIP TYPE</label>
            <select value={form.tripType} onChange={e => setForm(f => ({ ...f, tripType: e.target.value }))} style={inp()}>
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="friends">Friends</option>
              <option value="family">Family</option>
              <option value="college group">College Group</option>
            </select>
          </div>
        </div>
        {error && <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontWeight: 600, fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}
        <button onClick={generate} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
          ✨ Generate My Trip Plan
        </button>
      </Card>
    </div>
  );
}

// ── ROOT APP ───────────────────────────────────────────────────
export default function App() {
  const saved = localStorage.getItem("user");
  const [user, setUser] = useState(saved ? JSON.parse(saved) : null);
  const [page, setPage] = useState("home");

  function handleLogin(u) { setUser(u); setPage("home"); }
  function handleLogout() { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setPage("home"); }

  if (!user) return <AuthPage onLogin={handleLogin} />;

  const pages = {
    home: <HomePage user={user} setPage={setPage} />,
    planner: <PlannerPage setPage={setPage} />,
    weather: <WeatherPage />,
    map: <MapPage />,
    hotels: <HotelsPage />,
    profile: <ProfilePage user={user} setPage={setPage} />,
    about: <AboutPage />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap'); *{box-sizing:border-box} input:focus,select:focus{border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)}`}</style>
      <Navbar user={user} activePage={page} setPage={setPage} onLogout={handleLogout} />
      {pages[page]}
      <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: 12, borderTop: "1px solid #e2e8f0", marginTop: 20 }}>
        🎓 AI Trip Planner · College Project · React · Node.js · MongoDB · Groq AI
      </div>
    </div>
  );
}