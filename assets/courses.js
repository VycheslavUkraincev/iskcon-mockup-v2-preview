/* /courses: запис на курс через WhatsApp / Viber з передзаповненим повідомленням мовою сторінки.
   Текст повідомлення — ключ словника (assets/i18n-dict.js), напр. «Доброго дня! Хочу записатися на курс «Ведична філософія»».
   TODO(owner): коли надійде URL Google-форми Анади Кришни — вписати його в FORM_URL.
   Тоді кнопка data-form="courses" веде на форму, а кнопки месенджерів у картках зникають. */
(function(){
"use strict";

var FORM_URL = "";
var PHONE = "380633117500";

function norm(s){ return String(s).replace(/\s+/g," ").trim(); }
function lang(){ var l = document.documentElement.lang; return (l === "en" || l === "ro") ? l : "uk"; }
function tr(uk){
  var l = lang();
  if (l === "uk" || typeof I18N === "undefined" || !I18N[l]) return uk;
  var v = I18N[l][norm(uk)];
  return v || uk;
}

function update(){
  document.querySelectorAll(".course-join[data-course]").forEach(function(box){
    var msg = encodeURIComponent(tr("Доброго дня! Хочу записатися на курс «" + box.dataset.course + "»"));
    box.querySelectorAll("[data-msg]").forEach(function(a){
      a.href = a.dataset.msg === "viber"
        ? "viber://chat?number=%2B" + PHONE + "&draft=" + msg
        : "https://wa.me/" + PHONE + "?text=" + msg;
    });
  });
}

if (FORM_URL) {
  document.querySelectorAll('[data-form="courses"]').forEach(function(a){ a.href = FORM_URL; a.target = "_blank"; a.rel = "noopener"; });
  document.querySelectorAll(".course-join").forEach(function(box){ box.remove(); });
}

update();
new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
