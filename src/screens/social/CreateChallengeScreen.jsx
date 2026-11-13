import { useState } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL, BackBtn, Avatar } from '../../components/UI';
import { supabase } from '../../services/supabase';

const f = "'Manrope',system-ui";

export const CreateChallengeScreen = ({ userId, friends, onBack, onDone }) => {
  const [title,    setTitle]    = useState('');
  const [slogan,   setSlogan]   = useState('');
  const [type,     setType]     = useState('distance');
  const [target,   setTarget]   = useState('');
  const [duration, setDuration] = useState('7');
  const [selected, setSelected] = useState([]);
  const [saving,   setSaving]   = useState(false);

  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const inp = { background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', color:C.dark, fontSize:'14px', padding:'14px 16px', outline:'none', fontFamily:f, width:'100%', boxSizing:'border-box' };

  const handle = async () => {
    if (!title||!target||selected.length===0) return;
    setSaving(true);
    const endsAt = new Date(); endsAt.setDate(endsAt.getDate()+Number(duration));
    const { data: ch } = await supabase.from('challenges').insert({ creator_id:userId, title, slogan, challenge_type:type, target_value:Number(target), duration_days:Number(duration), ends_at:endsAt.toISOString(), status:'active' }).select().single();
    if (ch) {
      await supabase.from('challenge_participants').insert([
        { challenge_id:ch.id, user_id:userId, status:'accepted' },
        ...selected.map(fid=>({ challenge_id:ch.id, user_id:fid, status:'pending' })),
      ]);
    }
    setSaving(false); onDone();
  };

  const label = (l,children) => <div><p style={{ color:C.mid, fontSize:'12px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>{l}</p>{children}</div>;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'24px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>New Challenge</h2>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {label('Challenge name', <input placeholder="e.g. August Distance Battle" value={title} onChange={e=>setTitle(e.target.value)} style={inp} />)}
          {label('Slogan (optional)', <input placeholder="e.g. Who logs the most in a week?" value={slogan} onChange={e=>setSlogan(e.target.value)} style={inp} />)}
          {label('Type', <div style={{ display:'flex', gap:'8px' }}>
            {[['distance','Total Distance'],['sessions','Sessions']].map(([v,l])=>(
              <button key={v} onClick={()=>setType(v)} style={{ flex:1, padding:'12px', background:type===v?C.greenLight:'transparent', border:`1px solid ${type===v?C.green:C.border}`, borderRadius:'10px', color:type===v?C.green:C.mid, fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:f }}>{l}</button>
            ))}
          </div>)}
          {label(`Target (${type==='distance'?'km':'sessions'})`, <input placeholder={type==='distance'?'e.g. 50':'e.g. 10'} type="number" value={target} onChange={e=>setTarget(e.target.value)} style={inp} />)}
          {label('Duration', <select value={duration} onChange={e=>setDuration(e.target.value)} style={{ ...inp, appearance:'none' }}>
            {[['7','1 week'],['14','2 weeks'],['30','30 days']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>)}
          {label('Invite friends', (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {friends.length===0 ? <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>Add friends first to invite them to challenges.</p>
              : friends.map((fr,i)=>{
                const sel = selected.includes(fr.friend_id);
                return <div key={i} onClick={()=>toggle(fr.friend_id)} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', background:sel?C.greenLight:C.card, border:`1px solid ${sel?C.green:C.border}`, borderRadius:'12px', cursor:'pointer' }}>
                  <Avatar username={fr.profiles?.username} size={36} />
                  <p style={{ color:C.dark, fontSize:'14px', fontWeight:'600', margin:0, flex:1, fontFamily:f }}>{fr.profiles?.username??'Athlete'}</p>
                  <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:sel?C.green:C.raised, border:`2px solid ${sel?C.green:C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {sel && <span style={{ color:'#fff', fontSize:'11px', fontWeight:'700' }}>✓</span>}
                  </div>
                </div>;
              })}
            </div>
          ))}
          <button onClick={handle} disabled={!title||!target||selected.length===0||saving} style={gbtn(C.green,C.white,{opacity:(!title||!target||selected.length===0||saving)?0.5:1})}>{saving?'CREATING...':'CREATE CHALLENGE'}</button>
          <button onClick={onBack} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}` }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

