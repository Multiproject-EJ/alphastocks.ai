/* PWA — Punchcard Board (Demo + Supabase ready) */

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

/* ---------------------------------
   1) DEMO UNIVERSE (20 stocks)
   q,v,m,risk are 0..100 scaled
---------------------------------- */
let universe = [
  { id:'AAPL',  name:'Apple Inc.',         ticker:'AAPL',  q:84, v:42, m:71, risk:28, mcap:'$3.7T', cagr:'9.4%',  gm:'45%', debt:'0.9x' },
  { id:'MSFT',  name:'Microsoft',          ticker:'MSFT',  q:88, v:35, m:68, risk:25, mcap:'$3.4T', cagr:'12.1%', gm:'69%', debt:'1.2x' },
  { id:'NVDA',  name:'NVIDIA',             ticker:'NVDA',  q:86, v:22, m:92, risk:41, mcap:'$2.7T', cagr:'35.8%', gm:'74%', debt:'0.5x' },
  { id:'AMZN',  name:'Amazon',             ticker:'AMZN',  q:74, v:47, m:72, risk:36, mcap:'$1.9T', cagr:'11.2%', gm:'47%', debt:'1.7x' },
  { id:'GOOGL', name:'Alphabet',           ticker:'GOOGL', q:79, v:51, m:60, risk:27, mcap:'$2.1T', cagr:'10.3%', gm:'56%', debt:'0.2x' },
  { id:'META',  name:'Meta',               ticker:'META',  q:72, v:66, m:77, risk:33, mcap:'$1.2T', cagr:'13.9%', gm:'82%', debt:'0.3x' },
  { id:'TSLA',  name:'Tesla',              ticker:'TSLA',  q:61, v:38, m:58, risk:52, mcap:'$0.8T', cagr:'28.4%', gm:'18%', debt:'1.5x' },
  { id:'BKR',   name:'Baker Hughes',       ticker:'BKR',   q:55, v:72, m:49, risk:42, mcap:'$30B',  cagr:'8.2%',  gm:'22%', debt:'2.1x' },
  { id:'ASML',  name:'ASML',               ticker:'ASML',  q:90, v:28, m:64, risk:29, mcap:'$410B', cagr:'15.6%', gm:'51%', debt:'0.8x' },
  { id:'SHOP',  name:'Shopify',            ticker:'SHOP',  q:68, v:31, m:63, risk:47, mcap:'$100B', cagr:'21.3%', gm:'51%', debt:'0.4x' },
  { id:'ADBE',  name:'Adobe',              ticker:'ADBE',  q:80, v:44, m:55, risk:30, mcap:'$250B', cagr:'11.8%', gm:'88%', debt:'0.7x' },
  { id:'V',     name:'Visa',               ticker:'V',     q:83, v:48, m:57, risk:22, mcap:'$520B', cagr:'10.1%', gm:'97%', debt:'0.6x' },
  { id:'MA',    name:'Mastercard',         ticker:'MA',    q:82, v:46, m:59, risk:24, mcap:'$480B', cagr:'10.6%', gm:'78%', debt:'0.7x' },
  { id:'NFLX',  name:'Netflix',            ticker:'NFLX',  q:66, v:39, m:73, risk:40, mcap:'$260B', cagr:'14.2%', gm:'43%', debt:'1.1x' },
  { id:'INTC',  name:'Intel',              ticker:'INTC',  q:58, v:70, m:41, risk:45, mcap:'$180B', cagr:'2.1%',  gm:'40%', debt:'1.6x' },
  { id:'ORCL',  name:'Oracle',             ticker:'ORCL',  q:71, v:55, m:54, risk:29, mcap:'$350B', cagr:'8.7%',  gm:'79%', debt:'2.5x' },
  { id:'SAP',   name:'SAP',                ticker:'SAP',   q:77, v:52, m:50, risk:27, mcap:'$220B', cagr:'7.9%',  gm:'70%', debt:'0.9x' },
  { id:'JNJ',   name:'Johnson & Johnson',  ticker:'JNJ',   q:75, v:68, m:40, risk:18, mcap:'$380B', cagr:'4.2%',  gm:'68%', debt:'0.5x' },
  { id:'XOM',   name:'Exxon Mobil',        ticker:'XOM',   q:62, v:74, m:46, risk:34, mcap:'$500B', cagr:'6.0%',  gm:'35%', debt:'0.8x' },
  { id:'KO',    name:'Coca-Cola',          ticker:'KO',    q:70, v:65, m:37, risk:20, mcap:'$270B', cagr:'5.5%',  gm:'60%', debt:'2.0x' }
];

