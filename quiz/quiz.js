/* ================================================================
   GEM — Quiz Engine
   Questions are embedded here (bilingual EN/AR).
   Handles: one-question-at-a-time flow, progress, scoring,
            results screen, and canvas confetti for high scores.
================================================================ */

/* ── Questions data (EN + AR) ──────────────────────────────── */
var QUIZ_QUESTIONS = [
    {
        en: {
            question: "Which pharaoh commissioned the construction of the Great Pyramid at Giza?",
            options: ["Ramses II", "Khufu", "Tutankhamun", "Thutmose III"],
            correct: 1
        },
        ar: {
            question: "أي فرعون أمر ببناء الهرم الأكبر في الجيزة؟",
            options: ["رمسيس الثاني", "خوفو", "توت عنخ آمون", "تحتمس الثالث"],
            correct: 1
        }
    },
    {
        en: {
            question: "Which jackal-headed god was the guardian of the dead in ancient Egypt?",
            options: ["Ra", "Osiris", "Horus", "Anubis"],
            correct: 3
        },
        ar: {
            question: "أي إله برأس الابن الآوي كان حارس الأموات في مصر القديمة؟",
            options: ["رع", "أوزيريس", "حورس", "أنوبيس"],
            correct: 3
        }
    },
    {
        en: {
            question: "What writing system did the ancient Egyptians use?",
            options: ["Cuneiform", "Linear B", "Hieroglyphics", "Sanskrit"],
            correct: 2
        },
        ar: {
            question: "ما نظام الكتابة الذي استخدمه المصريون القدماء؟",
            options: ["الكتابة المسمارية", "الخط الخطي ب", "الهيروغليفية", "السنسكريتية"],
            correct: 2
        }
    },
    {
        en: {
            question: "The golden burial mask of Tutankhamun is estimated to weigh approximately:",
            options: ["5 kg", "10 kg", "15 kg", "20 kg"],
            correct: 1
        },
        ar: {
            question: "يُقدَّر وزن القناع الذهبي الجنائزي لتوت عنخ آمون بحوالي:",
            options: ["٥ كجم", "١٠ كجم", "١٥ كجم", "٢٠ كجم"],
            correct: 1
        }
    },
    {
        en: {
            question: "What does the term 'Pharaoh' literally mean?",
            options: ["God on Earth", "King of Kings", "Great House", "Ruler of the Nile"],
            correct: 2
        },
        ar: {
            question: "ماذا تعني كلمة «فرعون» حرفياً؟",
            options: ["إله على الأرض", "ملك الملوك", "البيت العظيم", "حاكم النيل"],
            correct: 2
        }
    },
    {
        en: {
            question: "Which natural salt was used to dehydrate and preserve mummies?",
            options: ["Fine sand", "Beeswax", "Natron", "Olive oil"],
            correct: 2
        },
        ar: {
            question: "أي ملح طبيعي استُخدم لتجفيف وحفظ المومياء؟",
            options: ["الرمل الناعم", "شمع العسل", "النطرون", "زيت الزيتون"],
            correct: 2
        }
    },
    {
        en: {
            question: "The Great Sphinx at Giza is believed to bear the face of which pharaoh?",
            options: ["Khufu", "Sneferu", "Thutmose III", "Khafre"],
            correct: 3
        },
        ar: {
            question: "يُعتقد أن أبو الهول في الجيزة يحمل وجه أي فرعون؟",
            options: ["خوفو", "سنفرو", "تحتمس الثالث", "خفرع"],
            correct: 3
        }
    },
    {
        en: {
            question: "Approximately how long did Ramses II rule Egypt?",
            options: ["About 30 years", "About 45 years", "About 66 years", "About 90 years"],
            correct: 2
        },
        ar: {
            question: "كم من الوقت حكم رمسيس الثاني مصر تقريباً؟",
            options: ["نحو ٣٠ عاماً", "نحو ٤٥ عاماً", "نحو ٦٦ عاماً", "نحو ٩٠ عاماً"],
            correct: 2
        }
    },
    {
        en: {
            question: "What was the ancient Egyptian paradise in the afterlife called?",
            options: ["Elysium", "Valhalla", "Aaru (Field of Reeds)", "Limbo"],
            correct: 2
        },
        ar: {
            question: "ما اسم جنة الآخرة عند المصريين القدماء؟",
            options: ["إليزيوم", "فالهالا", "آرو (حقل القصب)", "اللمبو"],
            correct: 2
        }
    },
    {
        en: {
            question: "Which queen ruled Egypt as pharaoh and wore a ceremonial false beard?",
            options: ["Nefertiti", "Cleopatra VII", "Hatshepsut", "Ankhesenamun"],
            correct: 2
        },
        ar: {
            question: "أي ملكة حكمت مصر بوصفها فرعوناً وارتدت لحية مستعارة في الاحتفالات؟",
            options: ["نفرتيتي", "كليوباترا السابعة", "حتشبسوت", "عنخ إيس آمون"],
            correct: 2
        }
    }
];

