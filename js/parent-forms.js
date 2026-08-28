/* ==========================================================================
   إدارة وتفاعل قسم نماذج أولياء الأمور (Parent Forms Portal)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const parentForm = document.getElementById('parentPortalForm');
  const formTabBtns = document.querySelectorAll('.form-tab-btn');
  const formTypeInput = document.getElementById('formTypeInput');
  const formTitleHeading = document.getElementById('formTitleHeading');

  if (!parentForm) return;

  const formTitles = {
    tracking: "نموذج طلب متابعة مستمرة لمستوى الطالب الأكاديمي",
    consultation: "نموذج طلب استشارة تعليمية وتوجيه تربوي",
    enrollment: "نموذج تسجيل وتسديد رسوم إلحاق طالب جديد"
  };

  // تبديل ألسنة النماذج
  formTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetType = btn.getAttribute('data-form');
      if (formTypeInput) formTypeInput.value = targetType;
      if (formTitleHeading) formTitleHeading.textContent = formTitles[targetType] || formTitles.tracking;
    });
  });

  // معالجة تقديم النموذج
  parentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const studentName = document.getElementById('parentStudentName').value.trim();
    const studentStage = document.getElementById('parentStudentStage').value;
    const parentSubjectEl = document.getElementById('parentSubject');
    const parentSubject = parentSubjectEl ? parentSubjectEl.value : '';

    if (!studentName || !parentSubject) {
      if (window.showToast) {
        window.showToast('يرجى إدخال اسم الطالب واختيار المادة الدراسية للاستمرار', 'info');
      }
      return;
    }

    // إعداد نص إرسال عبر الواتساب لضمان وصول الطلب مباشرة
    const formTypeName = formTitles[formTypeInput.value] || "طلب من ولي أمر";
    const waMessage = `السلام عليكم ورحمة الله وبركاته 👋
أرغب في تقديم (${formTypeName}) عبر منصة ذكاء التعليمية:

📌 *اسم الطالب/ة:* ${studentName}
🎓 *المرحلة الدراسية:* ${studentStage}
📚 *المادة أو البرنامج المطلوب:* ${parentSubject}

يرجى التواصل معي وتزويدي بكافة التفاصيل، شكراً جزيلاً.`;

    const encodedMsg = encodeURIComponent(waMessage);
    const waUrl = `https://wa.me/201040868935?text=${encodedMsg}`;

    if (window.showToast) {
      window.showToast('تم استلام طلبكم بنجاح! جاري فتح الواتساب للتواصل مع المشرف التربوي...', 'success');
    }

    // فتح الواتساب بعد ثانيتين
    setTimeout(() => {
      window.open(waUrl, '_blank');
      parentForm.reset();
    }, 1500);
  });
});
