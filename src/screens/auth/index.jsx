import { useState } from 'react';
import { C, S, gbtn } from '../../constants/colours';
import { BackBtn } from '../../components/UI';
import { LogoHero } from '../../components/Logo';
import { supabase } from '../../services/supabase';
const f = "'Manrope',system-ui";

export const HomeScreen = ({ onLogin, onSignup }) => (
  <div style={{ ...S.wrap, gap:'48px' }}>
    <LogoHero />
    <div style={S.col}>
      <button onClick={onLogin}  style={gbtn(C.green,C.white)}>LOGIN</button>
      <button onClick={onSignup} style={{ ...gbtn('transparent',C.green), border:`1px solid ${C.green}` }}>CREATE ACCOUNT</button>
    </div>
  </div>
);

export const LoginScreen = ({ onBack, onForgot, onSuccess }) => {
  const [email,setEmail]=useState(''); const [pw,setPw]=useState('');
  const [err,setErr]=useState(''); const [load,setLoad]=useState(false); const [tries,setTries]=useState(0);
  const handle = async () => {
    setLoad(true); setErr('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password:pw });
    setLoad(false);
    if (error) { setTries(t=>t+1); setErr('Incorrect email or password.'); if (tries>=1) onForgot(); }
    else onSuccess(data.session.user.id);
  };
  return <div style={S.wrap}><div style={S.col}>
    <BackBtn onClick={onBack} />
    <h2 style={{ color:C.dark, fontSize:'26px', fontWeight:'800', margin:'8px 0 6px', fontFamily:f }}>Welcome back</h2>
    <p style={{ color:C.mid, fontSize:'14px', margin:'0 0 8px', fontFamily:f }}>Sign in to your COACH account</p>
    <input placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={S.inp} />
    <input placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} style={S.inp} />
    {err && <p style={{ color:C.red, fontSize:'13px', margin:0, fontFamily:f }}>{err}</p>}
    <button onClick={handle} disabled={!email||!pw||load} style={gbtn(C.green,C.white,{opacity:(!email||!pw||load)?0.5:1})}>{load?'SIGNING IN...':'LOGIN'}</button>
    <button onClick={onForgot} style={{ background:'none', border:'none', color:C.mid, fontSize:'13px', cursor:'pointer', padding:'4px 0', textAlign:'center', fontFamily:f }}>Forgot your password?</button>
  </div></div>;
};

export const ForgotPasswordScreen = ({ onBack }) => {
  const [email,setEmail]=useState(''); const [sent,setSent]=useState(false);
  const [err,setErr]=useState(''); const [load,setLoad]=useState(false);
  const handle = async () => {
    if (!email) { setErr('Enter your email address'); return; }
    setLoad(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoad(false);
    if (error) setErr(error.message); else setSent(true);
  };
  return <div style={S.wrap}><div style={S.col}>
    <BackBtn onClick={() => { setSent(false); setErr(''); onBack(); }} />
    <h2 style={{ color:C.dark, fontSize:'26px', fontWeight:'800', margin:'8px 0 6px', fontFamily:f }}>Reset password</h2>
    {sent ? <>
      <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'20px', textAlign:'center' }}>
        <p style={{ color:C.green, fontSize:'16px', fontWeight:'700', margin:'0 0 8px', fontFamily:f }}>Check your inbox</p>
        <p style={{ color:C.mid, fontSize:'14px', margin:0, fontFamily:f }}>We sent a reset link to {email}</p>
      </div>
      <button onClick={() => { setSent(false); onBack(); }} style={gbtn(C.green,C.white)}>BACK TO LOGIN</button>
    </> : <>
      <input placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={S.inp} />
      {err && <p style={{ color:C.red, fontSize:'13px', margin:0, fontFamily:f }}>{err}</p>}
      <button onClick={handle} disabled={!email||load} style={gbtn(C.green,C.white,{opacity:(!email||load)?0.5:1})}>{load?'SENDING...':'SEND RESET LINK'}</button>
    </>}
  </div></div>;
};

export const ResetPasswordScreen = ({ onDone }) => {
  const [np,setNp]=useState(''); const [cp,setCp]=useState('');
  const [err,setErr]=useState(''); const [load,setLoad]=useState(false); const [ok,setOk]=useState(false);
  const handle = async () => {
    if (np!==cp) { setErr('Passwords do not match'); return; }
    if (np.length<6) { setErr('Password must be at least 6 characters'); return; }
    setLoad(true);
    const { error } = await supabase.auth.updateUser({ password:np });
    setLoad(false);
    if (error) setErr(error.message); else setOk(true);
  };
  return <div style={S.wrap}><div style={S.col}>
    <h2 style={{ color:C.dark, fontSize:'26px', fontWeight:'800', margin:'0 0 6px', fontFamily:f }}>Set new password</h2>
    {ok ? <>
      <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'20px', textAlign:'center' }}>
        <p style={{ color:C.green, fontSize:'16px', fontWeight:'700', margin:'0 0 8px', fontFamily:f }}>Password updated</p>
      </div>
      <button onClick={onDone} style={gbtn(C.green,C.white)}>GO TO LOGIN</button>
    </> : <>
      <input placeholder="New password" type="password" value={np} onChange={e=>setNp(e.target.value)} style={S.inp} />
      <input placeholder="Confirm password" type="password" value={cp} onChange={e=>setCp(e.target.value)} style={S.inp} />
      {err && <p style={{ color:C.red, fontSize:'13px', margin:0, fontFamily:f }}>{err}</p>}
      <button onClick={handle} disabled={!np||!cp||load} style={gbtn(C.green,C.white,{opacity:(!np||!cp||load)?0.5:1})}>{load?'UPDATING...':'SET NEW PASSWORD'}</button>
    </>}
  </div></div>;
};

export const SignupScreen = ({ onBack, onSuccess }) => {
  const [email,setEmail]=useState(''); const [pw,setPw]=useState('');
  const [cpw,setCpw]=useState(''); const [err,setErr]=useState(''); const [load,setLoad]=useState(false);
  const handle = async () => {
    if (pw!==cpw) { setErr('Passwords do not match'); return; }
    if (pw.length<6) { setErr('Password must be at least 6 characters'); return; }
    setLoad(true);
    const { data, error } = await supabase.auth.signUp({ email, password:pw });
    setLoad(false);
    if (error) setErr(error.message);
    else if (data.user) onSuccess(data.user.id);
  };
  return <div style={S.wrap}><div style={S.col}>
    <BackBtn onClick={onBack} />
    <h2 style={{ color:C.dark, fontSize:'26px', fontWeight:'800', margin:'8px 0 6px', fontFamily:f }}>Create your account</h2>
    <p style={{ color:C.mid, fontSize:'14px', margin:'0 0 8px', fontFamily:f }}>Takes less than 2 minutes. No card required.</p>
    <input placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={S.inp} />
    <input placeholder="Password (min 6 characters)" type="password" value={pw} onChange={e=>setPw(e.target.value)} style={S.inp} />
    <input placeholder="Confirm password" type="password" value={cpw} onChange={e=>setCpw(e.target.value)} style={S.inp} />
    {err && <p style={{ color:C.red, fontSize:'13px', margin:0, fontFamily:f }}>{err}</p>}
    <button onClick={handle} disabled={!email||!pw||!cpw||load} style={gbtn(C.green,C.white,{opacity:(!email||!pw||!cpw||load)?0.5:1})}>{load?'CREATING...':'CREATE ACCOUNT'}</button>
  </div></div>;
};
