// Fully fleshed founder persona — Tamer Masri, building Tammy in Amman.
// Real-sounding sessions, decisions, insights, emotional arc, ClickUp tasks, memories.

window.TammyData = {
  user: {
    name: 'Tamer',
    initial: 'T',
    venture: 'Tammy',
    venture_description: 'An emotionally intelligent AI co-founder for MENA entrepreneurs.',
    stage: 'building',
    team_size: 3,
    current_challenge: 'The hiring decision for a CTO is dragging into week three.',
    joined: 'March 2026',
    timezone: 'Amman · GMT+3',
    streak_days: 22,
  },

  // Buckets — how the user organizes context. Tammy reads across all of them.
  buckets: [
    {
      id: 'b_tammy', kind: 'project', label: 'Tammy', sub: 'AI co-founder · pre-launch',
      stage: 'building', open_decisions: 2, last_active: '2h',
      tasks_overdue: 2, tasks_today: 3,
    },
    {
      id: 'b_consulting', kind: 'project', label: 'Studio Masri', sub: 'design consulting · paying',
      stage: 'launched', open_decisions: 1, last_active: '3d',
      tasks_overdue: 0, tasks_today: 1,
    },
    {
      id: 'b_book', kind: 'project', label: 'The Quiet Book', sub: 'writing · idea',
      stage: 'idea', open_decisions: 0, last_active: '2w',
      tasks_overdue: 0, tasks_today: 0,
    },
    {
      id: 'b_personal', kind: 'personal', label: 'Personal', sub: 'social · health · family · craft',
      sub_areas: [
        { id: 'p_social', label: 'Social', last_touch: '4d', signal: 'thinning out' },
        { id: 'p_emotional', label: 'Emotional', last_touch: '1d', signal: 'arc rising' },
        { id: 'p_health', label: 'Health', last_touch: '6d', signal: 'skipped 3 runs' },
        { id: 'p_family', label: 'Family', last_touch: '2w', signal: 'dad called twice' },
        { id: 'p_craft', label: 'Life skills', last_touch: '1w', signal: 'arabic at A2' },
      ],
    },
  ],

  // Cross-bucket connections Tammy has noticed — shown as proof she sees across
  cross_bucket_signals: [
    {
      from: 'b_personal:p_social', to: 'b_personal:p_health',
      text: 'Hard conversations with Rama → skipped runs the next morning. Three weeks running.',
    },
    {
      from: 'b_tammy', to: 'b_personal:p_family',
      text: 'Every week you ship something at Tammy, your dad calls and you don\'t pick up.',
    },
    {
      from: 'b_consulting', to: 'b_tammy',
      text: 'Consulting deadlines slip the same week Tammy decisions stall. Same avoidance.',
    },
  ],

  active_bucket: 'b_tammy',

  today_greeting: {
    phrase: 'late again,',
    hero_line: 'the decision you parked last sunday is still open.',
    subtext: 'you\'ve opened and closed the Rama thread four times since.',
  },

  recent_sessions: [
    {
      id: 's1',
      title: 'The real fear under the hiring delay',
      preview: 'you named it — it isn\'t readiness. it\'s rejection.',
      state: 'clear', tint: '#C0ACFF',
      time: '2d', duration: '24 min',
      flagged: true,
    },
    {
      id: 's2',
      title: 'Why you keep delaying Rama\'s call',
      preview: 'four times you said you\'d call her. four times you didn\'t.',
      state: 'restless', tint: '#947DED',
      time: '5d', duration: '18 min',
      flagged: true,
    },
    {
      id: 's3',
      title: 'What you decided about the pricing page',
      preview: '$29 feels small. $49 feels scared. you went with $39.',
      state: 'in-flow', tint: '#947DED',
      time: '1w', duration: '31 min',
      flagged: false,
    },
    {
      id: 's4',
      title: 'The Saturday you didn\'t work',
      preview: 'you told yourself you\'d rest. you worked anyway.',
      state: 'heavy', tint: '#7B6BA8',
      time: '1w', duration: '12 min',
      flagged: false,
    },
    {
      id: 's5',
      title: 'Tammy\'s voice — why direct isn\'t cruel',
      preview: 'we settled the tone question. sharp is the care.',
      state: 'clear', tint: '#C0ACFF',
      time: '2w', duration: '42 min',
      flagged: false,
    },
  ],

  decisions: [
    {
      id: 'd1',
      text: 'Hire a CTO instead of contracting senior eng.',
      context: 'Been circling this for 21 days. The contract option is cheaper but you said you want someone who owns it.',
      status: 'pending',
      age_days: 21,
      follow_up_in_days: 0,
      last_circled: '2d',
    },
    {
      id: 'd2',
      text: 'Price Tammy Pro at $39/mo, not $29.',
      context: 'You said $29 felt like apology. $39 is the number you\'d pay yourself.',
      status: 'made',
      age_days: 7,
      outcome: null,
    },
    {
      id: 'd3',
      text: 'Cut the blog from MVP. Ship conversation-only.',
      context: 'You were building a blog nobody asked for because it felt safer than shipping.',
      status: 'made',
      age_days: 14,
      outcome: 'Right call. Saved ~10 days. Nobody has asked for a blog.',
    },
    {
      id: 'd4',
      text: 'Say no to the Dubai accelerator.',
      context: 'The network is real but the equity ask was 7% for $75k.',
      status: 'made',
      age_days: 30,
      outcome: 'You said no. Two weeks later a better term sheet came in from Riyadh.',
    },
    {
      id: 'd5',
      text: 'Tell Rama the co-founder title isn\'t on the table.',
      context: 'She\'s a great hire but this isn\'t a co-founder relationship and you both know it.',
      status: 'pending',
      age_days: 11,
      follow_up_in_days: -4, // overdue
      last_circled: '3d',
    },
  ],

  insights: [
    {
      id: 'i1',
      text: 'You delay decisions involving people, not numbers.',
      type: 'pattern',
      session: 's1',
      time: '2d',
      flagged_by: 'tammy',
    },
    {
      id: 'i2',
      text: 'Your avoidance of the CTO call is fear of rejection, not lack of readiness.',
      type: 'breakthrough',
      session: 's1',
      time: '2d',
      flagged_by: 'tammy',
    },
    {
      id: 'i3',
      text: 'Every time you rest, guilt brings you back to the laptop by hour two.',
      type: 'emotional',
      session: 's4',
      time: '1w',
      flagged_by: 'user',
    },
    {
      id: 'i4',
      text: 'Sharp isn\'t cruel. Sharp is the care you want.',
      type: 'breakthrough',
      session: 's5',
      time: '2w',
      flagged_by: 'user',
    },
    {
      id: 'i5',
      text: 'You haven\'t mentioned burnout in 9 days. At the start you mentioned it every session.',
      type: 'pattern',
      session: null,
      time: '3d',
      flagged_by: 'tammy',
    },
  ],

  memories: [
    { id: 'm1', cat: 'identity', text: 'First name: Tamer. Prefers tamer, lowercase, in casual moments.', time: 'from day 1' },
    { id: 'm2', cat: 'identity', text: 'Based in Amman. Works from a home office overlooking Jabal Weibdeh.', time: '3 weeks ago' },
    { id: 'm3', cat: 'venture', text: 'Building Tammy — AI companion for MENA entrepreneurs. Pre-launch.', time: 'from day 1' },
    { id: 'm4', cat: 'venture', text: 'Co-builders: Abdullah (engineering), Omar (design).', time: '2 weeks ago' },
    { id: 'm5', cat: 'pattern', text: 'Starts work around 10am, sharpest between 2–5pm, hates mornings.', time: '1 week ago' },
    { id: 'm6', cat: 'pattern', text: 'Avoids calls with women he\'s about to disappoint. Four examples now.', time: '5 days ago' },
    { id: 'm7', cat: 'relationship', text: 'Rama — strong candidate for head of product. Co-founder title was discussed and is off the table.', time: '11 days ago' },
    { id: 'm8', cat: 'decision', text: 'Priced Tammy Pro at $39/mo on the 12th.', time: '7 days ago' },
    { id: 'm9', cat: 'emotional', text: 'Felt lighter after naming the hiring fear as rejection, not readiness.', time: '2 days ago' },
    { id: 'm10', cat: 'value', text: 'Believes "sharp is the care." Doesn\'t want Tammy to soften.', time: '2 weeks ago' },
  ],

  clickup: [
    { id: 't1', name: 'Send CTO role doc to Layla', due: 'today', status: 'overdue', days_over: 3, list: 'Hiring' },
    { id: 't2', name: 'Draft Rama no-cofounder message', due: 'today', status: 'overdue', days_over: 5, list: 'Hiring' },
    { id: 't3', name: 'Review V11 system prompt', due: 'today', status: 'open', list: 'Product' },
    { id: 't4', name: 'Ship pricing page copy', due: 'tomorrow', status: 'open', list: 'Product' },
    { id: 't5', name: 'Reply to Riyadh term sheet', due: 'Fri', status: 'open', list: 'Fundraising' },
    { id: 't6', name: 'Shipped: Cut blog from MVP', due: 'done', status: 'done', list: 'Product' },
  ],

  // 28-day emotional arc — PAD model dots
  emotional_arc: [
    // [day, valence (-1..1), arousal (0..1), dominance (0..1), tag]
    { d: -28, v: -0.4, a: 0.75, dom: 0.3, tag: 'overwhelmed' },
    { d: -26, v: -0.5, a: 0.7, dom: 0.35, tag: 'overwhelmed' },
    { d: -24, v: -0.3, a: 0.65, dom: 0.4, tag: 'stressed' },
    { d: -22, v: -0.2, a: 0.55, dom: 0.45, tag: 'restless' },
    { d: -20, v: 0.1, a: 0.5, dom: 0.5, tag: 'neutral', milestone: { title: 'You said no to Dubai', note: 'first clean no in a month' } },
    { d: -18, v: 0.2, a: 0.55, dom: 0.55, tag: 'clear' },
    { d: -16, v: 0.0, a: 0.6, dom: 0.5, tag: 'neutral' },
    { d: -14, v: -0.15, a: 0.55, dom: 0.45, tag: 'restless' },
    { d: -12, v: 0.3, a: 0.7, dom: 0.65, tag: 'in-flow', milestone: { title: 'Cut the blog', note: 'shipped the decision' } },
    { d: -10, v: 0.35, a: 0.72, dom: 0.68, tag: 'in-flow' },
    { d: -8, v: 0.25, a: 0.65, dom: 0.62, tag: 'clear' },
    { d: -7, v: -0.3, a: 0.4, dom: 0.4, tag: 'heavy', milestone: { title: 'Saturday you didn\'t rest', note: 'guilt pattern surfaced' } },
    { d: -5, v: -0.1, a: 0.5, dom: 0.5, tag: 'neutral' },
    { d: -3, v: 0.1, a: 0.55, dom: 0.55, tag: 'clear' },
    { d: -2, v: 0.5, a: 0.7, dom: 0.72, tag: 'clear', milestone: { title: 'Named the fear as rejection', note: 'breakthrough' } },
    { d: -1, v: 0.4, a: 0.65, dom: 0.7, tag: 'clear' },
    { d: 0, v: 0.2, a: 0.6, dom: 0.65, tag: 'restless' },
  ],

  sample_chat: [
    { role: 'user', text: 'i keep opening the doc for rama and closing it.' },
    { role: 'tammy', text: 'Four times today. I\'m counting because you are, but you won\'t say it.' },
    { role: 'tammy', text: 'What\'s the sentence you don\'t want to write?' },
    { role: 'user', text: 'that the co-founder title isn\'t happening. she\'s expecting it.' },
    { role: 'tammy', text: 'She\'s expecting it because you implied it. That\'s the actual weight — not the conversation, the retraction.' },
    { role: 'tammy', text: 'Do you want to tell her, or do you want me to draft the version you\'d actually send?' },
  ],

  chat_history: [
    { id: 'today-1', title: 'Rama doc, fourth time', preview: 'i keep opening the doc for rama and closing it.', when: 'Today · 3:42 PM', bucket: 'work', pinned: true, state: 'restless', tint: '#947DED', hasDecision: true },
    { id: 'today-2', title: 'CTO offer — what\'s actually slowing me', preview: 'twenty-one days. it\'s not the equity split.', when: 'Today · 11:08 AM', bucket: 'work', state: 'weighing', tint: '#6B5BC8', hasDecision: true },
    { id: 'yest-1', title: 'Mom called. Didn\'t pick up.', preview: 'i let it ring. then i felt guilty for ten minutes and then i forgot.', when: 'Yesterday · 9:14 PM', bucket: 'family', state: 'heavy', tint: '#7B6BA8' },
    { id: 'yest-2', title: 'Investor reply — read 6×', preview: 'i wrote three drafts and sent none.', when: 'Yesterday · 4:30 PM', bucket: 'work', state: 'avoidant', tint: '#A89BB3', hasDecision: true },
    { id: 'wk-1', title: 'The thing about Karim', preview: 'i don\'t want to say it out loud yet.', when: 'Mon · 8:11 AM', bucket: 'self', state: 'guarded', tint: '#8B8898' },
    { id: 'wk-2', title: 'Why I keep saying yes', preview: 'every time i say yes i feel a little smaller.', when: 'Sun · 10:02 PM', bucket: 'self', state: 'reflective', tint: '#947DED' },
    { id: 'wk-3', title: 'Pricing page rewrite', preview: 'is it pricing or is it conviction?', when: 'Sat · 2:20 PM', bucket: 'work', state: 'clear', tint: '#C0ACFF' },
    { id: 'old-1', title: 'Sleep is gone again', preview: 'three nights. up at 4. heart loud.', when: 'Apr 24', bucket: 'self', state: 'heavy', tint: '#7B6BA8' },
    { id: 'old-2', title: 'Dad\'s birthday — what to write', preview: 'i don\'t know what to say to him this year.', when: 'Apr 22', bucket: 'family', state: 'tender', tint: '#C0ACFF' },
    { id: 'old-3', title: 'Naming the company', preview: 'tammy keeps coming back. i don\'t know why.', when: 'Apr 18', bucket: 'work', state: 'in-flow', tint: '#947DED' },
    { id: 'old-4', title: 'Why I left the agency', preview: 'i told everyone it was the money. it wasn\'t.', when: 'Apr 12', bucket: 'self', state: 'naming', tint: '#6B5BC8' },
  ],
};
