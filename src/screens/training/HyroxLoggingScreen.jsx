import { useState } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL, BackBtn } from '../../components/UI';
import { supabase } from '../../services/supabase';

const f = "'Manrope',system-ui";

const STATIONS = [
  {id:'skierg',   name:'SkiErg',          unit:'1km', tip:'Maintain consistent rhythm. Do not sprint the first 200m. Most athletes slow significantly if they go out too fast.'},
  {id:'sled_push',name:'Sled Push',        unit:'50m', tip:'Stay low and drive with your legs. Position hands high on the sled. Short powerful steps beat long strides.'},
  {id:'sled_pull',name:'Sled Pull',        unit:'50m', tip:'Stay upright and walk backwards with control. Do not let the rope go slack between pulls.'},
  {id:'burpees',  name:'Burpee Broad Jumps',unit:'80 reps', tip:'Find a rhythm early. Break into sets of 10-15 if needed. Jumping far on each burpee reduces total rep count mentally.'},
  {id:'rowing',   name:'Rowing',           unit:'1km', tip:'Start at a controlled pace. Your split should be sustainable for the full kilometre. Legs drive first, not arms.'},
  {id:'farmers',  name:'Farmers Carry',    unit:'200m', tip:'Keep shoulders back and walk tall. Do not let the handles drop below waist height. Set down if form breaks.'},
  {id:'lunges',   name:'Sandbag Lunges',   unit:'100m', tip:'Keep the sandbag on one shoulder. Alternate which shoulder if allowed. Step long and controlled.'},
  {id:'wallballs', name:'Wall Balls',      unit:'100 reps', tip:'Aim for the same spot on the wall every rep. Do not catch the ball too high — let it drop slightly to reduce arm fatigue. Break early into sets.'},
];

export const HyroxLoggingScreen = ({ userId, onBack, onDone }) => {
  const [results, setResults] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const update = (id,field,val) => setResults(p=>({...p,[id]:{...p[id],[field]:val}}));

  const save = async () => {
    setSaving(true);
    await supabase.from('activity_logs').insert({ user_id:userId, activity_type:'hyrox', logged_date:new Date().toISOString().split('T')[0], notes:'Hyrox Stations: '+JSON.stringify(results), device_source:'manual' });
    setSaving(false); setSaved(true);
    setTimeout(()=>onDone(), 1500);
  };

  const inp = { background:C.raised, border:`1px solid ${C.border}`, borderRadius:'10px', color:C.dark, fontSize:'14px', padding:'11px 12px', outline:'none', fontFamily:f, width:'100%', boxSizing:'border-box' };

  if (saved) return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:f }}><div style={{ textAlign:'center', padding:'40px' }}><p style={{ fontSize:'40px', margin:'0 0 16px' }}>🙌</p><p style={{ color:C.green, fontSize:'20px', fontWeight:'800', margin:'0 0 8px', fontFamily:f }}>Session logged</p><p style={{ color:C.mid, fontSize:'14px', margin:0, fontFamily:f }}>Every station counts.</p></div></div>;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'16px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>Hyrox Station Log</h2>
        </div>
        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'12px', padding:'12px 16px', marginBottom:'20px' }}>
          <GL text="Log your station performance" />
          <p style={{ color:C.mid, fontSize:'13px', margin:'4px 0 0', lineHeight:1.5, fontFamily:f }}>Record time and notes per station. This builds your Hyrox performance profile over time.</p>
        </div>
        {STATIONS.map((s,i)=>(
          <div key={s.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', marginBottom:'12px' }}>
            <p style={{ color:C.light, fontSize:'11px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 4px', fontFamily:f }}>Station {i+1}</p>
            <p style={{ color:C.dark, fontSize:'16px', fontWeight:'700', margin:'0 0 2px', fontFamily:f }}>{s.name}</p>
            <p style={{ color:C.mid, fontSize:'12px', margin:'0 0 8px', fontFamily:f }}>{s.unit}</p>
            <p style={{ color:C.mid, fontSize:'12px', lineHeight:1.5, margin:'0 0 12px', fontFamily:f }}>{s.tip}</p>
            <div style={{ display:'flex', gap:'8px' }}>
              <div style={{ flex:1 }}><p style={{ color:C.mid, fontSize:'10px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 6px', fontFamily:f }}>Time</p><input placeholder="e.g. 3:45" value={results[s.id]?.time??''} onChange={e=>update(s.id,'time',e.target.value)} style={inp} /></div>
              <div style={{ flex:1 }}><p style={{ color:C.mid, fontSize:'10px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 6px', fontFamily:f }}>Notes</p><input placeholder="Weight, reps..." value={results[s.id]?.notes??''} onChange={e=>update(s.id,'notes',e.target.value)} style={inp} /></div>
            </div>
          </div>
        ))}
        <button onClick={save} disabled={saving} style={gbtn(C.green,C.white,{opacity:saving?0.5:1,marginTop:'8px'})}>{saving?'SAVING...':'SAVE HYROX SESSION'}</button>
        <button onClick={onBack} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}`, marginTop:'10px' }}>Cancel</button>
      </div>
    </div>
  );
};
