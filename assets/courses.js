/* /courses: запис на курс через Google-форми Анади Кришни — окрема форма для кожного курсу.
   ЄДИНЕ місце правки адрес: карта FORMS (ключ = data-course картки, як у HTML).
   Без JS кнопка в картці веде до блоку «Запис на курси» з телефонами (#signup). */
(function(){
"use strict";

var FORMS = {
  "Ведична філософія":   "https://docs.google.com/forms/d/e/1FAIpQLSddLwLaSHhWBS4Q7o8pHsVkkjW48qhl74Wph52YK066_yttHw/viewform?usp=header",
  "Ведична кулінарія":   "https://docs.google.com/forms/d/e/1FAIpQLSc0HRqjkVjkT1hl5ytmyy_oJpeCQfZbHOT5enGUQ0v_W5LSwA/viewform?usp=header",
  "Музичні інструменти": "https://docs.google.com/forms/d/e/1FAIpQLSe3DuQrK_D-yA0oGQgkDgXRPZWxI2GNCYehkmN7bXkqtVRQAA/viewform?usp=header"
};

document.querySelectorAll(".course-join[data-course]").forEach(function(box){
  var url = FORMS[box.getAttribute("data-course")];
  var a = box.querySelector("[data-course-form]");
  if (!url || !a) return;
  a.href = url; a.target = "_blank"; a.rel = "noopener";
});
})();
