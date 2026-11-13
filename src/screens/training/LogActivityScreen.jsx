import { useState } from 'react';
import { C, S, gbtn } from '../../constants/colours';
import { GL, BackBtn } from '../../components/UI';
import { supabase } from '../../services/supabase';

const f = "'Manrope',system-ui";
const inp = S.inp;

const TYPES = ['run','strength','hyrox','cycling','swimming','cross-training','other'];

export const LogActivityScreen = ({ userId, selectedWorkout, gpsResult, onSave, onBack }) => {
  const [type,  setType]  = useState(selectedWorkout?.type ?? 'run');
  const [dist,  setDist]  = useState(gpsResult?.distance?.toString() ?? '');
  const [dur,   setDur]   = useState(gpsResult?.duration?.toString() ?? '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    setSaving(true);
    const log = {
      user_id: userId,
      activity_type: type,
      distance_km: dist ? Number(dist) : null,
      duration_minutes: dur ? Number(dur) : null,
      notes: notes || null,
      logged_date: new Date().toISOString().split('T')[0],
      device_source: gpsResult ? 'gps' : 'manual',
    };
    const { data } = await supabase.from('activity_logs').insert(log).select().single();
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const { data: st } = await supabase.from('streaks').select('*').eq('user_id',userId).maybeSingle();
    if (!st) {
      await supabase.from('streaks').insert({ user_id:userId, current_streak:1, longest_streak:1, last_active:today });
    } else {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
      const yd = yesterday.toISOString().split('T')[0];
      const newStreak = st.last_active === yd ? st.current_streak+1 : 1;
      await supabase.from('streaks').update({ current_streak:newStreak, longest_streak:Math.max(newStreak,st.longest_streak??0), last_active:today }).eq('user_id',userId);
    }
    setSaving(false);
    onSave(data ?? log);
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'24px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>Log Activity</h2>
        </div>
        {gpsResult && (
          <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'12px', padding:'14px 16px', marginBottom:'16px' }}>
            <GL text="GPS Session" />
            <div style={{ display:'flex', gap:'20px', marginTop:'6px' }}>
              <div><p style={{ color:C.green, fontSize:'20px', fontWeight:'700', margin:0, fontFamily:f }}>{gpsResult.distance}km</p><p style={{ color:C.mid, fontSize:'11px', margin:0, fontFamily:f }}>Distance</p></div>
              <div><p style={{ color:C.green, fontSize:'20px', fontWeight:'700', margin:0, fontFamily:f }}>{gpsResult.duration}min</p><p style={{ color:C.mid, fontSize:'11px', margin:0, fontFamily:f }}>Duration</p></div>
            </div>
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <p style={{ color:C.mid, fontSize:'12px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>Activity type</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {TYPES.map(t=><button key={t} onClick={()=>setType(t)} style={{ padding:'8px 14px', background:type===t?C.greenLight:'transparent', border:`1px solid ${type===t?C.green:C.border}`, borderRadius:'20px', color:type===t?C.green:C.mid, fontSize:'13px', fontWeight:type===t?'700':'500', cursor:'pointer', fontFamily:f, textTransform:'capitalize' }}>{t}</button>)}
            </div>
          </div>
          <div>
            <p style={{ color:C.mid, fontSize:'12px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>Distance (km)</p>
            <input placeholder="e.g. 5.2" type="number" value={dist} onChange={e=>setDist(e.target.value)} style={inp} />
          </div>
          <div>
            <p style={{ color:C.mid, fontSize:'12px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>Duration (minutes)</p>
            <input placeholder="e.g. 35" type="number" value={dur} onChange={e=>setDur(e.target.value)} style={inp} />
          </div>
          <div>
            <p style={{ color:C.mid, fontSize:'12px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>Notes (optional)</p>
            <textarea placeholder="How did it feel? Anything to remember..." value={notes} onChange={e=>setNotes(e.target.value)} rows={3} style={{ ...inp, resize:'none', lineHeight:1.6 }} />
          </div>
          <button onClick={handle} disabled={saving||(!dist&&!dur)} style={gbtn(C.green,C.white,{opacity:(saving||(!dist&&!dur))?0.5:1})}>{saving?'SAVING...':'LOG ACTIVITY'}</button>
          <button onClick={onBack} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}` }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
