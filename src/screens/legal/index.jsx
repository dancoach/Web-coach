import { C } from '../../constants/colours';
const f = "'Manrope',system-ui";
const Sec = ({title,children}) => <div style={{ marginBottom:'24px' }}><p style={{ color:C.green, fontSize:'13px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 8px', fontFamily:f }}>{title}</p><div style={{ color:C.dark, fontSize:'14px', lineHeight:1.8, fontFamily:f }}>{children}</div></div>;
const Wrap = ({title,onBack,children}) => (
  <div style={{ minHeight:'100vh', background:'#f5f1d4', fontFamily:f, overflowY:'auto' }}>
    <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 60px' }}>
      <div style={{ paddingTop:'20px', marginBottom:'24px' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:C.green, cursor:'pointer', fontSize:'14px', padding:0, fontFamily:f, fontWeight:'600', marginBottom:'16px', display:'block' }}>← Back</button>
        <h1 style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:'0 0 4px', fontFamily:f }}>{title}</h1>
        <p style={{ color:C.light, fontSize:'12px', margin:0, fontFamily:f }}>Last updated: August 2025</p>
      </div>
      {children}
    </div>
  </div>
);

export const PrivacyPolicyScreen = ({ onBack }) => (
  <Wrap title="Privacy Policy" onBack={onBack}>
    <Sec title="Who we are"><p>COACH is a fitness training application operated as a UK-based business. Contact us at privacy@coachapp.co.uk</p></Sec>
    <Sec title="What data we collect"><p>• Account data — email, password (encrypted, never plain text)<br/>• Profile data — username, age, height, weight, training frequency<br/>• Health data — training sessions, distances, GPS routes, activity logs<br/>• Event data — races you are training for, dates, results<br/>• Location data — GPS coordinates during tracked runs, not stored on our servers<br/>• Social data — friends, challenges, activity you choose to share</p></Sec>
    <Sec title="Why we collect it"><p>• Contract — to provide the COACH service you signed up for<br/>• Legitimate interests — to improve COACH and ensure security<br/>• Consent — for optional features like location tracking</p></Sec>
    <Sec title="Who we share it with"><p>• Supabase — our database provider (UK/EU infrastructure)<br/>• Anthropic — receives your training profile (not your name or email) to generate AI plans<br/>• Mapbox — processes location data during GPS sessions<br/>We do not sell your data. We do not share with advertisers.</p></Sec>
    <Sec title="How long we keep it"><p>We keep your data while your account is active. On deletion we remove all personal data within 30 days.</p></Sec>
    <Sec title="Your rights under UK GDPR"><p>Access · Correct · Delete · Object · Portability — email privacy@coachapp.co.uk. We respond within 30 days.</p></Sec>
    <Sec title="Data breaches"><p>We will notify the ICO within 72 hours of a breach that risks your rights and freedoms, and will notify affected users without undue delay.</p></Sec>
    <Sec title="Complaints"><p>Contact the ICO at ico.org.uk or 0303 123 1113.</p></Sec>
  </Wrap>
);

export const TermsOfServiceScreen = ({ onBack }) => (
  <Wrap title="Terms of Service" onBack={onBack}>
    <Sec title="Agreement"><p>By using COACH you agree to these terms. If you do not agree, do not use the app.</p></Sec>
    <Sec title="What COACH provides"><p>COACH is a fitness training application. It is not a medical service, physiotherapy service or substitute for professional coaching. Training plans are general fitness recommendations only.</p></Sec>
    <Sec title="Your account"><p>You must be at least 16 years old. You are responsible for keeping your login secure and for all activity under your account.</p></Sec>
    <Sec title="Acceptable use"><p>You agree not to use COACH for unlawful purposes, post offensive content, access other users' data, reverse engineer the app, or disrupt our systems.</p></Sec>
    <Sec title="Subscriptions"><p>COACH is currently free during beta. When paid plans are introduced you will be notified in advance. You will never be charged without explicit consent.</p></Sec>
    <Sec title="Intellectual property"><p>All COACH content is owned by COACH and protected by copyright. You may not reproduce or distribute it without written permission.</p></Sec>
    <Sec title="Limitation of liability"><p>To the maximum extent permitted by law, COACH is not liable for any injury, illness or damage from using the app or its training plans. You train at your own risk.</p></Sec>
    <Sec title="Governing law"><p>These terms are governed by the laws of England and Wales.</p></Sec>
  </Wrap>
);

export const HealthDisclaimerScreen = ({ onBack }) => (
  <Wrap title="Health Disclaimer" onBack={onBack}>
    <div style={{ background:'rgba(183,119,13,0.1)', border:'1px solid #b7770d', borderRadius:'14px', padding:'16px', marginBottom:'24px' }}>
      <p style={{ color:'#b7770d', fontSize:'14px', fontWeight:'700', margin:'0 0 6px', fontFamily:f }}>Important — please read before training</p>
      <p style={{ color:C.dark, fontSize:'13px', lineHeight:1.6, margin:0, fontFamily:f }}>COACH provides fitness guidance not medical advice.</p>
    </div>
    <Sec title="Not medical advice"><p>Training plans, workout recommendations and coaching content in COACH are for general fitness purposes only. Nothing in COACH constitutes medical advice, diagnosis or treatment.</p></Sec>
    <Sec title="Consult a doctor first"><p>Before beginning any new exercise programme see your doctor, particularly if you: have not exercised regularly for 6+ months, have a heart condition or cardiovascular risk factors, are pregnant or recently gave birth, have injuries or chronic conditions, or are over 40 without a recent health check.</p></Sec>
    <Sec title="Know your limits"><p>Stop immediately if you feel pain, dizziness, nausea or unusual symptoms. RPE guides are suggestions only. Your personal response varies based on sleep, nutrition, stress and health status.</p></Sec>
    <Sec title="GPS and outdoor training"><p>Always be aware of your surroundings when running. Do not stare at your phone while moving. Tell someone your planned route and expected return time when training alone.</p></Sec>
    <Sec title="Limitation of liability"><p>To the fullest extent permitted by law, COACH accepts no liability for injury, illness or adverse health events arising from use of the app or its training recommendations.</p></Sec>
  </Wrap>
);
