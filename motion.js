/* U Motešických – interaktivita a pohyb. Knižnice: GSAP + ScrollTrigger, Lenis (uložené lokálne v /js). */
(function(){
  var d=document,root=d.documentElement,UM=window.UM||{};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
  var el=function(t,c,h){var e=d.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
  var top=$('.top'),nav=$('#nav'),lenis=null;
  function go(target,off){var o=off==null?-(top?top.offsetHeight:0)-56:off;
    if(lenis)lenis.scrollTo(target,{offset:o,duration:1.1});
    else{var y=target.getBoundingClientRect().top+window.pageYOffset+o;window.scrollTo({top:y,behavior:reduce?'auto':'smooth'})}}

  /* ============ INTERAKTIVITA ============ */

  /* 1. Obedová lišta ukáže, čo sa varí dnes */
  try{var strip=$('.lunch a');
    if(strip&&UM.dm&&UM.dm.length){
      var now=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Bratislava'}));
      var t=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())),dn=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-dn);
      var wk=Math.ceil(((t-Date.UTC(t.getUTCFullYear(),0,1))/864e5+1)/7),day=now.getDay();
      if(day>=1&&day<=5){var r=UM.dm[wk%UM.dm.length][day-1];
        var s=el('span','lunch-today');s.appendChild(el('b','','Dnes'));
        [r[1],r[2],r[3]].forEach(function(x,i){if(i)s.appendChild(el('i','','/'));s.appendChild(d.createTextNode(x))});
        strip.appendChild(s)}}
  }catch(e){}

  /* 2. Lístok: skok na kategóriu + filter alergénov */
  var listok=$('#listok'),secs=$$('.menu-sec',listok||d),dishes=$$('.dish',listok||d);
  if(listok&&secs.length){
    var tools=el('div','menu-tools'),mnav=el('div','menu-nav');mnav.setAttribute('role','navigation');mnav.setAttribute('aria-label','Časti jedálneho lístka');
    var chips=secs.map(function(sec,i){var h=$('h3',sec),name=h.firstChild.textContent.trim();sec.id=sec.id||'cast-'+(i+1);
      var b=el('button','chip');b.type='button';b.textContent=name;b.addEventListener('click',function(){go(sec)});mnav.appendChild(b);return b});
    // alergény načítané priamo z jedál
    var NAMES={1:'lepok',2:'kôrovce',3:'vajcia',4:'ryby',5:'arašidy',6:'sója',7:'mlieko',8:'orechy',9:'zeler',10:'horčica',11:'sezam',12:'siričitany'};
    var found={};dishes.forEach(function(x){var m=($('.dish-meta',x)||{}).textContent||'',a=(m.split('alergény')[1]||'').match(/\d+/g)||[];x._alg=a.map(Number);x._alg.forEach(function(n){found[n]=1})});
    var alg=el('div','alg'),off={},count=el('span','alg-count');count.setAttribute('role','status');
    alg.appendChild(el('span','alg-label','Vynechať jedlá, ktoré obsahujú:'));
    Object.keys(found).map(Number).sort(function(a,b){return a-b}).forEach(function(n){
      var b=el('button','chip');b.type='button';b.textContent=NAMES[n]||('alergén '+n);b.setAttribute('aria-pressed','false');
      b.addEventListener('click',function(){off[n]=!off[n];b.setAttribute('aria-pressed',off[n]?'true':'false');var ok=0;
        dishes.forEach(function(x){var out=x._alg.some(function(k){return off[k]});x.classList.toggle('is-out',out);if(!out)ok++});
        count.textContent=ok===dishes.length?'':'Vyhovuje '+ok+' z '+dishes.length+' jedál'});
      alg.appendChild(b)});
    alg.appendChild(count);
    var grid=$('.menu-grid',listok);tools.appendChild(alg);grid.parentNode.insertBefore(tools,grid);grid.parentNode.insertBefore(mnav,grid);
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=secs.indexOf(e.target);chips.forEach(function(c,k){if(k===i){c.setAttribute('aria-current','true');if(mnav.scrollWidth>mnav.clientWidth)mnav.scrollTo({left:c.offsetLeft-20,behavior:'smooth'})}else c.removeAttribute('aria-current')})}})},{rootMargin:'-30% 0px -60% 0px'});secs.forEach(function(s){io.observe(s)})}
    // fotka jedla nájde jedlo v lístku
    $$('.photos figure',listok).forEach(function(f){var cap=($('figcaption',f)||{}).textContent||'',key=cap.toLowerCase().slice(0,9);
      var hit=dishes.filter(function(x){return $('h4',x).textContent.toLowerCase().indexOf(key)===0})[0];if(!hit)return;
      f.setAttribute('role','button');f.tabIndex=0;f.setAttribute('aria-label',cap+' – nájsť v lístku');
      var run=function(){go(hit,-window.innerHeight*.35);setTimeout(function(){hit.classList.remove('is-flash');void hit.offsetWidth;hit.classList.add('is-flash')},reduce?0:700)};
      f.addEventListener('click',run);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();run()}})});
  }

  /* 3. Rezervácia: počítadlo osôb */
  var os=$('#res input[name=osoby]');
  if(os){var w=el('span','step'),mk=function(tx,lab,dv){var b=el('button');b.type='button';b.textContent=tx;b.setAttribute('aria-label',lab);
      b.addEventListener('click',function(e){e.preventDefault();var v=(parseInt(os.value,10)||0)+dv;os.value=Math.max(+os.min||1,Math.min(+os.max||40,v));
        if(window.gsap&&!reduce)gsap.fromTo(os,{scale:1.18},{scale:1,duration:.35,ease:'back.out(3)'})});return b};
    os.parentNode.insertBefore(w,os);w.appendChild(mk('−','O jednu osobu menej',-1));w.appendChild(os);w.appendChild(mk('+','O jednu osobu viac',1))}

  /* 4. Hlavička: schová sa pri čítaní, vráti pri scrollovaní hore; zvýrazní aktuálnu sekciu */
  if(top){var bar=el('span','progress');bar.setAttribute('aria-hidden','true');top.appendChild(bar);
    var last=0,setH=function(){root.style.setProperty('--hh',(top.classList.contains('is-hidden')?0:top.offsetHeight)+'px')};
    var onScroll=function(){var y=window.pageYOffset,max=root.scrollHeight-window.innerHeight;
      top.classList.toggle('is-scrolled',y>20);
      var open=nav&&nav.classList.contains('open-nav');
      if(!open&&y>420&&y>last+4)top.classList.add('is-hidden');else if(y<last-4||y<=420)top.classList.remove('is-hidden');
      last=y;setH();bar.style.transform='scaleX('+(max>0?Math.min(1,y/max):0)+')'};
    window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',setH);onScroll();
    top.addEventListener('focusin',function(){top.classList.remove('is-hidden');setH()});
    var links=$$('a[href^="#"]',nav||d).filter(function(a){return a.getAttribute('href').length>1});
    if(links.length&&'IntersectionObserver' in window){var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)links.forEach(function(a){if(a.getAttribute('href')==='#'+e.target.id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')})})},{rootMargin:'-45% 0px -50% 0px'});
      links.forEach(function(a){var s=d.getElementById(a.getAttribute('href').slice(1));if(s)so.observe(s)})}
  }

  /* ============ POHYB ============ */
  if(reduce||!window.gsap||!window.ScrollTrigger){root.classList.remove('motion');return}
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ease:'power3.out',duration:.8});

  // plynulý scroll (len myš a trackpad; dotyk ostáva natívny)
  if(window.Lenis){lenis=new Lenis({anchors:{offset:-70},lerp:.11});lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0);root.style.scrollBehavior='auto'}

  // rozdelenie nadpisu na slová (pevná medzera drží slová pokope)
  function split(h){if(h._w)return h._w;h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());
    (function walk(n){[].slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===3){var f=d.createDocumentFragment();c.textContent.split(/([ \n\t]+)/).forEach(function(p){if(!p)return;
          if(/^[ \n\t]+$/.test(p)){f.appendChild(d.createTextNode(' '));return}
          var o=el('span','w'),i=el('span','wi');o.setAttribute('aria-hidden','true');i.textContent=p;o.appendChild(i);f.appendChild(o)});n.replaceChild(f,c)}
      else if(c.nodeType===1)walk(c)})})(h);
    return h._w=$$('.wi',h)}

  /* úvod */
  var hero=$('.hero');
  if(hero){var h1=$('h1',hero),words=split(h1),photo=$('.hero-photo',hero),img=$('img',photo);
    var rest=$$('.hero-text>*',hero).filter(function(x){return x!==h1&&!x.hidden});
    gsap.set(words,{yPercent:115});gsap.set(rest,{autoAlpha:0,y:22});
    gsap.set(photo,{autoAlpha:0,y:50});gsap.set(img,{clipPath:'inset(100% 0% 0% 0%)',scale:1.25});
    root.classList.add('motion-ready');
    var tl=gsap.timeline({delay:.15});
    tl.to(rest[0],{autoAlpha:1,y:0,duration:.6},0)
      .to(words,{yPercent:0,duration:1,ease:'power4.out',stagger:.075},.1)
      .to(photo,{autoAlpha:1,y:0,duration:1},.15)
      .to(img,{clipPath:'inset(0% 0% 0% 0%)',duration:1.3,ease:'power4.inOut'},.3)
      .to(img,{scale:1.1,duration:2,ease:'power2.out'},.3)
      .to(rest.slice(1),{autoAlpha:1,y:0,stagger:.1,duration:.7},.75);
    if(top)tl.from(top,{yPercent:-100,duration:.7,clearProps:'transform'},0);
    // pri odchode z úvodu sa text a fotka rozídu
    gsap.to($('.hero-text',hero),{yPercent:-12,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
    gsap.fromTo(img,{yPercent:0},{yPercent:9,ease:'none',immediateRender:false,scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
  }else{root.classList.add('motion-ready')}

  /* nadpisy sekcií: slová vyjdú spoza linky */
  $$('main h2, .subpage main h1').forEach(function(h){if(h.closest('.cookie'))return;var w=split(h);gsap.set(w,{yPercent:115});
    ScrollTrigger.create({trigger:h,start:'top 86%',once:true,onEnter:function(){gsap.to(w,{yPercent:0,duration:.9,ease:'power4.out',stagger:.06})}})});

  /* bloky textu a tabuliek */
  var blocks=$$('.sec-head p,.menu-tools,.menu-nav,.allergens,.center,.tap-grid table,.drink-sec,.story-text>p,.facts li,.contact-info>*,.res,.foot-in>*,.lunch p,.subpage main .wrap>p,.subpage main .wrap>h2~*,.dm-week');
  blocks=blocks.filter(function(x){return !x.closest('.cookie')&&!x.closest('.hero')&&x.tagName!=='H2'});
  gsap.set(blocks,{autoAlpha:0,y:34});
  ScrollTrigger.batch(blocks,{start:'top 90%',once:true,onEnter:function(b){gsap.to(b,{autoAlpha:1,y:0,stagger:.08,overwrite:true,clearProps:'transform'})}});

  /* lístok: jedlá nabiehajú po jednom, linka pod nadpisom sa dokreslí */
  secs.forEach(function(sec){var h=$('h3',sec),ds=$$('.dish',sec);gsap.set(h,{autoAlpha:0,x:-18});gsap.set(ds,{autoAlpha:0,y:18});
    ScrollTrigger.create({trigger:sec,start:'top 84%',once:true,onEnter:function(){gsap.to(h,{autoAlpha:1,x:0,duration:.6});gsap.to(ds,{autoAlpha:1,y:0,duration:.6,stagger:.055,delay:.1,clearProps:'transform,opacity,visibility'})}})});

  /* fotky: odkrytie zdola a jemný parallax */
  $$('.photos .arch,.story-photo,.tap-photo,.ext').forEach(function(f,i){var im=$('img',f);if(!im)return;var inRow=f.closest('.photos');
    gsap.set(f,{clipPath:'inset(100% 0% 0% 0% round 999px 999px 0 0)'});gsap.set(im,{scale:1.18});
    if(!f.classList.contains('arch')&&!f.classList.contains('ext'))gsap.set(f,{clipPath:'inset(100% 0% 0% 0%)'});
    ScrollTrigger.create({trigger:inRow||f,start:'top 82%',once:true,onEnter:function(){
      gsap.to(f,{clipPath:f.classList.contains('arch')||f.classList.contains('ext')?'inset(0% 0% 0% 0% round 999px 999px 0 0)':'inset(0% 0% 0% 0%)',duration:1.2,ease:'power4.inOut',delay:inRow?i*.12:0,clearProps:'clipPath'})}});
    gsap.fromTo(im,{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:f,start:'top bottom',end:'bottom top',scrub:true}})});

  /* fotka pri nápojoch ostane stáť, kým okolo nej prejde pivo a víno */
  var tp=$('.tap-photo'),tg=$('.tap-grid');
  if(tp&&tg)ScrollTrigger.matchMedia({'(min-width: 901px)':function(){
    ScrollTrigger.create({trigger:tg,start:'top 100px',end:function(){return '+='+Math.max(0,tg.offsetHeight-tp.offsetHeight)},pin:tp,pinSpacing:false,invalidateOnRefresh:true})}});

  /* denné menu: riadky dnešného týždňa */
  $$('.dm-week').forEach(function(wk){var rows=$$('.dm-row',wk);gsap.set(rows,{autoAlpha:0,x:-16});
    ScrollTrigger.create({trigger:wk,start:'top 88%',once:true,onEnter:function(){gsap.to(rows,{autoAlpha:1,x:0,duration:.5,stagger:.06,clearProps:'transform'})}})});

  window.addEventListener('load',function(){ScrollTrigger.refresh()});
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){ScrollTrigger.refresh()});
})();
