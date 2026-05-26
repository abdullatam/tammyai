const API = 'http://localhost:7861';
window.TammyData = {
  user:{name:'',initial:'?'},
  greeting:{phrase:'hey.',hero_line:"what's on your chest?"},
  recent_sessions:[],decisions:[],emotional_arc:[],
  arc_stats:{},projects:[],unread_count:0
};
window.TammyBootstrap = async () => {
  const go = (url) => fetch(`${API}${url}`,{credentials:'include'}).then(r=>r.ok?r.json():null).catch(()=>null);
  const [me,gr,sess,dec,arc,stats,proj,nc] = await Promise.all([
    go('/auth/me'),go('/api/greeting'),go('/sessions'),
    go('/api/decisions?status=pending'),go('/api/arc'),go('/arc/stats'),
    go('/api/projects'),go('/notifications/count')
  ]);
  if(me) window.TammyData.user={...me,initial:me.name?.[0]?.toUpperCase()||'?'};
  if(gr) window.TammyData.greeting=gr;
  if(sess) window.TammyData.recent_sessions=sess;
  if(dec) window.TammyData.decisions=dec;
  if(arc) window.TammyData.emotional_arc=arc;
  if(stats) window.TammyData.arc_stats=stats;
  if(proj) window.TammyData.projects=proj;
  if(nc) window.TammyData.unread_count=nc.unread_count||0;
};
window.TammyCheckAuth = async () => {
  const me = await fetch(`${API}/auth/me`,{credentials:'include'}).then(r=>r.ok?r.json():null).catch(()=>null);
  if(!me) return {auth:false};
  return {auth:true, onboarding_complete:me.onboarding_complete};
};