/* ---------------------------------
   2) INITIAL DEMO BOARD (pre-placed)
---------------------------------- */
const demoBoard = {
  up:    ['MSFT','ASML','AAPL'],         // “Quality”
  right: ['NVDA','NFLX'],                // “Momentum-ish”
  down:  ['AMZN','GOOGL','META'],        // Growth/mega mix
  left:  ['BKR','INTC','XOM','KO']       // “Value-ish”
};

function computeInitialStack(){
  const placed = new Set([...demoBoard.up, ...demoBoard.right, ...demoBoard.down, ...demoBoard.left]);
  const remaining = universe.filter(s => !placed.has(s.id)).map(s => s.id);
  return shuffle(remaining);
}

/* ---------------------------------
   3) STATE (localStorage)
---------------------------------- */
const defaultState = () => ({
  stack: computeInitialStack(),
  board: JSON.parse(JSON.stringify(demoBoard))
});

let state = loadState() || defaultState();
let current = null;

/* ---------------------------------
   4) DOM
---------------------------------- */
const streets = {
  up: $('.street-top'),
  right: $('.street-right'),
  down: $('.street-bottom'),
  left: $('.street-left')
};

const stackCount = $('#stackCount');
const currentCard = $('#currentCard');
const cardTitle = $('#cardTitle');
const cardTicker = $('#cardTicker');
const cardQuality = $('#cardQuality');
const cardValue = $('#cardValue');
const cardMomentum = $('#cardMomentum');
const cardRisk = $('#cardRisk');

const statMcap = $('#statMcap');
const statCagr = $('#statCagr');
const statGM   = $('#statGM');
const statDebt = $('#statDebt');

const btnPick = $('#btnPick');
const btnFlip = $('#btnFlip');

const universeCanvas = $('#universeCanvas');
const ctx = universeCanvas.getContext('2d');

const dataBadge = $('#dataBadge');

const PLACEHOLDER_PATTERNS = [
  'YOUR-PROJECT',
  'YOUR-ANON-KEY',
  'YOUR-',
  'XXX.supabase.co',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'changeme',
  '...'
];

function isPlaceholderValue(value){
  if(typeof value !== 'string') return false;
  const trimmed = value.trim();
  if(!trimmed) return true;
  const lower = trimmed.toLowerCase();
  return PLACEHOLDER_PATTERNS.some(pattern => lower.includes(pattern.toLowerCase()));
}

/* ---------------------------------
   5) STORAGE HELPERS
---------------------------------- */
function saveState(){ localStorage.setItem('punchcard_state_v2', JSON.stringify(state)); }
function loadState(){ try{ return JSON.parse(localStorage.getItem('punchcard_state_v2')); } catch(e){ return null; } }
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function getById(id){ return universe.find(x => x.id === id); }

