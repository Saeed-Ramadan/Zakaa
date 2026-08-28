/* ==========================================================================
   نظام توليد شهادات التقدير والتفوق (HTML5 Canvas Engine)
   ========================================================================== */

class CertificateGenerator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    // الأبعاد الأصلية العالية الدقة للشهادة (1200 × 850 بكسل)
    this.canvas.width = 1200;
    this.canvas.height = 850;
  }

  generate({ studentName, subjectTitle, gradeName, scorePercentage }) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. الخلفية الأساسية (ورقي فاتح أنيق)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // خلفية ناعمة عاجية
    const bgGradient = ctx.createLinearGradient(0, 0, w, h);
    bgGradient.addColorStop(0, "#ffffff");
    bgGradient.addColorStop(1, "#f8fafc");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // 2. الإطار الخارجي الفاخر (هوية سعودية: أزرق ملكي + ذهبي)
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#0d47a1"; // أزرق اللوجو الملكي
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#d4af37"; // ذهبي
    ctx.strokeRect(34, 34, w - 68, h - 68);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ff6f00"; // برتقالي اللوجو
    ctx.strokeRect(42, 42, w - 84, h - 84);

    // 3. زخارف الأركان الذهبية
    this.drawCornerDeco(ctx, 42, 42, 0);
    this.drawCornerDeco(ctx, w - 42, 42, Math.PI / 2);
    this.drawCornerDeco(ctx, w - 42, h - 42, Math.PI);
    this.drawCornerDeco(ctx, 42, h - 42, (Math.PI * 3) / 2);

    // 4. رسم شعار المنصة الأصلي (images/logo.png)
    const logoImg = new Image();
    logoImg.onload = () => {
      // رسم اللوجو في منتصف الجزء العلوي بظل مجسم 3D
      const logoWidth = 110;
      const logoHeight = 110;
      ctx.save();
      ctx.shadowColor = "rgba(13, 71, 161, 0.25)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
      ctx.drawImage(logoImg, (w - logoWidth) / 2, 55, logoWidth, logoHeight);
      ctx.restore();

      // رسم بقية نصوص الشهادة والختم
      this.drawTextContent({
        studentName,
        subjectTitle,
        gradeName,
        scorePercentage,
        logoImg,
      });
    };
    logoImg.onerror = () => {
      // في حال تعذر تحميل الصورة يتم رسم النص فوراً
      this.drawTextContent({
        studentName,
        subjectTitle,
        gradeName,
        scorePercentage,
        logoImg: null,
      });
    };
    logoImg.src = "images/logo.png";
  }

  drawCornerDeco(ctx, x, y, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(30, 0);
    ctx.lineTo(0, 30);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawTextContent({ studentName, subjectTitle, gradeName, scorePercentage, logoImg }) {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.textAlign = "center";

    // اسم المنصة
    ctx.font = "800 26px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#0d47a1";
    ctx.fillText("منصة ذكاء التعليمية", w / 2, 215);

    // عنوان الشهادة
    ctx.font = "900 42px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#ff6f00";
    ctx.fillText("شهادة إنجاز وتشجيع", w / 2, 275);

    // خط فاصل ناعم
    ctx.beginPath();
    ctx.moveTo(w / 2 - 160, 295);
    ctx.lineTo(w / 2 + 160, 295);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#d4af37";
    ctx.stroke();

    // عبارة المنح التحفيزية
    ctx.font = "600 22px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("تُمنح هذه الشهادة بكل فخر للطالب(ة):", w / 2, 340);

    // اسم الطالب
    ctx.font = "900 40px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#0d47a1";
    ctx.fillText(studentName, w / 2, 405);

    // تفاصيل المادة والمرحلة
    ctx.font = "600 22px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText(
      `لاجتيازه اختبار مادة: (${subjectTitle})`,
      w / 2,
      465,
    );

    ctx.font = "700 22px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#1565c0";
    ctx.fillText(`الصف الدراسي: ${gradeName}`, w / 2, 510);

    // النتيجة
    ctx.font = "800 24px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#2e7d32";
    ctx.fillText(`النتيجة: ${scorePercentage}%`, w / 2, 558);

    // العبارة التشجيعية
    ctx.font = "600 20px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(
      "أحسنت! مع تمنياتنا لك بدوام التفوق والنجاح المستمر في مسيرتك التعليمية.",
      w / 2,
      610,
    );

    // 5. التاريخ الهجري والخاتم الرسمي (تقويم أم القرى)
    let hijriDate = "";
    try {
      hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
    } catch (e) {
      hijriDate = new Date().toLocaleDateString("ar-SA-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    // تنظيف النص والتأكد من عدم تكرار حرف (هـ)
    const cleanHijriDate = hijriDate.replace(/\s*هـ?\s*$/g, "").trim() + " هـ";

    // التاريخ الهجري (يمين)
    ctx.textAlign = "right";
    ctx.font = "700 17px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText(`تاريخ الإصدار: ${cleanHijriDate}`, w - 120, 715);

    // توقيع وختم المنصة (يسار)
    ctx.textAlign = "center";
    ctx.font = "700 17px Tajawal, Cairo, sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText("إدارة منصة ذكاء التعليمية", 220, 695);

    // رسم ختم اللوجو الرسمي الفاخر المتناسق
    const sealCenterX = 220;
    const sealCenterY = 752;
    const sealRadius = 38;

    ctx.save();
    ctx.translate(sealCenterX, sealCenterY);
    ctx.rotate(-0.06); // انحناء خفيف جداً يمنحه طابع الختم الحقيقي

    // خلفية دائرية نقية
    ctx.beginPath();
    ctx.arc(0, 0, sealRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // إطار خارجي أزرق ملكي
    ctx.beginPath();
    ctx.arc(0, 0, sealRadius + 4, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#0d47a1";
    ctx.stroke();

    // إطار داخلي ذهبي
    ctx.beginPath();
    ctx.arc(0, 0, sealRadius - 1, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#d4af37";
    ctx.stroke();

    // رسم شعار المنصة داخل الختم بشكل دائري مقصوص بدقة عالية
    if (logoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, sealRadius - 2, 0, Math.PI * 2);
      ctx.clip();
      const imgSize = (sealRadius - 2) * 2;
      ctx.drawImage(logoImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
      ctx.restore();
    }
    ctx.restore();
  }

  downloadPNG(filename = "شهادة_منصة_ذكاء.png") {
    if (!this.canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = this.canvas.toDataURL("image/png", 1.0);
    link.click();
  }

  downloadPDF(filename = "شهادة_منصة_ذكاء.pdf") {
    if (!this.canvas) return;
    const dataUrl = this.canvas.toDataURL("image/png", 1.0);

    // استخدام مكتبة jsPDF لتوليد ملف PDF أفقي (A4 Landscape 297x210mm) فورياً بدقة كاملة
    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210, undefined, "FAST");
      pdf.save(filename);
    } else {
      this.printCertificate();
    }
  }

  printCertificate() {
    if (!this.canvas) return;
    const dataUrl = this.canvas.toDataURL("image/png", 1.0);

    const printWindow = window.open("", "_blank", "width=1200,height=850");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>شهادة إنجاز - منصة ذكاء التعليمية</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .cert-print-img {
              width: 100vw;
              height: 100vh;
              max-width: 297mm;
              max-height: 210mm;
              object-fit: contain;
              display: block;
              margin: auto;
              page-break-inside: avoid;
            }
            @media print {
              html, body {
                width: 100% !important;
                height: 100% !important;
              }
              .cert-print-img {
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                object-fit: fill !important;
              }
            }
          </style>
        </head>
        <body>
          <img class="cert-print-img" src="${dataUrl}" alt="شهادة إنجاز منصة ذكاء" />
          <script>
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.close();
              }, 300);
            });
          <\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  }
}

