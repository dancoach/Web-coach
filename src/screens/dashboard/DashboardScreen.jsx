import { useState, useEffect } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL, Card, StatCard, MiniBar, BottomModal, TierBadge } from '../../components/UI';
import { LogoText } from '../../components/Logo';
import { supabase } from '../../services/supabase';
import { EVENTS } from '../../constants/data';

const f = "'Manrope',system-ui";
const pad2 = n => String(n).padStart(2,'0');
const fmtCountdown = (d) => {
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff < 0) return 'Past';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return `${diff} days`;
  if (diff < 30) return `${Math.floor(diff/7)}w ${diff%7}d`;
  return `${Math.floor(diff/30)}mo ${Math.floor((diff%30)/7)}w`;
};

const getWeekRange = () => {
  const now = new Date();
  const mon = new Date(now); mon.setDate(now.getDate() - (now.getDay()||7) + 1); mon.setHours(0,0,0,0);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
  return { mon: mon.toISOString(), sun: sun.toISOString() };
};

const getTrainingLoad = (logs) => {
  if (!logs || logs.length === 0) return 'green';
  const recent = logs.filter(l => new Date(l.logged_date) > new Date(Date.now() - 7*86400000));
  if (recent.length >= 6) return 'red';
  if (recent.length >= 5) return 'amber';
  return 'green';
};

const loadColour = { green: C.green, amber: C.orange, red: C.red };
const loadLabel  = { green: 'Good load', amber: 'High load', red: 'Recovery needed' };

