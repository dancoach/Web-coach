import { useState } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL, Card, BackBtn, Avatar, CentreModal } from '../../components/UI';
import { supabase } from '../../services/supabase';

const f = "'Manrope',system-ui";

export const FriendsScreen = ({ userId, friends, challenges, pendingInvites, onBack, onCreateChallenge, onViewChallenge, onRespondInvite, onAddFriend }) => {
  const [tab,       setTab]       = useState('friends');
  const [search,    setSearch]    = useState('');
  const [results,   setResults]   = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase.from('profiles').select('id,username').ilike('username',`%${search.trim()}%`).neq('id',userId).limit(10);
    setResults(data??[]); setSearching(false);
  };

  const inp = { background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', color:C.dark, fontSize:'14px', padding:'13px 16px', outline:'none', fontFamily:f, flex:1 };
  const fmtDaysLeft = (endsAt) => { const d=Math.max(0,Math.ceil((new Date(endsAt)-new Date())/86400000)); return d===0?'Ends today':`${d}d left`; };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <h2 style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:'20px 0 16px', paddingTop:'20px', fontFamily:f }}>Friends</h2>

        {/* Tab bar */}
        <div style={{ display:'flex', background:C.card, borderRadius:'10px', padding:'3px', border:`1px solid ${C.border}`, marginBottom:'16px' }}>
          {[['friends','Friends'],['challenges','Challenges']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:'10px', background:tab===id?C.green:'transparent', border:'none', borderRadius:'7px', color:tab===id?C.white:C.mid, fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:f }}>{label}{id==='challenges'&&pendingInvites.length>0?` (${pendingInvites.length})`:''}</button>
          ))}
        </div>

        {tab==='friends' && (<>
          {/* Search */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
            <input placeholder="Search by username..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} style={inp} />
            <button onClick={handleSearch} disabled={searching||!search.trim()} style={{ padding:'13px 18px', background:C.green, border:'none', borderRadius:'12px', color:C.white, fontWeight:'700', cursor:'pointer', fontFamily:f, flexShrink:0 }}>Search</button>
          </div>
          {results.length>0 && (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'8px', marginBottom:'16px' }}>
              {results.map((r,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px', borderBottom:i<results.length-1?`1px solid ${C.border}`:'none' }}>
                  <Avatar username={r.username} />
                  <p style={{ color:C.dark, fontSize:'14px', fontWeight:'600', margin:0, flex:1, fontFamily:f }}>{r.username}</p>
                  <button onClick={()=>onAddFriend(r.id)} style={{ padding:'8px 14px', background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'10px', color:C.green, fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:f }}>Add</button>
                </div>
              ))}
            </div>
          )}
          {/* Friends list */}
          {friends.length===0 ? (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'16px', padding:'40px 24px', textAlign:'center' }}>
              <p style={{ color:C.dark, fontSize:'16px', fontWeight:'700', margin:'0 0 8px', fontFamily:f }}>No friends yet</p>
              <p style={{ color:C.mid, fontSize:'13px', margin:0, lineHeight:1.6, fontFamily:f }}>Search for friends by username above and start competing together.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {friends.map((fr,i) => (
                <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <Avatar username={fr.profiles?.username} />
                  <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:0, flex:1, fontFamily:f }}>{fr.profiles?.username??'Athlete'}</p>
                </div>
              ))}
            </div>
          )}
        </>)}

        {tab==='challenges' && (<>
          {/* Pending invites */}
          {pendingInvites.length>0 && (
            <div style={{ marginBottom:'16px' }}>
              <GL text="Awaiting your response" />
              <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px' }}>
                {pendingInvites.map((ch,i)=>(
                  <div key={i} style={{ background:C.raised, border:`1px solid ${C.orange}`, borderRadius:'14px', padding:'16px' }}>
                    <p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:'0 0 4px', fontFamily:f }}>{ch.title}</p>
                    <p style={{ color:C.mid, fontSize:'13px', margin:'0 0 12px', fontFamily:f }}>{ch.slogan}</p>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={()=>onRespondInvite(ch.id,true)}  style={gbtn(C.green,C.white,{flex:1,padding:'11px'})}>ACCEPT</button>
                      <button onClick={()=>onRespondInvite(ch.id,false)} style={{ ...gbtn('transparent',C.mid), flex:1, border:`1px solid ${C.border}`, padding:'11px' }}>DECLINE</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Active challenges */}
          <button onClick={onCreateChallenge} style={{ ...gbtn('transparent',C.green), border:`1px solid ${C.green}`, marginBottom:'16px' }}>+ NEW CHALLENGE</button>
          {challenges.length===0 ? (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'16px', padding:'40px 24px', textAlign:'center' }}>
              <p style={{ color:C.dark, fontSize:'16px', fontWeight:'700', margin:'0 0 8px', fontFamily:f }}>No active challenges</p>
              <p style={{ color:C.mid, fontSize:'13px', margin:0, lineHeight:1.6, fontFamily:f }}>Challenge a friend to a race, distance goal or session count.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {challenges.map((ch,i)=>ch&&(
                <div key={i} onClick={()=>onViewChallenge(ch)} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', cursor:'pointer' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                    <p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:0, fontFamily:f, flex:1, marginRight:'12px' }}>{ch.title}</p>
                    {ch.ends_at && <span style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'20px', padding:'3px 10px', color:C.green, fontSize:'11px', fontWeight:'700', fontFamily:f, flexShrink:0 }}>{fmtDaysLeft(ch.ends_at)}</span>}
                  </div>
                  <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>{ch.slogan}</p>
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>
    </div>
  );
};
