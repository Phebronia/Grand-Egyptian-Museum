/* ================================================================
   GEM — Tutankhamun Health Page · JavaScript
   Section 1: hero only (scroll indicator is CSS-only, nothing needed here)
   Sections 2–6 will add their logic below progressively.
================================================================ */

(function () {
    'use strict';

    var lang = document.documentElement.lang || 'en';

    /* ── Section 2: Body Diagram ── */
    var CONDITIONS = {
        head: {
            tag:      { en: 'Bone Disease',      ar: 'أمراض العظام'      },
            title:    { en: 'Skull & Bone Necrosis', ar: 'نخر العظام والجمجمة' },
            body:     {
                en: 'CT scans from the 2005 Egyptian Mummy Project revealed avascular necrosis in multiple bones — a condition where blood supply is cut off, causing bone tissue to die. This was found in Tutankhamun\'s left foot and other skeletal regions, likely linked to genetic inbreeding within the royal family.',
                ar: 'كشفت الأشعة المقطعية لعام ٢٠٠٥ عن نخر لاوعائي في عدة عظام — حالة تنقطع فيها إمدادات الدم مما يؤدي إلى موت أنسجة العظام. وُجد ذلك في قدمه اليسرى ومناطق هيكلية أخرى، ويُرجَّح أن السبب التزاوج الداخلي في الأسرة المالكة.'
            },
            evidence: {
                en: 'CT scan analysis (2005 Egyptian Mummy Project) + DNA study (JAMA, 2010)',
                ar: 'تحليل الأشعة المقطعية (٢٠٠٥) + دراسة الحمض النووي (JAMA، ٢٠١٠)'
            }
        },
        mouth: {
            tag:      { en: 'Congenital Defect', ar: 'عيب خلقي'           },
            title:    { en: 'Cleft Palate',       ar: 'الشق الحنكي'        },
            body:     {
                en: 'Physical examination of the mummy identified a cleft palate — a congenital split in the roof of the mouth — consistent with conditions associated with close inbreeding. The 2010 DNA study confirmed that Tutankhamun\'s parents were siblings, which significantly increases the likelihood of such congenital anomalies.',
                ar: 'كشف الفحص الجسدي للمومياء عن شق حنكي — انشقاق خلقي في سقف الفم — يتسق مع الحالات المرتبطة بالتزاوج الداخلي الوثيق. أكدت دراسة الحمض النووي ٢٠١٠ أن والديه كانا أشقاء، مما يزيد احتمالية مثل هذه التشوهات الخلقية.'
            },
            evidence: {
                en: 'Physical mummy examination + DNA parentage analysis (JAMA, 2010)',
                ar: 'فحص المومياء الجسدي + تحليل نسب الحمض النووي (JAMA، ٢٠١٠)'
            }
        },
        thigh: {
            tag:      { en: 'Köhler Disease',    ar: 'داء كولر'           },
            title:    { en: 'Bone Death in Left Thigh', ar: 'موت العظم في الفخذ الأيسر' },
            body:     {
                en: 'Imaging studies identified Köhler disease II — necrosis of the metatarsal bones of the foot. This condition affects the blood supply to the foot bones and was found in the second and third metatarsal of the left foot. Combined with a clubfoot deformity, Tutankhamun would have walked with a significant limp and relied on walking sticks — over 130 of which were found in his tomb.',
                ar: 'حددت الدراسات التصويرية داء كولر الثاني — نخر عظام مشط القدم. تؤثر هذه الحالة على إمداد الدم لعظام القدم ووُجدت في عظمتي مشط القدم الثانية والثالثة في القدم اليسرى. مع تشوه القدم الحنفاء، كان توت عنخ آمون يمشي بعرج واضح معتمداً على العصي — وُجد منها أكثر من ١٣٠ عصا في مقبرته.'
            },
            evidence: {
                en: 'CT imaging + over 130 walking canes found in tomb KV62 (Carter, 1922)',
                ar: 'التصوير المقطعي + أكثر من ١٣٠ عصا وُجدت في مقبرة KV62 (كارتر، ١٩٢٢)'
            }
        },
        foot: {
            tag:      { en: 'Clubfoot',          ar: 'القدم الحنفاء'      },
            title:    { en: 'Clubfoot Deformity', ar: 'تشوه القدم الحنفاء' },
            body:     {
                en: 'Tutankhamun had a congenital clubfoot (talipes equinovarus) — a condition in which the foot is twisted inward and downward. The 2010 DNA study found evidence of this in the skeletal remains. Artistic depictions show the king seated while performing royal duties such as archery, which would be consistent with difficulty standing for prolonged periods.',
                ar: 'عانى توت عنخ آمون من القدم الحنفاء الخلقية — حالة يكون فيها القدم ملتوياً للداخل وللأسفل. وجدت دراسة الحمض النووي ٢٠١٠ أدلة على ذلك في بقايا الهيكل العظمي. تُظهر التصويرات الفنية الملك جالساً أثناء أداء واجباته الملكية كالرماية، مما يتسق مع صعوبة الوقوف لفترات طويلة.'
            },
            evidence: {
                en: 'DNA study (JAMA 2010) + CT scan + tomb paintings showing the king seated',
                ar: 'دراسة الحمض النووي (JAMA 2010) + الأشعة المقطعية + رسومات المقبرة'
            }
        },
        blood: {
            tag:      { en: 'Infectious Disease', ar: 'مرض معدٍ'          },
            title:    { en: 'Malaria Infection',  ar: 'الإصابة بالملاريا'  },
            body:     {
                en: 'The 2010 DNA study (JAMA) detected DNA from Plasmodium falciparum — the parasite that causes malaria — in Tutankhamun\'s remains. He carried genetic material from at least four strains of the parasite. Combined with his other conditions, this recurrent infection likely severely weakened his immune system. Some researchers believe malaria, acting together with his bone diseases and leg fracture, was a contributing cause of death.',
                ar: 'اكتشفت دراسة الحمض النووي ٢٠١٠ (JAMA) حمض نووي لطفيل المتصورة المنجلية — الطفيل المسبب للملاريا — في رفات توت عنخ آمون. كان يحمل مادة وراثية من أربعة سلالات على الأقل من الطفيل. إلى جانب حالاته الأخرى، ربما أضعف هذا الإصابة المتكررة جهازه المناعي بشدة. يرى بعض الباحثين أن الملاريا، بالاقتران مع أمراض عظامه وكسر ساقه، كانت سبباً مساهماً في وفاته.'
            },
            evidence: {
                en: 'Plasmodium falciparum DNA detected in bone and tissue samples (JAMA, 2010)',
                ar: 'تم اكتشاف الحمض النووي للمتصورة المنجلية في عينات العظام والأنسجة (JAMA، ٢٠١٠)'
            }
        }
    };

    var hotspots  = document.querySelectorAll('.th-hotspot');
    var panelIdle = document.getElementById('thPanelIdle');
    var panelContent = document.getElementById('thPanelContent');
    var panelTag  = document.getElementById('thPanelTag');
    var panelTitle = document.getElementById('thPanelTitle');
    var panelBody  = document.getElementById('thPanelBody');
    var panelEvidence = document.getElementById('thPanelEvidence');
    var closeBtn  = document.getElementById('thPanelClose');

    function showCondition(key) {
        var c = CONDITIONS[key];
        if (!c) return;
        var l = lang;
        panelTag.textContent      = c.tag[l]      || c.tag.en;
        panelTitle.textContent    = c.title[l]    || c.title.en;
        panelBody.textContent     = c.body[l]     || c.body.en;
        panelEvidence.textContent = c.evidence[l] || c.evidence.en;

        panelIdle.hidden    = true;
        panelContent.hidden = false;

        hotspots.forEach(function (hs) { hs.classList.remove('th-hs-active'); });
        var active = document.querySelector('.th-hotspot[data-condition="' + key + '"]');
        if (active) active.classList.add('th-hs-active');
    }

    function closePanel() {
        panelIdle.hidden    = false;
        panelContent.hidden = true;
        hotspots.forEach(function (hs) { hs.classList.remove('th-hs-active'); });
    }

    hotspots.forEach(function (hs) {
        hs.addEventListener('click', function () {
            showCondition(hs.dataset.condition);
        });
        hs.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showCondition(hs.dataset.condition);
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closePanel);
    }

    /* Keep lang in sync if user switches language */
    document.addEventListener('langchange', function (e) {
        lang = e.detail || document.documentElement.lang || 'en';
        var active = document.querySelector('.th-hotspot.th-hs-active');
        if (active) showCondition(active.dataset.condition);
    });

    /* ── Section 5: Timeline scroll-reveal ── */
    var tlItems = document.querySelectorAll('.th-tl-reveal');

    if ('IntersectionObserver' in window && tlItems.length) {
        var tlObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('th-visible');
                    tlObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        tlItems.forEach(function (el, i) {
            el.style.transitionDelay = (i * 0.1) + 's';
            tlObs.observe(el);
        });
    } else {
        tlItems.forEach(function (el) { el.classList.add('th-visible'); });
    }

    /* ── Section 6: References accordion ── */
    var accTriggers = document.querySelectorAll('.th-acc-trigger');

    accTriggers.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item   = btn.closest('.th-acc-item');
            var body   = item.querySelector('.th-acc-body');
            var isOpen = item.classList.contains('th-acc-open');

            /* Close all */
            document.querySelectorAll('.th-acc-item').forEach(function (it) {
                it.classList.remove('th-acc-open');
                it.querySelector('.th-acc-trigger').setAttribute('aria-expanded', 'false');
                it.querySelector('.th-acc-body').hidden = true;
            });

            /* Open clicked (unless it was already open) */
            if (!isOpen) {
                item.classList.add('th-acc-open');
                btn.setAttribute('aria-expanded', 'true');
                body.hidden = false;
            }
        });
    });

})();
