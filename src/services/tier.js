// COACH — Tier / Pricing Logic
import { supabase } from './supabase';

export const getUserTier = async (userId) => {
  const { data } = await supabase.from('profiles').select('tier,tier_expires_at').eq('id',userId).single();
  if (!data || data.tier === 'free') return 'free';
  if (data.tier_expires_at && new Date(data.tier_expires_at) < new Date()) return 'free';
  return data.tier;
};

export const canAccess = (userTier, feature) => {
  const map = {
    gpsTracking:'free', activityLogging:'free', streak:'free', leaderboard:'free',
    activityFeed:'free', clubs:'free', personalRecords:'free', audioGps:'free',
    aiTrainingPlan:'premium', unlimitedEvents:'premium', fullStats:'premium',
    racePredictor:'premium', planReschedule:'premium', heartRateZones:'premium',
    trainingLoad:'premium', nutritionTargets:'pro', routeIntelligence:'pro',
    advancedAnalytics:'pro', dataExport:'pro',
  };
  const req = map[feature] ?? 'free';
  if (req === 'free') return true;
  if (req === 'premium') return userTier === 'premium' || userTier === 'pro';
  return userTier === 'pro';
};

export const generateGiftCode = () => {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'COACH-';
  for (let i = 0; i < 8; i++) { if (i===4) code+='-'; code+=c[Math.floor(Math.random()*c.length)]; }
  return code;
};

export const redeemGiftCode = async (userId, code) => {
  const { data: gc } = await supabase.from('gift_codes').select('*').eq('code', code.toUpperCase().trim()).is('redeemed_by',null).maybeSingle();
  if (!gc) return { success:false, error:'Invalid or already used code' };
  const exp = new Date(); exp.setDate(exp.getDate() + gc.duration_days);
  await supabase.from('gift_codes').update({ redeemed_by:userId, redeemed_at:new Date().toISOString() }).eq('id',gc.id);
  await supabase.from('profiles').update({ tier:gc.type, tier_expires_at:exp.toISOString() }).eq('id',userId);
  return { success:true, days:gc.duration_days };
};

export const awardAchievement = async (userId, achievementId, withCode=false, codeType=null, codeDays=0) => {
  const { data: ex } = await supabase.from('achievements').select('id').eq('user_id',userId).eq('achievement_id',achievementId).maybeSingle();
  if (ex) return null;
  let giftCode = null;
  if (withCode) {
    giftCode = generateGiftCode();
    await supabase.from('gift_codes').insert({ code:giftCode, type:codeType, duration_days:codeDays, created_for:userId });
  }
  await supabase.from('achievements').insert({ user_id:userId, achievement_id:achievementId, gift_code:giftCode });
  return { achievementId, giftCode };
};

export const ensureReferralCode = async (userId) => {
  const { data } = await supabase.from('referral_codes').select('code').eq('user_id',userId).maybeSingle();
  if (data) return data.code;
  const code = 'REF-' + userId.slice(0,6).toUpperCase();
  await supabase.from('referral_codes').insert({ user_id:userId, code });
  return code;
};