/* ---------------------------------
   6) UNIVERSE SCATTER
---------------------------------- */
function drawUniverse(){
  const dpr = window.devicePixelRatio || 1;
  const w = universeCanvas.clientWidth;
  const h = universeCanvas.clientHeight;
  universeCanvas.width = Math.floor(w * dpr);
  universeCanvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  drawGrid(w,h);
  drawAxes(w,h);

  universe.forEach(stock => {
    const x = lerp(stock.v, 0,100, 20, w-20);       // X: Value -> Momentum
    const y = lerp(100-stock.q, 0,100, 20, h-20);   // Y: higher quality at top
    const color = pickColor(stock);
    ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2);
    ctx.fillStyle = colorToShadow(color, .22); ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,4.5,0,Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
    stock._pos = {x,y};
  });
}
function drawGrid(w,h){
  ctx.strokeStyle = 'rgba(255,255,255,.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w/2, 10); ctx.lineTo(w/2, h-10);
  ctx.moveTo(10, h/2); ctx.lineTo(w-10, h/2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  for(let i=1;i<5;i++){
    const gx = (w/10)*i*2; const gy = (h/10)*i*2;
    ctx.beginPath(); ctx.moveTo(gx, 10); ctx.lineTo(gx, h-10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, gy); ctx.lineTo(w-10, gy); ctx.stroke();
  }
}
function drawAxes(w,h){
  ctx.strokeStyle = 'rgba(255,255,255,.08)';
  for(let i=0;i<=10;i++){
    const x = lerp(i,0,10, 20, w-20);
    const y = lerp(i,0,10, 20, h-20);
    ctx.beginPath(); ctx.moveTo(x, h/2 - 6); ctx.lineTo(x, h/2 + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w/2 - 6, y); ctx.lineTo(w/2 + 6, y); ctx.stroke();
  }
}
function pickColor(s){
  if (s.q >= 70 && s.m >= 60) return '#65ff9c';
  if (s.m >= 75) return '#2ad1ff';
  if (s.v >= 70) return '#ffd166';
  if (s.q < 50 && s.risk >= 45) return '#ff5c7a';
  return '#9dc2ff';
}
function colorToShadow(hex, alpha=.25){
  const c = hex.replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function lerp(v, a,b, x,y){ return x + ( (v - a) * (y - x) / (b - a) ); }

universeCanvas.addEventListener('click', (e)=>{
  const rect = universeCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  let nearest = null, dist2 = 9999;
  universe.forEach(s=>{
    if(!s._pos) return;
    const dx = s._pos.x - x;
    const dy = s._pos.y - y;
    const d2 = dx*dx + dy*dy;
    if(d2 < dist2 && d2 < 16*16) { nearest = s; dist2 = d2; }
  });
  if(nearest){ previewCard(nearest.id); }
});

/* ---------------------------------
   7) CARD PREVIEW / STACK
---------------------------------- */
function updateStackCount(){ stackCount.textContent = state.stack.length; }
function previewCard(id){
  current = id;
  const s = getById(id);
  currentCard.classList.remove('flipped');
  cardTitle.textContent = s.name;
  cardTicker.textContent = s.ticker;
  cardQuality.textContent = s.q;
  cardValue.textContent = s.v;
  cardMomentum.textContent = s.m;
  cardRisk.textContent = s.risk;
  statMcap.textContent = s.mcap;
  statCagr.textContent = s.cagr;
  statGM.textContent   = s.gm;
  statDebt.textContent = s.debt;
}
btnFlip.addEventListener('click', ()=> currentCard.classList.toggle('flipped'));
btnPick.addEventListener('click', ()=>{
  if(state.stack.length === 0){
    state.stack = shuffle(universe.map(x => x.id).filter(id=>!isOnBoard(id)));
  }
  const id = state.stack.shift();
  saveState(); updateStackCount(); previewCard(id);
});

/* ---------------------------------
   8) INVEST / RENDER BOARD
---------------------------------- */
$$('.btn.side').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    const side = btn.getAttribute('data-target');
    if(!current) return;
    state.board[side].push(current);
    saveState(); renderBoard();
    await persistBoardIfSupabase();
    if(state.stack.length>0){ btnPick.click(); }
  });
});

function isOnBoard(id){
  return ['up','right','down','left'].some(side=> state.board[side].includes(id));
}
function renderBoard(){
  Object.values(streets).forEach(el=> el.innerHTML = '');
  ['up','right','down','left'].forEach(side=>{
    state.board[side].forEach(id=>{
      const s = getById(id);
      const t = document.createElement('button');
      t.className = 'tile';
      t.setAttribute('data-id', id);
      t.setAttribute('aria-label', `${s.ticker} card`);
      t.innerHTML = `<div class="badge">${s.ticker}</div>${s.name}`;
      t.addEventListener('click', ()=> openModal(id, side));
      streets[side].appendChild(t);
    });
  });
  updateStackCount();
}

/* ---------------------------------
   9) MODAL (placed card)
---------------------------------- */
const modal = $('#cardModal');
const modalClose = $('#modalClose');
const modalClose2 = $('#modalClose2');
const modalFlip = $('#modalFlip');
const modalRemove = $('#modalRemove');
const modalTitle = $('#modalTitle');
const modalTicker = $('#modalTicker');
const mQuality = $('#mQuality');
const mValue = $('#mValue');
const mMomentum = $('#mMomentum');
const mRisk = $('#mRisk');
const mMcap = $('#mMcap');
const mCagr = $('#mCagr');
const mGM = $('#mGM');
const mDebt = $('#mDebt');
const modalFlipInner = $('#modalFlipInner');

let modalCtx = { id:null, side:null };

