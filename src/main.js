import './style.css';
import { TILES } from './tiles.js';
const N=9;
const LV=[
{n:'Addis Ababa',m:20,g:{s:600}},{n:'Lalibela',m:20,g:{id:'amhara',c:12}},{n:'Axum',m:20,g:{id:'tigray',c:14}},
{n:'Simien Mountains',m:22,g:{s:1200}},{n:'Harar',m:22,g:{id:'harari',c:15}},{n:'Danakil',m:22,g:{id:'afar',c:16}},
{n:'Bale Mountains',m:24,g:{id:'oromia',c:18}},{n:'Hawassa',m:24,g:{id:'sidama',c:18}},{n:'Omo Valley',m:25,g:{id:'south',c:20}},
{n:'Kaffa Forest',m:25,g:{id:'southwest',c:20}},{n:'Dire Dawa',m:26,g:{id:'diredawa',c:22}},{n:'Blue Nile',m:28,g:{s:3000}}];
const FACT={afar:['Semera','The Danakil Depression is one of the hottest places on Earth.'],amhara:['Bahir Dar','Lake Tana is the source of the Blue Nile; Lalibela and Gondar are here.'],
benishangul:['Asosa','The Grand Ethiopian Renaissance Dam stands on the Blue Nile in this region.'],central:['Hosaena','Formed in 2023; enset, the false banana, is a staple crop.'],
gambela:['Gambela','The lowest-lying region, along the Baro River.'],harari:['Harar','Its walled city, Jugol, is a UNESCO World Heritage site.'],
oromia:['Finfinne (Addis Ababa)','The largest region by area and population; home of the Bale Mountains.'],sidama:['Hawassa','Celebrates Fichee-Chambalaalla, the Sidama New Year.'],
somali:['Jigjiga','The second-largest region by area.'],south:['Wolaita Sodo','Includes Arba Minch and the cultures of the Lower Omo Valley.'],
southwest:['Bonga','Kaffa forests are the birthplace of wild Arabica coffee.'],tigray:['Mekelle','Axum, with its ancient obelisks, is here.'],
diredawa:['Dire Dawa','Grew from 1902 as a railway town on the Djibouti line.'],addis:['Addis Ababa','Its name means New Flower; seat of the African Union.']};
(function(){const s=document.createElement('style');s.textContent=TILES.map((t,i)=>'.t'+i+'{background-image:url('+t.img+')}').join('');document.head.appendChild(s)})();
const IDX={},BY={};TILES.forEach((t,i)=>{IDX[t.id]=i;BY[t.id]=t});
let save={stars:[],seen:{}};try{Object.assign(save,JSON.parse(localStorage.getItem('eth1')||'{}'))}catch(e){}
const persist=()=>{try{localStorage.setItem('eth1',JSON.stringify(save))}catch(e){}};
let g=[],sel=null,score=0,moves=0,got=0,lv=0,busy=false,over=true,muted=false,act=Date.now(),hinted=false;
const $=id=>document.getElementById(id),grid=$('grid');
const rnd=()=>({...TILES[Math.floor(Math.random()*TILES.length)]});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
/* sound */
let ac=null;
function A(){if(muted)return null;if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(ac.state==='suspended')ac.resume();return ac}
function tone(f,t0,dur,type,vol,slide){const a=A();if(!a)return;const t=a.currentTime+t0,o=a.createOscillator(),gn=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(vol||.15,t+.012);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+dur+.02)}
const SC=[0,2,4,7,9,12,14,16],hz=s=>523.25*Math.pow(2,s/12);
const sfx={tick(){tone(740,0,.08,'triangle',.12)},swap(){tone(280,0,.12,'triangle',.14,620)},soft(){tone(220,0,.18,'sine',.14,140)},
match(l,c){const n=Math.min(2+Math.floor(c/2),6),sh=(l-1)*2;for(let i=0;i<n;i++){tone(hz(SC[i]+sh),i*.05,.26,'triangle',.16);tone(hz(SC[i]+sh+12),i*.05,.2,'sine',.05)}},
bonus(){[0,4,7,12,16].forEach((s,i)=>tone(hz(s+12),i*.05,.25,'sine',.12))},special(){tone(120,0,.45,'sawtooth',.12,900);tone(hz(19),.1,.4,'sine',.12)},
win(){[0,4,7,12,16,19].forEach((s,i)=>tone(hz(s),i*.1,.5,'triangle',.16))},lose(){[7,4,0,-5].forEach((s,i)=>tone(hz(s),i*.22,.45,'triangle',.16))}};
function toggleMute(){muted=!muted;$('mute').textContent=muted?'🔇':'🔊'}
/* confetti */
const cv=$('fx'),cx=cv.getContext('2d');let P=[],raf=0,last=0;
function size(){const d=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*d;cv.height=innerHeight*d;cx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',size);size();
const COL=['#078930','#fcdd09','#da121a','#0f47af','#ffffff'],pc=()=>COL[Math.floor(Math.random()*5)];
const add=p=>{if(P.length<260)P.push(p)};
function burst(x,y,n,pow){pow=pow||1;for(let i=0;i<n;i++){const a=Math.random()*6.28,s=(120+Math.random()*300)*pow;add({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-180*pow,r:Math.random()*6.28,vr:(Math.random()-.5)*14,w:5+Math.random()*5,h:3+Math.random()*4,c:pc(),life:1.1+Math.random()*.5})}start()}
function rain(n){for(let i=0;i<n;i++)add({x:Math.random()*innerWidth,y:-20-Math.random()*200,vx:(Math.random()-.5)*120,vy:120+Math.random()*160,r:Math.random()*6.28,vr:(Math.random()-.5)*10,w:6+Math.random()*6,h:4+Math.random()*5,c:pc(),life:2.2+Math.random()*.6});start()}
function start(){if(!raf){last=performance.now();raf=requestAnimationFrame(loop)}}
function loop(now){const dt=Math.min((now-last)/1000,.05);last=now;cx.clearRect(0,0,innerWidth,innerHeight);P=P.filter(p=>p.life>0&&p.y<innerHeight+30);
for(const p of P){p.vy+=620*dt;p.vx*=1-1.2*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.life-=dt;cx.globalAlpha=Math.min(1,p.life*2);cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore()}
cx.globalAlpha=1;if(P.length)raf=requestAnimationFrame(loop);else{raf=0;cx.clearRect(0,0,innerWidth,innerHeight)}}
/* ui helpers */
function floatText(t,x,y,col){const d=document.createElement('div');d.className='fl';d.textContent=t;d.style.left=x+'px';d.style.top=y+'px';if(col)d.style.color=col;document.body.appendChild(d);setTimeout(()=>d.remove(),1000)}
function toast(main,sub,small){const e=$('toast');const L=Array.isArray(main)?main:String(main).split('\n');
e.innerHTML=L.map(s=>'<div class="nm'+(small?' small':s.length>12?' long':'')+'">'+s+'</div>').join('')+(sub?'<div class="cb">'+sub+'</div>':'');
e.classList.remove('show');void e.offsetWidth;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1200)}
function bump(id){const e=$(id);e.classList.add('bump');setTimeout(()=>e.classList.remove('bump'),220)}
const goalOf=()=>LV[lv].g;
function upd(){$('score').textContent=score;$('moves').textContent=moves;$('mbox').classList.toggle('low',moves<=5);
const G=goalOf();$('goal').innerHTML=G.id?'<i class="mini t'+IDX[G.id]+'"></i>'+Math.min(got,G.c)+'/'+G.c:Math.min(score,G.s)+'/'+G.s}
const el=(r,c)=>grid.children[r*N+c];
/* board */
function make(){g=[];for(let r=0;r<N;r++){g[r]=[];for(let c=0;c<N;c++){let t;do{t=rnd()}while((c>1&&g[r][c-1].id==t.id&&g[r][c-2].id==t.id)||(r>1&&g[r-1][c].id==t.id&&g[r-2][c].id==t.id));g[r][c]=t}}}
function render(fall){grid.innerHTML='';for(let r=0;r<N;r++)for(let c=0;c<N;c++){const t=g[r][c],d=document.createElement('div');d.className='tile t'+IDX[t.id]+(t.sp?' sp-'+t.sp:'');if(fall&&fall[r][c]){d.classList.add('drop');d.style.setProperty('--f',fall[r][c]);d.style.animationDelay=(c*.008+(N-1-r)*.012).toFixed(3)+'s'}d.setAttribute('aria-label',t.name);d.onclick=()=>click(r,c);grid.appendChild(d)}}
const swapData=(a,b,c,d)=>{[g[a][b],g[c][d]]=[g[c][d],g[a][b]]};
function find(){const m=Array.from({length:N},()=>Array(N).fill(false)),names=new Set(),runs=[];
const run=(cells,id,nm)=>{if(cells.length>=3){runs.push({cells,id});names.add(nm);cells.forEach(([r,c])=>m[r][c]=true)}};
for(let r=0;r<N;r++){let s=0;for(let c=1;c<=N;c++){if(c<N&&g[r][c].id==g[r][s].id)continue;run(Array.from({length:c-s},(_,k)=>[r,s+k]),g[r][s].id,g[r][s].name);s=c}}
for(let c=0;c<N;c++){let s=0;for(let r=1;r<=N;r++){if(r<N&&g[r][c].id==g[s][c].id)continue;run(Array.from({length:r-s},(_,k)=>[s+k,c]),g[s][c].id,g[s][c].name);s=r}}
return{m,names:[...names],runs}}
function findMove(){for(let r=0;r<N;r++)for(let c=0;c<N;c++)for(const[dr,dc]of[[0,1],[1,0]]){const r2=r+dr,c2=c+dc;if(r2>=N||c2>=N)continue;swapData(r,c,r2,c2);const ok=find().runs.length>0;swapData(r,c,r2,c2);if(ok)return[[r,c],[r2,c2]]}return null}
function expand(m){let ch=true,fired=0;while(ch){ch=false;for(let r=0;r<N;r++)for(let c=0;c<N;c++){const t=g[r][c];if(m[r][c]&&t.sp&&!t.done){t.done=1;ch=true;fired++;
if(t.sp=='cross')for(let k=0;k<N;k++){m[r][k]=true;m[k][c]=true}else for(let a=0;a<N;a++)for(let b=0;b<N;b++)if(g[a][b].id==t.id)m[a][b]=true}}}return fired}
/* play */
async function click(r,c){if(busy||over)return;A();act=Date.now();hinted=false;
if(!sel){sel={r,c};el(r,c).classList.add('sel');sfx.tick();return}
const{r:a,c:b}=sel;el(a,b).classList.remove('sel');
if(a==r&&b==c){sel=null;return}
if(Math.abs(a-r)+Math.abs(b-c)!=1){sel={r,c};el(r,c).classList.add('sel');sfx.tick();return}
sel=null;await doSwap(a,b,r,c)}
async function doSwap(a,b,r,c){busy=true;moves--;upd();bump('mbox');sfx.swap();
const e1=el(a,b),e2=el(r,c),r1=e1.getBoundingClientRect(),r2=e2.getBoundingClientRect();
e1.style.zIndex=8;e1.style.animation='none';e2.style.animation='none';e1.style.transition=e2.style.transition='transform .12s ease-in-out';
e1.style.transform='translate('+(r2.left-r1.left)+'px,'+(r2.top-r1.top)+'px)';e2.style.transform='translate('+(r1.left-r2.left)+'px,'+(r1.top-r2.top)+'px)';
await sleep(125);swapData(a,b,r,c);render();
if(find().runs.length)await cascade([[a,b],[r,c]]);else{sfx.soft();toast('Set-up move','',true)}
act=Date.now();hinted=false;
if(goalMet())finish(true);else if(moves<=0)finish(false);
busy=false}
const goalMet=()=>{const G=goalOf();return G.id?got>=G.c:score>=G.s};
async function cascade(pos){let level=0;
while(true){const f=find();if(!f.runs.length)break;level++;
const mk=[];for(const run of f.runs)if(run.cells.length>=4){const hit=run.cells.find(([r,c])=>pos&&pos.some(p=>p[0]==r&&p[1]==c))||run.cells[run.cells.length>>1];mk.push({r:hit[0],c:hit[1],sp:run.cells.length>=5?'star':'cross'})}
pos=null;const fired=expand(f.m);
for(const k of mk)f.m[k.r][k.c]=false;
let cnt=0,sx=0,sy=0,newc=null;
for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(f.m[r][c]){const t=g[r][c];cnt++;if(G().id&&t.id==G().id)got++;if(!(t.id in save.seen)){save.seen[t.id]=0;newc=t.name}save.seen[t.id]++}
const gain=cnt*10*level;score+=gain;
sfx.match(level,cnt);vib(level>1?[30,30,60]:25);
toast(f.names,level>=2?'Combo x'+level+'!':'');
if(fired){sfx.special();vib([60,40,100])}
if(level>=2||fired){$('wrap').classList.remove('shake');void $('wrap').offsetWidth;$('wrap').classList.add('shake')}
let k2=0;for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(f.m[r][c]){const e=el(r,c);e.classList.add('m');const b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;sx+=x;sy+=y;k2++;burst(x,y,cnt>10?2:4,.8+level*.1)}
floatText('+'+gain,sx/k2,sy/k2);
if(newc)setTimeout(()=>floatText('📖 New card: '+newc,innerWidth/2,innerHeight*.2,'#7dffa8'),200);
if(cnt>=5||level>=2||fired)burst(sx/k2,sy/k2,30,1.4);
if(cnt>=8||level>=3)rain(60);
if(level>=2){moves++;setTimeout(()=>{sfx.bonus();floatText('+1 move',innerWidth/2,innerHeight*.28,'#7dffa8');bump('mbox')},250)}
upd();bump('score');await sleep(250);
for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(f.m[r][c])g[r][c]=null;
for(const k of mk){g[k.r][k.c].sp=k.sp;g[k.r][k.c].done=0}
const fall=Array.from({length:N},()=>Array(N).fill(0));
for(let c=0;c<N;c++){let w=N-1;for(let r=N-1;r>=0;r--)if(g[r][c]){if(w!=r)fall[w][c]=w-r;g[w][c]=g[r][c];w--}for(let r=w;r>=0;r--){g[r][c]=rnd();fall[r][c]=w+1}}
render(fall);await sleep(360)}
persist();upd()}
const G=goalOf;
function finish(win){over=true;let s=0;
if(win){const f=moves/LV[lv].m;s=f>=.4?3:f>=.15?2:1;save.stars[lv]=Math.max(save.stars[lv]||0,s);persist();sfx.win();vib([80,60,80,60,200]);rain(140);burst(innerWidth/2,innerHeight/2,50,1.8)}else{sfx.lose()}
$('oh').textContent=win?'Level complete':'Out of moves';$('stars').textContent=win?'★'.repeat(s)+'☆'.repeat(3-s):'';
$('fm').textContent=win?LV[lv].n+' · Score '+score:'Goal not reached. Try again.';
$('ob').innerHTML=(win&&lv<LV.length-1?'<button onclick="startLevel('+(lv+1)+')">Next level</button>':'')+'<button class="s" onclick="startLevel('+lv+')">'+(win?'Replay':'Retry')+'</button><button onclick="showMap()">Map</button>';
setTimeout(()=>$('over').classList.add('on'),win?700:300)}
function startLevel(i){lv=i;score=0;got=0;moves=LV[i].m;sel=null;busy=false;over=false;act=Date.now();hinted=false;
$('over').classList.remove('on');$('map').classList.remove('on');A();
document.body.style.setProperty('--c1','hsl('+(140+i*26)+',55%,22%)');document.body.style.setProperty('--c2','hsl('+(i*30)+',55%,20%)');
$('lvn').textContent=(i+1)+'. '+LV[i].n;make();upd();render(Array.from({length:N},()=>Array(N).fill(N)));sfx.bonus();
const G=LV[i].g;toast(LV[i].n,G.id?'Collect '+G.c+' '+BY[G.id].name:'Score '+G.s)}
/* screens */
function showMap(){$('over').classList.remove('on');$('mp').innerHTML=LV.map((l,i)=>{const open=i==0||save.stars[i-1]>0,s=save.stars[i]||0,G=l.g;
return '<button class="node'+(i%2?' r':'')+(open?'':' lock')+'" '+(open?'onclick="startLevel('+i+')"':'disabled')+'><b>'+(i+1)+'</b><span>'+l.n+'<small>'+(G.id?'Collect '+G.c+' '+BY[G.id].name:'Score '+G.s)+'</small></span><em>'+'★'.repeat(s)+'☆'.repeat(3-s)+'</em></button>'}).join('');$('map').classList.add('on')}
function showBook(){$('bk').innerHTML=TILES.map((t,i)=>{const n=save.seen[t.id],f=FACT[t.id];
return n===undefined?'<div class="card2 lk"><div class="ci">?</div><h4>Locked</h4>Match this flag to unlock.</div>':'<div class="card2"><div class="ci t'+i+'"></div><h4>'+t.name+'</h4>Capital: '+f[0]+'<br>'+f[1]+'<br><small>Matched: '+n+'</small></div>'}).join('');$('book').classList.add('on')}
const hideBook=()=>$('book').classList.remove('on');
/* idle hint */
setInterval(()=>{if(!busy&&!over&&!hinted&&Date.now()-act>6000){const m=findMove();hinted=true;if(!m)return;for(const[r,c]of m){const e=el(r,c);e.classList.add('hint');setTimeout(()=>e.classList.remove('hint'),2500)}}},1000);
make();render();showMap();

Object.assign(window, { startLevel, showMap, showBook, hideBook, toggleMute });
