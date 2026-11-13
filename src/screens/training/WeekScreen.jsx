// COACH — Week Screen with AI plan, skip popup, heart rate zones, training load
import { useState, useEffect } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL, Card, Tag, BackBtn, BottomModal, StatCard } from '../../components/UI';
import { supabase } from '../../services/supabase';
import { canAccess } from '../../services/tier';
import { EVENTS, HYROX_STATIONS, getExercises, getWeekType } from '../../constants/data';

const f = "'Manrope',system-ui";
const EDGE_FN = 'Generate-training-plan';

// Heart rate zones from age
const getHRZones = (age) => {
  const max = 220 - (age || 30);
  return [
    { zone:1, name:'Recovery',   pct:'50–60%', min:Math.round(max*0.50), max:Math.round(max*0.60), colour:'#64C6C8' },
    { zone:2, name:'Aerobic',    pct:'60–70%', min:Math.round(max*0.60), max:Math.round(max*0.70), colour:'#64974a' },
    { zone:3, name:'Tempo',      pct:'70–80%', min:Math.round(max*0.70), max:Math.round(max*0.80), colour:'#F0A500' },
    { zone:4, name:'Threshold',  pct:'80–90%', min:Math.round(max*0.80), max:Math.round(max*0.90), colour:'#E07020' },
    { zone:5, name:'Max effort', pct:'90%+',   min:Math.round(max*0.90), max,                        colour:'#b83232' },
  ];
};

const SESSION_HR_TARGET = { 'Easy Run':2, 'Tempo Run':4, 'Long Run':2, 'Interval':5 };

const SKIP_REASONS = [
  { id:'tired',       label:'I am exhausted',           consequence:'One missed session will not derail training. Make tomorrow count.', motivation:'Recovery is training. Your muscles repair during rest. Come back stronger.' },
  { id:'busy',        label:'No time today',            consequence:'Reschedule this session to the next available slot.', motivation:'A shortened session is better than nothing. Can you do 20 minutes?' },
  { id:'sore',        label:'Still sore from last time', consequence:'Light movement often speeds recovery more than total rest.', motivation:'Try a 10-minute walk and stretching. Movement is medicine done gently.' },
  { id:'unmotivated', label:'Not feeling it today',     consequence:'Motivation follows action not the other way around.', motivation:'Put your kit on. Just that. Most athletes who get to that point go.' },
  { id:'injury',      label:'Minor pain or discomfort', consequence:'Do not train through sharp pain. See a physio if it persists.', motivation:'Protecting yourself from injury now is smarter than completing one session.' },
];

