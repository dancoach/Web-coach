import { useState, useEffect } from 'react';
import { C } from '../constants/colours';
import { LogoHero } from './Logo';
export const SplashScreen = ({ onDone }) => {
  const [op, setOp] = useState(1);
  useEffect(() => {
    const f = setTimeout(() => setOp(0), 1500);
    const d = setTimeout(() => onDone(), 2000);
    return () => { clearTimeout(f); clearTimeout(d); };
  }, []);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:999, background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity:op, transition:'opacity 0.5s ease' }}>
      <LogoHero />
    </div>
  );
};
