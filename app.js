(function(){
  var UM=window.UM||{};
  // otvorené / zatvorené podľa bratislavského času
  try{
    var el=document.getElementById('open');
    var p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Bratislava',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    var o={};p.forEach(function(x){o[x.type]=x.value});
    var d={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday];
    var now=parseInt(o.hour,10)%24*60+parseInt(o.minute,10);
    var h=UM.hodiny[d],m=function(s){var a=s.split(':');return a[0]*60+ +a[1]};
    if(now>=m(h[0])&&now<m(h[1])){el.textContent='Dnes máme otvorené do '+h[1]}
    else{var n=now<m(h[0])?h:UM.hodiny[(d+1)%7];el.textContent='Teraz máme zatvorené, otvárame o '+n[0];el.classList.add('closed')}
    el.hidden=false;
  }catch(e){}
  // mobilná navigácia
  var t=document.querySelector('.nav-toggle'),nav=document.getElementById('nav');
  if(t){t.addEventListener('click',function(){var on=nav.classList.toggle('open-nav');t.setAttribute('aria-expanded',on)});
    nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open-nav');t.setAttribute('aria-expanded','false')}});}
  // rezervácia → pripravený e-mail
  var f=document.getElementById('res'),note=document.getElementById('res-note');
  if(f){var di=f.elements.datum;try{di.min=new Date().toISOString().slice(0,10)}catch(e){}
    f.addEventListener('submit',function(e){e.preventDefault();
      var v=function(n){return f.elements[n].value.trim()};
      if(!v('meno')||!v('tel')||!v('datum')||!v('cas')||!v('osoby')){note.textContent='Vyplňte meno, telefón, dátum, čas a počet osôb.';note.classList.add('err');return}
      note.classList.remove('err');
      var dt=v('datum').split('-').reverse().join('. ');
      var body='Dobrý deň,\n\nprosím o rezerváciu stola.\n\nMeno: '+v('meno')+'\nTelefón: '+v('tel')+'\nDátum: '+dt+'\nČas: '+v('cas')+'\nPočet osôb: '+v('osoby')+(v('pozn')?'\nPoznámka: '+v('pozn'):'')+'\n\nĎakujem.';
      location.href='mailto:'+UM.email+'?subject='+encodeURIComponent('Rezervácia '+dt+' o '+v('cas')+', '+v('osoby')+' os.')+'&body='+encodeURIComponent(body);
      note.textContent='Otvorili sme vám e-mail s rezerváciou. Stačí ho odoslať a počkať na naše potvrdenie.';
    });}

  // ---- cookies: súhlas ----
  var KEY='um-consent',bar=document.getElementById('cookie');
  function read(){try{var c=JSON.parse(localStorage.getItem(KEY));if(c&&Date.now()-c.t<365*864e5)return c}catch(e){}return null}
  function load(src){var s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s)}
  function apply(c){
    if(c.a&&UM.ga4&&!window.__ga){window.__ga=1;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',UM.ga4,{anonymize_ip:true});load('https://www.googletagmanager.com/gtag/js?id='+UM.ga4)}
    if(c.m&&UM.metaPixel&&!window.fbq){var n=window.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};n.queue=[];n.loaded=true;n.version='2.0';load('https://connect.facebook.net/en_US/fbevents.js');fbq('init',UM.metaPixel);fbq('track','PageView')}
  }
  function save(a,m){var c={a:!!a,m:!!m,t:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(c))}catch(e){}bar.hidden=true;apply(c)}
  if(bar){
    var opts=document.getElementById('cookie-opts'),ca=document.getElementById('ck-a'),cm=document.getElementById('ck-m');
    var c=read();if(c){apply(c)}else{bar.hidden=false}
    bar.addEventListener('click',function(e){var k=e.target.getAttribute&&e.target.getAttribute('data-ck');if(!k)return;
      if(k==='all')save(1,1);else if(k==='none')save(0,0);else if(k==='save')save(ca.checked,cm.checked);
      else if(k==='set'){opts.hidden=false;bar.querySelector('[data-ck=save]').hidden=false;e.target.hidden=true}});
    document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[data-cookie-settings]')){var c=read()||{};ca.checked=!!c.a;cm.checked=!!c.m;opts.hidden=false;bar.querySelector('[data-ck=save]').hidden=false;bar.querySelector('[data-ck=set]').hidden=true;bar.hidden=false}});
  }
  // ---- denné menu: aktuálny týždeň a deň ----
  var dm=document.getElementById('dm');
  if(dm){try{
    var now=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Bratislava'}));
    var t=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()));var dn=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-dn);
    var wk=Math.ceil(((t-Date.UTC(t.getUTCFullYear(),0,1))/864e5+1)/7);
    var weeks=dm.querySelectorAll('.dm-week'),cur=wk%weeks.length,el=weeks[cur];
    weeks.forEach(function(w,i){if(i!==cur)w.classList.add('is-other')});
    el.querySelector('h2').textContent='Tento týždeň';dm.insertBefore(el,dm.firstChild);
    var rest=dm.querySelectorAll('.dm-week.is-other');rest.forEach(function(w,i){w.querySelector('h2').textContent=i===0?'Budúci týždeň':'O '+(i+1)+' týždne'});
    var day=now.getDay();if(day>=1&&day<=5){el.querySelectorAll('.dm-row:not(.dm-head)')[day-1].classList.add('is-today');var n=document.getElementById('dm-now');n.textContent='Dnes je '+['','pondelok','utorok','streda','štvrtok','piatok'][day];n.hidden=false}
  }catch(e){}}
  var r=document.getElementById('rok');if(r)r.textContent=new Date().getFullYear();
})();
