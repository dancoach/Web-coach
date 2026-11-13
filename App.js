// ─────────────────────────────────────────────────────────────────────────────
// COACH — Main App Router
// Clean navigation-only file — all logic lives in individual screens
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { supabase } from './src/services/supabase';
import { getUserTier } from './src/services/tier';
import { checkForPBs } from './src/services/pbs';
import { EVENTS } from './src/constants/data';

import { SplashScreen } from './src/components/SplashScreen';
import { NavBar }       from './src/components/NavBar';

// Auth
import { HomeScreen, LoginScreen, ForgotPasswordScreen, ResetPasswordScreen, SignupScreen } from './src/screens/auth/index';
// Onboarding (reuse existing component)
// Dashboard
import { DashboardScreen }    from './src/screens/dashboard/DashboardScreen';
// Training
import { WeekScreen }         from './src/screens/training/WeekScreen';
import { FullPlanScreen }     from './src/screens/training/FullPlanScreen';
import { RestDayScreen }      from './src/screens/training/RestDayScreen';
import { WorkoutScreen }      from './src/screens/training/WorkoutScreen';
import { HyroxLoggingScreen } from './src/screens/training/HyroxLoggingScreen';
import { GPSTracker }         from './src/screens/training/GPSTracker';
import { LogActivityScreen }  from './src/screens/training/LogActivityScreen';
import { StatisticsScreen }   from './src/screens/training/StatisticsScreen';
// Social
import { ActivityFeedScreen } from './src/screens/social/ActivityFeedScreen';
import { LeaderboardScreen }  from './src/screens/social/LeaderboardScreen';
import { FriendsScreen }      from './src/screens/social/FriendsScreen';
import { CreateChallengeScreen } from './src/screens/social/CreateChallengeScreen';
import { ChallengeDetailScreen } from './src/screens/social/ChallengeDetailScreen';
import { ClubsScreen, CreateClubScreen, ClubDetailScreen } from './src/screens/social/ClubsScreen';
// Profile
import { EditProfileScreen }  from './src/screens/profile/EditProfileScreen';
import { EventsManagementScreen } from './src/screens/profile/EventsManagementScreen';
import { CelebrationScreen }  from './src/screens/profile/CelebrationScreen';
import { AchievementsScreen } from './src/screens/profile/AchievementsScreen';
import { PersonalRecordsScreen } from './src/screens/profile/PersonalRecordsScreen';
// Legal
import { PrivacyPolicyScreen, TermsOfServiceScreen, HealthDisclaimerScreen } from './src/screens/legal';

// Load Manrope font
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800;900&display=swap';
  link.rel  = 'stylesheet';
  document.head.appendChild(link);
}

// Which screens show the bottom nav bar
const NAV_TABS = new Set(['dashboard','week','fullplan','stats','feed','clubs','clubdetail','createclub','leaderboard','friends','createchallenge','challengedetail','editprofile','manageevents','achievements','pbs']);

const getTab = s => {
  if (s === 'dashboard') return 'home';
  if (['week','fullplan','restday','workout','hyrox','logactivity','stats'].includes(s)) return 'train';
  if (['feed','clubs','clubdetail','createclub','leaderboard','friends','createchallenge','challengedetail'].includes(s)) return 'social';
  if (['editprofile','manageevents','achievements','pbs'].includes(s)) return 'profile';
  return null;
};

