import { C, gbtn } from '../constants/colours';
const f = "'Manrope',system-ui";
export const GL = ({ text }) => <p style={{ color:C.green, fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', margin:'0 0 4px', fontWeight:'700', fontFamily:f }}>{text}</p>;
export const StepBar = ({ step, total }) => (
  <div style={{ display:'flex', gap:'6px', width:'100%', marginBottom:'4px' }}>
    {Array.from({length:total}).map((_,i) => <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background:i<step?C.green:C.border }} />)}
  </div>
);
export const UnitToggle = ({ opts, active, onChange }) => (
  <div style={{ display:'flex', background:C.card, borderRadius:'8px', padding:'3px', border:`1px solid ${C.border}` }}>
    {opts.map(o => <button key={o} onClick={() => onChange(o)} style={{ flex:1, padding:'7px 4px', background:active===o?C.green:'transparent', border:'none', borderRadius:'5px', color:active===o?C.white:C.mid, fontSize:'11px', fontWeight:'700', cursor:'pointer', textTransform:'uppercase', fontFamily:f }}>{o}</button>)}
  </div>
);
export const Stepper = ({ display, sub, onInc, onDec }) => (
  <div>
    <div style={{ display:'flex', alignItems:'center', background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', overflow:'hidden' }}>
      <button onClick={onDec} style={{ width:'56px', height:'58px', background:C.raised, border:'none', borderRight:`1px solid ${C.border}`, color:C.dark, fontSize:'24px', cursor:'pointer', fontFamily:f }}>-</button>
      <div style={{ flex:1, textAlign:'center', color:C.dark, fontSize:'20px', fontWeight:'700', fontFamily:f }}>{display}</div>
      <button onClick={onInc} style={{ width:'56px', height:'58px', background:C.raised, border:'none', borderLeft:`1px solid ${C.border}`, color:C.dark, fontSize:'24px', cursor:'pointer', fontFamily:f }}>+</button>
    </div>
    {sub && <p style={{ color:C.light, fontSize:'11px', textAlign:'center', margin:'6px 0 0', fontFamily:f }}>{sub}</p>}
  </div>
);
export const BackBtn = ({ onClick }) => <button onClick={onClick} style={{ background:'none', border:'none', color:C.green, cursor:'pointer', fontSize:'14px', padding:0, fontFamily:f, fontWeight:'600' }}>← Back</button>;
export const Card = ({ children, style={}, green=false, onClick }) => (
  <div onClick={onClick} style={{ background:C.card, border:`1px solid ${green?C.greenBorder:C.border}`, borderRadius:'16px', padding:'16px', ...(onClick?{cursor:'pointer'}:{}), ...style }}>
    {children}
  </div>
);
export const Tag = ({ label, colour }) => (
  <span style={{ background:colour?`${colour}18`:C.greenLight, border:`1px solid ${colour?`${colour}44`:C.greenBorder}`, borderRadius:'20px', padding:'4px 10px', color:colour??C.green, fontSize:'11px', fontWeight:'700', whiteSpace:'nowrap', fontFamily:f }}>{label}</span>
);
export const BottomModal = ({ visible, onClose, title, children }) => {
  if (!visible) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(28,28,24,0.7)', display:'flex', alignItems:'flex-end', zIndex:40 }}>
      <div style={{ background:C.bg, borderRadius:'24px 24px 0 0', padding:'28px 24px 48px', width:'100%', boxSizing:'border-box', border:`1px solid ${C.border}`, borderBottom:'none' }}>
        <div style={{ width:'40px', height:'4px', background:C.border, borderRadius:'2px', margin:'0 auto 24px' }} />
        {title && <h3 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:'0 0 12px', fontFamily:f }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};
export const CentreModal = ({ visible, children }) => {
  if (!visible) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(28,28,24,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:40, padding:'32px' }}>
      <div style={{ background:C.bg, borderRadius:'20px', padding:'32px 24px', textAlign:'center', border:`1px solid ${C.border}`, maxWidth:'320px', width:'100%' }}>{children}</div>
    </div>
  );
};
export const Avatar = ({ username, size=40 }) => (
  <div style={{ width:size, height:size, borderRadius:'50%', background:C.greenLight, border:`1px solid ${C.greenBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
    <span style={{ color:C.green, fontSize:size*0.35, fontWeight:'800', fontFamily:f }}>{username?.[0]?.toUpperCase()??'?'}</span>
  </div>
);
export const ExerciseCard = ({ ex }) => (
  <div style={{ background:C.raised, borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
      <p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:0, flex:1, marginRight:'8px', fontFamily:f }}>{ex.name}</p>
      <Tag label={ex.sets} />
    </div>
    <p style={{ color:C.mid, fontSize:'13px', lineHeight:1.6, margin:'0 0 8px', fontFamily:f }}>{ex.tip}</p>
    <p style={{ color:C.light, fontSize:'11px', margin:0, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:f }}>Rest: {ex.rest}</p>
  </div>
);
export const TierBadge = ({ tier }) => {
  if (tier==='pro') return <span style={{ background:C.proLight, border:`1px solid ${C.pro}`, color:C.pro, fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'20px', fontFamily:f }}>PRO</span>;
  if (tier==='premium') return <span style={{ background:C.premiumLight, border:`1px solid ${C.premium}`, color:C.premium, fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'20px', fontFamily:f }}>PREMIUM</span>;
  return null;
};
export const UpgradePrompt = ({ feature, onUpgrade }) => (
  <div style={{ background:C.premiumLight, border:`1px solid ${C.premium}`, borderRadius:'14px', padding:'16px', textAlign:'center' }}>
    <p style={{ color:C.premium, fontSize:'13px', fontWeight:'700', margin:'0 0 4px', fontFamily:f }}>Premium feature</p>
    <p style={{ color:C.mid, fontSize:'13px', margin:'0 0 12px', lineHeight:1.5, fontFamily:f }}>{feature} is available on Premium and Pro plans.</p>
    <button onClick={onUpgrade} style={{ background:C.premium, color:'#fff', border:'none', borderRadius:'10px', padding:'10px 24px', fontWeight:'700', fontSize:'13px', cursor:'pointer', fontFamily:f }}>Upgrade</button>
  </div>
);
export const StatCard = ({ value, label, colour }) => (
  <div style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', textAlign:'center' }}>
    <p style={{ color:colour??C.green, fontSize:'24px', fontWeight:'900', margin:'0 0 4px', fontFamily:f, letterSpacing:'-0.02em' }}>{value}</p>
    <p style={{ color:C.mid, fontSize:'11px', margin:0, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:f }}>{label}</p>
  </div>
);
export const MiniBar = ({ value, max, colour }) => (
  <div style={{ height:'6px', background:C.raised, borderRadius:'3px', overflow:'hidden' }}>
    <div style={{ height:'100%', width:`${Math.min(100,(value/Math.max(max,1))*100)}%`, background:colour??C.green, borderRadius:'3px', transition:'width 0.4s ease' }} />
  </div>
);
