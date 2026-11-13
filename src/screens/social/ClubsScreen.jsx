import { useState, useEffect } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL, Card, BackBtn, Avatar } from '../../components/UI';
import { supabase } from '../../services/supabase';

const f = "'Manrope',system-ui";

export const ClubsScreen = ({ userId, onViewClub, onCreateClub }) => {
  const [clubs,    setClubs]    = useState([]);
  const [myClubs,  setMyClubs]  = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: all },{ data: mine }] = await Promise.all([
        supabase.from('clubs').select('*').order('member_count',{ascending:false}).limit(20),
        supabase.from('club_members').select('club_id,clubs(*)').eq('user_id',userId),
      ]);
      setClubs(all??[]); setMyClubs((mine??[]).map(m=>m.clubs)); setLoading(false);
    };
    if (userId) load();
  }, [userId]);

  const filtered = search ? clubs.filter(c=>c.name?.toLowerCase().includes(search.toLowerCase())) : clubs;

  const inp = { background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', color:C.dark, fontSize:'14px', padding:'13px 16px', outline:'none', fontFamily:f, width:'100%', boxSizing:'border-box' };

  if (loading) return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:C.green, fontSize:'14px', letterSpacing:'0.12em', fontWeight:'700', fontFamily:f }}>LOADING...</p></div>;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'20px', marginBottom:'16px' }}>
          <h2 style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:0, fontFamily:f }}>Clubs</h2>
          <button onClick={onCreateClub} style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'10px', padding:'8px 14px', color:C.green, fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:f }}>+ Create</button>
        </div>
        <input placeholder="Search clubs..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, marginBottom:'16px' }} />
        {myClubs.length>0 && (<>
          <GL text="My clubs" />
          <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
            {myClubs.map((cl,i)=>cl&&<div key={i} onClick={()=>onViewClub(cl)} style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'14px 16px', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                <p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:0, fontFamily:f }}>{cl.name}</p>
                <span style={{ color:C.mid, fontSize:'12px', fontFamily:f }}>{cl.member_count??0} members</span>
              </div>
              {cl.description && <p style={{ color:C.mid, fontSize:'13px', margin:0, lineHeight:1.5, fontFamily:f }}>{cl.description}</p>}
            </div>)}
          </div>
        </>)}
        <GL text="Discover clubs" />
        <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px' }}>
          {filtered.map((cl,i)=>(
            <div key={i} onClick={()=>onViewClub(cl)} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'14px 16px', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                <p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:0, fontFamily:f }}>{cl.name}</p>
                <span style={{ color:C.mid, fontSize:'12px', fontFamily:f }}>{cl.member_count??0} members</span>
              </div>
              {cl.description && <p style={{ color:C.mid, fontSize:'13px', margin:0, lineHeight:1.5, fontFamily:f }}>{cl.description}</p>}
            </div>
          ))}
          {filtered.length===0 && <p style={{ color:C.mid, fontSize:'14px', textAlign:'center', padding:'20px 0', fontFamily:f }}>No clubs found</p>}
        </div>
      </div>
    </div>
  );
};