function openModal(id, side){
  const s = getById(id);
  modalCtx = { id, side };
  modalTitle.textContent = s.name;
  modalTicker.textContent = s.ticker;
  mQuality.textContent = s.q;
  mValue.textContent = s.v;
  mMomentum.textContent = s.m;
  mRisk.textContent = s.risk;
  mMcap.textContent = s.mcap;
  mCagr.textContent = s.cagr;
  mGM.textContent = s.gm;
  mDebt.textContent = s.debt;
  modalFlipInner.style.transform = 'rotateY(0deg)';
  modal.showModal();
}
[modalClose, modalClose2].forEach(b=> b.addEventListener('click', ()=> modal.close()));
modalFlip.addEventListener('click', ()=>{
  const flipped = modalFlipInner.style.transform.includes('180deg');
  modalFlipInner.style.transform = flipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
});
modalRemove.addEventListener('click', async ()=>{
  const { id, side } = modalCtx;
  state.board[side] = state.board[side].filter(x => x !== id);
  saveState(); renderBoard(); modal.close();
  await persistBoardIfSupabase();
});

/* ---------------------------------
   10) PWA INSTALL
---------------------------------- */
let deferredPrompt = null;
const btnInstall = $('#btnInstall');
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault(); deferredPrompt = e; btnInstall.style.display = '';
});
btnInstall.addEventListener('click', async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null; btnInstall.style.display = 'none';
});
window.addEventListener('appinstalled', ()=> { btnInstall.style.display = 'none'; });

/* ---------------------------------
   11) SUPABASE (optional)
---------------------------------- */
let supa = null;
async function initSupabaseIfEnabled(){
  const cfg = window.PUNCHCARD_CONFIG || {};
  const configured = !!cfg.useSupabase && cfg.supabaseUrl && cfg.supabaseAnonKey &&
    !isPlaceholderValue(cfg.supabaseUrl) && !isPlaceholderValue(cfg.supabaseAnonKey);
  if(cfg.useSupabase && !configured){
    dataBadge.textContent = 'Supabase*';
    console.warn('Supabase is enabled but missing valid URL or anon key. Falling back to demo data.');
    return false;
  }
  dataBadge.textContent = configured ? 'Supabase' : 'Demo';
  if(!configured) return false;

  // Use anon key + RLS (safe for public read/write we set with policies)
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  supa = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: false } });

  // 1) Load universe
  const { data: rows, error } = await supa.from('punchcard_stocks').select('*');
  if(!error && rows && rows.length){
    universe = rows.map(r => ({
      id: r.id, name: r.name, ticker: r.ticker,
      q: r.quality, v: r.value, m: r.momentum, risk: r.risk,
      mcap: r.mcap, cagr: r.cagr, gm: r.gm, debt: r.debt
    }));
  }

  // 2) Load or init a board per device (anonymous)
  const localBoardId = localStorage.getItem('punchcard_board_id');
  let boardId = localBoardId;

  if(boardId){
    const { data: tiles } = await supa
      .from('punchcard_tiles')
      .select('*')
      .eq('board_id', boardId)
      .order('position');
    if(tiles && tiles.length){
      state.board = { up:[], right:[], down:[], left:[] };
      tiles.forEach(t => state.board[t.side].push(t.stock_id));
      state.stack = shuffle(universe.map(s=>s.id).filter(id => !isOnBoard(id)));
      saveState();
    }
  }
  if(!boardId){
    const { data: b } = await supa.from('punchcard_boards').insert({ title: 'Local Device Board' }).select().single();
    if(b){ boardId = b.id; localStorage.setItem('punchcard_board_id', boardId); }
    await writeTilesToSupabase(boardId, state.board);
  }

  return true;
}

async function writeTilesToSupabase(boardId, board){
  if(!supa) return;
  await supa.from('punchcard_tiles').delete().eq('board_id', boardId);
  const rows = [];
  ['up','right','down','left'].forEach(side=>{
    board[side].forEach((stock_id, idx)=>{
      rows.push({ board_id: boardId, side, position: idx, stock_id });
    });
  });
  if(rows.length){ await supa.from('punchcard_tiles').insert(rows); }
}

async function persistBoardIfSupabase(){
  const cfg = window.PUNCHCARD_CONFIG || {};
  if(!cfg.useSupabase || !supa) return;
  const boardId = localStorage.getItem('punchcard_board_id');
  if(!boardId) return;
  await writeTilesToSupabase(boardId, state.board);
}

/* ---------------------------------
   12) BOOTSTRAP
---------------------------------- */
function init(){
  renderBoard();
  drawUniverse();
  if(!current){
    const next = state.stack[0] || universe[0]?.id;
    if(next) previewCard(next);
  }
}
window.addEventListener('resize', drawUniverse);

(async function main(){
  const supaEnabled = await initSupabaseIfEnabled();
  if(supaEnabled){
    renderBoard();
    drawUniverse();
  }
  init();
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
