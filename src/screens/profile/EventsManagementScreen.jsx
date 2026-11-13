import { useState, useEffect } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL, BackBtn } from '../../components/UI';
import { supabase } from '../../services/supabase';
import { EVENTS } from '../../constants/data';

const f = "'Manrope',system-ui";

export const EventsManagementScreen = ({ userId, onBack }) => {
  const [events,   setEvents]   = useState([]);
  const [adding,   setAdding]   = useState(false);
  const [selType,  setSelType]  = useState('');
  const [selDate,  setSelDate]  = useState('');
  const [selName,  setSelName]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  const load = async () => {
    const { data } = await supabase.from('user_events').select('*').eq('user_id',userId).order('event_date',{ascending:true});
    setEvents(data??[]); setLoading(false);
  };
  useEffect(() => { if (userId) load(); }, [userId]);

  const addEvent = async () => {
    if (!selType || !selDate) return;
    setSaving(true);
    const info = EVENTS.find(e=>e.id===selType);
    await supabase.from('user_events').insert({ user_id:userId, event_type:selType, event_name:selName||info?.name||selType, event_date:selDate, is_active:true });
    setAdding(false); setSelType(''); setSelDate(''); setSelName(''); setSaving(false); load();
  };

  const removeEvent = async (id) => {
    await supabase.from('user_events').update({ is_active:false }).eq('id',id);
    load();
  };

  const inp = { background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', color:C.dark, fontSize:'14px', padding:'14px 16px', outline:'none', fontFamily:f, width:'100%', boxSizing:'border-box' };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'20px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>My Events</h2>
        </div>
        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'12px', padding:'12px 16px', marginBottom:'16px' }}>
          <GL text="Your race calendar" />
          <p style={{ color:C.mid, fontSize:'13px', margin:'4px 0 0', lineHeight:1.5, fontFamily:f }}>COACH builds your AI training plan around all your events simultaneously, with automatic tapering and recovery periods.</p>
        </div>
        {events.map((ev,i) => {
          const info = EVENTS.find(e=>e.id===ev.event_type);
          const days = Math.max(0,Math.ceil((new Date(ev.event_date)-new Date())/86400000));
          const past = days === 0 || new Date(ev.event_date) < new Date();
          return (
            <div key={i} style={{ background:past?C.raised:C.card, border:`1px solid ${past?C.border:C.greenBorder}`, borderRadius:'14px', padding:'16px', marginBottom:'10px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                <div style={{ flex:1, marginRight:'12px' }}>
                  <p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:'0 0 4px', fontFamily:f }}>{ev.event_name}</p>
                  <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>{new Date(ev.event_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  {past ? <span style={{ background:C.raised, border:`1px solid ${C.border}`, borderRadius:'20px', padding:'4px 10px', color:C.light, fontSize:'11px', fontWeight:'700', fontFamily:f }}>Past</span>
                        : <span style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'20px', padding:'4px 10px', color:C.green, fontSize:'11px', fontWeight:'700', fontFamily:f }}>{days}d</span>}
                </div>
              </div>
              <button onClick={()=>removeEvent(ev.id)} style={{ background:'none', border:'none', color:C.red, fontSize:'12px', cursor:'pointer', fontFamily:f, padding:0, textDecoration:'underline' }}>Remove event</button>
            </div>
          );
        })}
        {!adding ? (
          <button onClick={()=>setAdding(true)} style={{ ...gbtn('transparent',C.green), border:`1px solid ${C.green}`, marginTop:'8px' }}>+ ADD EVENT</button>
        ) : (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'16px', padding:'20px', marginTop:'8px' }}>
            <GL text="Add event" />
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginTop:'12px' }}>
              <select value={selType} onChange={e=>setSelType(e.target.value)} style={{ ...inp, appearance:'none' }}>
                <option value="">Select event type...</option>
                {EVENTS.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <input placeholder="Custom event name (optional)" value={selName} onChange={e=>setSelName(e.target.value)} style={inp} />
              <div>
                <p style={{ color:C.mid, fontSize:'12px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>Race date</p>
                <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={inp} min={new Date().toISOString().split('T')[0]} />
              </div>
              <button onClick={addEvent} disabled={!selType||!selDate||saving} style={gbtn(C.green,C.white,{opacity:(!selType||!selDate||saving)?0.5:1})}>{saving?'SAVING...':'ADD EVENT'}</button>
              <button onClick={()=>setAdding(false)} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}` }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
