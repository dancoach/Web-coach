import { useState, useEffect } from 'react';
import { C } from '../../constants/colours';
import { GL, Card, BackBtn, CentreModal } from '../../components/UI';
import { supabase } from '../../services/supabase';

const f = "'Manrope',system-ui";

const PB_CATEGORIES = [
  { id:'fastest_5k',       label:'Fastest 5k',       unit:'min', icon:'🏃' },
  { id:'fastest_10k',      label:'Fastest 10k',      unit:'min', icon:'🏃' },
  { id:'fastest_half',     label:'Fastest Half Marathon', unit:'min', icon:'🏅' },
  { id:'fastest_marathon', label:'Fastest Marathon', unit:'min', icon:'🏆' },
  { id:'longest_run',      label:'Longest run',      unit:'km',  icon:'📍' },
  { id:'most_weekly',      label:'Most sessions in a week', unit:'sessions', icon:'🔥' },
];

const fmtVal = (cat, val) => {
  if (cat.unit === 'min') {
    const h = Math.floor(val/60), m = Math.floor(val%60), s = Math.round((val%1)*60);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  }
  return `${val} ${cat.unit}`;
};

export const PersonalRecordsScreen = ({ userId, onBack }) => {
  const [pbs, setPbs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase.from('personal_records').select('*').eq('user_id', userId)
      .then(({ data }) => { setPbs(data??[]); setLoading(false); });
  }, [userId]);

  const pbMap = Object.fromEntries(pbs.map(p => [p.category, p]));

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ paddingTop:'20px', marginBottom:'20px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:'8px 0 4px', fontFamily:f }}>Personal Records</h2>
          <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>Your best performances — updated automatically as you log sessions</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {PB_CATEGORIES.map(cat => {
            const pb = pbMap[cat.id];
            return (
              <div key={cat.id} style={{ background:pb?C.greenLight:C.card, border:`1px solid ${pb?C.greenBorder:C.border}`, borderRadius:'14px', padding:'16px', display:'flex', alignItems:'center', gap:'14px' }}>
                <span style={{ fontSize:'28px', flexShrink:0 }}>{cat.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:'0 0 2px', fontFamily:f }}>{cat.label}</p>
                  {pb ? (
                    <>
                      <p style={{ color:C.green, fontSize:'20px', fontWeight:'900', margin:'0 0 2px', fontFamily:f, lineHeight:1 }}>{fmtVal(cat, pb.value)}</p>
                      <p style={{ color:C.light, fontSize:'11px', margin:0, fontFamily:f }}>Set {new Date(pb.achieved_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</p>
                    </>
                  ) : (
                    <p style={{ color:C.light, fontSize:'13px', margin:0, fontFamily:f }}>Not set yet — log sessions to set a PB</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderLeft:`3px solid ${C.green}`, borderRadius:'14px', padding:'14px 16px', marginTop:'16px' }}>
          <GL text="How PBs work" />
          <p style={{ color:C.dark, fontSize:'13px', lineHeight:1.6, margin:'4px 0 0', fontFamily:f }}>COACH automatically detects new personal bests every time you log an activity. When you set a new PB you will see a celebration screen and your friends can Whoop your achievement.</p>
        </div>
      </div>
    </div>
  );
};
