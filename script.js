// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

const CUSTOMER_PROFILE_KEY = 'arc_customer_profile';
const EMPLOYEE_PROFILE_KEY = 'arc_employee_profile';
const CLIENTS_TABLE_KEY = 'arc_clients_table';
const TESTS_TABLE_KEY = 'arc_tests_table';
const REPORT_UPLOAD_KEY = 'arc_report_uploads';
const DASHBOARD_PATH = '/client-dashboard';
const DASHBOARD_HTML_PATH = '/client-dashboard.html';
const EMPLOYEE_PORTAL_PATH = '/employee-portal';
const EMPLOYEE_PORTAL_HTML_PATH = '/employee-portal.html';

const safeJSONParse = (value, fallback = null) => {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn('Unable to parse stored data', error);
        return fallback;
    }
};

const readStoredJSON = (key, fallback = null) => {
    try {
        const raw = localStorage.getItem(key);
        return safeJSONParse(raw, fallback);
    } catch {
        return fallback;
    }
};

const writeStoredJSON = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('Unable to persist data', error);
    }
};

const formatNameFromEmail = (email) => {
    if (!email) return 'ARC Client';
    const base = email.split('@')[0] || email;
    return base.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const normalizeTestRef = (ref) => (ref || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const getStoredUserProfile = () => {
    const employee = readStoredJSON(EMPLOYEE_PROFILE_KEY);
    const customer = readStoredJSON(CUSTOMER_PROFILE_KEY);
    return employee || customer || null;
};

const normalizeRoles = (roles) => {
    if (!roles) return [];
    if (Array.isArray(roles)) return roles.map((r) => String(r || '').toLowerCase());
    if (typeof roles === 'string') return [roles.toLowerCase()];
    return [];
};

const isEmployeeUser = (user) => {
    const roleList =
        normalizeRoles(user?.app_metadata?.roles) ||
        normalizeRoles(user?.user_metadata?.roles);
    const metaRole = (user?.user_metadata?.role || '').toLowerCase();
    const storedRole = (getStoredUserProfile()?.role || '').toLowerCase();
    const hasSession = Boolean(user) || checkUserLoginStatus();
    if (!hasSession) return false;

    return (
        roleList.includes('employee') ||
        roleList.includes('admin') ||
        metaRole === 'employee' ||
        metaRole === 'admin' ||
        storedRole === 'employee'
    );
};

const checkUserLoginStatus = () => {
    const legacyFlag = localStorage.getItem('isLoggedIn') === 'true';
    const hasSession = Boolean(localStorage.getItem('arc_session'));
    return Boolean(legacyFlag || hasSession || getStoredUserProfile());
};

const getUserData = () => {
    const stored = safeJSONParse(localStorage.getItem('userData'), null);
    const profile = getStoredUserProfile();
    if (stored && (stored.name || stored.email)) return stored;
    if (profile) return profile;
    return { name: 'Account' };
};

document.addEventListener('DOMContentLoaded', () => {
    const userPill = document.getElementById('nav-user-pill');
    const navUserName = document.getElementById('nav-user-name');
    const navUserAvatar = document.getElementById('nav-user-avatar');
    if (!userPill || !navUserName || !navUserAvatar) return;

    if (checkUserLoginStatus()) {
        const userData = getUserData() || {};
        const displayName = userData.name || userData.email || 'Account';
        navUserName.textContent = displayName;
        const initials = (displayName || 'A').trim().charAt(0).toUpperCase() || 'A';
        navUserAvatar.textContent = initials;
        userPill.classList.add('show');
    } else {
        userPill.classList.remove('show');
    }
});

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

const loginForms = document.querySelectorAll('[data-login-form]');
if (loginForms.length) {
    loginForms.forEach((form) => {
        const loginFeedback = form.querySelector('[data-login-feedback]');
        const submitButton = form.querySelector('button[type="submit"]');
        const role = form.dataset.loginForm || 'customer';
        const redirectTarget = form.dataset.redirect || 'index.html#home';

        const setLoginFeedback = (status, message) => {
            if (!loginFeedback) return;
            loginFeedback.textContent = message || '';
            loginFeedback.classList.remove('success', 'error');
            if (status && status !== 'info') {
                loginFeedback.classList.add(status);
            }
        };

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const userIdInput = form.querySelector('[data-user-id-input]');
            const passwordInput = form.querySelector('input[type="password"]');
            if (!userIdInput) return;

            const email = emailInput ? emailInput.value.trim() : '';
            const userId = userIdInput.value.trim();
            const password = passwordInput ? passwordInput.value : '';

            if (!userId) {
                setLoginFeedback('error', 'Please enter your user ID.');
                return;
            }

            if (emailInput && !email) {
                setLoginFeedback('error', 'Please enter your email.');
                return;
            }

            if (passwordInput && !password) {
                setLoginFeedback('error', 'Please enter your password.');
                return;
            }

            setLoginFeedback('info', 'Signing you in...');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Signing in...';
            }

            try {
                const payload = {
                    role,
                    userId,
                    password: password || userId,
                };
                if (email) {
                    payload.email = email;
                }

                const response = await fetch('/.netlify/functions/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const result = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(result.message || 'Unable to sign in.');
                }

                if (result.token) {
                    localStorage.setItem('arc_session', result.token);
                }

                const profileKey = role === 'employee' ? EMPLOYEE_PROFILE_KEY : CUSTOMER_PROFILE_KEY;
                writeStoredJSON(profileKey, {
                    email: email || '',
                    userId,
                    name: email ? formatNameFromEmail(email) : userId,
                    role,
                    lastLogin: new Date().toISOString(),
                });

                setLoginFeedback('success', 'Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = redirectTarget;
                }, 1200);
            } catch (error) {
                console.error('Login failed:', error);
                setLoginFeedback('error', error.message || 'Login failed. Please try again.');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Login';
                }
            }
        });
    });
}