export default function App() {
  const [screen,  setScreen]  = useState('splash');
  const nav = s => setScreen(s);

  const [userId,      setUserId]      = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userTier,    setUserTier]    = useState('free');

  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutLogged,   setWorkoutLogged]   = useState(false);
  const [sessionLocation, setSessionLocation] = useState('home');
  const [gpsResult,       setGpsResult]       = useState(null);
  const [newPBs,          setNewPBs]          = useState([]);

  const [leaderboard,  setLeaderboard]  = useState([]);
  const [friends,      setFriends]      = useState([]);
  const [challenges,   setChallenges]   = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeLeaderboard, setChallengeLeaderboard] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  const [celebrationData,  setCelebrationData]  = useState(null);
  const [celebrationStats, setCelebrationStats] = useState(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') nav('resetpassword');
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase.from('profiles').select('*').eq('id',userId).single().then(({ data }) => {
      setUserProfile(data);
      if (data?.training_location) setSessionLocation(data.training_location === 'both' ? 'home' : data.training_location);
    });
    getUserTier(userId).then(setUserTier);
  }, [userId]);

  const handleLoginSuccess  = id => { setUserId(id); nav('dashboard'); };
  const handleSignupSuccess = id => { setUserId(id); nav('dashboard'); };
  const handleSignOut = async () => { await supabase.auth.signOut(); setUserId(null); setUserProfile(null); nav('home'); };

  const afterEditSaved = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id',userId).single();
    setUserProfile(data);
    if (data?.training_location) setSessionLocation(data.training_location==='both'?'home':data.training_location);
    nav('dashboard');
  };

  const handleActivitySaved = async (log) => {
    const pbs = await checkForPBs(userId, log);
    if (pbs.length > 0) setNewPBs(pbs);
    setWorkoutLogged(true);
    nav('dashboard');
  };

  const loadLeaderboard = async () => {
    const { data } = await supabase.from('streaks').select('current_streak,longest_streak,user_id,profiles(username)').order('current_streak',{ascending:false}).limit(20);
    setLeaderboard(data??[]); nav('leaderboard');
  };

  const loadFriends = async () => {
    const { data: fr } = await supabase.from('friendships').select('friend_id,profiles!friendships_friend_id_fkey(username)').eq('user_id',userId).eq('status','accepted');
    setFriends(fr??[]);
    const { data: ch } = await supabase.from('challenge_participants').select('challenge_id,status,challenges(id,title,slogan,challenge_type,target_value,duration_days,status,created_at,ends_at,creator_id)').eq('user_id',userId).neq('status','declined');
    setChallenges((ch??[]).filter(c=>c.status==='accepted').map(c=>c.challenges));
    setPendingInvites((ch??[]).filter(c=>c.status==='pending').map(c=>({...c.challenges,id:c.challenge_id})));
    nav('friends');
  };

  const addFriend = async friendId => {
    await supabase.from('friendships').insert({ user_id:userId, friend_id:friendId, status:'accepted' });
    loadFriends();
  };

  const respondToInvite = async (challengeId, accept) => {
    await supabase.from('challenge_participants').update({ status:accept?'accepted':'declined' }).eq('challenge_id',challengeId).eq('user_id',userId);
    loadFriends();
  };

  const viewChallenge = async challenge => {
    setSelectedChallenge(challenge);
    const { data: participants } = await supabase.from('challenge_participants').select('user_id,profiles(username)').eq('challenge_id',challenge.id).eq('status','accepted');
    if (!participants) { setChallengeLeaderboard([]); nav('challengedetail'); return; }
    const start = new Date(challenge.created_at).toISOString().split('T')[0];
    const end   = new Date(challenge.ends_at).toISOString().split('T')[0];
    const results = await Promise.all(participants.map(async p => {
      let value = 0;
      if (challenge.challenge_type==='distance') {
        const { data: logs } = await supabase.from('activity_logs').select('distance_km').eq('user_id',p.user_id).gte('logged_date',start).lte('logged_date',end);
        value = Math.round((logs??[]).reduce((s,l)=>s+(l.distance_km??0),0)*100)/100;
      } else if (challenge.challenge_type==='sessions') {
        const { data: logs } = await supabase.from('activity_logs').select('id').eq('user_id',p.user_id).gte('logged_date',start).lte('logged_date',end);
        value = (logs??[]).length;
      }
      return { username:p.profiles?.username??'Athlete', value };
    }));
    setChallengeLeaderboard([...results].sort((a,b)=>b.value-a.value));
    nav('challengedetail');
  };

  const handleEventComplete = async (response, eventData) => {
    await supabase.from('user_events').update({ completion_noted:true, completion_response:response }).eq('id',eventData.id);
    const { data: logs } = await supabase.from('activity_logs').select('distance_km').eq('user_id',userId);
    const { data: st }   = await supabase.from('streaks').select('longest_streak').eq('user_id',userId).single();
    const totalDist = logs?.reduce((s,l)=>s+(l.distance_km??0),0)??0;
    setCelebrationData({ response, eventData });
    setCelebrationStats({ sessions:logs?.length??0, distance:Math.round(totalDist*10)/10, streak:st?.longest_streak??0, eventName:EVENTS.find(e=>e.id===eventData?.event_type)?.name??'your event' });
    nav('celebration');
  };

  const handleShare = async () => {
    if (!celebrationStats) return;
    const text = `I just completed the ${celebrationStats.eventName} with COACH!\n\n${celebrationStats.sessions} sessions · ${celebrationStats.distance}km · ${celebrationStats.streak} day best streak\n\nTrain smart. Go further. #COACH`;
    if (navigator.share) { try { await navigator.share({title:'COACH',text}); } catch(e) {} }
    else { try { await navigator.clipboard.writeText(text); alert('Copied!'); } catch(e) {} }
  };

  const effectiveLoc = userProfile?.training_location==='both' ? sessionLocation : (userProfile?.training_location??'home');
  const showNav = userId && NAV_TABS.has(screen);
  const activeTab = getTab(screen);

  const navBar = showNav ? <NavBar activeTab={activeTab} onHome={()=>nav('dashboard')} onTrain={()=>nav('week')} onSocial={()=>nav('feed')} onProfile={()=>nav('editprofile')} /> : null;

  // PB celebration overlay
  const pbOverlay = newPBs.length > 0 && (
    <div style={{ position:'fixed', inset:0, background:'rgba(28,28,24,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'32px' }}>
      <div style={{ background:'#f5f1d4', borderRadius:'20px', padding:'32px 24px', textAlign:'center', maxWidth:'320px', width:'100%', border:'1px solid #cdc8b4' }}>
        <p style={{ fontSize:'48px', margin:'0 0 8px' }}>🎯</p>
        <p style={{ color:'#64974a', fontSize:'22px', fontWeight:'800', margin:'0 0 8px', fontFamily:"'Manrope',system-ui" }}>New Personal Best!</p>
        {newPBs.map((pb,i) => (
          <div key={i} style={{ background:'rgba(100,151,74,0.12)', border:'1px solid rgba(100,151,74,0.32)', borderRadius:'12px', padding:'12px', marginBottom:'8px' }}>
            <p style={{ color:'#5a5750', fontSize:'12px', margin:'0 0 2px', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:"'Manrope',system-ui" }}>{pb.label}</p>
            <p style={{ color:'#64974a', fontSize:'20px', fontWeight:'900', margin:0, fontFamily:"'Manrope',system-ui" }}>{pb.value}</p>
          </div>
        ))}
        <button onClick={()=>setNewPBs([])} style={{ width:'100%', padding:'16px', background:'#64974a', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'700', fontSize:'14px', cursor:'pointer', marginTop:'8px', fontFamily:"'Manrope',system-ui" }}>AMAZING, THANKS!</button>
      </div>
    </div>
  );

  // Screens
  if (screen==='splash') return <SplashScreen onDone={()=>nav('home')} />;
  if (screen==='home')          return <HomeScreen onLogin={()=>nav('login')} onSignup={()=>nav('signup')} />;
  if (screen==='login')         return <LoginScreen onBack={()=>nav('home')} onForgot={()=>nav('forgotpassword')} onSuccess={handleLoginSuccess} />;
  if (screen==='forgotpassword')return <ForgotPasswordScreen onBack={()=>nav('login')} />;
  if (screen==='resetpassword') return <ResetPasswordScreen onDone={()=>nav('login')} />;
  if (screen==='signup')        return <SignupScreen onBack={()=>nav('home')} onSuccess={handleSignupSuccess} />;

  if (screen==='dashboard') return <>{pbOverlay}<DashboardScreen userId={userId} onViewWeek={()=>nav('week')} onViewLeaderboard={loadLeaderboard} onViewFriends={loadFriends} onEditProfile={()=>nav('editprofile')} onStartGPS={()=>{setSelectedWorkout(null);nav('gpstracking');}} onEventComplete={handleEventComplete} onSignOut={handleSignOut} onAddEvent={()=>nav('manageevents')} />{navBar}</>;

  if (screen==='week')     return <><WeekScreen userId={userId} userProfile={userProfile} userTier={userTier} sessionLocation={effectiveLoc} setSessionLocation={setSessionLocation} onBack={()=>nav('dashboard')} onWorkout={w=>{setSelectedWorkout(w);setWorkoutLogged(false);setGpsResult(null);nav('workout');}} onRestDay={w=>{setSelectedWorkout(w);nav('restday');}} onFullPlan={()=>nav('fullplan')} onStats={()=>nav('stats')} />{navBar}</>;
  if (screen==='fullplan') return <><FullPlanScreen userId={userId} onBack={()=>nav('week')} />{navBar}</>;
  if (screen==='restday')  return <RestDayScreen selectedWorkout={selectedWorkout} onBack={()=>nav('week')} />;
  if (screen==='stats')    return <><StatisticsScreen userId={userId} userTier={userTier} onBack={()=>nav('week')} onUpgrade={()=>nav('editprofile')} />{navBar}</>;

  if (screen==='workout') return <WorkoutScreen selectedWorkout={selectedWorkout} userProfile={userProfile} sessionLocation={effectiveLoc} setSessionLocation={setSessionLocation} workoutLogged={workoutLogged} onLogActivity={()=>nav('logactivity')} onGPS={()=>nav('gpstracking')} onHyrox={()=>nav('hyrox')} onBack={()=>nav('week')} />;
  if (screen==='hyrox')   return <HyroxLoggingScreen userId={userId} onBack={()=>nav('workout')} onDone={()=>nav('dashboard')} />;

  if (screen==='gpstracking') return <GPSTracker workout={selectedWorkout??{title:'Free Run',type:'run'}} onComplete={result=>{setGpsResult(result);nav('logactivity');}} onCancel={()=>nav(selectedWorkout?'workout':'dashboard')} />;

  if (screen==='logactivity') return <LogActivityScreen userId={userId} selectedWorkout={selectedWorkout} gpsResult={gpsResult} onSave={handleActivitySaved} onBack={()=>nav(gpsResult?'dashboard':'workout')} />;

  if (screen==='feed')        return <><ActivityFeedScreen userId={userId} onBack={()=>nav('dashboard')} />{navBar}</>;
  if (screen==='clubs')       return <><ClubsScreen userId={userId} onViewClub={c=>{setSelectedClub(c);nav('clubdetail');}} onCreateClub={()=>nav('createclub')} />{navBar}</>;
  if (screen==='createclub')  return <><CreateClubScreen userId={userId} onBack={()=>nav('clubs')} onDone={()=>nav('clubs')} />{navBar}</>;
  if (screen==='clubdetail')  return <><ClubDetailScreen userId={userId} club={selectedClub} onBack={()=>nav('clubs')} />{navBar}</>;
  if (screen==='leaderboard') return <><LeaderboardScreen leaderboard={leaderboard} onBack={()=>nav('feed')} />{navBar}</>;
  if (screen==='friends')     return <><FriendsScreen userId={userId} friends={friends} challenges={challenges} pendingInvites={pendingInvites} onBack={()=>nav('feed')} onCreateChallenge={()=>nav('createchallenge')} onViewChallenge={viewChallenge} onRespondInvite={respondToInvite} onAddFriend={addFriend} />{navBar}</>;
  if (screen==='createchallenge') return <><CreateChallengeScreen userId={userId} friends={friends} onBack={()=>nav('friends')} onDone={loadFriends} />{navBar}</>;
  if (screen==='challengedetail') return <><ChallengeDetailScreen selectedChallenge={selectedChallenge} challengeLeaderboard={challengeLeaderboard} onBack={()=>nav('friends')} />{navBar}</>;

  if (screen==='editprofile') return <><EditProfileScreen userId={userId} initialProfile={userProfile} onBack={()=>nav('dashboard')} onSaved={afterEditSaved} onManageEvents={()=>nav('manageevents')} onAchievements={()=>nav('achievements')} onPersonalRecords={()=>nav('pbs')} onPrivacy={()=>nav('privacy')} onTerms={()=>nav('terms')} onHealth={()=>nav('health')} />{navBar}</>;
  if (screen==='manageevents')return <><EventsManagementScreen userId={userId} onBack={()=>nav('editprofile')} />{navBar}</>;
  if (screen==='achievements')return <><AchievementsScreen userId={userId} onBack={()=>nav('editprofile')} />{navBar}</>;
  if (screen==='pbs')         return <><PersonalRecordsScreen userId={userId} onBack={()=>nav('editprofile')} />{navBar}</>;

  if (screen==='privacy') return <PrivacyPolicyScreen onBack={()=>nav('editprofile')} />;
  if (screen==='terms')   return <TermsOfServiceScreen onBack={()=>nav('editprofile')} />;
  if (screen==='health')  return <HealthDisclaimerScreen onBack={()=>nav('editprofile')} />;

  if (screen==='celebration') return <CelebrationScreen celebrationData={celebrationData} celebrationStats={celebrationStats} onShare={handleShare} onNextEvent={()=>nav('manageevents')} onDashboard={()=>nav('dashboard')} />;

  return null;
}
