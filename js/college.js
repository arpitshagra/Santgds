/**
 * Sant G.D.S. Inter College Dharera Agra
 * Firebase Cloud Engine, Firestore Real-Time Sync, Storage & Google Auth
 */

(function () {
    'use strict';

    // Firebase Configuration provided by user
    const firebaseConfig = {
        apiKey: "AIzaSyBpeyPbO3R3Vw8oMesH4hT45yunUN_Mlko",
        authDomain: "santgdsintercollege.firebaseapp.com",
        projectId: "santgdsintercollege",
        storageBucket: "santgdsintercollege.firebasestorage.app",
        messagingSenderId: "362738235091",
        appId: "1:362738235091:web:fd8b5f57a175b00296c626",
        measurementId: "G-WLYZFQG7J3"
    };

    // Initialize Firebase
    let db = null;
    let auth = null;
    let storage = null;
    let isFirebaseReady = false;

    try {
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            db = firebase.firestore();
            auth = firebase.auth();
            storage = firebase.storage();
            if (typeof firebase.analytics === 'function') {
                try {
                    firebase.analytics();
                } catch (e) {
                    console.log('Analytics init note:', e.message);
                }
            }
            isFirebaseReady = true;
            console.log('Firebase initialized successfully for Sant G.D.S. Inter College (Firestore, Storage, Auth, Analytics).');
        } else {
            console.warn('Firebase SDK not loaded, using local storage mode.');
        }
    } catch (err) {
        console.error('Firebase initialization error:', err);
    }

    // Local Storage Keys (Fallback & Cache)
    const STORAGE_NOTICES_KEY = 'santgds_notices';
    const STORAGE_GALLERY_KEY = 'santgds_gallery';
    const STORAGE_SETTINGS_KEY = 'santgds_settings';
    const STORAGE_AUTH_KEY = 'santgds_admin_auth';
    const STORAGE_AUTHORIZED_EMAILS_KEY = 'santgds_authorized_admin_emails';

    // Authorized Google Accounts (Strictly max 2)
    const DEFAULT_AUTHORIZED_EMAILS = [
        'arpitshagra@gmail.com',
        'spurushottam123@gmail.com'
    ];
    let authorizedEmails = getStoredData(STORAGE_AUTHORIZED_EMAILS_KEY, DEFAULT_AUTHORIZED_EMAILS);
    if (!authorizedEmails || authorizedEmails.length === 0) {
        authorizedEmails = DEFAULT_AUTHORIZED_EMAILS;
        setStoredData(STORAGE_AUTHORIZED_EMAILS_KEY, authorizedEmails);
    }

    // Initial Default Seed Data
    const DEFAULT_SETTINGS = {
        collegeName: 'Sant G.D.S. Inter College',
        collegeNameHindi: 'संत जी.डी.एस. इण्टर कॉलेज',
        schoolCode: '1820',
        udiseCode: '09150600131',
        districtCode: '01 (Agra)',
        affiliation: 'Uttar Pradesh Madhyamik Shiksha Parishad (UPMSP), Prayagraj',
        address: 'Khandauli Road, Dharera, Etmadpur, Agra, Uttar Pradesh - 283202',
        phone: '+91 97610 60222',
        email: 'info@santgdsintercollege.org',
        founder: 'Kshetrapal Sharma',
        director: 'Pursottam Sharma',
        principal: 'Rakhi Sharma',
        adminPin: 'admin123'
    };

    const DEFAULT_NOTICES = [
        {
            id: 'n-1',
            title: 'UP Board High School & Intermediate Examination 2026-27 Registration',
            category: 'Examination',
            date: '2026-10-15',
            urgent: true,
            content: 'All students appearing for UPMSP High School (Class 10) and Intermediate (Class 12 - Science Stream) must verify their examination details and submit their practical fee clearance before the deadline.',
            attachment: '#'
        },
        {
            id: 'n-2',
            title: 'Admissions Open for Classes 6th to 12th (Science Stream PCM / PCB)',
            category: 'Admissions',
            date: '2026-10-10',
            urgent: true,
            content: 'Sant G.D.S. Inter College invites admission applications for the upcoming academic session. Special counseling available for Intermediate Science stream students in Physics, Chemistry, Biology & Mathematics.',
            attachment: 'contact.html'
        },
        {
            id: 'n-3',
            title: 'Annual Science Exhibition & Project Submission in Laboratories',
            category: 'Events',
            date: '2026-10-05',
            urgent: false,
            content: 'Students of classes 9th to 12th are required to prepare working models for Physics and Chemistry practicals. Best models will be awarded district-level commendation certificates.',
            attachment: '#'
        },
        {
            id: 'n-4',
            title: 'Saraswati Puja & Cultural Ceremony Announcement',
            category: 'Celebration',
            date: '2026-09-28',
            urgent: false,
            content: 'Annual Saraswati Puja and Deepotsav ceremony will be held in the main campus hall. All students, parents, and respected teachers are cordially invited to participate in the Vandana.',
            attachment: '#'
        },
        {
            id: 'n-5',
            title: 'Yoga, Meditation & Physical Fitness Camp on School Grounds',
            category: 'Sports',
            date: '2026-09-20',
            urgent: false,
            content: 'Special morning physical training and yoga sessions are organized daily at 08:30 AM to ensure mental wellness, discipline, and physical health for board examinees.',
            attachment: '#'
        }
    ];

    const DEFAULT_GALLERY = [
        {
            id: 'g-1',
            title: 'Independence Day & Republic Day Celebrations',
            category: 'Celebration',
            date: '2026-08-15',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.14 (1).jpeg',
            caption: 'Principal Smt. Rakhi Sharma and faculty members with students performing patriotic stage presentations.'
        },
        {
            id: 'g-2',
            title: 'Tricolor Patriotic Dance Performance',
            category: 'Celebration',
            date: '2026-08-15',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.14.jpeg',
            caption: 'Students of Sant GDS Inter College presenting national integration dance with the Indian flag.'
        },
        {
            id: 'g-3',
            title: 'Happy Teachers Day Group Celebration',
            category: 'Academics',
            date: '2026-09-05',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.26 (1).jpeg',
            caption: 'Faculty and students celebrating Teacher Appreciation Day with heartfelt gratitude and greetings.'
        },
        {
            id: 'g-4',
            title: 'Maa Saraswati Vandana & Deepotsav Ceremony',
            category: 'Celebration',
            date: '2026-02-14',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.17 (1).jpeg',
            caption: 'Devotional lighting of auspicious lamps before Maa Saraswati, seeking wisdom and knowledge.'
        },
        {
            id: 'g-5',
            title: 'Saraswati Puja Floral Offering',
            category: 'Celebration',
            date: '2026-02-14',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.17.jpeg',
            caption: 'Students taking blessings for academic excellence during the Saraswati Vandana ceremony.'
        },
        {
            id: 'g-6',
            title: 'Morning Yoga & Meditation Session on Playground',
            category: 'Sports',
            date: '2026-06-21',
            src: '../assets/images/z.jpeg',
            caption: 'Outdoor yoga training and meditation practice promoting concentration and physical vigor.'
        },
        {
            id: 'g-7',
            title: 'Diwali Rangoli Art Competition',
            category: 'Celebration',
            date: '2026-11-01',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.16.jpeg',
            caption: 'Creative Rangoli artwork crafted with enthusiasm by intermediate girls during Diwali festival.'
        },
        {
            id: 'g-8',
            title: 'Traditional Welcome with Tilak for Young Students',
            category: 'Campus',
            date: '2026-07-01',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.25.jpeg',
            caption: 'Warm academic welcome with traditional tilak ceremony for students arriving at school.'
        },
        {
            id: 'g-9',
            title: 'Primary Section Tilak Blessing & First Day of School',
            category: 'Campus',
            date: '2026-07-01',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.24.jpeg',
            caption: 'Teachers greeting primary students with affection on campus reopening day.'
        },
        {
            id: 'g-10',
            title: 'Morning School Assembly & Prayer Line',
            category: 'Campus',
            date: '2026-09-12',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.25 (1).jpeg',
            caption: 'Disciplined morning assembly line of students wearing Sant G.D.S. official uniform.'
        },
        {
            id: 'g-11',
            title: 'Science & Art Project Presentation',
            category: 'Academics',
            date: '2026-09-25',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.11.jpeg',
            caption: 'High school students showcasing creative craft files and academic projects.'
        },
        {
            id: 'g-12',
            title: 'Patriotic Songs by Primary Students in Uniform',
            category: 'Celebration',
            date: '2026-08-15',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.14 (2).jpeg',
            caption: 'Young patriots reciting national anthem and poetry with pride on stage.'
        },
        {
            id: 'g-13',
            title: 'Teachers Day Classroom Felicitation',
            category: 'Academics',
            date: '2026-09-05',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.49.460.jpeg',
            caption: 'Senior students honoring their science and mathematics teachers on Teachers Day.'
        },
        {
            id: 'g-14',
            title: 'Patriotic Pride & Flag Badges',
            category: 'Celebration',
            date: '2026-08-15',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.26 (2).jpeg',
            caption: 'Students celebrating National festivals with flower petals and patriotic sashes.'
        },
        {
            id: 'g-15',
            title: 'Indoor Activity & Moral Instruction Hall',
            category: 'Campus',
            date: '2026-09-10',
            src: '../assets/images/WhatsApp Image 2026-10-18 at 10.25.26.jpeg',
            caption: 'Students engaged in interactive personality development sessions in the campus hall.'
        }
    ];

    // Helper functions for Local Storage
    function getStoredData(key, defaultData) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultData;
        } catch (e) {
            console.error('Storage read error:', e);
            return defaultData;
        }
    }

    function setStoredData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage write error:', e);
        }
    }

    // Initialize local state
    let settings = getStoredData(STORAGE_SETTINGS_KEY, DEFAULT_SETTINGS);
    let notices = getStoredData(STORAGE_NOTICES_KEY, DEFAULT_NOTICES);
    let gallery = getStoredData(STORAGE_GALLERY_KEY, DEFAULT_GALLERY);
    let currentUser = null;

    if (!localStorage.getItem(STORAGE_NOTICES_KEY)) setStoredData(STORAGE_NOTICES_KEY, DEFAULT_NOTICES);
    if (!localStorage.getItem(STORAGE_GALLERY_KEY)) setStoredData(STORAGE_GALLERY_KEY, DEFAULT_GALLERY);
    if (!localStorage.getItem(STORAGE_SETTINGS_KEY) || !settings.founder || settings.director === 'Kshetrapal Sharma') {
        settings.founder = 'Kshetrapal Sharma';
        settings.director = 'Pursottam Sharma';
        settings.principal = 'Rakhi Sharma';
        setStoredData(STORAGE_SETTINGS_KEY, settings);
    }

    // Auth helpers - Strictly requires verified Google Account in authorized list
    function isAdminLoggedIn() {
        if (!currentUser) return false;
        const email = (currentUser.email || '').toLowerCase().trim();
        if (!email) return false;
        // If authorized list not yet populated, first 2 accounts can be registered
        if (authorizedEmails.length === 0) return true;
        return authorizedEmails.includes(email);
    }

    function setAdminLoggedIn(status, userObj = null) {
        if (status && userObj) {
            sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
            currentUser = userObj;
        } else {
            sessionStorage.removeItem(STORAGE_AUTH_KEY);
            currentUser = null;
        }
    }

    // Connect Firebase Auth State
    if (isFirebaseReady && auth) {
        auth.onAuthStateChanged(function (user) {
            if (user && user.email) {
                const email = user.email.toLowerCase().trim();
                // If initial setup has space for registration (up to 2 accounts)
                if (authorizedEmails.length < 2 && !authorizedEmails.includes(email)) {
                    authorizedEmails.push(email);
                    setStoredData(STORAGE_AUTHORIZED_EMAILS_KEY, authorizedEmails);
                }

                if (authorizedEmails.includes(email)) {
                    console.log('Firebase Auth: Authorized admin logged in:', email);
                    setAdminLoggedIn(true, user);
                } else {
                    console.warn('Firebase Auth: Unauthorized Google account attempt rejected:', email);
                    auth.signOut();
                    setAdminLoggedIn(false);
                }
            } else {
                setAdminLoggedIn(false);
            }
            if (typeof window.onAdminAuthChanged === 'function') {
                window.onAdminAuthChanged(user);
            }
        });
    }

    // Connect Firestore Real-Time Sync
    if (isFirebaseReady && db) {
        // 1. Sync Notices
        db.collection('notices').orderBy('date', 'desc').onSnapshot(function (snapshot) {
            if (!snapshot.empty) {
                const fetched = [];
                snapshot.forEach(doc => {
                    fetched.push(Object.assign({ id: doc.id }, doc.data()));
                });
                notices = fetched;
                setStoredData(STORAGE_NOTICES_KEY, notices);
                renderBreakingTicker();
                renderHomeNotices();
                renderFullNotices();
                if (typeof window.refreshAdminTables === 'function') window.refreshAdminTables();
            } else {
                // If cloud collection is brand new, seed default notices to cloud
                console.log('Firestore notices collection empty, seeding defaults...');
                DEFAULT_NOTICES.forEach(item => {
                    db.collection('notices').add(item);
                });
            }
        }, function (error) {
            console.warn('Firestore notices sync error:', error);
        });

        // 2. Sync Gallery
        db.collection('gallery').orderBy('date', 'desc').onSnapshot(function (snapshot) {
            if (!snapshot.empty) {
                const fetched = [];
                snapshot.forEach(doc => {
                    fetched.push(Object.assign({ id: doc.id }, doc.data()));
                });
                gallery = fetched;
                setStoredData(STORAGE_GALLERY_KEY, gallery);
                renderHomeGalleryPreview();
                renderGallery();
                if (typeof window.refreshAdminTables === 'function') window.refreshAdminTables();
            } else {
                // If cloud collection is brand new, seed default gallery to cloud
                console.log('Firestore gallery collection empty, seeding defaults...');
                DEFAULT_GALLERY.forEach(item => {
                    db.collection('gallery').add(item);
                });
            }
        }, function (error) {
            console.warn('Firestore gallery sync error:', error);
        });

        // 3. Sync Settings
        db.collection('settings').doc('general').onSnapshot(function (doc) {
            if (doc.exists) {
                settings = Object.assign({}, DEFAULT_SETTINGS, doc.data());
                setStoredData(STORAGE_SETTINGS_KEY, settings);
                if (typeof window.refreshAdminTables === 'function') window.refreshAdminTables();
            } else {
                db.collection('settings').doc('general').set(DEFAULT_SETTINGS);
            }
        }, function (error) {
            console.warn('Firestore settings sync error:', error);
        });

        // 4. Sync Security & Authorized Admin Emails
        db.collection('settings').doc('security').onSnapshot(function (doc) {
            if (doc.exists && Array.isArray(doc.data().authorizedEmails) && doc.data().authorizedEmails.length > 0) {
                authorizedEmails = doc.data().authorizedEmails.slice(0, 2);
                setStoredData(STORAGE_AUTHORIZED_EMAILS_KEY, authorizedEmails);
                if (typeof window.refreshAdminTables === 'function') window.refreshAdminTables();
            }
        }, function (error) {
            console.warn('Firestore security sync note:', error);
        });
    }

    // Public API
    window.CollegeApp = {
        getSettings: () => settings,
        getNotices: () => notices,
        getGallery: () => gallery,
        isAdmin: isAdminLoggedIn,
        isFirebaseActive: () => isFirebaseReady,
        getCurrentUser: () => currentUser || (auth ? auth.currentUser : null),
        getAuthorizedEmails: () => authorizedEmails,

        // Update the 2 Authorized Admin Google Accounts
        updateAuthorizedEmails: async function (emailsArray) {
            authorizedEmails = emailsArray
                .map(e => (e || '').toLowerCase().trim())
                .filter(e => e.length > 0)
                .slice(0, 2);
            setStoredData(STORAGE_AUTHORIZED_EMAILS_KEY, authorizedEmails);
            if (isFirebaseReady && db) {
                try {
                    await db.collection('settings').doc('security').set({ authorizedEmails: authorizedEmails }, { merge: true });
                } catch (e) {
                    console.error('Error saving authorized emails to Firestore:', e);
                }
            }
            return authorizedEmails;
        },

        // Google Authentication - Exclusively authorizes up to 2 Google accounts
        loginWithGoogle: async function () {
            if (!isFirebaseReady || !auth) {
                return { success: false, message: 'Firebase Auth is not available. Please verify your network connection.' };
            }
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });
                const result = await auth.signInWithPopup(provider);
                const user = result.user;
                const email = (user && user.email) ? user.email.toLowerCase().trim() : '';

                // If authorized list has fewer than 2 accounts, register this account
                if (authorizedEmails.length < 2 && !authorizedEmails.includes(email)) {
                    authorizedEmails.push(email);
                    setStoredData(STORAGE_AUTHORIZED_EMAILS_KEY, authorizedEmails);
                    if (isFirebaseReady && db) {
                        try {
                            await db.collection('settings').doc('security').set({ authorizedEmails: authorizedEmails }, { merge: true });
                        } catch (e) {
                            console.warn('Could not sync authorized emails to Firestore:', e);
                        }
                    }
                }

                // Strictly verify against the 2 authorized emails
                if (authorizedEmails.includes(email)) {
                    setAdminLoggedIn(true, user);
                    return { success: true, user: user };
                } else {
                    await auth.signOut();
                    setAdminLoggedIn(false);
                    return {
                        success: false,
                        unauthorized: true,
                        message: `Access Denied: Google Account "${email}" is NOT an authorized administrator. Only the 2 designated administrator accounts can access this panel.`
                    };
                }
            } catch (err) {
                console.error('Google Sign In Error:', err);
                let msg = err.message || 'Google Sign-In failed.';
                if (err.code === 'auth/unauthorized-domain') {
                    msg = 'Domain not authorized in Firebase Console. Add your hosting domain in Firebase Console -> Authentication -> Settings -> Authorized domains.';
                } else if (err.code === 'auth/popup-closed-by-user') {
                    msg = 'Google login window closed.';
                }
                return { success: false, message: msg, error: err };
            }
        },

        // PIN login permanently disabled per security requirements
        loginAdmin: function () {
            return { success: false, message: 'Security Policy: PIN authentication is disabled. Administrator login is exclusively restricted to Google Authentication.' };
        },

        logoutAdmin: async function () {
            if (isFirebaseReady && auth) {
                try {
                    await auth.signOut();
                } catch (e) {
                    console.error('Logout error:', e);
                }
            }
            setAdminLoggedIn(false);
            window.location.reload();
        },

        // Add Notice to Cloud Firestore
        addNotice: async function (noticeData) {
            const newNotice = {
                title: noticeData.title || 'Untitled Notice',
                category: noticeData.category || 'General',
                date: noticeData.date || new Date().toISOString().split('T')[0],
                urgent: !!noticeData.urgent,
                content: noticeData.content || '',
                attachment: noticeData.attachment || '#',
                createdAt: (isFirebaseReady && firebase.firestore) ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
            };

            if (isFirebaseReady && db) {
                const docRef = await db.collection('notices').add(newNotice);
                newNotice.id = docRef.id;
            } else {
                newNotice.id = 'n-' + Date.now();
                notices.unshift(newNotice);
                setStoredData(STORAGE_NOTICES_KEY, notices);
            }
            return newNotice;
        },

        // Delete Notice from Cloud Firestore
        deleteNotice: async function (id) {
            if (isFirebaseReady && db && id.length > 10) {
                await db.collection('notices').doc(id).delete();
            } else {
                notices = notices.filter(n => n.id !== id);
                setStoredData(STORAGE_NOTICES_KEY, notices);
            }
        },

        // Upload Photo to Firebase Storage & Save in Firestore
        addGalleryPhoto: async function (photoData, fileBlob = null) {
            let finalImageUrl = photoData.src;

            // If a real image file is provided, upload directly to Firebase Cloud Storage!
            if (fileBlob && isFirebaseReady && storage) {
                try {
                    const cleanFileName = Date.now() + '_' + fileBlob.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                    const storageRef = storage.ref('gallery/' + cleanFileName);
                    const uploadTask = await storageRef.put(fileBlob);
                    finalImageUrl = await uploadTask.ref.getDownloadURL();
                    console.log('Firebase Cloud Storage upload success:', finalImageUrl);
                } catch (storageErr) {
                    console.warn('Firebase Storage direct upload error (falling back to base64/url):', storageErr);
                    if (!finalImageUrl && photoData.src) {
                        finalImageUrl = photoData.src;
                    }
                }
            }

            const newPhoto = {
                title: photoData.title || 'Campus Moment',
                category: photoData.category || 'Campus',
                date: photoData.date || new Date().toISOString().split('T')[0],
                src: finalImageUrl || '../assets/images/WhatsApp Image 2026-10-18 at 10.25.14 (1).jpeg',
                caption: photoData.caption || '',
                createdAt: (isFirebaseReady && firebase.firestore) ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
            };

            if (isFirebaseReady && db) {
                const docRef = await db.collection('gallery').add(newPhoto);
                newPhoto.id = docRef.id;
            } else {
                newPhoto.id = 'g-' + Date.now();
                gallery.unshift(newPhoto);
                setStoredData(STORAGE_GALLERY_KEY, gallery);
            }
            return newPhoto;
        },

        // Delete Photo from Cloud Firestore
        deleteGalleryPhoto: async function (id) {
            if (isFirebaseReady && db && id.length > 10) {
                await db.collection('gallery').doc(id).delete();
            } else {
                gallery = gallery.filter(g => g.id !== id);
                setStoredData(STORAGE_GALLERY_KEY, gallery);
            }
        },

        // Update Settings in Cloud Firestore
        updateSettings: async function (newSettings) {
            settings = Object.assign({}, settings, newSettings);
            setStoredData(STORAGE_SETTINGS_KEY, settings);

            if (isFirebaseReady && db) {
                await db.collection('settings').doc('general').set(settings, { merge: true });
            }
        },

        resetToDefaults: async function () {
            localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
            localStorage.setItem(STORAGE_NOTICES_KEY, JSON.stringify(DEFAULT_NOTICES));
            localStorage.setItem(STORAGE_GALLERY_KEY, JSON.stringify(DEFAULT_GALLERY));
            settings = DEFAULT_SETTINGS;
            notices = DEFAULT_NOTICES;
            gallery = DEFAULT_GALLERY;

            if (isFirebaseReady && db) {
                try {
                    await db.collection('settings').doc('general').set(DEFAULT_SETTINGS);
                } catch (e) {
                    console.error('Reset error:', e);
                }
            }
            window.location.reload();
        }
    };

    // UI Rendering Functions
    function renderBreakingTicker() {
        const tickerContainer = document.getElementById('urgent-ticker-items');
        if (!tickerContainer) return;

        const urgentItems = notices.filter(n => n.urgent);
        const displayItems = urgentItems.length > 0 ? urgentItems : notices.slice(0, 3);

        tickerContainer.innerHTML = displayItems.map(item => `
            <span class="ticker-item me-5">
                <span class="badge bg-danger me-2"><i class="fas fa-bell me-1"></i>${item.category}</span>
                <a href="notices.html" class="text-white text-decoration-none fw-bold">${item.title}</a>
                <small class="text-white-50 ms-2">(${item.date})</small>
            </span>
        `).join('');
    }

    function renderHomeNotices() {
        const container = document.getElementById('home-notices-container');
        if (!container) return;

        const latestNotices = notices.slice(0, 4);
        container.innerHTML = latestNotices.map(notice => `
            <div class="col-md-6 mb-4">
                <div class="card h-100 notice-card shadow-sm border-0 ${notice.urgent ? 'border-start border-danger border-5' : 'border-start border-primary border-5'}">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge ${notice.urgent ? 'bg-danger text-white' : 'bg-primary text-white'} px-3 py-2 rounded-pill">
                                ${notice.urgent ? '<i class="fas fa-exclamation-circle me-1"></i> URGENT' : notice.category}
                            </span>
                            <small class="text-muted"><i class="far fa-calendar-alt me-1"></i> ${notice.date}</small>
                        </div>
                        <h5 class="card-title fw-bold text-dark mb-2">${notice.title}</h5>
                        <p class="card-text text-secondary mb-3">${notice.content.length > 120 ? notice.content.substring(0, 120) + '...' : notice.content}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <a href="notices.html" class="btn btn-outline-primary btn-sm rounded-pill px-3">Read Full Notice <i class="fas fa-arrow-right ms-1"></i></a>
                            ${notice.attachment && notice.attachment !== '#' ? `<a href="${notice.attachment}" class="btn btn-sm btn-link text-secondary"><i class="fas fa-paperclip"></i> View Link</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderFullNotices(filterCategory = 'All', searchQuery = '') {
        const container = document.getElementById('notices-list-container');
        if (!container) return;

        let filtered = notices;
        if (filterCategory !== 'All') {
            filtered = filtered.filter(n => n.category.toLowerCase() === filterCategory.toLowerCase());
        }
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="p-5 bg-light rounded-3">
                        <i class="far fa-folder-open fa-3x text-muted mb-3"></i>
                        <h4 class="text-muted">No notices found matching your criteria</h4>
                        <p class="text-secondary">Try searching for other keywords or select 'All' categories.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(notice => `
            <div class="col-lg-6 col-12 mb-4">
                <div class="card h-100 border-0 shadow-sm notice-card p-4 rounded-3 ${notice.urgent ? 'urgent-border' : ''}">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge ${notice.urgent ? 'bg-danger text-white' : 'bg-primary text-white'} px-3 py-2 rounded-pill">
                                ${notice.category}
                            </span>
                            ${notice.urgent ? '<span class="badge bg-warning text-dark"><i class="fas fa-bolt me-1"></i> Important</span>' : ''}
                        </div>
                        <span class="text-muted small"><i class="far fa-clock me-1"></i> ${notice.date}</span>
                    </div>
                    <h4 class="fw-bold mb-3 text-primary">${notice.title}</h4>
                    <p class="text-secondary flex-grow-1" style="line-height: 1.7;">${notice.content}</p>
                    <div class="pt-3 border-top d-flex justify-content-between align-items-center">
                        <span class="badge bg-light text-dark border">UPMSP Code: 1820</span>
                        <small class="text-muted"><i class="fas fa-check-circle text-primary me-1"></i>Official Circular</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderGallery(filterCategory = 'All') {
        const container = document.getElementById('gallery-items-container');
        if (!container) return;

        let filtered = gallery;
        if (filterCategory !== 'All') {
            filtered = filtered.filter(item => item.category.toLowerCase() === filterCategory.toLowerCase());
        }

        container.innerHTML = filtered.map(item => `
            <div class="col-lg-4 col-md-6 col-12 mb-4 gallery-item-wrap">
                <div class="card border-0 shadow-sm h-100 overflow-hidden gallery-card rounded-3">
                    <div class="position-relative overflow-hidden" style="height: 260px;">
                        <img src="${item.src}" class="w-100 h-100 object-fit-cover gallery-img" alt="${item.title}" onerror="this.src='../assets/images/WhatsApp%20Image%202026-10-18%20at%2010.25.14%20(1).jpeg'">
                        <div class="gallery-overlay d-flex flex-column justify-content-end p-3">
                            <span class="badge bg-secondary text-dark align-self-start mb-2 px-3 py-1 rounded-pill">${item.category}</span>
                            <h6 class="text-white fw-bold mb-1">${item.title}</h6>
                            <small class="text-white-50"><i class="far fa-calendar-alt me-1"></i> ${item.date}</small>
                        </div>
                        <a href="${item.src}" data-lightbox="santgds-gallery" data-title="${item.title} - ${item.caption}" class="stretched-link"></a>
                    </div>
                    <div class="card-body p-3 bg-white">
                        <p class="card-text text-muted small mb-0">${item.caption || item.title}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderHomeGalleryPreview() {
        const container = document.getElementById('home-gallery-preview');
        if (!container) return;

        const previewPhotos = gallery.slice(0, 6);
        container.innerHTML = previewPhotos.map(item => `
            <div class="col-lg-4 col-md-6 col-12 mb-4">
                <div class="card border-0 shadow-sm h-100 overflow-hidden gallery-card rounded-3">
                    <div class="position-relative overflow-hidden" style="height: 250px;">
                        <img src="${item.src}" class="w-100 h-100 object-fit-cover gallery-img" alt="${item.title}" onerror="this.src='../assets/images/WhatsApp%20Image%202026-10-18%20at%2010.25.14%20(1).jpeg'">
                        <div class="gallery-overlay d-flex flex-column justify-content-end p-3">
                            <span class="badge bg-secondary text-dark align-self-start mb-1">${item.category}</span>
                            <h6 class="text-white fw-bold mb-0">${item.title}</h6>
                        </div>
                        <a href="${item.src}" data-lightbox="home-gallery" data-title="${item.title}" class="stretched-link"></a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Initialize after DOM load
    document.addEventListener('DOMContentLoaded', function () {
        renderBreakingTicker();
        renderHomeNotices();
        renderHomeGalleryPreview();
        renderFullNotices();
        renderGallery();

        // Notices Filter Pills
        const noticePills = document.querySelectorAll('.notice-filter-btn');
        noticePills.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                noticePills.forEach(b => b.classList.remove('active', 'btn-primary'));
                noticePills.forEach(b => b.classList.add('btn-outline-primary'));
                this.classList.remove('btn-outline-primary');
                this.classList.add('active', 'btn-primary');

                const cat = this.getAttribute('data-category') || 'All';
                const searchInput = document.getElementById('notice-search-input');
                renderFullNotices(cat, searchInput ? searchInput.value : '');
            });
        });

        // Notices Search
        const noticeSearch = document.getElementById('notice-search-input');
        if (noticeSearch) {
            noticeSearch.addEventListener('input', function () {
                const activePill = document.querySelector('.notice-filter-btn.active');
                const cat = activePill ? activePill.getAttribute('data-category') : 'All';
                renderFullNotices(cat, this.value);
            });
        }

        // Gallery Filter Pills
        const galleryPills = document.querySelectorAll('.gallery-filter-btn');
        galleryPills.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                galleryPills.forEach(b => b.classList.remove('active', 'btn-primary'));
                galleryPills.forEach(b => b.classList.add('btn-outline-primary'));
                this.classList.remove('btn-outline-primary');
                this.classList.add('active', 'btn-primary');

                const cat = this.getAttribute('data-category') || 'All';
                renderGallery(cat);
            });
        });

        // Contact Form Submission Handler
        const contactForm = document.getElementById('santgds-contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', function (e) {
                e.preventDefault();
                alert('Thank you for contacting Sant G.D.S. Inter College Dharera Agra! Your enquiry has been recorded. Our admissions office will get in touch with you shortly at the provided number.');
                contactForm.reset();
            });
        }
    });

})();
