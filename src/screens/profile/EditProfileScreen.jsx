import { useState, useEffect } from 'react';
import { C, S, gbtn } from '../../constants/colours';
import { GL, Card, BackBtn, CentreModal, TierBadge } from '../../components/UI';
import { supabase } from '../../services/supabase';
import { redeemGiftCode, ensureReferralCode, getUserTier } from '../../services/tier';

const f = "'Manrope',system-ui";
const inp = { ...S.inp, marginBottom:'0' };
const EVENTS_LIST = [
  {id:'marathon',label:'Marathon'},{id:'half_marathon',label:'Half Marathon'},
  {id:'hyrox',label:'Hyrox'},{id:'5k',label:'5k'},{id:'10k',label:'10k'},
  {id:'ironman',label:'Ironman'},{id:'triathlon',label:'Triathlon'},
  {id:'obstacle',label:'Obstacle Course'},{id:'cycling',label:'Cycling Event'},
];

export const EditProfileScreen = ({ userId, initialProfile, onBack, onSaved, onManageEvents, onAchievements, onPersonalRecords, onPrivacy, onTerms, onHealth }) => {
  const [profile, setProfile] = useState(initialProfile ?? {});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [giftCode,setGiftCode]= useState('');
  const [giftMsg, setGiftMsg] = useState('');
  const [referral,setReferral]= useState('');
  const [tier,    setTier]    = useState('free');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const up = (k,v) => setProfile(p => ({...p,[k]:v}));

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      getUserTier(userId),
      ensureReferralCode(userId),
    ]).then(([t,r]) => { setTier(t); setReferral(r); });
  }, [userId]);

  const save = async () => {
    setSaving(true);
    await supabase.from('profiles').upsert({ id:userId, ...profile });
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); onSaved(); }, 1500);
  };

  const handleGiftCode = async () => {
    if (!giftCode) return;
    const result = await redeemGiftCode(userId, giftCode);
    setGiftMsg(result.success ? `Code applied — ${result.days} days of premium unlocked` : result.error);
    setGiftCode('');
  };

  const handleShare = async () => {
    const text = `Join me on COACH — the fitness app for athletes training for multiple events. Use my referral code ${referral} when you sign up for 2 weeks free premium. coachapp.co.uk`;
    if (navigator.share) { try { await navigator.share({ title:'Join COACH', text }); } catch(e) {} }
    else { try { await navigator.clipboard.writeText(text); setGiftMsg('Referral link copied to clipboard'); } catch(e) {} }
  };

  const handleExport = async () => {
    const [{ data:p },{ data:al },{ data:ev },{ data:pr }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id',userId).single(),
      supabase.from('activity_logs').select('*').eq('user_id',userId),
      supabase.from('user_events').select('*').eq('user_id',userId),
      supabase.from('personal_records').select('*').eq('user_id',userId),
    ]);
    const blob = new Blob([JSON.stringify({ profile:p, activities:al, events:ev, personalRecords:pr, exportedAt:new Date().toISOString() }, null, 2)], {type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download=`coach-data-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    // Delete all user data from Supabase
    await Promise.all([
      supabase.from('activity_logs').delete().eq('user_id',userId),
      supabase.from('user_events').delete().eq('user_id',userId),
      supabase.from('personal_records').delete().eq('user_id',userId),
      supabase.from('achievements').delete().eq('user_id',userId),
      supabase.from('streaks').delete().eq('user_id',userId),
      supabase.from('training_plans').delete().eq('user_id',userId),
      supabase.from('friendships').delete().eq('user_id',userId),
    ]);
    await supabase.from('profiles').delete().eq('id',userId);
    await supabase.auth.signOut();
    window.location.reload();
  };

  const section = (title, children) => (
    <div style={{ marginBottom:'24px' }}>
      <p style={{ color:C.light, fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 12px', fontWeight:'700', fontFamily:f }}>{title}</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>{children}</div>
    </div>
  );

  const label = (l, children) => (
    <div>
      <p style={{ color:C.mid, fontSize:'12px', fontWeight:'600', margin:'0 0 6px', fontFamily:f }}>{l}</p>
      {children}
    </div>
  );

  const sel = (k, opts) => (
    <select value={profile[k]??''} onChange={e=>up(k,e.target.value)} style={{ ...inp, appearance:'none', width:'100%' }}>
      <option value="">Select...</option>
      {opts.map(o => <option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}
    </select>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ paddingTop:'20px', display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, flex:1, fontFamily:f }}>Profile</h2>
          <TierBadge tier={tier} />
        </div>

        {saved && <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'14px', marginBottom:'16px', textAlign:'center' }}><p style={{ color:C.green, fontSize:'15px', fontWeight:'700', margin:0, fontFamily:f }}>Saved</p></div>}

        {/* Quick links */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
          {[['My Events','📅',onManageEvents],['Achievements','🏆',onAchievements],['Personal Bests','🎯',onPersonalRecords]].map(([label,icon,fn])=>(
            <button key={label} onClick={fn} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'14px', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'18px' }}>{icon}</span>
              <span style={{ color:C.dark, fontSize:'13px', fontWeight:'700', fontFamily:f }}>{label}</span>
            </button>
          ))}
        </div>

        {section('Personal info', [
          label('Username',    <input value={profile.username??''}     onChange={e=>up('username',e.target.value)}     placeholder="Username"      style={inp} />),
          label('Age',         <input value={profile.age??''}          onChange={e=>up('age',Number(e.target.value))}  placeholder="Age"           style={inp} type="number" />),
          label('Sex',         sel('sex',[{v:'male',l:'Male'},{v:'female',l:'Female'},{v:'other',l:'Prefer not to say'}])),
          label('Height (cm)', <input value={profile.height_cm??''}    onChange={e=>up('height_cm',Number(e.target.value))} placeholder="Height in cm" style={inp} type="number" />),
          label('Weight (kg)', <input value={profile.weight_kg??''}    onChange={e=>up('weight_kg',Number(e.target.value))} placeholder="Weight in kg" style={inp} type="number" />),
        ])}

        {section('Training', [
          label('Experience',  sel('experience_level',[{v:'new',l:'New to training'},{v:'some',l:'Some experience'},{v:'regular',l:'Regular trainer'}])),
          label('Training days per week', sel('training_frequency',['3','4','5','6'].map(n=>({v:Number(n),l:`${n} days`})))),
          label('Training location', sel('training_location',[{v:'home',l:'Home / outdoors'},{v:'gym',l:'Gym'},{v:'both',l:'Both'}])),
        ])}

        <button onClick={save} disabled={saving} style={gbtn(C.green,C.white,{opacity:saving?0.5:1,marginBottom:'8px'})}>{saving?'SAVING...':'SAVE CHANGES'}</button>
        <button onClick={onBack} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}`, marginBottom:'24px' }}>Cancel</button>

        {/* Gift code */}
        {section('Redeem a code', [
          <div key="gift" style={{ display:'flex', gap:'8px' }}>
            <input placeholder="COACH-XXXX-XXXX" value={giftCode} onChange={e=>setGiftCode(e.target.value.toUpperCase())} style={{ ...inp, flex:1 }} />
            <button onClick={handleGiftCode} disabled={!giftCode} style={{ padding:'14px 16px', background:C.green, border:'none', borderRadius:'12px', color:'#fff', fontWeight:'700', fontSize:'13px', cursor:'pointer', fontFamily:f, flexShrink:0 }}>Apply</button>
          </div>,
          giftMsg && <p key="msg" style={{ color:C.green, fontSize:'13px', margin:0, fontFamily:f }}>{giftMsg}</p>,
        ])}

        {/* Referral */}
        {section('Refer a friend', [
          <div key="ref">
            <p style={{ color:C.mid, fontSize:'13px', lineHeight:1.6, margin:'0 0 10px', fontFamily:f }}>Share COACH with a friend. When they sign up you both get 2 weeks free Premium.</p>
            <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'12px', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
              <div>
                <p style={{ color:C.light, fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 2px', fontFamily:f }}>Your code</p>
                <p style={{ color:C.green, fontSize:'16px', fontWeight:'900', margin:0, fontFamily:f, letterSpacing:'0.08em' }}>{referral}</p>
              </div>
            </div>
            <button onClick={handleShare} style={gbtn(C.green,C.white)}>SHARE MY CODE</button>
          </div>,
        ])}

        {/* Legal */}
        {section('Legal', [
          ...(['Privacy Policy','Terms of Service','Health Disclaimer'].map((item,i) => (
            <button key={item} onClick={[onPrivacy,onTerms,onHealth][i]}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'none', border:'none', padding:'12px 0', borderBottom:`1px solid ${C.border}`, cursor:'pointer' }}>
              <span style={{ color:C.mid, fontSize:'14px', fontFamily:f }}>{item}</span>
              <span style={{ color:C.light, fontSize:'16px' }}>›</span>
            </button>
          ))),
          <p key="version" style={{ color:C.light, fontSize:'11px', textAlign:'center', margin:'8px 0 0', fontFamily:f }}>COACH Beta · Made with care in the UK</p>,
        ])}

        {/* Data export */}
        <div style={{ marginBottom:'24px' }}>
          <p style={{ color:C.light, fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 12px', fontWeight:'700', fontFamily:f }}>Your data</p>
          <button onClick={handleExport} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}`, marginBottom:'10px' }}>DOWNLOAD MY DATA (GDPR)</button>
          <button onClick={() => setShowDelete(true)} style={{ ...gbtn('transparent',C.red), border:`1px solid ${C.red}` }}>DELETE MY ACCOUNT</button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <CentreModal visible={showDelete}>
        <p style={{ color:C.red, fontSize:'18px', fontWeight:'800', margin:'0 0 8px', fontFamily:f }}>Delete account?</p>
        <p style={{ color:C.mid, fontSize:'13px', lineHeight:1.6, margin:'0 0 16px', fontFamily:f }}>This is permanent and cannot be undone. All your activity data, training plans, achievements and events will be deleted.</p>
        <p style={{ color:C.mid, fontSize:'13px', margin:'0 0 8px', fontFamily:f }}>Type DELETE to confirm:</p>
        <input value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)} placeholder="DELETE" style={{ ...S.inp, marginBottom:'16px', textAlign:'center', letterSpacing:'0.1em' }} />
        <button onClick={handleDelete} disabled={deleteConfirm!=='DELETE'||deleting} style={gbtn(C.red,C.white,{opacity:deleteConfirm!=='DELETE'||deleting?0.5:1,marginBottom:'10px'})}>{deleting?'DELETING...':'DELETE MY ACCOUNT'}</button>
        <button onClick={()=>{setShowDelete(false);setDeleteConfirm('');}} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}` }}>Cancel</button>
      </CentreModal>
    </div>
  );
};
