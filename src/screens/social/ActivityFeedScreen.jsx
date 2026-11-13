import { useState, useEffect } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL, Card, Avatar, BackBtn } from '../../components/UI';
import { supabase } from '../../services/supabase';

const f = "'Manrope',system-ui";

export const ActivityFeedScreen = ({ userId, onBack }) => {
  const [feed,   setFeed]   = useState([]);
  const [whoops, setWhoops] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: friends } = await supabase.from('friendships').select('friend_id').eq('user_id',userId).eq('status','accepted');
      const ids = [userId, ...(friends??[]).map(f=>f.friend_id)];
      const { data: logs } = await supabase.from('activity_logs').select('*,profiles(username)').in('user_id',ids).order('logged_date',{ascending:false}).limit(30);
      setFeed(logs??[]);
      const { data: wp } = await supabase.from('whoops').select('*').in('activity_id',(logs??[]).map(l=>l.id));
      const wm = {}; (wp??[]).forEach(w=>{ wm[w.activity_id]=(wm[w.activity_id]??0)+1; });
      setWhoops(wm); setLoading(false);
    };
    if (userId) load();
  }, [userId]);

  const whoop = async (actId) => {
    await supabase.from('whoops').insert({ user_id:userId, activity_id:actId });
    setWhoops(w => ({...w,[actId]:(w[actId]??0)+1}));
  };

  const badge = (log) => {
    if (!log.distance_km && !log.duration_minutes) return null;
    const parts = [];
    if (log.distance_km) parts.push(`${log.distance_km}km`);
    if (log.duration_minutes) parts.push(`${log.duration_minutes}min`);
    return parts.join(' · ');
  };

  if (loading) return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:C.green, fontSize:'14px', letterSpacing:'0.12em', fontWeight:'700', fontFamily:f }}>LOADING...</p></div>;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <h2 style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:'20px 0 16px', paddingTop:'20px', fontFamily:f }}>Activity</h2>
        {feed.length === 0 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'16px', padding:'40px 24px', textAlign:'center' }}>
            <p style={{ color:C.dark, fontSize:'16px', fontWeight:'700', margin:'0 0 8px', fontFamily:f }}>Nothing here yet</p>
            <p style={{ color:C.mid, fontSize:'13px', margin:0, lineHeight:1.6, fontFamily:f }}>Log a session or add friends to see activity here.</p>
          </div>
        )}
        {feed.map((log,i) => {
          const isOwn = log.user_id === userId;
          const hasWhooped = false; // simplified — would track per user in production
          const b = badge(log);
          return (
            <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'16px', padding:'16px', marginBottom:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
                <Avatar username={log.profiles?.username} />
                <div style={{ flex:1 }}>
                  <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:'0 0 2px', fontFamily:f }}>{isOwn ? 'You' : log.profiles?.username ?? 'Athlete'}</p>
                  <p style={{ color:C.light, fontSize:'11px', margin:0, fontFamily:f }}>{new Date(log.logged_date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</p>
                </div>
              </div>
              <p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:'0 0 4px', textTransform:'capitalize', fontFamily:f }}>{log.activity_type}</p>
              {b && <p style={{ color:C.green, fontSize:'13px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>{b}</p>}
              {log.notes && <p style={{ color:C.mid, fontSize:'13px', lineHeight:1.6, margin:'0 0 10px', fontFamily:f }}>{log.notes}</p>}
              {!isOwn && (
                <button onClick={()=>whoop(log.id)} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:'20px', padding:'6px 14px', cursor:'pointer', color:C.mid, fontSize:'12px', fontWeight:'600', fontFamily:f, display:'flex', alignItems:'center', gap:'6px' }}>
                  <span>🙌</span> Whoop {whoops[log.id]>0?`· ${whoops[log.id]}`:''}
                </button>
              )}
              {isOwn && whoops[log.id]>0 && <p style={{ color:C.green, fontSize:'12px', fontWeight:'600', margin:'8px 0 0', fontFamily:f }}>🙌 {whoops[log.id]} whoop{whoops[log.id]!==1?'s':''}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