/* ================================================================
   QUIZ ENGINE
================================================================ */
(function () {
    'use strict';

    /* ── State ──────────────────────────────────────────────── */
    var questions = [];
    var current   = 0;
    var score     = 0;
    var answered  = false;

    /* ── DOM refs ───────────────────────────────────────────── */
    var heroSection    = document.getElementById('quizHero');
    var quizSection    = document.getElementById('quizSection');
    var resultsSection = document.getElementById('quizResults');

    var startBtn  = document.getElementById('quizStartBtn');
    var retryBtn  = document.getElementById('quizRetryBtn');

    var elCurrent   = document.getElementById('quizCurrent');
    var elTotal     = document.getElementById('quizTotal');
    var elLiveScore = document.getElementById('quizLiveScore');
    var elFill      = document.getElementById('quizProgressFill');

    var elCard         = document.getElementById('quizCard');
    var elQNum         = document.getElementById('quizQNum');
    var elQuestion     = document.getElementById('quizQuestion');
    var elOptions      = document.getElementById('quizOptions');
    var elFeedback     = document.getElementById('quizFeedback');
    var elFeedbackIcon = document.getElementById('quizFeedbackIcon');
    var elFeedbackText = document.getElementById('quizFeedbackText');
    var elNextBtn      = document.getElementById('quizNextBtn');
    var elNextLabel    = document.getElementById('quizNextLabel');
    var elNextIcon     = document.getElementById('quizNextIcon');

    var elScoreNum  = document.getElementById('quizScoreNum');
    var elRankTitle = document.getElementById('quizRankTitle');
    var elRankSub   = document.getElementById('quizRankSub');

    /* ── Language helper ────────────────────────────────────── */
    function getLang() {
        return document.documentElement.lang === 'ar' ? 'ar' : 'en';
    }

    /* ── Build question list for current language ───────────── */
    function buildQuestions() {
        var lang = getLang();
        questions = QUIZ_QUESTIONS.map(function (q) {
            return q[lang] || q['en'];
        });
    }

    /* ── Rank data ──────────────────────────────────────────── */
    function getRank(s) {
        var ar = getLang() === 'ar';
        if (s >= 9) return {
            icon:  'fa-crown',
            title: ar ? 'عالم فرعوني'   : 'Pharaoh Scholar',
            sub:   ar ? 'معرفة استثنائية بمصر القديمة!' : 'Outstanding knowledge of ancient Egypt!'
        };
        if (s >= 7) return {
            icon:  'fa-compass',
            title: ar ? 'مستكشف ماهر'   : 'Skilled Explorer',
            sub:   ar ? 'فهم رائع للتاريخ الفرعوني!' : 'Great understanding of pharaonic history!'
        };
        if (s >= 4) return {
            icon:  'fa-scroll',
            title: ar ? 'زائر فضولي'    : 'Curious Visitor',
            sub:   ar ? 'واصل الاستكشاف — مصر تكشف المزيد.' : 'Keep exploring — Egypt has more to reveal.'
        };
        return {
            icon:  'fa-seedling',
            title: ar ? 'مبتدئ'         : 'Beginner',
            sub:   ar ? 'كل رحلة تبدأ بخطوة واحدة.' : 'Every journey begins with a single step.'
        };
    }

    /* ── Show / hide ────────────────────────────────────────── */
    function show(el) { el.style.display = ''; }
    function hide(el) { el.style.display = 'none'; }

    /* ── Render question ────────────────────────────────────── */
    function renderQuestion(idx) {
        var q      = questions[idx];
        var total  = questions.length;
        var lang   = getLang();
        var isLast = idx === total - 1;
        var letters = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];

        answered = false;

        /* Progress */
        var pct = Math.round(((idx + 1) / total) * 100);
        elFill.style.width      = pct + '%';
        elCurrent.textContent   = idx + 1;
        elTotal.textContent     = total;
        elLiveScore.textContent = score;

        /* Question */
        elQNum.textContent     = String(idx + 1).padStart(2, '0');
        elQuestion.textContent = q.question;

        /* Options */
        elOptions.innerHTML = '';
        q.options.forEach(function (opt, i) {
            var btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.setAttribute('data-index', i);
            btn.innerHTML =
                '<span class="quiz-option-letter">' + letters[i] + '</span>' +
                '<span class="quiz-option-text">'   + opt         + '</span>';
            btn.addEventListener('click', function () { handleAnswer(i, q.correct); });
            elOptions.appendChild(btn);
        });

        /* Reset UI */
        hide(elFeedback);
        hide(elNextBtn);

        /* Last question label */
        if (isLast) {
            elNextLabel.textContent = lang === 'ar' ? 'اعرض النتيجة' : 'See Results';
            elNextIcon.className    = 'fa-solid fa-flag-checkered';
        } else {
            elNextLabel.textContent = lang === 'ar' ? 'التالي' : 'Next';
            elNextIcon.className    = 'fa-solid fa-arrow-right';
        }

        /* Re-trigger card fade-in */
        elCard.style.animation = 'none';
        void elCard.offsetWidth;
        elCard.style.animation = '';
    }

    /* ── Handle answer click ────────────────────────────────── */
    function handleAnswer(chosen, correctIdx) {
        if (answered) return;
        answered = true;

        var opts = elOptions.querySelectorAll('.quiz-option');

        opts.forEach(function (opt) { opt.classList.add('disabled'); });
        opts[correctIdx].classList.add('correct');

        if (chosen === correctIdx) {
            score++;
            elLiveScore.textContent = score;
            showFeedback(true);
        } else {
            opts[chosen].classList.add('wrong');
            showFeedback(false);
        }

        show(elNextBtn);
    }

    /* ── Feedback bar ───────────────────────────────────────── */
    function showFeedback(isCorrect) {
        elFeedback.className = 'quiz-feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');
        elFeedbackIcon.className = isCorrect
            ? 'fa-solid fa-circle-check'
            : 'fa-solid fa-circle-xmark';
        elFeedbackText.textContent = getLang() === 'ar'
            ? (isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة!')
            : (isCorrect ? 'Correct!'      : 'Wrong!');
        show(elFeedback);
    }

    /* ── Next button ────────────────────────────────────────── */
    elNextBtn.addEventListener('click', function () {
        current++;
        if (current >= questions.length) {
            showResults();
        } else {
            renderQuestion(current);
        }
    });

    /* ── Results screen ─────────────────────────────────────── */
    function showResults() {
        hide(quizSection);
        show(resultsSection);

        elScoreNum.textContent = score;

        var rank = getRank(score);
        document.getElementById('quizEmblemIcon').className = 'fa-solid ' + rank.icon;
        elRankTitle.textContent = rank.title;
        elRankSub.textContent   = rank.sub;

        if (score >= 7) startConfetti();
    }

    /* ── Start / restart ────────────────────────────────────── */
    function startQuiz() {
        buildQuestions();
        current  = 0;
        score    = 0;

        hide(heroSection);
        hide(resultsSection);
        show(quizSection);

        renderQuestion(0);
    }

    startBtn.addEventListener('click', startQuiz);
    retryBtn.addEventListener('click', function () { stopConfetti(); startQuiz(); });

    /* ================================================================
       CONFETTI (canvas-based, no library)
    ================================================================ */
    var canvas    = document.getElementById('quizConfetti');
    var ctx       = canvas.getContext('2d');
    var particles = [];
    var rafId     = null;
    var COLORS    = ['#F5CA56', '#C47A2C', '#E6C58A', '#ffffff', '#ffdd88', '#c9852b'];

    function Particle() { this.reset(); }

    Particle.prototype.reset = function () {
        this.x    = Math.random() * canvas.width;
        this.y    = -10;
        this.w    = 6  + Math.random() * 8;
        this.h    = 6  + Math.random() * 6;
        this.vy   = 2  + Math.random() * 3;
        this.vx   = (Math.random() - 0.5) * 1.5;
        this.rot  = Math.random() * Math.PI * 2;
        this.rotV = (Math.random() - 0.5) * 0.12;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    };

    Particle.prototype.update = function () {
        this.y += this.vy; this.x += this.vx; this.rot += this.rotV;
        if (this.y > canvas.height + 20) this.reset();
    };

    Particle.prototype.draw = function () {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    };

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function (p) { p.update(); p.draw(); });
        rafId = requestAnimationFrame(animateConfetti);
    }

    function startConfetti() {
        resizeCanvas();
        canvas.style.display = 'block';
        particles = [];
        for (var i = 0; i < 120; i++) {
            var p = new Particle();
            p.y = -Math.random() * canvas.height * 0.6;
            particles.push(p);
        }
        animateConfetti();
        setTimeout(stopConfetti, 5000);
    }

    function stopConfetti() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        if (ctx)    ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        particles = [];
    }

    window.addEventListener('resize', function () {
        if (canvas.style.display !== 'none') resizeCanvas();
    });

})();
