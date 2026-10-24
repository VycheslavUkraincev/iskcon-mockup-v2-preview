/* /food: лічильник, віджет «Подаруй тарілку», копіювання реквізитів, відео-фасад */
(function(){
  "use strict";
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  /* групування розрядів за правилами української локалі (нерозривний пробіл), як у сумі віджета */
  var nf = window.Intl && Intl.NumberFormat ? new Intl.NumberFormat("uk-UA") : null;
  var fmt = function(n){ return nf ? nf.format(n) : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); };

  /* Лічильник: фактичне значення «5 000 000+» стоїть у HTML; один раз при появі плавно
     доходимо до нього. Випадкових чисел немає. */
  var counter = document.getElementById("mealCounter");
  if(counter && !reduce && "IntersectionObserver" in window){
    var FINAL = counter.textContent, TARGET = 5000000, DUR = 1400;
    var io = new IntersectionObserver(function(es){
      if(!es[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      (function step(ts){
        if(t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / DUR), e = 1 - Math.pow(1 - p, 3);
        counter.textContent = p < 1 ? fmt(Math.round(TARGET * e)) : FINAL;
        if(p < 1) requestAnimationFrame(step);
      })(performance.now());
    }, {threshold:.6});
    io.observe(counter);
  }

  /* Віджет суми */
  var btns = document.querySelectorAll("#amountBtns button");
  var mealCount = document.getElementById("mealCount");
  var bowls = document.getElementById("bowls");
  var amt = document.getElementById("donateAmt");
  function setAmount(a){
    var meals = Math.floor(a / 100);
    mealCount.textContent = meals;
    amt.textContent = fmt(a);
    bowls.innerHTML = "";
    var show = Math.min(meals, 20);
    for(var i = 0; i < show; i++){
      var s = document.createElement("span"); s.className = "ico ico-bowl"; bowls.appendChild(s);
    }
    if(meals > 20){
      var m = document.createElement("span"); m.className = "widget__plus"; m.textContent = "+" + (meals - 20); bowls.appendChild(m);
    }
    btns.forEach(function(b){
      var on = +b.dataset.amount === a;
      b.classList.toggle("active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  if(btns.length && mealCount && bowls && amt){
    btns.forEach(function(b){ b.addEventListener("click", function(){ setAmount(+b.dataset.amount); }); });
    setAmount(1000);
  }

  /* Копіювання реквізитів */
  document.querySelectorAll(".copy[data-copy]").forEach(function(b){
    var label = b.textContent;
    b.addEventListener("click", function(){
      var v = b.getAttribute("data-copy");
      var done = function(){
        b.textContent = "✓ Скопійовано";
        setTimeout(function(){ b.textContent = label; }, 2000);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(v).then(done, done); }
      else done();
    });
  });

  /* Відео «Шпальта Медіа»: постер → iframe лише після кліку (youtube-nocookie) */
  var fac = document.querySelector(".video-facade");
  if(fac){
    fac.addEventListener("click", function(ev){
      ev.preventDefault();
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + fac.getAttribute("data-video-id") + "?autoplay=1&rel=0";
      f.title = fac.getAttribute("title");
      f.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      f.setAttribute("allowfullscreen", "");
      fac.parentNode.replaceChild(f, fac);
      f.focus();
    });
  }

  /* Фото й карта Соборної площі: адреси підставляємо після load, коли блок поруч,
     щоб ці картинки не змагалися з першим екраном (lazy у Chrome вантажить їх завчасно). */
  var placeImgs = document.querySelectorAll("img[data-srcset]");
  if(placeImgs.length){
    var showImg = function(img){
      img.srcset = img.getAttribute("data-srcset"); img.src = img.getAttribute("data-src");
      img.removeAttribute("data-srcset"); img.removeAttribute("data-src");
    };
    var armImgs = function(){
      if(!("IntersectionObserver" in window)){ Array.prototype.forEach.call(placeImgs, showImg); return; }
      var pio = new IntersectionObserver(function(es){
        es.forEach(function(e){ if(e.isIntersecting){ pio.unobserve(e.target); showImg(e.target); } });
      }, {rootMargin:"600px 0px"});
      Array.prototype.forEach.call(placeImgs, function(img){ pio.observe(img); });
    };
    if(document.readyState === "complete") armImgs(); else window.addEventListener("load", armImgs);
  }
})();
