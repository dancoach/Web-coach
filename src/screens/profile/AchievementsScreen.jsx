import { useState, useEffect } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL, Card, BackBtn, CentreModal } from '../../components/UI';
import { supabase } from '../../services/supabase';

const f = "'Manrope',system-ui";

const ALL_ACHIEVEMENTS = [
  { id:'first_session',   emoji:'🏃', name:'First step',         desc:'Log your first training session', reward:null },
  { id:'first_gps',       emoji:'📍', name:'On the map',         desc:'Complete your first GPS tracked run', reward:null },
  { id:'first_friend',    emoji:'👥', name:'Better together',    desc:'Add your first friend to COACH', reward:null },
  { id:'first_challenge', emoji:'⚔️', name:'Game on',            desc:'Create your first friend challenge', reward:null },
  { id:'streak_7',        emoji:'🔥', name:'One week',           desc:'Keep a 7-day training streak', reward:null },
  { id:'streak_30',       emoji:'🏅', name:'30-day warrior',     desc:'Keep a 30-day streak — no misses', reward:'7 days free Premium' },
  { id:'streak_90',       emoji:'🏆', name:'90-day champion',    desc:'Keep a 90-day streak — the elite few', reward:'1 month free Premium' },
  { id:'sessions_10',     emoji:'💪', name:'Getting started',    desc:'Log 10 training sessions', reward:null },
  { id:'sessions_50',     emoji:'⭐', name:'Committed',          desc:'Log 50 training sessions', reward:null },
  { id:'first_pb',        emoji:'🎯', name:'Personal best',      desc:'Set your first personal record', reward:null },
  { id:'first_event',     emoji:'🎉', name:'Race day',           desc:'Complete your first event', reward:'2 weeks free Premium' },
  { id:'referral_first',  emoji:'🤝', name:'Spread the word',    desc:'Refer your first friend to COACH', reward:'2 weeks free Premium' },
];

export const AchievementsScreen = ({ userId, onBack }) => {
  const [earned,   setEarned]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase.from('achievements').select('*').eq('user_id', userId).then(({ data }) => { setEarned(data??[]); setLoading(false); });
  }, [userId]);

  const earnedIds  = new Set(earned.map(e => e.achievement_id));
  const earnedMap  = Object.fromEntries(earned.map(e => [e.achievement_id, e]));
  const earnedList = ALL_ACHIEVEMENTS.filter(a => earnedIds.has(a.id));
  const lockedList = ALL_ACHIEVEMENTS.filter(a => !earnedIds.has(a.id));

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ paddingTop:'20px', marginBottom:'20px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:'8px 0 4px', fontFamily:f }}>Achievements</h2>
          <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>{earnedList.length} of {ALL_ACHIEVEMENTS.length} earned</p>
        </div>

        {/* Progress bar */}
        <div style={{ background:C.raised, borderRadius:'4px', height:'6px', marginBottom:'20px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${(earnedList.length/ALL_ACHIEVEMENTS.length)*100}%`, background:C.green, borderRadius:'4px', transition:'width 0.4s ease' }} />
        </div>

        {/* Earned */}
        {earnedList.length > 0 && (
          <>
            <GL text="Earned" />
            <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
              {earnedList.map(a => {
                const data = earnedMap[a.id];
                return (
                  <div key={a.id} onClick={() => data?.gift_code && setSelected({ ...a, ...data })}
                    style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'14px 16px', cursor:data?.gift_code?'pointer':'default', display:'flex', alignItems:'center', gap:'14px' }}>
                    <span style={{ fontSize:'28px', flexShrink:0 }}>{a.emoji}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:'0 0 2px', fontFamily:f }}>{a.name}</p>
                      <p style={{ color:C.mid, fontSize:'12px', margin:0, fontFamily:f }}>{a.desc}</p>
                      {a.reward && <p style={{ color:C.green, fontSize:'11px', fontWeight:'700', margin:'4px 0 0', fontFamily:f }}>🎁 {a.reward}</p>}
                    </div>
                    {data?.gift_code && <span style={{ color:C.green, fontSize:'16px' }}>›</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Locked */}
        <GL text="Locked" />
        <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
          {lockedList.map(a => (
            <div key={a.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'14px', opacity:0.6 }}>
              <span style={{ fontSize:'28px', flexShrink:0, filter:'grayscale(1)' }}>{a.emoji}</span>
              <div style={{ flex:1 }}>
                <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:'0 0 2px', fontFamily:f }}>{a.name}</p>
                <p style={{ color:C.mid, fontSize:'12px', margin:0, fontFamily:f }}>{a.desc}</p>
                {a.reward && <p style={{ color:C.orange, fontSize:'11px', fontWeight:'700', margin:'4px 0 0', fontFamily:f }}>🎁 Earns: {a.reward}</p>}
              </div>
              <span style={{ color:C.light, fontSize:'16px' }}>🔒</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gift code modal */}
      <CentreModal visible={!!selected}>
        {selected && (
          <>
            <p style={{ fontSize:'40px', margin:'0 0 8px' }}>{selected.emoji}</p>
            <p style={{ color:C.dark, fontSize:'18px', fontWeight:'800', margin:'0 0 8px', fontFamily:f }}>{selected.name}</p>
            <p style={{ color:C.mid, fontSize:'13px', lineHeight:1.6, margin:'0 0 16px', fontFamily:f }}>You earned: <strong>{selected.reward}</strong></p>
            <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'12px', padding:'14px', marginBottom:'16px' }}>
              <p style={{ color:C.light, fontSize:'11px', margin:'0 0 4px', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:f }}>Your gift code</p>
              <p style={{ color:C.green, fontSize:'18px', fontWeight:'900', margin:0, fontFamily:f, letterSpacing:'0.1em' }}>{selected.gift_code}</p>
            </div>
            <p style={{ color:C.mid, fontSize:'12px', margin:'0 0 16px', fontFamily:f }}>Enter this code in Profile → Redeem code</p>
            <button onClick={() => setSelected(null)} style={gbtn(C.green, C.white)}>DONE</button>
          </>
        )}
      </CentreModal>
    </div>
  );
};