// دالة تصدير الشهادة الحالية كـ PDF
window.downloadCurrentCertificatePDF = function(filename = "شهادة_منصة_ذكاء.pdf") {
  const canvas = document.getElementById("certificateCanvas");
  if (!canvas) return;
  const dataUrl = canvas.toDataURL("image/png", 1.0);

  if (window.jspdf && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210, undefined, "FAST");
    pdf.save(filename);
  } else {
    window.printCurrentCertificate();
  }
};

// دالة طباعة الشهادة المعروضة حالياً
window.printCurrentCertificate = function() {
  const canvas = document.getElementById("certificateCanvas");
  if (!canvas) return;
  const dataUrl = canvas.toDataURL("image/png", 1.0);

  const printWindow = window.open("", "_blank", "width=1200,height=850");
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>شهادة إنجاز - منصة ذكاء التعليمية</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .cert-print-img {
            width: 100vw;
            height: 100vh;
            max-width: 297mm;
            max-height: 210mm;
            object-fit: contain;
            display: block;
            margin: auto;
            page-break-inside: avoid;
          }
          @media print {
            html, body {
              width: 100% !important;
              height: 100% !important;
            }
            .cert-print-img {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              max-height: 100% !important;
              object-fit: fill !important;
            }
          }
        </style>
      </head>
      <body>
        <img class="cert-print-img" src="${dataUrl}" alt="شهادة إنجاز منصة ذكاء" />
        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 300);
          });
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  } else {
    window.print();
  }
};

// تصدير كائن الشهادات عالمياً
window.CertificateGenerator = CertificateGenerator;
