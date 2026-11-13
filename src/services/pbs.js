// ─────────────────────────────────────────────────────────────────────────────
// COACH — Personal Record Detection
// Call checkForPBs after every activity log save
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabase';
import { awardAchievement } from './tier';

// Check if a new activity beats any PBs
// Returns array of new PB categories achieved (empty if none)
export const checkForPBs = async (userId, activityLog) => {
  const newPBs = [];
  const { distance_km: dist, duration_minutes: dur, activity_type } = activityLog;

  // Only check running activities for pace-based PBs
  if (activity_type === 'run' && dist > 0 && dur > 0) {
    const pace = dur / dist; // minutes per km

    // Fastest 5k (must be at least 5km)
    if (dist >= 5) {
      const time5k = pace * 5;
      const { data: cur } = await supabase.from('personal_records').select('value').eq('user_id',userId).eq('category','fastest_5k').maybeSingle();
      if (!cur || time5k < cur.value) {
        await supabase.from('personal_records').upsert({ user_id:userId, category:'fastest_5k', value:Math.round(time5k*100)/100, unit:'min', achieved_at:new Date().toISOString() }, { onConflict:'user_id,category' });
        newPBs.push({ category:'fastest_5k', label:'Fastest 5k', value:`${Math.floor(time5k)}m ${Math.round((time5k%1)*60)}s` });
      }
    }

    // Fastest 10k
    if (dist >= 10) {
      const time10k = pace * 10;
      const { data: cur } = await supabase.from('personal_records').select('value').eq('user_id',userId).eq('category','fastest_10k').maybeSingle();
      if (!cur || time10k < cur.value) {
        await supabase.from('personal_records').upsert({ user_id:userId, category:'fastest_10k', value:Math.round(time10k*100)/100, unit:'min', achieved_at:new Date().toISOString() }, { onConflict:'user_id,category' });
        newPBs.push({ category:'fastest_10k', label:'Fastest 10k', value:`${Math.floor(time10k/60)}h ${Math.floor(time10k%60)}m` });
      }
    }

    // Fastest Half Marathon
    if (dist >= 21) {
      const timeHalf = pace * 21.0975;
      const { data: cur } = await supabase.from('personal_records').select('value').eq('user_id',userId).eq('category','fastest_half').maybeSingle();
      if (!cur || timeHalf < cur.value) {
        await supabase.from('personal_records').upsert({ user_id:userId, category:'fastest_half', value:Math.round(timeHalf*100)/100, unit:'min', achieved_at:new Date().toISOString() }, { onConflict:'user_id,category' });
        newPBs.push({ category:'fastest_half', label:'Fastest Half Marathon', value:`${Math.floor(timeHalf/60)}h ${Math.floor(timeHalf%60)}m` });
      }
    }

    // Fastest Marathon
    if (dist >= 42) {
      const timeMarathon = pace * 42.195;
      const { data: cur } = await supabase.from('personal_records').select('value').eq('user_id',userId).eq('category','fastest_marathon').maybeSingle();
      if (!cur || timeMarathon < cur.value) {
        await supabase.from('personal_records').upsert({ user_id:userId, category:'fastest_marathon', value:Math.round(timeMarathon*100)/100, unit:'min', achieved_at:new Date().toISOString() }, { onConflict:'user_id,category' });
        newPBs.push({ category:'fastest_marathon', label:'Fastest Marathon', value:`${Math.floor(timeMarathon/60)}h ${Math.floor(timeMarathon%60)}m` });
      }
    }

    // Longest run
    const { data: curLong } = await supabase.from('personal_records').select('value').eq('user_id',userId).eq('category','longest_run').maybeSingle();
    if (!curLong || dist > curLong.value) {
      await supabase.from('personal_records').upsert({ user_id:userId, category:'longest_run', value:Math.round(dist*100)/100, unit:'km', achieved_at:new Date().toISOString() }, { onConflict:'user_id,category' });
      newPBs.push({ category:'longest_run', label:'Longest run', value:`${Math.round(dist*100)/100}km` });
    }
  }

  // Check session count achievements
  const { count } = await supabase.from('activity_logs').select('*',{count:'exact',head:true}).eq('user_id',userId);
  if (count === 1)  await awardAchievement(userId, 'first_session');
  if (count === 10) await awardAchievement(userId, 'sessions_10');
  if (count === 50) await awardAchievement(userId, 'sessions_50');

  // GPS run achievement
  if (activityLog.device_source === 'gps') {
    await awardAchievement(userId, 'first_gps');
  }

  // First PB
  if (newPBs.length > 0) {
    await awardAchievement(userId, 'first_pb');
  }

  return newPBs;
};
