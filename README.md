# Campus Vision AR

نموذج أولي للواقع المعزز باستخدام MindAR وA-Frame لعرض ست معلومات تجريبية حول مبنى ٢.

> البيانات تجريبية وغير رسمية.

## تشغيل المشروع
يحتاج المشروع إلى ملفات `index.html` و`style.css` و`app.js` و`data/building.json` و`assets/target.png` و`assets/targets.mind` ومجلد الأيقونات. شغّليه عبر HTTPS باستخدام GitHub Pages أو Live Server محليًا.

## صورة التتبع
يجب توليد `assets/targets.mind` من `assets/target.png` باستخدام [MindAR Image Targets Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/).

## اختبار
اختبري الكاميرا والتتبع والضغط على الأيقونات في Chrome Android وSafari iOS، مع تغيير الإضاءة والمسافة والزاوية.
