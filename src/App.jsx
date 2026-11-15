import React, { useEffect, useMemo, useState } from "react";
import { Activity, Apple, BedDouble, Bell, CalendarDays, ChevronDown, ChevronRight, CircleHelp, ClipboardList, Droplets, Dumbbell, Footprints, HeartPulse, Home, LayoutDashboard, Plus, Search, Settings, ShieldCheck, Sparkles, Target, TrendingUp, UserRound, Utensils, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { supabase, isSupabaseConfigured } from "./supabase";

const trend = [{day:"Mon",cal:1850},{day:"Tue",cal:2100},{day:"Wed",cal:1780},{day:"Thu",cal:1980},{day:"Fri",cal:2200},{day:"Sat",cal:1900},{day:"Sun",cal:1020}];
const nav = [
  { label:"Overview", icon:LayoutDashboard }, { label:"Food & calories", icon:Utensils },
  { label:"Activity", icon:Footprints }, { label:"Sleep", icon:BedDouble },
  { label:"Meal planner", icon:Apple }, { label:"Medical predictor", icon:HeartPulse }
];

function Dashboard({ user, initialProfile, initialData, onSaveData, onSaveProfile, onSignOut }) {
  const [page, setPage] = useState("Overview");
  const [profile, setProfile] = useState(() => initialProfile || { name: user?.user_metadata?.full_name || "", goal:"Maintain weight", weight:0, height:0, age:0, gender:"", activity:"Moderate" });
  const [meals, setMeals] = useState(() => initialData?.meals || []);
  const [steps, setSteps] = useState(() => initialData?.steps ?? 0);
  const [water, setWater] = useState(() => initialData?.water ?? 0);
  const [sleep, setSleep] = useState(() => initialData?.sleep ?? 0);
  const [showMeal, setShowMeal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [query, setQuery] = useState("");
  const [mealForm, setMealForm] = useState({name:"", calories:"", protein:"", carbs:"", fat:""});
  const [predict, setPredict] = useState({age:"", height:"", weight:"", activity:"", symptoms:[]});
  const [predictResult, setPredictResult] = useState("");

  const calories = meals.reduce((s,m)=>s+Number(m.calories),0);
  const protein = meals.reduce((s,m)=>s+Number(m.protein||0),0);
  const bmi = profile.weight / Math.pow(profile.height/100,2);
  const filteredMeals = meals.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));
  const addMeal = e => { e.preventDefault(); const item={...mealForm,id:Date.now(),calories:Number(mealForm.calories),protein:Number(mealForm.protein||0),carbs:Number(mealForm.carbs||0),fat:Number(mealForm.fat||0),detail:"Added just now"}; const next=[...meals,item]; setMeals(next); setMealForm({name:"",calories:"",protein:"",carbs:"",fat:""}); setShowMeal(false); };
  const updateProfile = e => { e.preventDefault(); onSaveProfile(profile); setShowProfile(false); };
  const addWater = () => { const v=Math.min(12,water+1);setWater(v); };
  const addSteps = () => { const v=steps+500;setSteps(v); };
  const calorieGoal = profile.goal === "Build muscle" ? 2600 : profile.goal === "Lose body fat" ? 1900 : 2100;
  const progress = Math.min(100, Math.round(calories/calorieGoal*100));
  useEffect(() => { onSaveData({ meals, steps, water, sleep }); }, [meals, steps, water, sleep]);

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={21}/></div><span>Calor<span className="brand-accent">IQ</span></span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(({label,icon:Icon})=><button key={label} className={`nav-item ${page===label?"active":""}`} onClick={()=>setPage(label)}><Icon size={18}/><span>{label}</span>{label==="Medical predictor"&&<span className="new-tag">NEW</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="tip-card"><Sparkles size={17}/><b>Small steps, big change.</b><p>Consistency beats perfection. Keep showing up.</p></div><button className="nav-item" onClick={()=>setShowProfile(true)}><Settings size={18}/> Settings</button><div className="user-mini"><div className="avatar">{profile.name?.[0]?.toUpperCase() || "U"}</div><div className="user-mini-info"><b>{profile.name}</b><small>{user?.email}</small></div><button className="signout-button" onClick={onSignOut} title="Sign out">Sign out</button></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{page}</b></div><div className="top-actions"><div className="date-pill"><CalendarDays size={15}/> Today, {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div><button className="icon-button" aria-label="Notifications"><Bell size={18}/><i/></button><button className="profile-button" onClick={()=>setShowProfile(true)}><div className="avatar small">{profile.name[0]?.toUpperCase()}</div><ChevronDown size={15}/></button></div></header>

      {page==="Overview" && <div className="content">
        <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> YOUR HEALTH, IN FOCUS</div><h1>Good evening, {profile.name} <span>✦</span></h1><p className="muted">Here's your health snapshot for today. Keep up the momentum.</p></div><button className="primary-button" onClick={()=>setShowMeal(true)}><Plus size={17}/> Log food</button></section>
        <section className="hero-card"><div className="hero-copy"><div className="hero-kicker">DAILY CALORIE INTAKE</div><div className="hero-number">{calories.toLocaleString()} <span>kcal</span></div><p>You've consumed {progress}% of your daily target.</p><div className="progress-track"><div style={{width:`${progress}%`}}/></div><div className="hero-foot"><span>0 kcal</span><b>Goal: {calorieGoal.toLocaleString()} kcal</b></div></div><div className="hero-ring"><div className="ring-inner"><FlameIcon/><b>{Math.max(0,calorieGoal-calories).toLocaleString()}</b><small>kcal left</small></div></div><div className="hero-decoration"/></section>
        <div className="section-heading"><div><h2>Your daily metrics</h2><p>Stay aware of the habits that move you forward.</p></div><span className="live-label"><i/> UPDATED TODAY</span></div>
        <section className="metric-grid">
          <Metric icon={Footprints} label="Steps" value={steps.toLocaleString()} unit="/ 10,000" pct={Math.min(100,steps/100)} color="mint" footer="Daily movement" action={addSteps} actionLabel="+ 500 steps"/>
          <Metric icon={Droplets} label="Water intake" value={`${water}`} unit="/ 8 glasses" pct={Math.min(100,water/8*100)} color="blue" footer="Stay hydrated" action={addWater} actionLabel="+ Add glass"/>
          <Metric icon={BedDouble} label="Sleep" value={sleep.toFixed(1)} unit="hrs" pct={Math.min(100,sleep/8*100)} color="violet" footer="Target: 8 hours" action={()=>setPage("Sleep")} actionLabel="View sleep"/>
          <Metric icon={Dumbbell} label="Protein" value={`${protein}`} unit="g today" pct={Math.min(100,protein/130*100)} color="orange" footer="Daily target: 130g" action={()=>setPage("Food & calories")} actionLabel="View nutrition"/>
        </section>
        <section className="lower-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h3>Calorie overview</h3><p>Your intake over the last 7 days</p></div><span className="select-label">This week <ChevronDown size={14}/></span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><defs><linearGradient id="fillCal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8bc7a5" stopOpacity={.28}/><stop offset="100%" stopColor="#8bc7a5" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#29352e" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#8e9c92",fontSize:12}}/><Tooltip contentStyle={{background:"#1b2820",border:"1px solid #34443a",borderRadius:10,color:"#fff"}}/><Area type="monotone" dataKey="cal" stroke="#9bc9a8" strokeWidth={2.5} fill="url(#fillCal)"/></AreaChart></ResponsiveContainer></div></div>
        <div className="panel meals-panel"><div className="panel-heading"><div><h3>Today's meals</h3><p>Your recent food log</p></div><button className="text-button" onClick={()=>setPage("Food & calories")}>See all</button></div>{meals.slice(0,3).map(m=><div className="meal-row" key={m.id}><div className="food-icon"><Utensils size={17}/></div><div className="meal-info"><b>{m.name}</b><small>{m.detail}</small></div><strong>{m.calories} <small>kcal</small></strong></div>)}{meals.length===0&&<p className="empty">No meals logged yet.</p>}<button className="add-meal-link" onClick={()=>setShowMeal(true)}><Plus size={15}/> Add a meal</button></div></section>
        <section className="insight-strip"><div className="insight-icon"><Sparkles size={19}/></div><div><b>Your daily insight</b><p>{protein<100?"Try adding a protein-rich snack to help support muscle recovery.":"Great protein progress today — keep pairing balanced meals with movement."}</p></div><button onClick={()=>setPage("Meal planner")}>Explore meal ideas <ChevronRight size={15}/></button></section>
      </div>}

      {page==="Food & calories" && <div className="content"><PageTitle eyebrow="NUTRITION TRACKER" title="Food & calories" sub="Keep track of what you eat and stay aligned with your goals." action={()=>setShowMeal(true)}/><div className="nutrition-summary"><div><span>CALORIES CONSUMED</span><b>{calories.toLocaleString()} <small>kcal</small></b><p>Daily goal: {calorieGoal} kcal</p><div className="progress-track"><div style={{width:`${progress}%`}}/></div></div><div className="macro"><span>PROTEIN</span><b>{protein}g</b></div><div className="macro"><span>CARBS</span><b>{meals.reduce((s,m)=>s+Number(m.carbs||0),0)}g</b></div><div className="macro"><span>FAT</span><b>{meals.reduce((s,m)=>s+Number(m.fat||0),0)}g</b></div></div><div className="panel full-panel"><div className="panel-heading"><div><h3>Food diary</h3><p>Everything you've logged today</p></div><div className="search-box"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search meals"/></div></div>{filteredMeals.map(m=><div className="diary-row" key={m.id}><div className="food-icon"><Utensils size={17}/></div><div className="meal-info"><b>{m.name}</b><small>{m.detail}</small></div><span className="macro-label">{m.protein}g protein</span><strong>{m.calories} kcal</strong><button className="remove-button" title="Remove meal" onClick={()=>{const n=meals.filter(x=>x.id!==m.id);setMeals(n)}}><X size={16}/></button></div>)}{filteredMeals.length===0&&<p className="empty">No matching meals. Add a meal to get started.</p>}</div></div>}

      {page==="Activity" && <div className="content"><PageTitle eyebrow="MOVE MORE" title="Activity" sub="Every step counts. Build movement into your day."/><div className="panel activity-feature"><div className="big-icon mint-bg"><Footprints size={26}/></div><span className="eyebrow">TODAY'S STEPS</span><h2>{steps.toLocaleString()} <small>/ 10,000</small></h2><div className="progress-track"><div style={{width:`${Math.min(100,steps/100)}%`}}/></div><p>{Math.max(0,10000-steps).toLocaleString()} steps to reach your daily goal.</p><button className="primary-button" onClick={addSteps}><Plus size={16}/> Add 500 steps</button></div><div className="metric-grid"><Metric icon={Target} label="Goal completion" value={`${Math.round(Math.min(100,steps/100))}`} unit="%" pct={Math.min(100,steps/100)} color="mint"/><Metric icon={TrendingUp} label="Movement streak" value="4" unit="days" pct={57} color="orange"/><Metric icon={Activity} label="Activity status" value={steps>=10000?"Goal met":"In progress"} unit="" pct={Math.min(100,steps/100)} color="blue"/></div></div>}

      {page==="Sleep" && <div className="content"><PageTitle eyebrow="REST & RECOVERY" title="Sleep analysis" sub="Good recovery starts with consistent, quality sleep."/><div className="panel sleep-feature"><div className="big-icon violet-bg"><BedDouble size={26}/></div><span className="eyebrow">LAST NIGHT'S SLEEP</span><h2>{sleep.toFixed(1)} <small>hours</small></h2><p>{sleep>=8?"You reached the recommended sleep duration.": "Aim for 7–9 hours of sleep each night for better recovery."}</p><div className="sleep-adjust"><label>Adjust sleep duration</label><input type="range" min="0" max="12" step=".1" value={sleep} onChange={e=>{setSleep(Number(e.target.value))}}/><b>{sleep.toFixed(1)} hrs</b></div></div><div className="panel full-panel"><h3>Sleep hygiene tips</h3><div className="tip-list"><p>🌙 Keep a consistent bedtime and wake-up time.</p><p>📵 Reduce screen exposure before going to bed.</p><p>☕ Avoid caffeine late in the evening.</p><p>🛏️ Keep your bedroom cool, dark, and quiet.</p></div></div></div>}

      {page==="Meal planner" && <div className="content"><PageTitle eyebrow="PLAN AHEAD" title="Meal planner" sub="Simple meal ideas to support your daily nutrition goals."/><div className="meal-plan-grid">{[{time:"BREAKFAST",name:"Oats, milk & banana",desc:"A filling start with fibre and energy.",kcal:350,tag:"Energy"},{time:"LUNCH",name:"Rice, dal & grilled paneer",desc:"A balanced plate with protein and carbs.",kcal:550,tag:"Balanced"},{time:"SNACK",name:"Greek yogurt & nuts",desc:"A convenient protein-rich snack.",kcal:220,tag:"Protein"},{time:"DINNER",name:"Chapati, chicken & vegetables",desc:"A satisfying meal with lean protein.",kcal:500,tag:"Recovery"}].map((m,i)=><div className="panel plan-card" key={m.time}><span className="eyebrow">{m.time}</span><div className="plan-emoji">{["🥣","🍛","🥜","🥗"][i]}</div><h3>{m.name}</h3><p>{m.desc}</p><div className="plan-foot"><span>{m.kcal} kcal</span><span className="tag">{m.tag}</span></div><button className="outline-button" onClick={()=>{setMealForm({name:m.name,calories:String(m.kcal),protein:"20",carbs:"45",fat:"10"});setShowMeal(true)}}><Plus size={15}/> Log this meal</button></div>)}</div><p className="disclaimer">Meal ideas are general examples. Adjust portions and ingredients to your preferences, allergies, and nutritional needs.</p></div>}

      {page==="Medical predictor" && <div className="content"><PageTitle eyebrow="HEALTH AWARENESS" title="Medical predictor" sub="A basic wellness screening tool — not a medical diagnosis."/><div className="panel predictor-panel"><div className="predictor-note"><ShieldCheck size={19}/><span>This tool provides general health-awareness information only. It cannot diagnose conditions or replace a qualified healthcare professional.</span></div><form onSubmit={e=>{e.preventDefault();const h=Number(predict.height)/100,w=Number(predict.weight),b=w/(h*h);setPredictResult(`Your calculated BMI is ${b.toFixed(1)}. ${b<18.5?"This is below the usual adult reference range.":b<25?"This is within the usual adult reference range.":b<30?"This is above the usual adult reference range.":"This is in a higher adult BMI category."} BMI is only a screening measure and does not assess overall health. Discuss concerns with a healthcare professional.`)}}><div className="form-grid"><Field label="Age" type="number" value={predict.age} onChange={v=>setPredict({...predict,age:v})} placeholder="e.g. 25"/><Field label="Height (cm)" type="number" value={predict.height} onChange={v=>setPredict({...predict,height:v})} placeholder="e.g. 175"/><Field label="Weight (kg)" type="number" value={predict.weight} onChange={v=>setPredict({...predict,weight:v})} placeholder="e.g. 70"/><label className="field"><span>Activity level</span><select value={predict.activity} onChange={e=>setPredict({...predict,activity:e.target.value})}><option value="">Select activity</option><option>Low</option><option>Moderate</option><option>High</option></select></label></div><button className="primary-button" disabled={!predict.age||!predict.height||!predict.weight||Number(predict.height)<=0||Number(predict.weight)<=0}><HeartPulse size={16}/> Calculate wellness indicator</button></form>{predictResult&&<div className="result-box"><b>Screening result</b><p>{predictResult}</p></div>}</div></div>}

      <footer className="footer">CalorIQ <span>·</span> Your wellness journey, one day at a time. <span className="footer-right">Your data is stored locally on this device.</span></footer>
    </main>

    {showMeal&&<Modal title="Log a meal" close={()=>setShowMeal(false)}><form onSubmit={addMeal} className="modal-form"><Field label="Food name" value={mealForm.name} onChange={v=>setMealForm({...mealForm,name:v})} placeholder="e.g. Paneer sandwich" required/><div className="form-grid two"><Field label="Calories (kcal)" type="number" value={mealForm.calories} onChange={v=>setMealForm({...mealForm,calories:v})} required/><Field label="Protein (g)" type="number" value={mealForm.protein} onChange={v=>setMealForm({...mealForm,protein:v})}/><Field label="Carbs (g)" type="number" value={mealForm.carbs} onChange={v=>setMealForm({...mealForm,carbs:v})}/><Field label="Fat (g)" type="number" value={mealForm.fat} onChange={v=>setMealForm({...mealForm,fat:v})}/></div><button className="primary-button wide"><Plus size={16}/> Save meal</button></form></Modal>}
    {showProfile&&<Modal title="Your profile" close={()=>setShowProfile(false)}><form onSubmit={updateProfile} className="modal-form"><Field label="Name" value={profile.name} onChange={v=>setProfile({...profile,name:v})}/><div className="form-grid two"><Field label="Age" type="number" value={profile.age} onChange={v=>setProfile({...profile,age:Number(v)})}/><Field label="Weight (kg)" type="number" value={profile.weight} onChange={v=>setProfile({...profile,weight:Number(v)})}/><Field label="Height (cm)" type="number" value={profile.height} onChange={v=>setProfile({...profile,height:Number(v)})}/><label className="field"><span>Gender</span><select value={profile.gender || "Prefer not to say"} onChange={e=>setProfile({...profile,gender:e.target.value})}><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option></select></label><label className="field"><span>Activity level</span><select value={profile.activity || "Moderate"} onChange={e=>setProfile({...profile,activity:e.target.value})}><option>Sedentary</option><option>Light</option><option>Moderate</option><option>Active</option><option>Very active</option></select></label><label className="field"><span>Fitness goal</span><select value={profile.goal} onChange={e=>setProfile({...profile,goal:e.target.value})}><option>Lose body fat</option><option>Maintain weight</option><option>Build muscle</option></select></label></div><button className="primary-button wide">Save profile</button></form></Modal>}
  </div>;
}

function Metric({icon:Icon,label,value,unit,pct,color,footer,action,actionLabel}){return <div className="metric-card"><div className="metric-top"><div className={`metric-icon ${color}`}><Icon size={18}/></div><span>{label}</span></div><div className="metric-value">{value}<small>{unit}</small></div><div className="mini-progress"><div className={color} style={{width:`${pct}%`}}/></div><div className="metric-bottom"><span>{footer||"Today's progress"}</span>{action&&<button onClick={action}>{actionLabel}</button>}</div></div>}
function PageTitle({eyebrow,title,sub,action}){return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="muted">{sub}</p></div>{action&&<button className="primary-button" onClick={action}><Plus size={16}/> Log food</button>}</div>}
function Field({label,value,onChange,type="text",placeholder="",required=false}){return <label className="field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} required={required} min={type==="number"?"0":undefined}/></label>}
function Modal({title,close,children}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-button" onClick={close}><X size={18}/></button></div>{children}</div></div>}
function FlameIcon(){return <span className="flame">✦</span>}


export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [authForm, setAuthForm] = useState({ name:"", email:"", password:"" });
  const [profile, setProfile] = useState(null);
  const [userData, setUserData] = useState({ meals:[], steps:0, water:0, sleep:0 });
  const [needsProfile, setNeedsProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name:"", age:"", gender:"Prefer not to say", height:"", weight:"", activity:"Moderate", goal:"Maintain weight" });
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) setAuthError(error.message);
      setSession(data?.session ?? null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      if (!session?.user) { setProfile(null); setNeedsProfile(false); return; }
      setDataLoading(true); setSaveError("");
      const [profileResult, dataResult] = await Promise.all([
        supabase.from("profiles").select("full_name, age, gender, height_cm, weight_kg, activity_level, fitness_goal").eq("id", session.user.id).maybeSingle(),
        supabase.from("user_data").select("data").eq("user_id", session.user.id).maybeSingle()
      ]);
      if (cancelled) return;
      if (profileResult.error || dataResult.error) {
        setAuthError(profileResult.error?.message || dataResult.error?.message || "Could not load your account data.");
      }
      const p = profileResult.data;
      if (p?.full_name) {
        setProfile({ name:p.full_name, age:p.age || "", gender:p.gender || "Prefer not to say", height:p.height_cm || "", weight:p.weight_kg || "", activity:p.activity_level || "Moderate", goal:p.fitness_goal || "Maintain weight" });
        setNeedsProfile(false);
      } else {
        setProfile(null); setNeedsProfile(true);
        setProfileForm(f => ({ ...f, name:session.user.user_metadata?.full_name || "" }));
      }
      setUserData(dataResult.data?.data || { meals:[], steps:0, water:0, sleep:0 });
      setDataLoading(false);
    }
    loadUser();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const handleAuth = async (e) => {
    e.preventDefault(); setBusy(true); setAuthError(""); setAuthMessage("");
    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email:authForm.email.trim(), password:authForm.password, options:{ data:{ full_name:authForm.name.trim() } } });
        if (error) throw error;
        if (!data.session) setAuthMessage("Account created! Check your email and confirm your address, then return here to log in.");
        else setAuthMessage("Account created successfully. Let's finish your profile.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email:authForm.email.trim(), password:authForm.password });
        if (error) throw error;
      }
    } catch (error) { setAuthError(error.message || "Authentication failed."); }
    finally { setBusy(false); }
  };

  const saveProfile = async (e) => {
    e.preventDefault(); setBusy(true); setAuthError("");
    const user = session?.user;
    if (!user) return;
    const row = { id:user.id, full_name:profileForm.name.trim(), age:Number(profileForm.age), gender:profileForm.gender, height_cm:Number(profileForm.height), weight_kg:Number(profileForm.weight), activity_level:profileForm.activity, fitness_goal:profileForm.goal, updated_at:new Date().toISOString() };
    const { error } = await supabase.from("profiles").upsert(row);
    if (error) setAuthError(error.message);
    else {
      setProfile({ name:row.full_name, age:row.age, gender:row.gender, height:row.height_cm, weight:row.weight_kg, activity:row.activity_level, goal:row.fitness_goal });
      setNeedsProfile(false);
    }
    setBusy(false);
  };

  const persistData = async (next) => {
    if (!session?.user) return;
    const merged = { ...userData, ...next };
    const { error } = await supabase.from("user_data").upsert({ user_id:session.user.id, data:merged, updated_at:new Date().toISOString() });
    if (error) setSaveError(`Could not save your data: ${error.message}`);
    else setSaveError("");
  };

  const persistProfile = async (next) => {
    if (!session?.user) return;
    const row = { id:session.user.id, full_name:next.name.trim(), age:Number(next.age), gender:next.gender || "Prefer not to say", height_cm:Number(next.height), weight_kg:Number(next.weight), activity_level:next.activity || "Moderate", fitness_goal:next.goal, updated_at:new Date().toISOString() };
    const { error } = await supabase.from("profiles").upsert(row);
    if (error) setSaveError(`Could not save your profile: ${error.message}`);
    else { setProfile(next); setSaveError(""); }
  };

  const signOut = async () => { await supabase.auth.signOut(); setProfile(null); setUserData({ meals:[], steps:0, water:0, sleep:0 }); };

  if (!isSupabaseConfigured) return <div className="auth-screen"><div className="auth-card"><Brand/><h1>Connect your Supabase project</h1><p className="auth-subtitle">Create a <code>.env</code> file in the project root and add your Supabase Project URL and publishable/anon key. Then restart the Vite server.</p><div className="auth-alert">Supabase environment variables are missing. See README.md for setup steps.</div></div></div>;
  if (authLoading) return <div className="auth-screen"><div className="auth-card"><Brand/><p>Loading your secure account…</p></div></div>;
  if (!session) return <AuthScreen mode={authMode} setMode={m=>{setAuthMode(m);setAuthError("");setAuthMessage("");}} form={authForm} setForm={setAuthForm} onSubmit={handleAuth} busy={busy} error={authError} message={authMessage}/>;
  if (dataLoading) return <div className="auth-screen"><div className="auth-card"><Brand/><p>Loading your personal dashboard…</p></div></div>;
  if (needsProfile) return <div className="auth-screen"><div className="auth-card profile-setup-card"><Brand/><div className="eyebrow">YOUR PERSONAL BASELINE</div><h1>Let's set up your profile</h1><p className="auth-subtitle">These details help CalorIQ tailor your daily wellness dashboard.</p>{authError&&<div className="auth-alert">{authError}</div>}<form onSubmit={saveProfile} className="auth-form"><Field label="Full name" value={profileForm.name} onChange={v=>setProfileForm({...profileForm,name:v})} required/><div className="form-grid two"><Field label="Age" type="number" value={profileForm.age} onChange={v=>setProfileForm({...profileForm,age:v})} required/><label className="field"><span>Gender</span><select value={profileForm.gender} onChange={e=>setProfileForm({...profileForm,gender:e.target.value})}><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option></select></label><Field label="Height (cm)" type="number" value={profileForm.height} onChange={v=>setProfileForm({...profileForm,height:v})} required/><Field label="Current weight (kg)" type="number" value={profileForm.weight} onChange={v=>setProfileForm({...profileForm,weight:v})} required/><label className="field"><span>Activity level</span><select value={profileForm.activity} onChange={e=>setProfileForm({...profileForm,activity:e.target.value})}><option>Sedentary</option><option>Light</option><option>Moderate</option><option>Active</option><option>Very active</option></select></label><label className="field"><span>Fitness goal</span><select value={profileForm.goal} onChange={e=>setProfileForm({...profileForm,goal:e.target.value})}><option>Lose body fat</option><option>Maintain weight</option><option>Build muscle</option></select></label></div><button className="primary-button wide" disabled={busy}>{busy?"Saving profile…":"Save and open dashboard"}</button></form><button className="auth-link-button" onClick={signOut}>Sign out</button></div></div>;
  return <><Dashboard key={session.user.id} user={session.user} initialProfile={profile} initialData={userData} onSaveData={persistData} onSaveProfile={persistProfile} onSignOut={signOut}/>{saveError&&<div className="save-error">{saveError}</div>}</>;
}

function Brand(){return <div className="auth-brand"><div className="brand-mark"><Activity size={21}/></div><span>Calor<span className="brand-accent">IQ</span></span></div>;}
function AuthScreen({mode,setMode,form,setForm,onSubmit,busy,error,message}) {
  return <div className="auth-screen"><div className="auth-card"><Brand/><div className="eyebrow">YOUR HEALTH, IN FOCUS</div><h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1><p className="auth-subtitle">{mode === "signup" ? "Start building healthier habits with a dashboard that belongs to you." : "Sign in to continue your wellness journey."}</p>{error&&<div className="auth-alert">{error}</div>}{message&&<div className="auth-success">{message}</div>}<form onSubmit={onSubmit} className="auth-form">{mode === "signup"&&<Field label="Full name" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="Your name" required/>}<Field label="Email address" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="you@example.com" required/><Field label="Password" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} placeholder="At least 6 characters" required/><button className="primary-button wide" disabled={busy}>{busy?(mode==="signup"?"Creating account…":"Signing in…"):(mode==="signup"?"Create account":"Sign in")}</button></form><div className="auth-switch">{mode === "signup" ? "Already have an account?" : "New to CalorIQ?"}<button onClick={()=>setMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Sign in" : "Create an account"}</button></div><p className="auth-privacy"><ShieldCheck size={14}/> Your health data is private to your account.</p></div></div>;
}