const STORAGE_KEY_MAP = {
    clients: CLIENTS_TABLE_KEY,
    tests: TESTS_TABLE_KEY,
};

const defaultRecordSet = [
    {
        testRef: 'ARC/TR/2025/001',
        jobNo: 'JOB-7842',
        dateReceived: '10-Jan-2025',
        material: 'Concrete Cube',
        testParameter: 'Compressive Strength',
        sampleId: 'C-101',
        grade: 'M40',
        castingDate: '05-Jan-2025',
        age: '7 days',
        testingDate: '12-Jan-2025',
        expectedDate: '13-Jan-2025',
        report: 'ARC_TR_2025_001.pdf',
    },
    {
        testRef: 'ARC/TR/2025/014',
        jobNo: 'JOB-7920',
        dateReceived: '08-Jan-2025',
        material: 'Steel Bar',
        testParameter: 'Tensile Strength',
        sampleId: 'S-210',
        grade: 'Fe500',
        castingDate: '30-Dec-2024',
        age: '14 days',
        testingDate: '13-Jan-2025',
        expectedDate: '15-Jan-2025',
        report: '',
    }
];

const serializeTableBody = (tbody) => {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    return rows
        .map((row) =>
            Array.from(row.children).map((cell) =>
                (cell.textContent || '').replace(/\u00a0/g, ' ').trim()
            )
        )
        .filter((row) => row.some((cell) => cell));
};

const renderRowsToTable = (tbody, rows) => {
    if (!Array.isArray(rows)) return;
    tbody.innerHTML = '';
    rows.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((cellValue) => {
            const td = document.createElement('td');
            td.textContent = cellValue || '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
};

const hydrateEditableTables = () => {
    const tableBodies = document.querySelectorAll('[data-table-body]');
    tableBodies.forEach((tbody) => {
        const keyName = STORAGE_KEY_MAP[tbody.dataset.storageKey];
        if (!keyName) return;

        const storedRows = readStoredJSON(keyName, []);
        if (Array.isArray(storedRows) && storedRows.length) {
            renderRowsToTable(tbody, storedRows);
        }

        let saveTimer;
        const scheduleSave = () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                const data = serializeTableBody(tbody);
                writeStoredJSON(keyName, data);
            }, 300);
        };

        ['input', 'paste', 'blur'].forEach((evt) => {
            tbody.addEventListener(evt, scheduleSave);
        });
    });
};

hydrateEditableTables();

const customerSummary = document.querySelector('[data-customer-summary]');
const recordsTableBody = document.querySelector('[data-records-body]');
let activeRecordData = [];