export const WeekScreen = ({ userId, userProfile, userTier, sessionLocation, setSessionLocation, onBack, onWorkout, onRestDay, onFullPlan, onStats }) => {
  const [plan,       setPlan]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [allEvents,  setAllEvents]  = useState([]);
  const [event,      setEvent]      = useState(null);
  const [error,      setError]      = useState('');
  const [showSkip,   setShowSkip]   = useState(false);
  const [skipDay,    setSkipDay]    = useState(null);
  const [skipReason, setSkipReason] = useState(null);
  const [loadStatus, setLoadStatus] = useState('green');

  const weekType = getWeekType();
  const isGym    = sessionLocation === 'gym';
  const hrZones  = getHRZones(userProfile?.age);
  const hasPlan  = canAccess(userTier, 'aiTrainingPlan');
  const hasLoad  = canAccess(userTier, 'trainingLoad');

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [{ data: ep }, { data: evRows }, { data: logs }] = await Promise.all([
        supabase.from('training_plans').select('*').eq('user_id',userId).maybeSingle(),
        supabase.from('user_events').select('*').eq('user_id',userId).eq('is_active',true).order('event_date',{ascending:true}),
        supabase.from('activity_logs').select('logged_date,activity_type').eq('user_id',userId).order('logged_date',{ascending:false}).limit(14),
      ]);
      const evList = evRows??[];
      setAllEvents(evList); setEvent(evList[0]??null);
      if (ep?.plan_data) setPlan(ep.plan_data);
      // Training load
      const recent = (logs??[]).filter(l => new Date(l.logged_date) > new Date(Date.now()-7*86400000));
      setLoadStatus(recent.length >= 6 ? 'red' : recent.length >= 5 ? 'amber' : 'green');
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleGenerate = async () => {
    setGenerating(true); setError('');
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id',userId).single();
      const { data: evRows }  = await supabase.from('user_events').select('*').eq('user_id',userId).eq('is_active',true).order('event_date',{ascending:true});
      const evList = evRows??[];
      setAllEvents(evList); setEvent(evList[0]??null);
      const { data, error } = await supabase.functions.invoke(EDGE_FN, {
        body:{ userId, events:evList, experienceLevel:profile?.experience_level??'some', trainingDays:profile?.training_frequency??4, injuries:[], trainingLocation:profile?.training_location??'home' }
      });
      if (error) throw error;
      setPlan(data.plan);
    } catch(e) { setError('Could not generate your plan. Check your connection and try again.'); }
    setGenerating(false);
  };

  const buildWeek = () => {
    if (plan?.weeklyStructure) {
      const s = plan.weeklyStructure;
      return ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d,i) => ({
        day: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i],
        ...s[d], aiPowered: true,
      }));
    }
    return [
      { day:'Monday',    title:'Easy Run',  type:'run',      detail:'5km at conversational pace', duration:'40 min', rpe:'6/10' },
      { day:'Tuesday',   title:'Upper Push', type:'strength', detail:'Upper body strength session', duration:'50 min', rpe:'7/10' },
      { day:'Wednesday', title:'Rest Day',  type:'rest',     detail:'Active recovery — walk and stretch', duration:'20 min', rpe:'2/10' },
      { day:'Thursday',  title:'Tempo Run', type:'run',      detail:'6km at comfortably hard pace', duration:'45 min', rpe:'7/10' },
      { day:'Friday',    title:'Lower Body', type:'strength', detail:'Lower body strength session', duration:'50 min', rpe:'7/10' },
      { day:'Saturday',  title:'Long Run',  type:'run',      detail:'10km at easy conversational pace', duration:'70 min', rpe:'6/10' },
      { day:'Sunday',    title:'Rest Day',  type:'rest',     detail:'Complete rest — prioritise sleep', duration:'0 min', rpe:'1/10' },
    ];
  };

  const WEEK = buildWeek();
  const skipReasonsData = SKIP_REASONS.find(r => r.id === skipReason);
  const loadC = { green:C.green, amber:C.orange, red:C.red };
  const loadL = { green:'Good', amber:'High', red:'Rest needed' };

  if (loading) return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:C.green, fontSize:'14px', letterSpacing:'0.12em', fontWeight:'700', fontFamily:f }}>LOADING...</p></div>;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'16px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, flex:1, fontFamily:f }}>This Week</h2>
          <button onClick={onStats} style={{ background:'none', border:'none', color:C.green, cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:f }}>Stats</button>
        </div>

        {/* Training load — premium */}
        {hasLoad && (
          <div style={{ background:C.card, border:`2px solid ${loadC[loadStatus]}22`, borderRadius:'12px', padding:'10px 14px', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p style={{ color:C.light, fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 2px', fontWeight:'700', fontFamily:f }}>Training load</p>
              <p style={{ color:loadC[loadStatus], fontSize:'14px', fontWeight:'700', margin:0, fontFamily:f }}>{loadL[loadStatus]}</p>
            </div>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`${loadC[loadStatus]}18`, border:`2px solid ${loadC[loadStatus]}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'14px' }}>{loadStatus==='green'?'✓':loadStatus==='amber'?'!':'⚠'}</span>
            </div>
          </div>
        )}

        {/* Plan header */}
        <div style={{ background:plan?C.greenLight:C.card, border:`1px solid ${plan?C.greenBorder:C.border}`, borderRadius:'12px', padding:'14px 16px', marginBottom:'14px' }}>
          {plan ? (
            <>
              <GL text={allEvents.length>1?`AI Multi-Event Plan · ${allEvents.length} events`:(event?`AI Plan · ${EVENTS.find(e=>e.id===event.event_type)?.name??event.event_type}`:'AI Training Plan')} />
              <p style={{ color:C.dark, fontSize:'13px', margin:'4px 0 6px', lineHeight:1.5, fontFamily:f }}>{plan.planSummary}</p>
              {plan.currentPhase && (
                <div style={{ background:C.card, borderRadius:'8px', padding:'8px 12px', marginBottom:'8px' }}>
                  <p style={{ color:C.green, fontSize:'11px', fontWeight:'700', margin:'0 0 2px', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:f }}>Current phase</p>
                  <p style={{ color:C.dark, fontSize:'13px', margin:0, fontFamily:f }}>{plan.currentPhase}</p>
                </div>
              )}
              {allEvents.length > 0 && (
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'6px' }}>
                  {allEvents.map((ev,i) => {
                    const info = EVENTS.find(e=>e.id===ev.event_type);
                    const days = ev.event_date ? Math.max(0,Math.ceil((new Date(ev.event_date)-new Date())/86400000)) : null;
                    return <div key={i} style={{ background:C.raised, border:`1px solid ${C.border}`, borderRadius:'20px', padding:'4px 10px', display:'flex', alignItems:'center', gap:'4px' }}>
                      <span style={{ color:C.dark, fontSize:'11px', fontWeight:'600', fontFamily:f }}>{info?.name??ev.event_type}</span>
                      {days!==null && <span style={{ color:C.light, fontSize:'11px', fontFamily:f }}>· {days}d</span>}
                    </div>;
                  })}
                </div>
              )}
              {hasPlan && <button onClick={handleGenerate} disabled={generating} style={{ background:'none', border:'none', color:C.green, fontSize:'12px', cursor:'pointer', fontFamily:f, fontWeight:'600', padding:0 }}>{generating?'Regenerating...':'Regenerate plan'}</button>}
            </>
          ) : hasPlan ? (
            <>
              <GL text="No AI plan yet" />
              <p style={{ color:C.mid, fontSize:'13px', margin:'4px 0 12px', lineHeight:1.5, fontFamily:f }}>
                {allEvents.length>1?`Generate your unified ${allEvents.length}-event training plan. AI will phase training across all events with tapering and transitions.`:event?`Generate your personalised ${EVENTS.find(e=>e.id===event.event_type)?.name??'event'} training plan.`:'Add an event to generate your AI training plan.'}
              </p>
              {error && <p style={{ color:C.red, fontSize:'12px', margin:'0 0 10px', fontFamily:f }}>{error}</p>}
              <button onClick={handleGenerate} disabled={generating} style={gbtn(C.green,C.white,{opacity:generating?0.5:1})}>{generating?'BUILDING YOUR PLAN...':'GENERATE MY PLAN'}</button>
            </>
          ) : (
            <>
              <GL text="Default training week" />
              <p style={{ color:C.mid, fontSize:'13px', margin:'4px 0 10px', lineHeight:1.5, fontFamily:f }}>AI-personalised plans are available on Premium. Your plan will be built around your specific events, experience and schedule.</p>
              <div style={{ background:C.premiumLight, border:`1px solid ${C.premium}`, borderRadius:'10px', padding:'10px 14px' }}>
                <p style={{ color:C.premium, fontSize:'12px', fontWeight:'700', margin:'0 0 2px', fontFamily:f }}>Upgrade to Premium</p>
                <p style={{ color:C.mid, fontSize:'12px', margin:0, fontFamily:f }}>Get your AI training plan for {allEvents.length>0?EVENTS.find(e=>e.id===allEvents[0]?.event_type)?.name??'your event':'your events'}</p>
              </div>
            </>
          )}
        </div>

        {/* Location toggle */}
        {userProfile?.training_location==='both' && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'12px 16px', marginBottom:'14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>At: <strong style={{ color:C.dark }}>{sessionLocation?.charAt(0).toUpperCase()+sessionLocation?.slice(1)}</strong></p>
            <div style={{ display:'flex', background:C.raised, borderRadius:'8px', padding:'3px', border:`1px solid ${C.border}` }}>
              {['gym','home'].map(loc=><button key={loc} onClick={()=>setSessionLocation(loc)} style={{ padding:'6px 10px', background:sessionLocation===loc?C.green:'transparent', border:'none', borderRadius:'5px', color:sessionLocation===loc?C.white:C.mid, fontSize:'11px', fontWeight:'700', cursor:'pointer', textTransform:'uppercase', fontFamily:f }}>{loc}</button>)}
            </div>
          </div>
        )}

        {/* Sessions */}
        {WEEK.map((w,i) => {
          const isToday = i === new Date().getDay()-1;
          const isRest  = w.type==='rest';
          const hrZone  = !isRest && w.type==='run' ? hrZones[SESSION_HR_TARGET[w.title]?? SESSION_HR_TARGET['Easy Run']] : null;
          return (
            <div key={i} style={{ background:isToday?C.greenLight:C.card, border:`1px solid ${isToday?C.green:C.border}`, borderRadius:'14px', padding:'16px', marginBottom:'10px' }}>
              <div onClick={()=>isRest?onRestDay(w):onWorkout({...w,exercises:getExercises(sessionLocation,w.day==='Tuesday',weekType)})} style={{ cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1, marginRight:'12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
                      <p style={{ color:isToday?C.green:C.light, fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', margin:0, fontWeight:'700', fontFamily:f }}>{w.day}{isToday?' — Today':''}</p>
                      {w.aiPowered && <span style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'20px', padding:'1px 6px', color:C.green, fontSize:'9px', fontWeight:'700', fontFamily:f }}>AI</span>}
                    </div>
                    <p style={{ color:C.dark, fontSize:'16px', fontWeight:'700', margin:'0 0 4px', fontFamily:f }}>{w.title}</p>
                    <p style={{ color:C.mid, fontSize:'12px', margin:0, lineHeight:1.5, fontFamily:f }}>{w.detail}</p>
                    {w.duration && w.duration!=='0 min' && (
                      <div style={{ display:'flex', gap:'6px', marginTop:'6px', flexWrap:'wrap' }}>
                        <Tag label={w.duration} />
                        {w.rpe && <Tag label={`RPE ${w.rpe}`} />}
                        {hrZone && canAccess(userTier,'heartRateZones') && <Tag label={`Zone ${hrZone.zone} ${hrZone.min}–${hrZone.max}bpm`} colour={hrZone.colour} />}
                      </div>
                    )}
                  </div>
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:isRest?C.raised:C.greenLight, border:`1px solid ${isRest?C.border:C.greenBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ color:isRest?C.light:C.green, fontSize:'10px', fontWeight:'700', fontFamily:f }}>{isRest?'R':w.type==='run'?'RN':'ST'}</span>
                  </div>
                </div>
              </div>
              {!isRest && <button onClick={()=>{setSkipDay(w);setSkipReason(null);setShowSkip(true);}} style={{ marginTop:'10px', background:'none', border:'none', color:C.light, fontSize:'12px', cursor:'pointer', fontFamily:f, padding:0, textDecoration:'underline' }}>Skip this session</button>}
            </div>
          );
        })}

        <button onClick={onFullPlan} style={{ ...gbtn('transparent',C.green), border:`1px solid ${C.green}`, marginTop:'8px' }}>View Full Plan Overview</button>
      </div>

      {/* Skip modal */}
      <BottomModal visible={showSkip} onClose={()=>setShowSkip(false)} title={`Skip ${skipDay?.day??'session'}?`}>
        {!skipReason ? (
          <>
            <p style={{ color:C.mid, fontSize:'14px', lineHeight:1.6, margin:'0 0 16px', fontFamily:f }}>What is the reason? We will give you the honest advice.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {SKIP_REASONS.map(r=><button key={r.id} onClick={()=>setSkipReason(r.id)} style={{ background:C.raised, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'14px 16px', cursor:'pointer', textAlign:'left', fontFamily:f }}><p style={{ color:C.dark, fontSize:'14px', fontWeight:'600', margin:0, fontFamily:f }}>{r.label}</p></button>)}
            </div>
          </>
        ) : (
          <>
            <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'12px', padding:'14px 16px', marginBottom:'12px' }}>
              <GL text="Your coach says" />
              <p style={{ color:C.dark, fontSize:'14px', lineHeight:1.7, margin:'4px 0 0', fontFamily:f }}>{skipReasonsData?.motivation}</p>
            </div>
            <div style={{ background:C.raised, borderRadius:'12px', padding:'14px 16px', marginBottom:'16px' }}>
              <GL text="If you skip" />
              <p style={{ color:C.mid, fontSize:'14px', lineHeight:1.6, margin:'4px 0 0', fontFamily:f }}>{skipReasonsData?.consequence}</p>
            </div>
            <button onClick={()=>setShowSkip(false)} style={gbtn(C.green,C.white)}>ACTUALLY I WILL DO IT</button>
            <button onClick={()=>setShowSkip(false)} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}`, marginTop:'10px' }}>Skip this session</button>
          </>
        )}
      </BottomModal>
    </div>
  );
};
