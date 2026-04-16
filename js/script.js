// === LANGUAGE SYSTEM ===
let currentLang = 'en'

function setLang(lang) {
    currentLang = lang;

    // Update all elements with data-en/data-id
    document.querySelectorAll('[data-en]').forEach(el => {
        const text = lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
        if (text) el.innerHTML = text;
    });

    // Update placeholder
    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
        const ph = lang === 'id' ? el.getAttribute('data-placeholder-id') : el.getAttribute('data-placeholder-en');
        if (ph) el.placeholder = ph;
    });

    // Toggle active button - desktop
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-id').classList.toggle('active', lang === 'id');

    // Toggle active button - mobile
    const btnEnM = document.getElementById('btn-en-m');
    const btnIdM = document.getElementById('btn-id-m');
    if (btnEnM) btnEnM.classList.toggle('active', lang === 'en');
    if (btnIdM) btnIdM.classList.toggle('active', lang === 'id');

    // Store lang preference
    localStorage.setItem('lang', lang);
}

// === NAVBAR SCROLL ===
const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// === HAMBURGER ===
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const icon = hamburger.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close Mobile Menu on Link Click
document.querySelectorAll('.mobile-nav').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        const icon = hamburger.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// === SCROLL ANIMATION (IntersectionObserver) ===
// ===== SCROLL ANIMATION (IntersectionObserver) =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up, .fade-up-delay').forEach(el => observer.observe(el));

// === SKILL BARS ANIMATION === 
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(bar => {
            bar.classList.add('animated');
        });
        }
    });
}, { threshold: 0.3 });

const skillSection = document.getElementById('skills');
if (skillSection) skillObserver.observe(skillSection);

// === PROJECT FILTER ===
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
            setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => { card.style.display = 'none'; }, 300);
        }
        });
    });
});

// === CONTACT FORM ===
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('form-success');
const errorMsg = document.getElementById('form-error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    const payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim(),
    };

    try {
        // === CHANGE THIS URL TO YOUR FLASK BACKEND ===
        const response = await fetch('http://localhost:5000/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        });

        if (response.ok) {
        successMsg.classList.remove('hidden');
        form.reset();
        } else {
        errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        // If backend not connected, show demo success
        console.warn('Backend not connected. Demo mode active.');
        successMsg.classList.remove('hidden');
        form.reset();
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> <span data-en="Send Message" data-id="Kirim Pesan">${currentLang === 'id' ? 'Kirim Pesan' : 'Send Message'}</span>`;
    }
});

// === ACTIVE NAV HIGHLIGHT ON SCROLL ===
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
        navLinks.forEach(link => {
            link.classList.remove('text-primary-dark', 'font-semibold');
            if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('text-primary-dark', 'font-semibold');
            }
        });
        }
    });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);

    // Trigger hero fade-up immediately
    document.querySelectorAll('.hero-text, .fade-up').forEach(el => {
        setTimeout(() => el.classList.add('visible'), 200);
    });
});

// === BACK TOP ===
const backTop = document.getElementById('back-top');

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    navbar.classList.toggle('scrolled', scrolled > 20);
    if (backTop) backTop.style.opacity = scrolled > 400 ? '1' : '0';
    if (progress) {
        const pct = (scrolled / (document.body.scrollHeight - window.innerHeight)) * 100;
        progress.style.width = pct + '%';
    }
});
