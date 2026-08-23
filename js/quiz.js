/* ==========================================================================
   نظام التفاعل مع المواد والأدوات والتفاعل مع اختبارات الكفايات
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  let activeStageId = 'primary';
  let activeGradeId = 'p1';
  let currentQuizSubject = null;
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let certEngine = null;

  // العناصر من الـ DOM
  const stagesTabsContainer = document.getElementById('stagesTabs');
  const gradesSubtabsContainer = document.getElementById('gradesSubtabs');
  const subjectsGrid = document.getElementById('subjectsGrid');

  const quizModal = document.getElementById('quizModal');
  const quizModalClose = document.getElementById('quizModalClose');
  const quizSubjectTitle = document.getElementById('quizSubjectTitle');
  const quizProgressBar = document.getElementById('quizProgressBar');
  const quizQuestionText = document.getElementById('quizQuestionText');
  const quizQuestionBadge = document.getElementById('quizQuestionBadge');
  const quizOptionsList = document.getElementById('quizOptionsList');
  const quizPrevBtn = document.getElementById('quizPrevBtn');
  const quizNextBtn = document.getElementById('quizNextBtn');
  const quizSubmitBtn = document.getElementById('quizSubmitBtn');

  const quizResultsBox = document.getElementById('quizResultsBox');
  const quizScorePercentage = document.getElementById('quizScorePercentage');
  const quizResultStatus = document.getElementById('quizResultStatus');
  const studentNameInputWrap = document.getElementById('studentNameInputWrap');
  const studentNameInput = document.getElementById('studentNameInput');
  const generateCertBtn = document.getElementById('generateCertBtn');

  const certModal = document.getElementById('certModal');
  const certModalClose = document.getElementById('certModalClose');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const downloadCertBtn = document.getElementById('downloadCertBtn');

  // 1. تهيئة تبويبات المراحل الدراسية
  function renderStagesTabs() {
    if (!stagesTabsContainer) return;
    stagesTabsContainer.innerHTML = THAKAA_DATA.stages.map(stage => `
      <button class="stage-tab-btn ${stage.id === activeStageId ? 'active' : ''}" data-stage="${stage.id}">
        <i class="fas ${stage.icon}"></i>
        <span>${stage.title}</span>
      </button>
    `).join('');

    stagesTabsContainer.querySelectorAll('.stage-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeStageId = btn.getAttribute('data-stage');
        const selectedStage = THAKAA_DATA.stages.find(s => s.id === activeStageId);
        if (selectedStage && selectedStage.grades.length > 0) {
          activeGradeId = selectedStage.grades[0].id; // الصف الأول افتراضياً لكل مرحلة
        }
        renderStagesTabs();
        renderGradesSubtabs();
        renderSubjects();
      });
    });
  }

  // 2. تهيئة الصفوف الدراسية الفرعية
  function renderGradesSubtabs() {
    if (!gradesSubtabsContainer) return;
    const stage = THAKAA_DATA.stages.find(s => s.id === activeStageId);
    if (!stage) return;

    gradesSubtabsContainer.innerHTML = stage.grades.map(grade => `
      <button class="grade-subtab-btn ${grade.id === activeGradeId ? 'active' : ''}" data-grade="${grade.id}">
        ${grade.name}
      </button>
    `).join('');

    gradesSubtabsContainer.querySelectorAll('.grade-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeGradeId = btn.getAttribute('data-grade');
        renderGradesSubtabs();
        renderSubjects();
      });
    });
  }

  // 3. عرض كروت المواد بأسلوب غلاف كتب وزارة التعليم السعودية (000.jpeg)
  function renderSubjects() {
    if (!subjectsGrid) return;

    const currentStage = THAKAA_DATA.stages.find(s => s.id === activeStageId);
    const currentGrade = currentStage ? currentStage.grades.find(g => g.id === activeGradeId) : null;
    const currentGradeName = currentGrade ? currentGrade.name : "الصف الدراسي";

    // الحصول على مواد المرحلة وتحديث اسم الصف فيها ديناميكياً ليطابق الصف المحدد
    const rawSubjects = THAKAA_DATA.subjects.filter(sub => sub.stageId === activeStageId);
    const displaySubjects = rawSubjects.map(sub => {
      return {
        ...sub,
        gradeId: activeGradeId,
        gradeName: currentGradeName
      };
    });

    subjectsGrid.innerHTML = displaySubjects.map(subject => `
      <div class="subject-card">
        <div class="textbook-card-header" style="--card-theme-color: ${subject.themeColor};">
          <div class="card-ministry-arc"></div>
          <div class="card-logo-badge">
            <img src="images/logo.png" alt="شعار منصة ذكاء">
          </div>
          <div class="subject-icon-wrap">
            <i class="fas ${subject.icon}"></i>
          </div>
          <h3 class="subject-title">${subject.title}</h3>
          <p class="subject-grade-name">${subject.gradeName}</p>
        </div>
        <div class="subject-card-body">
          <p style="font-size: 0.88rem; color: #64748b; line-height: 1.5;">${subject.description}</p>
          <div class="subject-actions">
            <button class="btn-card-quiz" data-subject-id="${subject.id}" data-grade-name="${subject.gradeName}">
              <i class="fas fa-file-signature"></i> اختبار المادة
            </button>
            <button class="btn-card-book" data-subject-title="${subject.title}" data-grade-name="${subject.gradeName}">
              <span class="wa-icon-3d" style="width: 20px; height: 20px; font-size: 0.72rem;"><i class="fab fa-whatsapp"></i></span>
              <span>حجز المادة</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // ربط أزرار بدء الاختبار
    subjectsGrid.querySelectorAll('.btn-card-quiz').forEach(btn => {
      btn.addEventListener('click', () => {
        const subId = btn.getAttribute('data-subject-id');
        const gradeName = btn.getAttribute('data-grade-name');
        const rawSub = THAKAA_DATA.subjects.find(s => s.id === subId);
        if (rawSub) {
          const activeSub = { ...rawSub, gradeName: gradeName, gradeId: activeGradeId };
          startQuiz(activeSub);
        }
      });
    });

    // ربط أزرار الحجز عبر الواتساب
    subjectsGrid.querySelectorAll('.btn-card-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-subject-title');
        const grade = btn.getAttribute('data-grade-name');
        if (window.openBookingModal) {
          window.openBookingModal(title, grade);
        }
      });
    });
  }

  // 4. بدء تشغيل الاختبار التفاعلي
  function startQuiz(subject) {
    currentQuizSubject = subject;
    currentQuestionIndex = 0;
    userAnswers = new Array(subject.questions.length).fill(null);

    quizSubjectTitle.textContent = `${subject.title} - ${subject.gradeName}`;
    quizResultsBox.style.display = 'none';
    document.getElementById('quizQuestionsContent').style.display = 'block';

    renderCurrentQuestion();
    quizModal.classList.add('active');
  }

  function renderCurrentQuestion() {
    const q = currentQuizSubject.questions[currentQuestionIndex];
    const total = currentQuizSubject.questions.length;

    // تحديث شريط التقدم
    const progressPct = ((currentQuestionIndex + 1) / total) * 100;
    quizProgressBar.style.width = `${progressPct}%`;

    quizQuestionBadge.textContent = `السؤال ${currentQuestionIndex + 1} من ${total} - درجة الصعوبة: [${q.difficulty}]`;
    quizQuestionText.textContent = q.question;

    quizOptionsList.innerHTML = q.options.map((opt, idx) => `
      <div class="quiz-option-item ${userAnswers[currentQuestionIndex] === idx ? 'selected' : ''}" data-index="${idx}">
        <span style="width: 26px; height: 26px; border-radius: 50%; background: var(--bg-alt); display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem;">
          ${String.fromCharCode(65 + idx)}
        </span>
        <span>${opt}</span>
      </div>
    `).join('');

    quizOptionsList.querySelectorAll('.quiz-option-item').forEach(item => {
      item.addEventListener('click', () => {
        const selectedIdx = parseInt(item.getAttribute('data-index'), 10);
        userAnswers[currentQuestionIndex] = selectedIdx;
        renderCurrentQuestion();
      });
    });

    // إدارة أزرار التنقل
    quizPrevBtn.style.display = currentQuestionIndex > 0 ? 'inline-flex' : 'none';
    if (currentQuestionIndex === total - 1) {
      quizNextBtn.style.display = 'none';
      quizSubmitBtn.style.display = 'inline-flex';
    } else {
      quizNextBtn.style.display = 'inline-flex';
      quizSubmitBtn.style.display = 'none';
    }
  }

  // أزرار التالي والسابق والإنهاء
  if (quizPrevBtn) {
    quizPrevBtn.addEventListener('click', () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderCurrentQuestion();
      }
    });
  }

  if (quizNextBtn) {
    quizNextBtn.addEventListener('click', () => {
      if (userAnswers[currentQuestionIndex] === null) {
        showToast('يرجى اختيار إجابة قبل الانتقال للسؤال التالي', 'info');
        return;
      }
      if (currentQuestionIndex < currentQuizSubject.questions.length - 1) {
        currentQuestionIndex++;
        renderCurrentQuestion();
      }
    });
  }

  if (quizSubmitBtn) {
    quizSubmitBtn.addEventListener('click', calculateAndShowResults);
  }

  // 5. احتساب النتيجة ونسبة النجاح
  function calculateAndShowResults() {
    if (userAnswers.includes(null)) {
      showToast('يرجى الإجابة على جميع الأسئلة لإخراج التقييم النهائي', 'info');
      return;
    }

    let correctCount = 0;
    currentQuizSubject.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) correctCount++;
    });

    const total = currentQuizSubject.questions.length;
    const scorePct = Math.round((correctCount / total) * 100);

    document.getElementById('quizQuestionsContent').style.display = 'none';
    quizResultsBox.style.display = 'block';

    quizScorePercentage.textContent = `${scorePct}%`;

    const isPassed = scorePct >= 50;
    if (isPassed) {
      quizResultStatus.innerHTML = `
        <div style="color: #2e7d32; font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">
          🎉 مبروك! لقد اجتزت اختبار المادة بنجاح وتفوق.
        </div>
        <p style="color: #64748b;">أدخل اسمك الكريم لإصدار وشهادة التقدير الرسمية باسمك ورسمها باللوجو والمادة.</p>
      `;
      studentNameInputWrap.style.display = 'block';
    } else {
      quizResultStatus.innerHTML = `
        <div style="color: #c62828; font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">
          للأسف لم تتجاوز نسبة النجاح المطلوب (50%).
        </div>
        <p style="color: #64748b;">يمكنك مراجعة الدروس وإعادة المحاولة مجدداً في أي وقت.</p>
      `;
      studentNameInputWrap.style.display = 'none';
    }

    // زر إصدار الشهادة
    if (generateCertBtn) {
      generateCertBtn.onclick = () => {
        const name = studentNameInput.value.trim();
        if (!name) {
          showToast('يرجى كتابة اسم الطالب رباعياً أو ثلاثياً للإصدار', 'info');
          return;
        }

        // إغلاق نافذة الاختبار وفتح نافذة الشهادة
        quizModal.classList.remove('active');
        openCertificateModal({
          studentName: name,
          subjectTitle: currentQuizSubject.title,
          gradeName: currentQuizSubject.gradeName,
          scorePercentage: scorePct
        });
      };
    }
  }

  // 6. فتح نافذة الشهادة وتوليد الرسمة بالكانفاس
  function openCertificateModal(certData) {
    certModal.classList.add('active');
    if (!certEngine) {
      certEngine = new window.CertificateGenerator('certificateCanvas');
    }
    certEngine.generate(certData);

    if (downloadPdfBtn) {
      downloadPdfBtn.onclick = () => {
        certEngine.downloadPDF(`شهادة_إنجاز_${certData.studentName.replace(/\s+/g, '_')}.pdf`);
        showToast('تم تحميل ملف الـ PDF بنجاح على جهازك!', 'success');
      };
    }

    if (downloadCertBtn) {
      downloadCertBtn.onclick = () => {
        certEngine.downloadPNG(`شهادة_إنجاز_${certData.studentName.replace(/\s+/g, '_')}.png`);
        showToast('تم تحميل صورة الشهادة بنجاح على جهازك!', 'success');
      };
    }
  }

  // إغلاق النوافذ المنبثقة
  if (quizModalClose) {
    quizModalClose.addEventListener('click', () => quizModal.classList.remove('active'));
  }
  if (certModalClose) {
    certModalClose.addEventListener('click', () => certModal.classList.remove('active'));
  }

  // دالة الإشعارات السريعة (Toast Notification)
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  window.showToast = showToast;

  // التشغيل الأولي
  renderStagesTabs();
  renderGradesSubtabs();
  renderSubjects();
});
