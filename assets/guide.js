/* Вайшнав-помічник: дерево швидких відповідей + мантра-анімація */
(function(){
  var QA = [
    { id:"what", q:"Що таке ІСККОН?",
      a:"ІСККОН — Міжнародне товариство свідомості Крішни, засноване 1966 року. Ми практикуємо бгакті-йогу — шлях любові та відданості Богу." },
    { id:"when", q:"Коли найближча програма?",
      a:"Недільний фестиваль: 13:30 — кіртан, 14:00 — лекція з філософії, 16:00 — вегетаріанський бенкет. У суботу з 08:00 — ранкова програма." },
    { id:"volunteer", q:"Як стати волонтером?",
      a:"Ми завжди раді новим волонтерам! Приходьте до храму (вул. Скальда, 40А) або напишіть нам у Telegram." },
    { id:"donate", q:"Як підтримати храм?",
      a:"Дякуємо за ваше відкрите серце! Зробити разову чи регулярну пожертву можна на сторінці «Пожертви».",
      link:"donation", linkText:"Перейти до пожертв →" }
  ];
  var MANTRA = ["Харе Крішна","Крішна Крішна","Харе Харе","Харе Рама","Рама Рама","Харе Харе"];
  var GREETING = "Харе Крішна! 🙏 Я — помічник храму. Що тебе цікавить?";

  function el(html){ var d=document.createElement("div"); d.innerHTML=html; return d.firstChild; }

  var fab = el(
    '<div class="guide-fab" id="guideFab">'+
      '<div class="guide-mantra" id="guideMantra">Харе Крішна</div>'+
      '<button class="guide-btn" id="guideBtn" aria-label="Помічник храму">🙏</button>'+
    "</div>");
  var card = el(
    '<div class="guide-card" id="guideCard">'+
      '<div class="guide-head"><span class="ava">🙏</span><span>Помічник храму<small>завжди на звʼязку</small></span></div>'+
      '<div class="guide-body" id="guideBody"></div>'+
    "</div>");
  document.body.appendChild(fab);
  document.body.appendChild(card);

  var body = card.querySelector("#guideBody");
  var mantraEl = fab.querySelector("#guideMantra");
  var open = false, mi = 0;

  /* анімація мантри над кнопкою, коли чат закрито */
  setInterval(function(){
    if(open) return;
    mi = (mi+1) % MANTRA.length;
    mantraEl.style.opacity = 0;
    setTimeout(function(){ mantraEl.textContent = MANTRA[mi]; mantraEl.style.opacity = 1; }, 350);
  }, 2600);

  function scrollDown(){ body.scrollTop = body.scrollHeight; }
  function addMsg(text, cls){
    var m = el('<div class="guide-msg'+(cls?" "+cls:"")+'"></div>');
    m.textContent = text; body.appendChild(m); scrollDown(); return m;
  }
  function showMenu(){
    body.innerHTML = "";
    addMsg(GREETING);
    var opts = el('<div class="guide-opts"></div>');
    QA.forEach(function(item, i){
      var b = el('<button class="guide-opt"></button>');
      b.textContent = item.q;
      b.addEventListener("click", function(){ answer(i); });
      opts.appendChild(b);
    });
    body.appendChild(opts); scrollDown();
  }
  function answer(i){
    var item = QA[i];
    body.innerHTML = "";
    addMsg(item.q, "user");
    var m = addMsg(item.a);
    if(item.link){
      var a = document.createElement("a");
      a.href = item.link; a.className = "guide-link"; a.textContent = item.linkText;
      m.appendChild(document.createElement("br")); m.appendChild(a);
    }
    var back = el('<button class="guide-back">← Назад до питань</button>');
    back.addEventListener("click", showMenu);
    body.appendChild(back); scrollDown();
  }

  fab.querySelector("#guideBtn").addEventListener("click", function(){
    open = !open;
    card.classList.toggle("open", open);
    mantraEl.style.display = open ? "none" : "";
    if(open && !body.children.length) showMenu();
    if(open) scrollDown();
  });
})();
