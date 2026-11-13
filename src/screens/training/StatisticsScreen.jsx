import { useState, useEffect } from 'react';
import { C } from '../../constants/colours';
import { GL, Card, StatCard, MiniBar, BackBtn } from '../../components/UI';
import { supabase } from '../../services/supabase';
import { canAccess } from '../../services/tier';

const f = "'Manrope',system-ui";

const getWeekStart = () => {
  const d = new Date(); d.setDate(d.getDate() - (d.getDay()||7) + 1); d.setHours(0,0,0,0);
  return d.toISOString().split('T')[0];
};
const getMonthStart = () => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.toISOString().split('T')[0]; };
const days30Ago = () => { const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString().split('T')[0]; };

const fmtPace = mins => { if (!mins) return '--'; const m=Math.floor(mins), s=Math.round((mins-m)*60); return `${m}:${String(s).padStart(2,'0')}`; };

export const StatisticsScreen = ({ userId, userTier, onBack, onUpgrade }) => {
  const [tab, setTab]   = useState('week');
  const [logs, setLogs] = useState([]);
  const [pbs,  setPbs]  = useState([]);
  const [loading, setLoading] = useState(true);

  const hasFullStats = canAccess(userTier, 'fullStats');

  useEffect(() => {
    if (!userId) return;
    const cutoff = hasFullStats ? '2020-01-01' : days30Ago();
    Promise.all([
      supabase.from('activity_logs').select('*').eq('user_id',userId).gte('logged_date',cutoff).order('logged_date',{ascending:false}),
      supabase.from('personal_records').select('*').eq('user_id',userId),
    ]).then(([{ data: al }, { data: pb }]) => {
      setLogs(al??[]); setPbs(pb??[]); setLoading(false);
    });
  }, [userId]);

  const filterLogs = () => {
    const now = new Date().toISOString().split('T')[0];
    if (tab === 'week')  return logs.filter(l => l.logged_date >= getWeekStart());
    if (tab === 'month') return logs.filter(l => l.logged_date >= getMonthStart());
    return logs;
  };

  const fl     = filterLogs();
  const runs   = fl.filter(l => l.activity_type === 'run');
  const totalDist  = fl.reduce((s,l) => s+(l.distance_km??0), 0);
  const totalMins  = fl.reduce((s,l) => s+(l.duration_minutes??0), 0);
  const avgPace    = runs.length > 0 && totalDist > 0
    ? runs.reduce((s,l) => s + ((l.duration_minutes??0)/(l.distance_km||1)), 0) / runs.length
    : null;

  // Sport breakdown
  const byType = fl.reduce((acc,l) => { acc[l.activity_type]=(acc[l.activity_type]??0)+1; return acc; }, {});
  const maxCount = Math.max(...Object.values(byType), 1);

  // Pace trend (last 8 runs)
  const paceTrend = [...logs].filter(l => l.activity_type==='run' && l.distance_km > 0 && l.duration_minutes > 0).slice(0,8).reverse().map(l => ({ date: l.logged_date, pace: l.duration_minutes / l.distance_km }));

  if (loading) return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:C.green, fontSize:'14px', letterSpacing:'0.12em', fontWeight:'700', fontFamily:f }}>LOADING...</p></div>;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ paddingTop:'20px', marginBottom:'16px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:'8px 0 4px', fontFamily:f }}>Statistics</h2>
          {!hasFullStats && <p style={{ color:C.orange, fontSize:'12px', margin:'0 0 12px', fontFamily:f }}>Showing last 30 days — upgrade for full history</p>}
        </div>

        {/* Tab selector */}
        <div style={{ display:'flex', background:C.card, borderRadius:'10px', padding:'3px', border:`1px solid ${C.border}`, marginBottom:'16px' }}>
          {[['week','This week'],['month','This month'],['all','All time']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:'10px', background:tab===id?C.green:'transparent', border:'none', borderRadius:'7px', color:tab===id?C.white:C.mid, fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:f }}>{label}</button>
          ))}
        </div>

        {/* Key stats */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
          <StatCard value={fl.length} label="Sessions" />
          <StatCard value={totalDist>0?`${Math.round(totalDist*10)/10}km`:'-'} label="Distance" />
          <StatCard value={totalMins>0?`${Math.round(totalMins/60)}h`:'-'} label="Time" />
        </div>

        {/* Pace */}
        {avgPace && (
          <Card style={{ marginBottom:'16px' }}>
            <GL text="Average run pace" />
            <p style={{ color:C.dark, fontSize:'28px', fontWeight:'900', margin:'4px 0 2px', fontFamily:f, lineHeight:1 }}>{fmtPace(avgPace)}<span style={{ color:C.light, fontSize:'13px', fontWeight:'500' }}>/km</span></p>
            <p style={{ color:C.mid, fontSize:'12px', margin:0, fontFamily:f }}>Based on {runs.length} run{runs.length!==1?'s':''}</p>
          </Card>
        )}

        {/* Pace trend — simple bar chart */}
        {paceTrend.length >= 3 && (
          <Card style={{ marginBottom:'16px' }}>
            <GL text="Pace trend — last runs" />
            <p style={{ color:C.mid, fontSize:'11px', margin:'2px 0 12px', fontFamily:f }}>Lower is faster</p>
            <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'60px' }}>
              {paceTrend.map((r,i) => {
                const maxP = Math.max(...paceTrend.map(x=>x.pace));
                const minP = Math.min(...paceTrend.map(x=>x.pace));
                const h = maxP===minP ? 50 : 10 + ((r.pace-minP)/(maxP-minP))*50;
                const improving = i > 0 && r.pace < paceTrend[i-1].pace;
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                    <div style={{ width:'100%', height:`${h}px`, background:improving?C.green:C.raised, borderRadius:'4px 4px 0 0', border:`1px solid ${improving?C.greenBorder:C.border}` }} />
                    <p style={{ color:C.light, fontSize:'9px', margin:0, fontFamily:f }}>{fmtPace(r.pace)}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Sport breakdown */}
        {Object.keys(byType).length > 0 && (
          <Card style={{ marginBottom:'16px' }}>
            <GL text="Activity breakdown" />
            <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px' }}>
              {Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([type,count]) => (
                <div key={type}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <p style={{ color:C.dark, fontSize:'13px', fontWeight:'600', margin:0, textTransform:'capitalize', fontFamily:f }}>{type}</p>
                    <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>{count} session{count!==1?'s':''}</p>
                  </div>
                  <MiniBar value={count} max={maxCount} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Personal records */}
        {pbs.length > 0 && (
          <Card style={{ marginBottom:'16px' }}>
            <GL text="Personal records" />
            <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'8px' }}>
              {pbs.map((pb,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:C.raised, borderRadius:'10px' }}>
                  <p style={{ color:C.dark, fontSize:'13px', fontWeight:'600', margin:0, textTransform:'capitalize', fontFamily:f }}>{pb.category.replace(/_/g,' ')}</p>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ color:C.green, fontSize:'14px', fontWeight:'700', margin:0, fontFamily:f }}>{pb.value} {pb.unit}</p>
                    <p style={{ color:C.light, fontSize:'10px', margin:0, fontFamily:f }}>{new Date(pb.achieved_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {fl.length === 0 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'16px', padding:'40px 24px', textAlign:'center' }}>
            <p style={{ color:C.dark, fontSize:'16px', fontWeight:'700', margin:'0 0 8px', fontFamily:f }}>No sessions logged yet</p>
            <p style={{ color:C.mid, fontSize:'13px', margin:0, lineHeight:1.6, fontFamily:f }}>Log your first session to start seeing your statistics here.</p>
          </div>
        )}

        {!hasFullStats && (
          <div style={{ background:C.premiumLight, border:`1px solid ${C.premium}`, borderRadius:'14px', padding:'16px', marginBottom:'16px', textAlign:'center' }}>
            <p style={{ color:C.premium, fontSize:'13px', fontWeight:'700', margin:'0 0 4px', fontFamily:f }}>Full statistics on Premium</p>
            <p style={{ color:C.mid, fontSize:'13px', margin:'0 0 12px', lineHeight:1.5, fontFamily:f }}>See all-time stats, full pace trend and complete history.</p>
            <button onClick={onUpgrade} style={{ background:C.premium, color:'#fff', border:'none', borderRadius:'10px', padding:'10px 24px', fontWeight:'700', fontSize:'13px', cursor:'pointer', fontFamily:f }}>Upgrade to Premium</button>
          </div>
        )}
      </div>
    </div>
  );
};