export const DashboardScreen = ({ userId, onViewWeek, onViewLeaderboard, onViewFriends, onEditProfile, onStartGPS, onEventComplete, onSignOut, onAddEvent }) => {
  const [profile,      setProfile]      = useState(null);
  const [events,       setEvents]       = useState([]);
  const [streak,       setStreak]       = useState(null);
  const [weekLogs,     setWeekLogs]     = useState([]);
  const [lastWeekLogs, setLastWeekLogs] = useState([]);
  const [recentLogs,   setRecentLogs]   = useState([]);
  const [pbs,          setPbs]          = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [selectedEvent,setSelectedEvent]= useState(null);
  const [completionRes,setCompletionRes]= useState('');
  const [weekSummary,  setWeekSummary]  = useState(null);

  useEffect(() => { if (userId) load(); }, [userId]);

  const load = async () => {
    const [{ data: p }, { data: ev }, { data: st }, { data: al }, { data: pb }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id',userId).single(),
      supabase.from('user_events').select('*').eq('user_id',userId).eq('is_active',true).order('event_date',{ascending:true}),
      supabase.from('streaks').select('*').eq('user_id',userId).single(),
      supabase.from('activity_logs').select('*').eq('user_id',userId).order('logged_date',{ascending:false}).limit(30),
      supabase.from('personal_records').select('*').eq('user_id',userId).order('achieved_at',{ascending:false}).limit(3),
    ]);
    setProfile(p); setEvents(ev??[]); setStreak(st); setPbs(pb??[]);
    const logs = al??[];
    const { mon, sun } = getWeekRange();
    setWeekLogs(logs.filter(l => l.logged_date >= mon.split('T')[0] && l.logged_date <= sun.split('T')[0]));
    setRecentLogs(logs);

    // Last week for comparison
    const lastMon = new Date(mon); lastMon.setDate(lastMon.getDate()-7);
    const lastSun = new Date(mon); lastSun.setDate(lastSun.getDate()-1);
    const lw = logs.filter(l => l.logged_date >= lastMon.toISOString().split('T')[0] && l.logged_date <= lastSun.toISOString().split('T')[0]);
    setLastWeekLogs(lw);

    // Weekly summary (show if Monday or if last week had sessions)
    const isMonday = new Date().getDay() === 1;
    if (isMonday || lw.length > 0) {
      const lwDist = lw.reduce((s,l) => s+(l.distance_km??0),0);
      const twDist = logs.filter(l => l.logged_date >= mon.split('T')[0]).reduce((s,l) => s+(l.distance_km??0),0);
      setWeekSummary({ sessions: lw.length, distance: Math.round(lwDist*10)/10, thisWeekSessions: logs.filter(l => l.logged_date >= mon.split('T')[0]).length, thisWeekDist: Math.round(twDist*10)/10 });
    }
    setLoading(false);
  };

  const weekDist   = weekLogs.reduce((s,l) => s+(l.distance_km??0),0);
  const weekTarget = profile?.training_frequency ?? 4;
  const loadStatus = getTrainingLoad(recentLogs);
  const nextEvent  = events[0];
  const eventInfo  = nextEvent ? EVENTS.find(e => e.id === nextEvent.event_type) : null;

  if (loading) return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:C.green, fontSize:'14px', letterSpacing:'0.12em', fontWeight:'700', fontFamily:f }}>LOADING...</p></div>;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'20px', marginBottom:'20px' }}>
          <LogoText />
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <TierBadge tier={profile?.tier} />
            <button onClick={onEditProfile} style={{ width:'36px', height:'36px', background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'50%', color:C.green, fontWeight:'800', fontSize:'14px', cursor:'pointer', fontFamily:f }}>
              {profile?.username?.[0]?.toUpperCase()??'?'}
            </button>
          </div>
        </div>

        {/* Weekly summary card — shows on Monday or after a week with sessions */}
        {weekSummary && weekSummary.sessions > 0 && (
          <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderLeft:`3px solid ${C.green}`, borderRadius:'14px', padding:'14px 16px', marginBottom:'16px' }}>
            <GL text="Last week" />
            <p style={{ color:C.dark, fontSize:'14px', lineHeight:1.6, margin:'4px 0 0', fontFamily:f }}>
              {weekSummary.sessions} session{weekSummary.sessions!==1?'s':''} completed
              {weekSummary.distance > 0 ? ` · ${weekSummary.distance}km covered` : ''}
              {weekSummary.sessions >= weekTarget ? ' · Great week, target hit.' : ` · ${weekTarget - weekSummary.sessions} session${weekTarget-weekSummary.sessions!==1?'s':''} short of your goal.`}
            </p>
          </div>
        )}

        {/* Training load */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <GL text="Training load" />
            <p style={{ color:loadColour[loadStatus], fontSize:'14px', fontWeight:'700', margin:'2px 0 0', fontFamily:f }}>{loadLabel[loadStatus]}</p>
          </div>
          <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:loadStatus==='green'?C.greenLight:loadStatus==='amber'?'rgba(183,119,13,0.12)':'rgba(184,50,50,0.12)', border:`2px solid ${loadColour[loadStatus]}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'16px' }}>{loadStatus==='green'?'✓':loadStatus==='amber'?'!':'⚠'}</span>
          </div>
        </div>

        {/* This week progress */}
        <Card style={{ marginBottom:'16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
            <div>
              <GL text="This week" />
              <p style={{ color:C.dark, fontSize:'22px', fontWeight:'900', margin:'4px 0 0', fontFamily:f, lineHeight:1 }}>{weekLogs.length}<span style={{ color:C.light, fontSize:'14px', fontWeight:'500' }}>/{weekTarget}</span></p>
              <p style={{ color:C.mid, fontSize:'12px', margin:'2px 0 0', fontFamily:f }}>sessions</p>
            </div>
            {weekDist > 0 && (
              <div style={{ textAlign:'right' }}>
                <GL text="Distance" />
                <p style={{ color:C.dark, fontSize:'22px', fontWeight:'900', margin:'4px 0 0', fontFamily:f, lineHeight:1 }}>{Math.round(weekDist*10)/10}<span style={{ color:C.light, fontSize:'12px' }}>km</span></p>
              </div>
            )}
          </div>
          <MiniBar value={weekLogs.length} max={weekTarget} />
          {weekLogs.length > 0 && weekLogs.length < weekTarget && (
            <p style={{ color:C.mid, fontSize:'12px', margin:'8px 0 0', fontFamily:f }}>{weekTarget - weekLogs.length} more to hit your weekly target</p>
          )}
          {weekLogs.length >= weekTarget && (
            <p style={{ color:C.green, fontSize:'12px', fontWeight:'700', margin:'8px 0 0', fontFamily:f }}>Weekly target hit 🎯</p>
          )}
        </Card>

        {/* Streak */}
        {streak && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'14px 16px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <GL text="Streak" />
              <p style={{ color:C.dark, fontSize:'22px', fontWeight:'900', margin:'4px 0 0', fontFamily:f, lineHeight:1 }}>{streak.current_streak ?? 0} <span style={{ color:C.mid, fontSize:'13px', fontWeight:'500' }}>days</span></p>
            </div>
            <div style={{ textAlign:'right' }}>
              <GL text="Best" />
              <p style={{ color:C.light, fontSize:'16px', fontWeight:'700', margin:'4px 0 0', fontFamily:f }}>{streak.longest_streak ?? 0}d</p>
            </div>
          </div>
        )}

        {/* Recent PBs */}
        {pbs.length > 0 && (
          <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'14px 16px', marginBottom:'16px' }}>
            <GL text="Recent personal bests" />
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'6px' }}>
              {pbs.map((pb,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ color:C.dark, fontSize:'13px', fontWeight:'600', margin:0, fontFamily:f }}>{pb.category.replace(/_/g,' ')}</p>
                  <p style={{ color:C.green, fontSize:'13px', fontWeight:'700', margin:0, fontFamily:f }}>{pb.value} {pb.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next event */}
        {nextEvent ? (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
              <div>
                <GL text="Next event" />
                <p style={{ color:C.dark, fontSize:'18px', fontWeight:'800', margin:'4px 0 4px', fontFamily:f }}>{eventInfo?.name ?? nextEvent.event_type}</p>
                <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>{new Date(nextEvent.event_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0, marginLeft:'12px' }}>
                <p style={{ color:C.green, fontSize:'28px', fontWeight:'900', margin:0, fontFamily:f, lineHeight:1 }}>{fmtCountdown(nextEvent.event_date)}</p>
              </div>
            </div>
            {!nextEvent.completion_noted && new Date(nextEvent.event_date) <= new Date() && (
              <button onClick={() => { setSelectedEvent(nextEvent); setShowComplete(true); }} style={gbtn(C.green,C.white)}>LOG RACE RESULT</button>
            )}
          </div>
        ) : (
          <button onClick={onAddEvent} style={{ ...gbtn('transparent',C.green), border:`1px solid ${C.green}`, marginBottom:'16px' }}>+ ADD YOUR FIRST EVENT</button>
        )}

        {/* Quick actions */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          <button onClick={onViewWeek}       style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', cursor:'pointer', textAlign:'left' }}>
            <p style={{ color:C.green, fontSize:'20px', margin:'0 0 4px' }}>📋</p>
            <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:0, fontFamily:f }}>This week</p>
          </button>
          <button onClick={onStartGPS}       style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', cursor:'pointer', textAlign:'left' }}>
            <p style={{ color:C.green, fontSize:'20px', margin:'0 0 4px' }}>📍</p>
            <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:0, fontFamily:f }}>Start GPS run</p>
          </button>
          <button onClick={onViewLeaderboard} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', cursor:'pointer', textAlign:'left' }}>
            <p style={{ color:C.green, fontSize:'20px', margin:'0 0 4px' }}>🏆</p>
            <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:0, fontFamily:f }}>Leaderboard</p>
          </button>
          <button onClick={onViewFriends}    style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', cursor:'pointer', textAlign:'left' }}>
            <p style={{ color:C.green, fontSize:'20px', margin:'0 0 4px' }}>👥</p>
            <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:0, fontFamily:f }}>Friends</p>
          </button>
        </div>

        <button onClick={onSignOut} style={{ background:'none', border:'none', color:C.light, fontSize:'12px', cursor:'pointer', padding:'8px 0', fontFamily:f, width:'100%', textAlign:'center' }}>Sign out</button>
      </div>

      {/* Race completion modal */}
      <BottomModal visible={showComplete} onClose={() => setShowComplete(false)} title="How did the race go?">
        <textarea
          placeholder="Share how it went — finish time, how you felt, highlights..."
          value={completionRes}
          onChange={e => setCompletionRes(e.target.value)}
          rows={4}
          style={{ ...{ width:'100%', boxSizing:'border-box', background:C.raised, border:`1px solid ${C.border}`, borderRadius:'12px', color:C.dark, fontSize:'14px', padding:'14px', outline:'none', fontFamily:f, resize:'none', lineHeight:1.6 }, marginBottom:'16px' }}
        />
        <button onClick={() => { onEventComplete(completionRes, selectedEvent); setShowComplete(false); }} style={gbtn(C.green,C.white)}>LOG RESULT</button>
        <button onClick={() => setShowComplete(false)} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}`, marginTop:'10px' }}>Cancel</button>
      </BottomModal>
    </div>
  );
};
