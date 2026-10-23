/* «Дыхание алтаря» — единственный фирменный эффект сайта (только главная).
   Свет поверх фото алтаря медленно меняется при прокрутке (GSAP ScrollTrigger, scrub).
   Фото не масштабируется и не искажается; меняется лишь прозрачность тёплого слоя под скримом.
   prefers-reduced-motion и Save-Data: эффект и библиотеки не загружаются, кадр статичен.
   GSAP подключается лениво, после load и в простое, чтобы не влиять на LCP. */
(function(){
  "use strict";
  var glow = document.querySelector(".hero-home__glow");
  if(!glow) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var save = navigator.connection && navigator.connection.saveData;
  if(reduce || save) return;

  function load(src, cb){
    var s = document.createElement("script");
    s.src = src; s.async = false; s.onload = cb; s.onerror = function(){};
    document.head.appendChild(s);
  }
  function start(){
    load("assets/vendor/gsap/gsap.min.js", function(){
      load("assets/vendor/gsap/ScrollTrigger.min.js", function(){
        if(!window.gsap || !window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);
        gsap.fromTo(glow, {opacity: 0.05}, {
          opacity: 0.32, ease: "none",
          scrollTrigger: {trigger: ".hero-home", start: "top top", end: "bottom top", scrub: 1}
        });
      });
    });
  }
  function whenIdle(){
    if("requestIdleCallback" in window) requestIdleCallback(start, {timeout: 3000});
    else setTimeout(start, 1500);
  }
  if(document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle);
})();