const mapRowToRecord = (row) => ({
    testRef: row[0] || 'Pending',
    jobNo: row[1] || '—',
    dateReceived: row[2] || '—',
    material: row[3] || '—',
    testParameter: row[4] || '—',
    sampleId: row[5] || '—',
    grade: row[6] || '—',
    castingDate: row[7] || '—',
    age: row[8] || '—',
    testingDate: row[9] || '—',
    expectedDate: row[10] || '—',
});

const renderRecordsTable = (records, uploads) => {
    if (!recordsTableBody) return;
    const uploadMap = new Map();
    uploads.forEach((upload) => {
        if (upload.testRef) {
            uploadMap.set(normalizeTestRef(upload.testRef), upload);
        }
    });

    recordsTableBody.innerHTML = '';
    records.forEach((record) => {
        const upload = uploadMap.get(normalizeTestRef(record.testRef));
        const tr = document.createElement('tr');
        const cells = [
            record.testRef,
            record.jobNo,
            record.dateReceived,
            record.material,
            record.testParameter,
            record.sampleId,
            record.grade,
            record.castingDate,
            record.age,
            record.testingDate,
            record.expectedDate,
        ];

        cells.forEach((value) => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });

        const reportCell = document.createElement('td');
        if (upload && upload.fileName) {
            const link = document.createElement('a');
            link.href = upload.downloadUrl || '#';
            link.textContent = upload.fileName;
            link.className = 'report-link';
            link.setAttribute('target', '_blank');
            reportCell.appendChild(link);
        } else if (record.report) {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = record.report;
            link.className = 'report-link';
            reportCell.appendChild(link);
        } else {
            const badge = document.createElement('span');
            badge.className = 'status-pill pending';
            badge.textContent = 'Pending';
            reportCell.appendChild(badge);
        }
        tr.appendChild(reportCell);
        recordsTableBody.appendChild(tr);
    });
};

const exportRecordsToCSV = (records, uploads) => {
    if (!records.length) return;
    const uploadMap = new Map();
    uploads.forEach((upload) => {
        uploadMap.set(normalizeTestRef(upload.testRef), upload.fileName || '');
    });

    const headers = [
        'Test Ref. No.',
        'Job No.',
        'Date Sample Received',
        'Material',
        'Test Parameter',
        'ID',
        'Grade',
        'Date of Casting',
        'Age',
        'Testing Date',
        'Expected Result Date',
        'Report File',
    ];

    const rows = records.map((record) => [
        record.testRef,
        record.jobNo,
        record.dateReceived,
        record.material,
        record.testParameter,
        record.sampleId,
        record.grade,
        record.castingDate,
        record.age,
        record.testingDate,
        record.expectedDate,
        uploadMap.get(normalizeTestRef(record.testRef)) || record.report || 'Pending',
    ]);

    const csvContent = [headers, ...rows]
        .map((row) =>
            row
                .map((value) => `"${(value || '').replace(/"/g, '""')}"`)
                .join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arc-testing-records.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

if (recordsTableBody) {
    const profile = readStoredJSON(CUSTOMER_PROFILE_KEY, null);
    if (profile && customerSummary) {
        const fields = {
            name: profile.name || profile.clientName,
            project: profile.project || 'Material Compliance Program',
            location: profile.location || 'Mumbai, India',
            contact: profile.email || profile.userId,
            access: profile.userId || (profile.email ? profile.email.split('@')[0] : 'ARC-CLIENT'),
        };
        Object.entries(fields).forEach(([field, value]) => {
            const el = customerSummary.querySelector(`[data-field="${field}"]`);
            if (el && value) {
                el.textContent = value;
            }
        });
    }

    const storedTests = readStoredJSON(TESTS_TABLE_KEY, []);
    const uploads = readStoredJSON(REPORT_UPLOAD_KEY, []);
    const records =
        Array.isArray(storedTests) && storedTests.length
            ? storedTests.map(mapRowToRecord)
            : defaultRecordSet;

    activeRecordData = records;
    renderRecordsTable(records, uploads || []);

    const downloadButton = document.querySelector('[data-download-records]');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            exportRecordsToCSV(activeRecordData, uploads || []);
        });
    }
}

