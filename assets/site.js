/* ІСККОН Чернівці — інтерактив: лайтбокс, reveal, хедер */
(function(){
  "use strict";

  /* Тінь хедера при скролі */
  var header = document.querySelector(".site-header");
  function onScroll(){ if(header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  /* Аналітика GoatCounter (без cookies, без персональних даних; рішення власника 24.10.2026).
     Вмикається, щойно вписано код сайту з goatcounter.com (напр. "iskcon-cv" для https://iskcon-cv.goatcounter.com).
     Рахує лише на живому домені — превью та локальні копії не рахуються. Шлях береться з <link rel="canonical">. */
  var GOATCOUNTER = "";
  if(GOATCOUNTER && /(^|\.)iskcon\.cv\.ua$/.test(location.hostname)){
    window.addEventListener("load", function(){
      var gc = document.createElement("script");
      gc.async = true;
      gc.src = "https://gc.zgo.at/count.js";
      gc.setAttribute("data-goatcounter", "https://" + GOATCOUNTER + ".goatcounter.com/count");
      document.head.appendChild(gc);
    });
  }

  /* Якорі «#id» на поточній сторінці. Через <base href> браузер інакше відкриває «#id» на головній. */
  document.addEventListener("click", function(ev){
    var a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if(!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var id = decodeURIComponent(a.getAttribute("href").slice(1));
    var target = id && document.getElementById(id);
    if(!target) return;
    ev.preventDefault();
    if(location.hash.slice(1) === id) target.scrollIntoView();
    else location.hash = id;
    if(a.classList.contains("skip-link")){
      if(!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({preventScroll:true});
    }
  });

  /* Зовнішній перехід на «сторінка#id» (соцмережі): плавний скрол браузера стартує до кінця
     розкладки і може зупинитися не там. Після load чекаємо, поки скрол зупиниться, і лише тоді,
     якщо ціль не під хедером, а людина ще не гортала сама, один раз доводимо її на місце. */
  if(location.hash.length > 1){
    var userMoved = false, stop = function(){ userMoved = true; };
    ["wheel","touchstart","keydown","pointerdown"].forEach(function(evt){ window.addEventListener(evt, stop, {passive:true, once:true}); });
    window.addEventListener("load", function(){
      var t = null, lastY = -1, still = 0, tries = 0;
      try { t = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch(e){}
      if(!t) return;
      (function settle(){
        if(userMoved) return;
        still = (window.scrollY === lastY) ? still + 1 : 0;
        lastY = window.scrollY;
        if(still < 2 && ++tries < 40){ setTimeout(settle, 100); return; }
        var want = parseFloat(getComputedStyle(t).scrollMarginTop) || 0,
            top = t.getBoundingClientRect().top,
            atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
        if(Math.abs(top - want) > 8 && !(atEnd && top > want)) t.scrollIntoView({block:"start", behavior:"instant"});
      })();
    });
  }

  /* Видимий фокус карти Google з клавіатури: фокус iframe іншого домену CSS не бачить, тож коли
     Tab переводить фокус у карту, рамка .map-frame отримує клас .kbd-focus (знімається при поверненні) */
  var mapFrames = document.querySelectorAll(".map-frame"), viaTab = false;
  if(mapFrames.length){
    document.addEventListener("keydown", function(ev){ viaTab = ev.key === "Tab"; }, true);
    /* клік мишею всередині карти до сторінки не доходить — скидаємо прапорець уже під час руху миші сторінкою */
    ["pointerdown","pointermove"].forEach(function(evt){ document.addEventListener(evt, function(){ viaTab = false; }, {capture:true, passive:true}); });
    window.addEventListener("blur", function(){
      setTimeout(function(){
        var a = document.activeElement;
        mapFrames.forEach(function(f){ f.classList.toggle("kbd-focus", viaTab && f.contains(a)); });
      }, 0);
    });
    window.addEventListener("focus", function(){ mapFrames.forEach(function(f){ f.classList.remove("kbd-focus"); }); });
    /* карта ще не завантажилась (loading="lazy"): фокус лишається на самому iframe у сторінці — blur не буде */
    mapFrames.forEach(function(f){
      f.addEventListener("focusin", function(){ if(viaTab) f.classList.add("kbd-focus"); });
      f.addEventListener("focusout", function(){ if(document.hasFocus()) f.classList.remove("kbd-focus"); });
      /* ледача карта, що вантажиться під фокусом, скидає його на BODY — повертаємо фокус на карту.
         Фокус в iframe іншого домену видно лише як blur вікна, тож запам'ятовуємо його там. */
      var ifr = f.querySelector("iframe"), loaded = false, held = false;
      if(!ifr) return;
      ifr.addEventListener("load", function(){ loaded = true; restore(); held = false; });
      window.addEventListener("blur", function(){ setTimeout(function(){ if(!loaded && document.activeElement === ifr) held = true; }, 0); });
      window.addEventListener("focus", function(){ setTimeout(restore, 0); });
      function restore(){
        if(!held || document.activeElement !== document.body) return;
        held = false;
        ifr.focus({preventScroll:true});
        if(viaTab) f.classList.add("kbd-focus");
      }
    });
  }

  /* Мобільне меню */
  var navToggle = document.querySelector(".nav-toggle"),
      mainNav = document.getElementById("mainNav");
  if(navToggle && mainNav){
    if(!navToggle.hasAttribute("aria-controls")) navToggle.setAttribute("aria-controls", "mainNav");
    function setMenu(isOpen){
      mainNav.classList.toggle("open", isOpen);
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    navToggle.addEventListener("click", function(){ setMenu(!mainNav.classList.contains("open")); });
    /* закрити меню при кліку на посилання */
    mainNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ setMenu(false); });
    });
    /* Esc закриває меню; фокус повертається на кнопку, якщо був усередині меню */
    document.addEventListener("keydown", function(ev){
      if(ev.key !== "Escape" || !mainNav.classList.contains("open")) return;
      var inside = mainNav.contains(document.activeElement);
      setMenu(false);
      if(inside || document.activeElement === document.body) navToggle.focus();
    });
    /* клік поза шапкою закриває меню */
    document.addEventListener("click", function(ev){
      if(mainNav.classList.contains("open") && !ev.target.closest(".site-header")) setMenu(false);
    });
    /* перехід на широкий екран скидає стан */
    window.addEventListener("resize", function(){ if(window.innerWidth > 640) setMenu(false); });
  }

  /* Поява блоків при скролі */
  var revealEls = document.querySelectorAll("section.block, .hero .hero-inner");
  revealEls.forEach(function(elm){ elm.classList.add("reveal"); });
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, {threshold:.08});
    revealEls.forEach(function(elm){ io.observe(elm); });
  } else {
    revealEls.forEach(function(elm){ elm.classList.add("visible"); });
  }

  /* Лайтбокс галереї */
  var links = Array.prototype.slice.call(document.querySelectorAll(".gallery a"));
  if(!links.length) return;

  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role","dialog");
  lb.setAttribute("aria-modal","true");
  lb.setAttribute("aria-label","Перегляд фото");
  lb.innerHTML =
    '<button class="lb-close" aria-label="Закрити">×</button>' +
    '<button class="lb-prev" aria-label="Попереднє фото">‹</button>' +
    '<img alt="">' +
    '<button class="lb-next" aria-label="Наступне фото">›</button>' +
    '<div class="lb-cap"></div>';
  document.body.appendChild(lb);
  var img = lb.querySelector("img"), cap = lb.querySelector(".lb-cap"), idx = 0;

  function show(i){
    idx = (i + links.length) % links.length;
    var a = links[idx], im = a.querySelector("img");
    img.src = a.href; img.alt = im ? (im.alt || "") : "";
    cap.textContent = (im && im.alt ? im.alt + " · " : "") + (idx+1) + " / " + links.length;
  }
  var lastFocus = null, closeBtn = lb.querySelector(".lb-close");
  function open(i){
    lastFocus = document.activeElement;
    show(i); lb.classList.add("open"); document.body.style.overflow = "hidden";
    closeBtn.focus();
  }
  function close(){
    lb.classList.remove("open"); document.body.style.overflow = "";
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  links.forEach(function(a, i){
    a.removeAttribute("target");
    a.addEventListener("click", function(ev){ ev.preventDefault(); open(i); });
  });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function(ev){ ev.stopPropagation(); show(idx-1); });
  lb.querySelector(".lb-next").addEventListener("click", function(ev){ ev.stopPropagation(); show(idx+1); });
  lb.addEventListener("click", function(ev){ if(ev.target === lb) close(); });
  document.addEventListener("keydown", function(ev){
    if(!lb.classList.contains("open")) return;
    if(ev.key === "Escape") close();
    if(ev.key === "ArrowLeft") show(idx-1);
    if(ev.key === "ArrowRight") show(idx+1);
    /* фокус не виходить за межі лайтбокса */
    if(ev.key === "Tab"){
      var f = lb.querySelectorAll("button");
      var first = f[0], last = f[f.length-1];
      if(ev.shiftKey && document.activeElement === first){ ev.preventDefault(); last.focus(); }
      else if(!ev.shiftKey && document.activeElement === last){ ev.preventDefault(); first.focus(); }
      else if(!lb.contains(document.activeElement)){ ev.preventDefault(); first.focus(); }
    }
  });
})();
