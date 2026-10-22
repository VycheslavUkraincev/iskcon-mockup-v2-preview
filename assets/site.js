/* ІСККОН Чернівці — інтерактив: лайтбокс, reveal, хедер */
(function(){
  "use strict";

  /* Тінь хедера при скролі */
  var header = document.querySelector(".site-header");
  function onScroll(){ if(header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

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
  function open(i){ show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close(){ lb.classList.remove("open"); document.body.style.overflow = ""; }

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
  });
})();