export const CreateClubScreen = ({ userId, onBack, onDone }) => {
  const [name,  setName]  = useState('');
  const [desc,  setDesc]  = useState('');
  const [saving,setSaving]= useState(false);
  const inp = { background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', color:C.dark, fontSize:'14px', padding:'14px 16px', outline:'none', fontFamily:f, width:'100%', boxSizing:'border-box' };
  const handle = async () => {
    setSaving(true);
    const { data: cl } = await supabase.from('clubs').insert({ name, description:desc, creator_id:userId, member_count:1 }).select().single();
    if (cl) await supabase.from('club_members').insert({ club_id:cl.id, user_id:userId, role:'admin' });
    setSaving(false); onDone();
  };
  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'24px' }}><BackBtn onClick={onBack} /><h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>Create Club</h2></div>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div><p style={{ color:C.mid, fontSize:'12px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>Club name</p><input placeholder="e.g. Manchester Hyrox Crew" value={name} onChange={e=>setName(e.target.value)} style={inp} /></div>
          <div><p style={{ color:C.mid, fontSize:'12px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>Description (optional)</p><textarea placeholder="What is this club about?" value={desc} onChange={e=>setDesc(e.target.value)} rows={3} style={{ ...inp, resize:'none', lineHeight:1.6 }} /></div>
          <button onClick={handle} disabled={!name||saving} style={gbtn(C.green,C.white,{opacity:(!name||saving)?0.5:1})}>{saving?'CREATING...':'CREATE CLUB'}</button>
          <button onClick={onBack} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}` }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export const ClubDetailScreen = ({ userId, club, onBack }) => {
  const [members,  setMembers]  = useState([]);
  const [joined,   setJoined]   = useState(false);
  const [feed,     setFeed]     = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: mb },{ data: mem },{ data: logs }] = await Promise.all([
        supabase.from('club_members').select('user_id').eq('club_id',club?.id).eq('user_id',userId).maybeSingle(),
        supabase.from('club_members').select('user_id,profiles(username)').eq('club_id',club?.id).limit(20),
        supabase.from('activity_logs').select('*,profiles(username)').in('user_id',(await supabase.from('club_members').select('user_id').eq('club_id',club?.id)).data?.map(m=>m.user_id)??[]).order('logged_date',{ascending:false}).limit(20),
      ]);
      setJoined(!!mb); setMembers(mem??[]); setFeed(logs??[]); setLoading(false);
    };
    if (club?.id) load();
  }, [club?.id, userId]);

  const join  = async () => { await supabase.from('club_members').insert({ club_id:club.id, user_id:userId, role:'member' }); await supabase.from('clubs').update({ member_count:(club.member_count??0)+1 }).eq('id',club.id); setJoined(true); };
  const leave = async () => { await supabase.from('club_members').delete().eq('club_id',club.id).eq('user_id',userId); setJoined(false); };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'16px' }}><BackBtn onClick={onBack} /></div>
        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
          <h2 style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:'0 0 6px', fontFamily:f }}>{club?.name}</h2>
          {club?.description && <p style={{ color:C.mid, fontSize:'14px', margin:'0 0 12px', lineHeight:1.5, fontFamily:f }}>{club.description}</p>}
          <p style={{ color:C.light, fontSize:'13px', margin:'0 0 16px', fontFamily:f }}>{club?.member_count??0} members</p>
          {joined ? <button onClick={leave} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}`, width:'auto', padding:'10px 20px' }}>Leave club</button>
                  : <button onClick={join}  style={{ ...gbtn(C.green,C.white), width:'auto', padding:'10px 20px' }}>Join club</button>}
        </div>
        {members.length>0 && (<>
          <GL text={`Members (${members.length})`} />
          <div style={{ marginTop:'8px', display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px' }}>
            {members.map((m,i)=><div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', background:C.card, border:`1px solid ${C.border}`, borderRadius:'20px', padding:'6px 12px' }}><Avatar username={m.profiles?.username} size={24} /><span style={{ color:C.dark, fontSize:'12px', fontWeight:'600', fontFamily:f }}>{m.profiles?.username??'Athlete'}</span></div>)}
          </div>
        </>)}
        {feed.length>0 && (<>
          <GL text="Club activity" />
          <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {feed.map((log,i)=>(
              <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}><Avatar username={log.profiles?.username} size={32} /><div><p style={{ color:C.dark, fontSize:'13px', fontWeight:'700', margin:0, fontFamily:f }}>{log.profiles?.username??'Athlete'}</p><p style={{ color:C.light, fontSize:'11px', margin:0, fontFamily:f }}>{log.logged_date}</p></div></div>
                <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:'0 0 2px', textTransform:'capitalize', fontFamily:f }}>{log.activity_type}</p>
                {log.distance_km && <p style={{ color:C.green, fontSize:'13px', fontWeight:'600', margin:0, fontFamily:f }}>{log.distance_km}km</p>}
              </div>
            ))}
          </div>
        </>)}
      </div>
    </div>
  );
};
