import { C } from '../constants/colours';
const f = "'Manrope',system-ui";
const HomeI   = ({ a }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={a?C.green:C.light} strokeWidth="2" strokeLinejoin="round" fill={a?C.greenLight:'none'}/></svg>;
const TrainI  = ({ a }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={a?C.green:C.light} strokeWidth="2"/><path d="M3 12H9M15 12H21M12 3V9M12 15V21" stroke={a?C.green:C.light} strokeWidth="2" strokeLinecap="round"/></svg>;
const SocialI = ({ a }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke={a?C.green:C.light} strokeWidth="2"/><circle cx="17" cy="10" r="2.5" stroke={a?C.green:C.light} strokeWidth="2"/><path d="M3 20C3 17 5.5 15 9 15C10.2 15 11.3 15.3 12.2 15.9" stroke={a?C.green:C.light} strokeWidth="2" strokeLinecap="round"/><path d="M13 20C13 17.8 14.8 16 17 16C19.2 16 21 17.8 21 20" stroke={a?C.green:C.light} strokeWidth="2" strokeLinecap="round"/></svg>;
const ProfileI= ({ a }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={a?C.green:C.light} strokeWidth="2"/><path d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20" stroke={a?C.green:C.light} strokeWidth="2" strokeLinecap="round"/></svg>;
export const NavBar = ({ activeTab, onHome, onTrain, onSocial, onProfile }) => (
  <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.bg, borderTop:`1px solid ${C.border}`, display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
    {[['home','Home',HomeI,onHome],['train','Train',TrainI,onTrain],['social','Social',SocialI,onSocial],['profile','Profile',ProfileI,onProfile]].map(([id,label,Icon,onClick]) => {
      const a = activeTab===id;
      return <button key={id} onClick={onClick} style={{ flex:1, padding:'10px 0 14px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', background:'none', border:'none', cursor:'pointer' }}>
        <Icon a={a} /><span style={{ fontSize:'10px', color:a?C.green:C.light, fontWeight:a?'700':'500', fontFamily:f, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</span>
      </button>;
    })}
  </div>
);
