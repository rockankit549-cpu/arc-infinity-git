// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Header scroll effect
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetSelector = this.getAttribute('href');
        if (!targetSelector || targetSelector.length === 1) {
            return;
        }

        const target = document.querySelector(targetSelector);
        if (!target) {
            return;
        }

        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Form submission
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');

if (contactForm && successMessage) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        const payload = {
            Name: name,
            Email: email,
            Phone: phone,
            Message: message,
            _subject: name || 'Website enquiry',
            _replyto: email
        };

        try {
            const response = await fetch('https://formsubmit.co/ajax/enquiry@arcinfinitylab.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok || result.success !== 'true') {
                throw new Error('Failed to send message');
            }

            successMessage.textContent = 'Thank you! Your message has been sent successfully.';
            successMessage.classList.remove('error');
            successMessage.classList.add('show');
            contactForm.reset();
        } catch (error) {
            successMessage.textContent = 'Sorry, there was an issue sending your message. Please try again later.';
            successMessage.classList.add('error', 'show');
            console.error(error);
        }

        setTimeout(() => {
            successMessage.classList.remove('show', 'error');
        }, 5000);
    });
}

const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const loginTabs = document.querySelectorAll('.login-tab');
const loginCards = document.querySelectorAll('.login-card[data-type]');
if (loginTabs.length && loginCards.length) {
    loginTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            if (!target) return;

            loginTabs.forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');

            loginCards.forEach(card => {
                card.classList.toggle('active', card.dataset.type === target);
            });
        });
    });
}

// Careers page job management
const jobsList = document.getElementById('jobsList');
const jobsCount = document.getElementById('jobsCount');
const careersJobForm = document.getElementById('jobForm');
const resetJobsButton = document.getElementById('resetJobs');
const CAREER_JOBS_KEY = 'arcCareersJobs';
const defaultJobs = [
    {
        title: 'Senior Material Engineer',
        location: 'Mumbai, India',
        department: 'Quality & Testing',
        type: 'Full-time',
        description: 'Lead concrete and material testing assignments, mentor junior engineers, and collaborate with NABL auditors.',
        applyLink: 'mailto:hr@arcinfinitylab.com?subject=Application%20-%20Senior%20Material%20Engineer'
    },
    {
        title: 'Site Testing Specialist (NDT)',
        location: 'Multiple Cities (PAN India)',
        department: 'Field Services',
        type: 'Contract',
        description: 'Execute on-site non-destructive testing, prepare reports, and coordinate with project stakeholders.',
        applyLink: 'https://forms.gle/arc-ndt-application'
    },
    {
        title: 'Lab Operations Associate',
        location: 'Mumbai, India',
        department: 'Operations',
        type: 'Full-time',
        description: 'Manage daily lab workflows, sample tracking, and documentation in alignment with ISO/IEC 17025 standards.',
        applyLink: 'mailto:hr@arcinfinitylab.com?subject=Application%20-%20Lab%20Operations%20Associate'
    }
];

const loadJobs = () => {
    try {
        const saved = localStorage.getItem(CAREER_JOBS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.warn('Unable to load stored jobs', error);
    }
    return defaultJobs;
};

const isAdminView = Boolean(careersJobForm);
let careersJobs = loadJobs();

const saveJobs = () => {
    try {
        localStorage.setItem(CAREER_JOBS_KEY, JSON.stringify(careersJobs));
    } catch (error) {
        console.warn('Unable to save jobs', error);
    }
};

const renderJobs = () => {
    if (!jobsList) return;
    jobsList.innerHTML = '';

    if (!careersJobs.length) {
        jobsList.innerHTML = '<p class="jobs-empty">No openings are live right now. Please check back soon.</p>';
    } else {
        careersJobs.forEach((job, index) => {
            const card = document.createElement('article');
            card.className = 'job-card';
            card.innerHTML = `
                <div>
                    <h3>${job.title}</h3>
                    <div class="job-meta">
                        <span>${job.location}</span>
                        <span>${job.department}</span>
                    </div>
                </div>
                <div class="job-tags">
                    <span class="job-tag">${job.type}</span>
                    <span class="job-tag">${job.department}</span>
                </div>
                <p>${job.description}</p>
                <div class="job-actions">
                    <a class="cta-button" href="${job.applyLink || 'mailto:hr@arcinfinitylab.com'}" target="_blank" rel="noopener">Apply Now</a>
                    ${isAdminView ? `<button type="button" class="job-remove-btn" data-index="${index}">Remove</button>` : ''}
                </div>
            `;
            jobsList.appendChild(card);
        });
    }

    if (jobsCount) {
        jobsCount.textContent = careersJobs.length;
    }
};

if (jobsList) {
    renderJobs();

    if (isAdminView) {
        careersJobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const job = {
                title: careersJobForm.jobTitle.value.trim(),
                location: careersJobForm.jobLocation.value.trim(),
                department: careersJobForm.jobDepartment.value.trim(),
                type: careersJobForm.jobType.value,
                description: careersJobForm.jobDescription.value.trim(),
                applyLink: careersJobForm.applyLink.value.trim()
            };

            if (!job.title || !job.location || !job.department || !job.description) {
                return;
            }

            careersJobs.push(job);
            saveJobs();
            renderJobs();
            careersJobForm.reset();
        });

        jobsList.addEventListener('click', (event) => {
            const removeBtn = event.target.closest('.job-remove-btn');
            if (!removeBtn) return;

            const index = Number(removeBtn.dataset.index);
            careersJobs.splice(index, 1);
            saveJobs();
            renderJobs();
        });

        if (resetJobsButton) {
            resetJobsButton.addEventListener('click', () => {
                careersJobs = [...defaultJobs];
                localStorage.removeItem(CAREER_JOBS_KEY);
                renderJobs();
            });
        }
    }
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.highlight-card, .service-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Counter animation for highlight numbers
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString() + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString() + '+';
        }
    }, 16);
};

// Trigger counter animation when highlights section is visible
const highlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const numbers = entry.target.querySelectorAll('.highlight-number');
            numbers.forEach(num => {
                const target = parseInt(num.textContent.replace(/[,+]/g, ''));
                if (target) {
                    animateCounter(num, target);
                }
            });
            highlightObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const highlightsSection = document.querySelector('.highlights');
if (highlightsSection) {
    highlightObserver.observe(highlightsSection);
}

// Gallery item click effect
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
            item.style.transform = 'scale(1)';
        }, 200);
    });
});

// Add hover effect to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.borderLeft = '4px solid var(--primary-cyan)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.borderLeft = 'none';
    });
});

// Validate email format
const emailInput = document.getElementById('email');
if (emailInput) {
    emailInput.addEventListener('blur', () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value) && emailInput.value !== '') {
            emailInput.style.borderColor = 'var(--primary-red)';
        } else {
            emailInput.style.borderColor = 'var(--light-gray)';
        }
    });
}

// Add loading animation to CTA button
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        ctaButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            ctaButton.style.transform = 'scale(1)';
        }, 200);
    });
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / 600);
    }
});

// Add pulse animation to scroll indicator
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    setInterval(() => {
        scrollIndicator.style.transform = 'translateX(-50%) scale(1.2)';
        setTimeout(() => {
            scrollIndicator.style.transform = 'translateX(-50%) scale(1)';
        }, 300);
    }, 2000);
}

// Log page load
console.log('ARC Infinity Lab website loaded successfully');
console.log('Established: December 2019');
console.log('NABL Certificate: TC-16777');
