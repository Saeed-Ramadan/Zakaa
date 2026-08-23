/* ==========================================================================
   إدارة حجز المواد والمراحل الدراسية وإرسال الرسائل الفورية للواتساب (01040868935)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const bookingModal = document.getElementById('bookingModal');
  const bookingModalClose = document.getElementById('bookingModalClose');
  const bookingForm = document.getElementById('bookingForm');
  const bookingSubjectInput = document.getElementById('bookingSubject');
  const bookingGradeInput = document.getElementById('bookingGrade');

  if (!bookingModal || !bookingForm) return;

  // فتح نافذة الحجز مع تعبئة المادة والمرحلة
  function openBookingModal(subjectTitle = '', gradeName = '') {
    if (bookingSubjectInput && subjectTitle && subjectTitle !== 'عام') {
      let matchedOpt = Array.from(bookingSubjectInput.options).find(opt => opt.value === subjectTitle || opt.text.includes(subjectTitle) || subjectTitle.includes(opt.value));
      if (matchedOpt) {
        bookingSubjectInput.value = matchedOpt.value;
      } else {
        const newOpt = new Option(subjectTitle, subjectTitle, true, true);
        bookingSubjectInput.add(newOpt);
      }
    }

    if (bookingGradeInput && gradeName && gradeName !== 'جميع المراحل') {
      let matchedGrade = Array.from(bookingGradeInput.options).find(opt => opt.value === gradeName || opt.text.includes(gradeName));
      if (matchedGrade) {
        bookingGradeInput.value = matchedGrade.value;
      } else {
        const newGradeOpt = new Option(gradeName, gradeName, true, true);
        bookingGradeInput.add(newGradeOpt);
      }
    }

    bookingModal.classList.add('active');
  }

  window.openBookingModal = openBookingModal;

  // إغلاق النافذة
  if (bookingModalClose) {
    bookingModalClose.addEventListener('click', () => {
      bookingModal.classList.remove('active');
    });
  }

  // إرسال الحجز وتحويله للواتساب مباشرة
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const studentName = document.getElementById('bookingStudentName').value.trim();
    const subject = bookingSubjectInput.value.trim();
    const grade = bookingGradeInput.value.trim();

    if (!studentName || !subject || !grade) {
      if (window.showToast) {
        window.showToast('يرجى كتابة كافة البيانات المطلوب تعبئتها لحجز المادة', 'info');
      }
      return;
    }

    // صياغة الرسالة الموجهة للواتساب
    const message = `مرحباً منصة ذكاء التعليمية 👋
أرغب في حجز مادة دراسية:

📌 *الاسم:* ${studentName}
📚 *المادة:* ${subject}
🎓 *المرحلة والصف الدراسي:* ${grade}

يرجى تزويدي بتفاصيل الجدول والمواعيد المتاحة وشكراً لكم.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/201040868935?text=${encodedMessage}`;

    if (window.showToast) {
      window.showToast('تم إعداد حجزك! جاري فتح الواتساب للتأكيد والمتابعة...', 'success');
    }

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      bookingModal.classList.remove('active');
      bookingForm.reset();
    }, 1200);
  });
});
