/* /donation: модальне вікно WayForPay (фокус, Esc), копіювання реквізитів, картки «сума = результат» */
(function(){
  "use strict";

  /* ---------- Модальне вікно ---------- */
  var URLS = {
    onetime: "https://secure.wayforpay.com/donate/d645a94f6a237",
    regular: "https://secure.wayforpay.com/donate/db52afa6592ea"
  };
  var modal = document.getElementById("donateModal"),
      frame = document.getElementById("donateFrame"),
      loader = document.getElementById("donateLoader"),
      titleEl = document.getElementById("donateModalTitle"),
      closeBtn = document.getElementById("donateModalClose"),
      newTab = document.getElementById("donateNewTab");
  var opener = null, inerted = [];

  function setBackgroundInert(on){
    if(on){
      Array.prototype.forEach.call(document.body.children, function(el){
        if(el === modal || /^(SCRIPT|STYLE|LINK)$/.test(el.tagName)) return;
        if(!el.hasAttribute("inert")){ el.setAttribute("inert", ""); inerted.push(el); }
      });
    }else{
      inerted.forEach(function(el){ el.removeAttribute("inert"); });
      inerted = [];
    }
  }
  function focusables(){
    return Array.prototype.filter.call(modal.querySelectorAll("button, a[href], iframe"), function(el){ return el.offsetParent !== null; });
  }
  function openModal(kind, btn){
    opener = btn || document.activeElement;
    titleEl.textContent = (btn && btn.textContent.trim()) || "Пожертва";
    loader.style.display = "flex";
    frame.removeAttribute("src");
    if(newTab) newTab.href = URLS[kind];
    /* невелика затримка, щоб лоадер встиг показатись */
    setTimeout(function(){ frame.src = URLS[kind]; }, 60);
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    setBackgroundInert(true);
    closeBtn.focus();
  }
  function closeModal(){
    modal.classList.remove("open");
    document.body.style.overflow = "";
    frame.removeAttribute("src");
    setBackgroundInert(false);
    if(opener && opener.focus) opener.focus();
    opener = null;
  }
  frame.addEventListener("load", function(){ loader.style.display = "none"; });
  document.querySelectorAll("[data-donate]").forEach(function(btn){
    btn.addEventListener("click", function(){ openModal(btn.getAttribute("data-donate"), btn); });
  });
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function(e){ if(e.target === modal) closeModal(); });
  document.addEventListener("keydown", function(e){
    if(!modal.classList.contains("open")) return;
    if(e.key === "Escape"){ e.preventDefault(); closeModal(); return; }
    if(e.key === "Tab"){
      /* запасний цикл для браузерів без inert; фокус не виходить на сторінку під вікном */
      var f = focusables(); if(!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if(!modal.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
      else if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Копіювання реквізитів: чесний фідбек ---------- */
  var failMsg = document.getElementById("copyFail");
  function selectText(el){
    var r = document.createRange(); r.selectNodeContents(el);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  document.querySelectorAll(".copy[data-copy]").forEach(function(btn){
    var label = btn.textContent, timer = null;
    function flash(text){
      btn.textContent = text;
      clearTimeout(timer);
      timer = setTimeout(function(){ btn.textContent = label; }, 2000);
    }
    function ok(){ if(failMsg) failMsg.hidden = true; flash("Скопійовано ✓"); }
    function fail(el){
      selectText(el);
      if(failMsg) failMsg.hidden = false;
      flash("Скопіюйте вручну");
    }
    btn.addEventListener("click", function(){
      var el = document.getElementById(btn.getAttribute("data-copy"));
      var text = el.textContent;
      function legacy(){
        var good = false, ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try{ good = document.execCommand("copy"); }catch(e){ good = false; }
        document.body.removeChild(ta);
        good ? ok() : fail(el);
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(ok, legacy);
      }else legacy();
    });
  });

  /* ---------- Картки «сума = результат»: показуємо лише заповнені власником ---------- */
  var sec = document.getElementById("impact");
  if(sec){
    var shown = 0;
    sec.querySelectorAll(".impact__card").forEach(function(card){
      var a = (card.getAttribute("data-amount") || "").trim(), r = (card.getAttribute("data-result") || "").trim();
      if(!a || !r) return;
      card.querySelector('[data-slot="amount"]').textContent = Number(a).toLocaleString("uk-UA");
      card.querySelector('[data-slot="result"]').textContent = r;
      card.hidden = false; shown++;
    });
    if(shown) sec.hidden = false;
  }
})();