const addRowButtons = document.querySelectorAll('[data-add-row]');
addRowButtons.forEach((button) => {
    const targetSelector = button.dataset.target;
    const tbody = targetSelector ? document.querySelector(targetSelector) : null;
    if (!tbody) return;

    button.addEventListener('click', () => {
        const table = tbody.closest('table');
        const columnCount = table ? table.querySelectorAll('thead th').length : tbody.firstElementChild?.children.length || 1;
        const tr = document.createElement('tr');
        for (let i = 0; i < columnCount; i += 1) {
            const td = document.createElement('td');
            td.innerHTML = '&nbsp;';
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
        tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

const collectRefsFromTable = (tbody, columnIndex = 0) => {
    if (!tbody) return new Set();
    const refs = new Set();
    Array.from(tbody.querySelectorAll('tr')).forEach((row) => {
        const cell = row.children[columnIndex];
        if (cell) {
            const ref = normalizeTestRef(cell.textContent);
            if (ref) {
                refs.add(ref);
            }
        }
    });
    return refs;
};

const uploadInput = document.querySelector('[data-document-upload]');
if (uploadInput) {
    const uploadFeedback = document.querySelector('[data-upload-feedback]');
    const uploadList = document.querySelector('[data-upload-list]');

    const renderUploads = (uploads) => {
        if (!uploadList) return;
        uploadList.innerHTML = '';
        uploads.forEach((upload) => {
            const li = document.createElement('li');
            li.className = upload.testRef ? 'success' : 'error';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = upload.fileName;
            const refSpan = document.createElement('span');
            refSpan.textContent = upload.testRef || 'No Test Ref Match';
            li.appendChild(nameSpan);
            li.appendChild(refSpan);
            uploadList.appendChild(li);
        });
    };

    const existingUploads = readStoredJSON(REPORT_UPLOAD_KEY, []);
    renderUploads(existingUploads || []);

    uploadInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const clientRefs = collectRefsFromTable(document.querySelector('#client-table-body'), 4);
        const testRefs = collectRefsFromTable(document.querySelector('#test-table-body'), 0);
        const validRefs = new Set([...testRefs].filter((ref) => clientRefs.has(ref)));
        const uploads = readStoredJSON(REPORT_UPLOAD_KEY, []) || [];
        const newUploads = [];
        const unmatched = [];

        files.forEach((file) => {
            const upperName = file.name.toUpperCase();
            let matchedRef = null;
            validRefs.forEach((ref) => {
                if (!matchedRef && upperName.includes(ref)) {
                    matchedRef = ref;
                }
            });

            if (matchedRef) {
                newUploads.push({
                    fileName: file.name,
                    testRef: matchedRef,
                    uploadedAt: new Date().toISOString(),
                });
            } else {
                unmatched.push(file.name);
            }
        });

        if (newUploads.length) {
            const merged = [
                ...uploads.filter(
                    (upload) =>
                        !newUploads.some(
                            (fresh) => normalizeTestRef(fresh.testRef) === normalizeTestRef(upload.testRef)
                        )
                ),
                ...newUploads,
            ];
            writeStoredJSON(REPORT_UPLOAD_KEY, merged);
            renderUploads(merged);
            if (uploadFeedback) {
                uploadFeedback.textContent = `${newUploads.length} file(s) linked to testing records.`;
            }
        }

        if (unmatched.length && uploadFeedback) {
            uploadFeedback.textContent = `Unmatched file names: ${unmatched.join(', ')}. Include the Test Ref. No. in each file name.`;
        }

        uploadInput.value = '';
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

const initNetlifyIdentityWidget = () => {
    if (typeof window === 'undefined' || !window.netlifyIdentity) {
        return;
    }

    const loginBtn = document.getElementById('identity-login-btn');
    const logoutBtn = document.getElementById('identity-logout-btn');
    const dashboardBtn = document.getElementById('identity-dashboard-btn');
    const employeeLoginBtn = document.getElementById('identity-employee-login-btn');
    const loggedInfo = document.getElementById('identity-logged-info');
    const userEmail = document.getElementById('identity-user-email');
    const dashboardLogoutBtn = document.getElementById('dashboard-logout-btn');
    const dashboardUserEmail = document.getElementById('dashboard-user-email');
    const navLoginLinks = document.querySelectorAll('.mobile-login-button');
    const navRecordLinks = document.querySelectorAll('.nav-record-link');
    const navUpdateLinks = document.querySelectorAll('.nav-update-link');
    const isOnClientDashboard = (path) => {
        return (
            path === DASHBOARD_PATH ||
            path === `${DASHBOARD_PATH}/` ||
            path === DASHBOARD_HTML_PATH
        );
    };
    const isOnEmployeePortal = (path) => {
        return (
            path === EMPLOYEE_PORTAL_PATH ||
            path === `${EMPLOYEE_PORTAL_PATH}/` ||
            path === EMPLOYEE_PORTAL_HTML_PATH
        );
    };
    const onClientDashboard = isOnClientDashboard(window.location.pathname);
    const navUserPill = document.getElementById('nav-user-pill');
    const navUserAvatar = document.getElementById('nav-user-avatar');
    const navUserName = document.getElementById('nav-user-name');
    const protectedPaths = [
        DASHBOARD_PATH,
        `${DASHBOARD_PATH}/`,
        DASHBOARD_HTML_PATH,
        EMPLOYEE_PORTAL_PATH,
        `${EMPLOYEE_PORTAL_PATH}/`,
        EMPLOYEE_PORTAL_HTML_PATH
    ];

    navLoginLinks.forEach((link) => {
        if (link && !link.dataset.defaultText) {
            link.dataset.defaultText = link.textContent.trim() || 'Login';
        }
        if (link && !link.dataset.defaultHref) {
            link.dataset.defaultHref = link.getAttribute('href') || 'login.html';
        }
        if (link && !link.dataset.defaultDisplay) {
            link.dataset.defaultDisplay = link.style.display || '';
        }
    });

    navRecordLinks.forEach((item) => {
        if (!item) return;
        if (!item.dataset.defaultDisplay) {
            const computed = window.getComputedStyle(item);
            const fallbackDisplay = computed && computed.display !== 'none' ? computed.display : 'flex';
            item.dataset.defaultDisplay = fallbackDisplay;
        }
        item.style.display = 'none';
        item.setAttribute('aria-hidden', 'true');
    });

    navUpdateLinks.forEach((item) => {
        if (!item) return;
        if (!item.dataset.defaultDisplay) {
            const computed = window.getComputedStyle(item);
            const fallbackDisplay = computed && computed.display !== 'none' ? computed.display : 'flex';
            item.dataset.defaultDisplay = fallbackDisplay;
        }
        item.style.display = 'none';
        item.setAttribute('aria-hidden', 'true');
    });

    const getIdentityDisplayName = (user) => {
        if (!user) return '';
        const metaName = user.user_metadata?.full_name?.trim();
        if (metaName) return metaName;
        if (user.email) {
            return formatNameFromEmail(user.email);
        }
        return 'Account';
    };

    const updateNavLoginLinks = (user) => {
        const displayName = getIdentityDisplayName(user);
        const isPortalView = onClientDashboard || isOnEmployeePortal(window.location.pathname);
        navLoginLinks.forEach((link) => {
            if (!link) return;
            if (user) {
                if (isPortalView) {
                    link.style.display = link.dataset.defaultDisplay || '';
                    link.textContent = 'Logout';
                    link.classList.add('nav-logout-link');
                    link.removeAttribute('href');
                    link.onclick = (event) => {
                        event.preventDefault();
                        netlifyIdentity.logout();
                    };
                    link.setAttribute('role', 'button');
                    link.setAttribute('aria-label', displayName ? `Logout ${displayName}` : 'Logout');
                } else {
                    link.style.display = 'none';
                    link.onclick = null;
                    link.classList.remove('nav-logout-link');
                    link.removeAttribute('role');
                    if (displayName) {
                        link.setAttribute('aria-label', `Logged in as ${displayName}`);
                    } else {
                        link.removeAttribute('aria-label');
                    }
                }
            } else {
                link.style.display = link.dataset.defaultDisplay || '';
                link.textContent = link.dataset.defaultText || 'Login';
                link.classList.remove('nav-logout-link');
                const defaultHref = link.dataset.defaultHref || 'login.html';
                link.setAttribute('href', defaultHref);
                link.onclick = null;
                link.removeAttribute('role');
                link.removeAttribute('aria-label');
            }
        });
    };

    const shouldShowRecordsLink = (user) => {
        return Boolean(user);
    };

    const shouldShowUpdateLink = (user) => isEmployeeUser(user);

    const updateNavRecordLinks = (user) => {
        const canView = shouldShowRecordsLink(user);
        navRecordLinks.forEach((item) => {
            if (!item) return;
            if (canView) {
                item.style.display = item.dataset.defaultDisplay || 'flex';
                item.setAttribute('aria-hidden', 'false');
            } else {
                item.style.display = 'none';
                item.setAttribute('aria-hidden', 'true');
            }
        });
    };

    const updateNavUpdateLinks = (user) => {
        const canView = shouldShowUpdateLink(user);
        navUpdateLinks.forEach((item) => {
            if (!item) return;
            if (canView) {
                item.style.display = item.dataset.defaultDisplay || 'flex';
                item.setAttribute('aria-hidden', 'false');
            } else {
                item.style.display = 'none';
                item.setAttribute('aria-hidden', 'true');
            }
        });
    };

    const updateNavUserPill = (user) => {
        if (!navUserPill || !navUserAvatar || !navUserName) return;
        if (user) {
            const name = getIdentityDisplayName(user);
            navUserName.textContent = name;
            const initials = (name || user.email || 'A')
                .split(' ')
                .map(part => part.trim()[0])
                .filter(Boolean)
                .join('')
                .slice(0, 2)
                .toUpperCase();
            navUserAvatar.textContent = initials || 'A';
            navUserPill.classList.add('show');
        } else {
            navUserName.textContent = 'Account';
            navUserAvatar.textContent = 'A';
            navUserPill.classList.remove('show');
        }
    };

    const updatePortalUI = (user) => {
        const isLoggedIn = Boolean(user);

        if (loginBtn) {
            loginBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
        }

        if (employeeLoginBtn) {
            employeeLoginBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
        }

        if (logoutBtn) {
            logoutBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
        }

        if (loggedInfo) {
            if (isLoggedIn) {
                loggedInfo.classList.add('active');
                if (userEmail) {
                    userEmail.textContent = `Logged in as: ${user.email}`;
                }
            } else {
                loggedInfo.classList.remove('active');
                if (userEmail) {
                    userEmail.textContent = 'Please login to continue.';
                }
            }
        }

        if (dashboardUserEmail) {
            dashboardUserEmail.textContent = user
                ? `Logged in as: ${user.email}`
                : 'Checking account...';
        }

        updateNavLoginLinks(user);
        updateNavRecordLinks(user);
        updateNavUpdateLinks(user);
        updateNavUserPill(user);
    };

    const guardProtectedPages = (user) => {
        const currentPath = window.location.pathname;
        if (!protectedPaths.includes(currentPath)) {
            return;
        }

        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        if (isOnEmployeePortal(currentPath) && !isEmployeeUser(user)) {
            window.location.href = DASHBOARD_PATH;
        }
    };

    netlifyIdentity.on('init', (user) => {
        const effectiveUser = user || getStoredUserProfile();
        updatePortalUI(effectiveUser);
        guardProtectedPages(effectiveUser);
    });

    netlifyIdentity.on('login', (user) => {
        updatePortalUI(user);
        const targetPath = isEmployeeUser(user) ? EMPLOYEE_PORTAL_PATH : DASHBOARD_PATH;
        if (window.location.pathname !== targetPath) {
            window.location.href = targetPath;
        }
    });

    netlifyIdentity.on('logout', () => {
        updatePortalUI(null);
        const homeTarget = '/index.html#home';
        window.location.href = homeTarget;
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            netlifyIdentity.open('login');
        });
    }

    if (employeeLoginBtn) {
        employeeLoginBtn.addEventListener('click', () => {
            netlifyIdentity.open('login');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            netlifyIdentity.logout();
        });
    }

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            const user = netlifyIdentity.currentUser() || getStoredUserProfile();
            const target = isEmployeeUser(user) ? EMPLOYEE_PORTAL_PATH : DASHBOARD_PATH;
            window.location.href = target;
        });
    }

    if (dashboardLogoutBtn) {
        dashboardLogoutBtn.addEventListener('click', () => {
            netlifyIdentity.logout();
        });
    }

    netlifyIdentity.init();
};

if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNetlifyIdentityWidget);
    } else {
        initNetlifyIdentityWidget();
    }
}

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
