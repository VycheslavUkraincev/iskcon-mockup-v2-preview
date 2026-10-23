/* ============================================================
   Аватар-вайшнав: живий помічник храму
   SVG-персонаж зі станами: idle, waving, talking, happy, sleeping
   + дерево швидких відповідей (чат)
   ============================================================ */
(function(){
"use strict";

/* ---------- Дані чату ---------- */
var QA = [
  { id:"what", q:"Що таке ІСККОН?",
    a:"ІСККОН — Міжнародне товариство свідомості Крішни, засноване 1966 року. Ми практикуємо бгакті-йогу — шлях любові та відданості Богу." },
  { id:"when", q:"Коли найближча програма?",
    a:"Недільний фестиваль: 13:30 — кіртан, 14:00 — лекція з філософії, 16:00 — вегетаріанський бенкет. У суботу з 08:00 — ранкова програма." },
  { id:"food", q:"Що таке «Їжа життя»?",
    a:"Благодійна місія: гарячі вегетаріанські обіди щосуботи о 14:00 на Соборній площі. Готуємо з 08:00 у храмі — долучайтесь як волонтер!",
    link:"food", linkText:"Детальніше про «Їжу життя» →" },
  { id:"courses", q:"Які є курси?",
    a:"Ведична філософія, ведична кулінарія та гра на традиційних інструментах (каратали, мріданг, фісгармонія). Запис за телефонами храму.",
    link:"courses", linkText:"До курсів →" },
  { id:"volunteer", q:"Як стати волонтером?",
    a:"Ми завжди раді новим волонтерам! Приходьте до храму (вул. Скальда, 40А) або напишіть нам у Telegram.",
    qr:"assets/tg-qr.png", qrText:"Скануйте щоб написати в Telegram" },
  { id:"donate", q:"Як підтримати храм?",
    a:"Дякуємо за ваше відкрите серце! Зробити разову чи регулярну пожертву можна на сторінці «Пожертви».",
    link:"donation", linkText:"Перейти до пожертв →" }
];
var MANTRA = ["Харе Крішна","Крішна Крішна","Харе Харе","Харе Рама","Рама Рама","Харе Харе"];
var GREETING = "Харе Крішна! 🙏 Я — помічник храму. Що вас цікавить?";

/* ---------- Персонаж: живе відео; сцена залежить від сторінки ---------- */
var SCENE = (function(){
  var p = location.pathname.toLowerCase();
  if(p.indexOf("food") > -1) return "food";
  if(p.indexOf("courses") > -1) return "learn";
  if(p.indexOf("donation") > -1) return "donate";
  return "main";
})();
var POSTER = "assets/avatar-" + SCENE + "-poster.png";
var REDUCED = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
var SAVE_DATA = !!(navigator.connection && navigator.connection.saveData);
var STATIC_AVATAR = REDUCED || SAVE_DATA;
var videoOk = false; /* відео стартує лише після load + паузи, щоб не конкурувати з LCP */
var SVG =
'<video class="avatar-video" muted loop playsinline preload="none" '+
'poster="' + POSTER + '" aria-hidden="true">'+
  '<source src="assets/avatar-' + SCENE + '.webm" type="video/webm">'+
'</video>';

/* Міні-версія для шапки чату */
var SVG_MINI = '<img src="' + POSTER + '" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 0%;">';

/* ---------- Побудова DOM ---------- */
function el(html){ var d=document.createElement("div"); d.innerHTML=html; return d.firstChild; }

var widget = el(
  '<div class="avatar-widget" id="avatarWidget">'+
    '<div class="avatar-bubble" id="avatarBubble">Харе Крішна</div>'+
    '<div class="avatar-zzz-wrap">'+
      '<div class="avatar-char idle" id="avatarChar" role="button" tabindex="0" aria-label="Помічник храму — натисніть, щоб поговорити">'+SVG+'</div>'+
      '<div class="avatar-zzz">z z z</div>'+
    '</div>'+
  '</div>');

var card = el(
  '<div class="avatar-card" id="avatarCard" role="dialog" aria-label="Чат з помічником храму">'+
    '<div class="avatar-head"><span class="mini">'+SVG_MINI+'</span>'+
    '<span>Помічник храму<small>вайшнав-аватар · завжди на звʼязку</small></span>'+
    '<button class="close-x" id="avatarClose" aria-label="Закрити чат">×</button></div>'+
    '<div class="avatar-body" id="avatarBody"></div>'+
  '</div>');

document.body.appendChild(widget);
document.body.appendChild(card);

var charEl   = widget.querySelector("#avatarChar");
var videoEl  = charEl.querySelector("video");
/* Браузер без WebM-альфи (Safari): статичний прозорий PNG замість відео */
if(videoEl && (STATIC_AVATAR || !videoEl.canPlayType("video/webm"))){
  var pimg = document.createElement("img");
  pimg.src = POSTER; pimg.className = "avatar-video"; pimg.alt = "";
  videoEl.replaceWith(pimg); videoEl = null;
}
var bubbleEl = widget.querySelector("#avatarBubble");
var body     = card.querySelector("#avatarBody");
var open = false, mi = 0, lastActive = Date.now(), sleepTimer = null;

/* ---------- Стани персонажа ---------- */
function setState(s){
  charEl.classList.remove("waving","talking","happy","curious","sleeping");
  if(s) charEl.classList.add(s);
  /* idle завжди активний як базовий */
  if(!charEl.classList.contains("idle")) charEl.classList.add("idle");
  /* відео: сон — пауза, інші стани — грає */
  if(videoEl && videoOk){
    if(s==="sleeping"){ videoEl.pause(); }
    else if(videoEl.paused){ var pr = videoEl.play(); if(pr && pr.catch) pr.catch(function(){}); }
  }
}
function wake(){
  lastActive = Date.now();
  if(charEl.classList.contains("sleeping")){
    setState(null); bubbleEl.classList.remove("hidden");
  }
  restartSleepTimer();
}
function restartSleepTimer(){
  clearTimeout(sleepTimer);
  sleepTimer = setTimeout(function(){
    if(!open){
      charEl.classList.add("sleeping");
      bubbleEl.classList.add("hidden");
      if(videoEl) videoEl.pause();
    }
  }, 60000); /* засинає за хвилину бездіяльності */
}

/* Старт відео: не при reduced-motion / Save-Data; лише після load і першої взаємодії
   (скрол, дотик, клавіша), а без взаємодії — через 8 с після load. Так важке webm
   не конкурує з першим екраном і не вантажиться «в нікуди». */
var videoStarted = false;
function startVideo(){
  if(!videoEl || videoStarted) return;
  videoStarted = true; videoOk = true;
  ["scroll","pointerdown","keydown","touchstart"].forEach(function(evt){ window.removeEventListener(evt, startVideo); });
  if(charEl.classList.contains("sleeping")) return;
  var pr = videoEl.play(); if(pr && pr.catch) pr.catch(function(){});
}
function armVideo(){
  ["scroll","pointerdown","keydown","touchstart"].forEach(function(evt){ window.addEventListener(evt, startVideo, {passive:true, once:true}); });
  setTimeout(startVideo, 8000);
}
if(videoEl){
  if(document.readyState === "complete") armVideo();
  else window.addEventListener("load", armVideo);
}

/* Мантра в хмарці (при reduced-motion текст не змінюється) */
if(!REDUCED) setInterval(function(){
  if(open || charEl.classList.contains("sleeping")) return;
  mi = (mi+1) % MANTRA.length;
  bubbleEl.style.opacity = 0;
  setTimeout(function(){ bubbleEl.textContent = MANTRA[mi]; bubbleEl.style.opacity = 1; }, 350);
}, 2800);

/* Клік: радість + відкриття чату */
function toggleChat(){
  wake();
  open = !open;
  setTimeout(function(){ if(typeof safeSchedule === "function") safeSchedule(); }, 350);
  card.classList.toggle("open", open);
  if(open){
    bubbleEl.classList.add("hidden");
    setState("waving");
    setTimeout(function(){ if(open) setState("curious"); }, 2600);
    if(!body.children.length) showMenu(true);
  }else{
    bubbleEl.classList.remove("hidden");
    setState(null);
  }
}
charEl.addEventListener("click", function(){
  charEl.classList.remove("happy"); void charEl.offsetWidth; /* перезапуск анімації */
  charEl.classList.add("happy");
  setTimeout(toggleChat, 180);
});
charEl.addEventListener("keydown", function(e){
  if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggleChat(); }
});
card.querySelector("#avatarClose").addEventListener("click", function(){
  if(open) toggleChat();
});
["mousemove","touchstart"].forEach(function(evt){
  document.addEventListener(evt, wake, {passive:true});
});
restartSleepTimer();

/* ---------- Логіка чату ---------- */
function scrollDown(){ body.scrollTop = body.scrollHeight; }
function addMsg(text, cls){
  var m = el('<div class="avatar-msg'+(cls?" "+cls:"")+'"></div>');
  m.textContent = text; body.appendChild(m); scrollDown(); return m;
}
function showMenu(instant){
  body.innerHTML = "";
  var render = function(){
    body.innerHTML = "";
    addMsg(GREETING);
    var opts = el('<div class="avatar-opts"></div>');
    QA.forEach(function(item, i){
      var b = el('<button class="avatar-opt"></button>');
      b.textContent = item.q;
      b.addEventListener("click", function(){ answer(i); });
      opts.appendChild(b);
    });
    body.appendChild(opts); scrollDown();
  };
  if(instant){ render(); return; }
  setState("talking");
  var t = addMsg("", "typing");
  setTimeout(function(){ t.remove(); setState("curious"); render(); }, 700);
}
function answer(i){
  wake();
  var item = QA[i];
  body.innerHTML = "";
  addMsg(item.q, "user");
  /* ефект "друкування" + анімація розмови */
  setState("talking");
  var t = addMsg("", "typing");
  scrollDown();
  setTimeout(function(){
    t.remove();
    var m = addMsg(item.a); if(item.qr){var qi=document.createElement("img");qi.src=item.qr;qi.style.cssText="width:120px;height:120px;margin:10px auto;display:block;border-radius:8px;";m.appendChild(qi);var qt=document.createElement("div");qt.style.cssText="text-align:center;font-size:.85rem;opacity:.7;";qt.textContent=item.qrText;m.appendChild(qt);}
    if(item.link){
      var a = document.createElement("a");
      a.href = item.link; a.className = "avatar-link"; a.textContent = item.linkText;
      m.appendChild(document.createElement("br")); m.appendChild(a);
    }
    var back = el('<button class="avatar-back">← Назад до питань</button>');
    back.addEventListener("click", function(){ showMenu(false); });
    body.appendChild(back); scrollDown();
    setState("happy");
    setTimeout(function(){ if(open) setState("curious"); }, 900);
  }, 900 + Math.min(item.a.length * 8, 1200));
}

/* ---------- Безпечна зона: аватар не перекриває текст і інтерактивні елементи ----------
   Якщо розгорнутий віджет накриває текст/кнопки/посилання, він ховається за правий край
   (залишається ручка 14 px у полі сторінки). Дотик по ручці розгортає його на кілька секунд.
   Відкритий чат і фокус усередині віджета ніколи не ховаються. Сцени й логіку чату не змінює. */
var SAFE_SEL = "a[href], button, summary, input, select, textarea, iframe, label, [role=button], p, h1, h2, h3, h4, li, blockquote, figcaption, code, dt, dd";
var safeCand = [], safeTimer = null, peekUntil = 0, lastY = window.scrollY;
function safeCollect(){
  safeCand = Array.prototype.filter.call(document.querySelectorAll(SAFE_SEL), function(el){
    return !el.closest(".avatar-widget, .avatar-card, .lightbox, .donate-modal, .skip-link");
  });
}
function expandedRect(){
  var cs = getComputedStyle(widget);
  var w = widget.offsetWidth, h = widget.offsetHeight;
  var r = parseFloat(cs.right) || 0, b = parseFloat(cs.bottom) || 0;
  return {left: window.innerWidth - r - w, right: window.innerWidth - r, top: window.innerHeight - b - h, bottom: window.innerHeight - b};
}
/* Правило мінімальної дистанції: розгорнутий аватар тримається не ближче SAFE_GAP px
   до будь-якого видимого тексту чи інтерактивного елемента. */
var SAFE_GAP = 12;
function hit(a, b, gap){
  gap = gap || 0;
  return !(b.right <= a.left - gap || b.left >= a.right + gap || b.bottom <= a.top - gap || b.top >= a.bottom + gap);
}
/* прямокутник, обрізаний контейнерами з overflow (стрічки, що прокручуються, не рахуються поза видимою частиною) */
function clipRect(el, r){
  var q = {left:r.left, right:r.right, top:r.top, bottom:r.bottom}, cur = el.parentElement;
  while(cur && cur !== document.documentElement){
    var cs = getComputedStyle(cur);
    if(cs.overflowX !== "visible" || cs.overflowY !== "visible"){
      var cr = cur.getBoundingClientRect();
      q.left = Math.max(q.left, cr.left); q.right = Math.min(q.right, cr.right);
      q.top = Math.max(q.top, cr.top); q.bottom = Math.min(q.bottom, cr.bottom);
    }
    cur = cur.parentElement;
  }
  return (q.right > q.left && q.bottom > q.top) ? q : null;
}
var INTERACTIVE = /^(A|BUTTON|SUMMARY|INPUT|SELECT|TEXTAREA|IFRAME|LABEL)$/;
function overlapsContent(){
  var wr = expandedRect(), rng = document.createRange();
  for(var i = 0; i < safeCand.length; i++){
    var el = safeCand[i], r = el.getBoundingClientRect();
    if(r.width === 0 || r.height === 0 || !hit(wr, r, SAFE_GAP)) continue;
    var cs = getComputedStyle(el);
    if(cs.visibility === "hidden" || +cs.opacity === 0) continue;
    if(INTERACTIVE.test(el.tagName) || el.getAttribute("role") === "button"){
      var c = clipRect(el, r);
      if(c && hit(wr, c, SAFE_GAP)) return true;
      continue;
    }
    rng.selectNodeContents(el);
    var rs = rng.getClientRects();
    for(var k = 0; k < rs.length; k++){
      if(!hit(wr, rs[k], SAFE_GAP)) continue;
      var c2 = clipRect(el, rs[k]);
      if(c2 && hit(wr, c2, SAFE_GAP)) return true;
    }
  }
  return false;
}
function safeCheck(){
  safeTimer = null;
  var keep = open || widget.contains(document.activeElement) || Date.now() < peekUntil;
  widget.classList.toggle("avatar-tuck", !keep && overlapsContent());
}
function safeSchedule(){ if(!safeTimer) safeTimer = setTimeout(safeCheck, 120); }
window.addEventListener("scroll", function(){
  if(Math.abs(window.scrollY - lastY) > 60) peekUntil = 0;   /* прокрутка скасовує «підгляд» */
  lastY = window.scrollY; safeSchedule();
}, {passive:true});
window.addEventListener("resize", function(){ safeCollect(); safeSchedule(); }, {passive:true});
widget.addEventListener("click", function(e){
  if(widget.classList.contains("avatar-tuck")){
    e.stopPropagation(); peekUntil = Date.now() + 6000;
    widget.classList.remove("avatar-tuck"); setTimeout(safeSchedule, 6100);
  }
}, true);
widget.addEventListener("focusin", safeSchedule);
widget.addEventListener("focusout", safeSchedule);
window.addEventListener("load", function(){ safeCollect(); safeSchedule(); });
safeCollect(); safeSchedule();

/* Привітальне махання при першому завантаженні */
if(!REDUCED) setTimeout(function(){
  if(!open && !charEl.classList.contains("sleeping")){
    setState("waving");
    setTimeout(function(){ if(!open) setState(null); }, 2800);
  }
}, 2500);

})();
