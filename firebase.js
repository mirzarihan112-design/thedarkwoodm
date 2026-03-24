/* ===============================================
   THE DARK WOOD — Firebase Integration
   =============================================== */

/*
 * =============================================
 * FIREBASE CONFIGURATION
 * =============================================
 * To enable Firebase features (portfolio uploads, hero image management):
 *
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use an existing one)
 * 3. Add a Web App to your project
 * 4. Copy the config object and paste it below
 * 5. Enable Firebase Storage in your project
 * 6. Enable Cloud Firestore in your project
 * 7. Set up Storage and Firestore security rules as needed
 *
 * Storage Rules (for admin uploads):
 *   allow read: if true;
 *   allow write: if true;   // For simplicity; in production, add auth
 *
 * Firestore Rules:
 *   allow read: if true;
 *   allow write: if true;   // For simplicity; in production, add auth
 * =============================================
 */

// Firebase SDK imports (using compat for simplicity with non-module scripts)
// These are loaded via CDN - we check if available
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBUkedkQOQpV9tncRBKojLHgDhNNW_Bo1U",
    authDomain: "thewoodenart-76238.firebaseapp.com",
    projectId: "thewoodenart-76238",
    storageBucket: "thewoodenart-76238.firebasestorage.app",
    messagingSenderId: "210519122234",
    appId: "1:210519122234:web:ef7f2facceb95ef0adf003",
    measurementId: "G-TK859F7RNY"
};

// Global error catcher to help user see errors on screen
window.addEventListener('error', (e) => {
    alert('JS Error: ' + e.message + ' at ' + e.filename + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
    alert('Unhandled Promise Rejection: ' + e.reason);
});

window.DWFirebase = {
    isConfigured: false,
    db: null,
    storage: null,

    init: function () {
        if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.includes("YOUR_API_KEY")) {
            console.warn('[DarkWood] Firebase not configured correctly.');
            this.isConfigured = false;
            return;
        }

        try {
            if (firebase.apps.length === 0) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            
            this.db = firebase.firestore();
            this.db.settings({ experimentalForceLongPolling: true });
            
            this.storage = firebase.storage();
            this.isConfigured = true;
            console.info('[DarkWood] Firebase Ready');

            this.loadPortfolioImages('installations');
            this.loadPortfolioImages('cnc-products');
        } catch (err) {
            alert('Firebase Init Error: ' + err.message);
        }
    },

    loadPortfolioImages: async function (category) {
        if (!this.isConfigured) return [];
        try {
            const snapshot = await this.db.collection('portfolioImages')
                .where('category', '==', category)
                .orderBy('uploadedAt', 'desc')
                .get();

            const images = [];
            snapshot.forEach(doc => images.push({ id: doc.id, ...doc.data() }));
            this.renderPortfolioImages(category, images);
            return images;
        } catch (err) {
            console.warn(`[DarkWood] Could not load ${category} images:`, err);
            return [];
        }
    },

    renderPortfolioImages: function (category, images) {
        const gridId = category === 'installations' ? 'installationsGrid' : 'cncGrid';
        const emptyId = category === 'installations' ? 'installationsEmpty' : 'cncEmpty';
        const grid = document.getElementById(gridId);
        const empty = document.getElementById(emptyId);
        if (!grid) return;

        const existingItems = grid.querySelectorAll('.portfolio__item');
        existingItems.forEach(item => item.remove());

        if (images.length === 0) {
            if (empty) empty.style.display = '';
            return;
        }

        if (empty) empty.style.display = 'none';

        images.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'portfolio__item';
            item.setAttribute('data-id', img.id);
            item.innerHTML = `
                <img src="${img.url}" alt="Portfolio" class="portfolio__item-image" loading="lazy">
                <button class="portfolio__item-delete admin-only" data-category="${category}" data-id="${img.id}" data-path="${img.storagePath || ''}" style="display:none;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            `;
            item.addEventListener('click', (e) => {
                if (e.target.closest('.portfolio__item-delete')) return;
                const allImages = Array.from(grid.querySelectorAll('.portfolio__item-image')).map(i => i.src);
                if (window.DWLightbox) window.DWLightbox.open(allImages, index);
            });
            grid.appendChild(item);
        });

        if (window.DWAnimations) window.DWAnimations.animatePortfolioItems(grid.querySelectorAll('.portfolio__item'));
        if (document.body.classList.contains('is-admin')) {
            grid.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
        }
    },

    uploadPortfolioImages: async function (files, category, onProgress) {
        if (!this.isConfigured) {
            alert('Firebase not ready.');
            return [];
        }

        const results = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storagePath = `portfolio/${category}/${Date.now()}_${file.name}`;
            const storageRef = this.storage.ref(storagePath);
            const uploadTask = storageRef.put(file);

            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    uploadTask.cancel();
                    reject(new Error('Upload Timeline Exceeded (15s). This is likely a CORS block or Network issue. Try using a local server (Live Server).'));
                }, 15000);

                uploadTask.on('state_changed', 
                    (snap) => {
                        const prog = ((i + (snap.bytesTransferred / snap.totalBytes || 0)) / files.length) * 100;
                        if (onProgress) onProgress(prog, i + 1, files.length);
                    },
                    (err) => { clearTimeout(timeout); reject(err); },
                    async () => {
                        clearTimeout(timeout);
                        const url = await uploadTask.snapshot.ref.getDownloadURL();
                        const docRef = await this.db.collection('portfolioImages').add({
                            url, storagePath, category, uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        results.push({ id: docRef.id, url });
                        resolve();
                    }
                );
            });
        }
        await this.loadPortfolioImages(category);
        return results;
    },

    deletePortfolioImage: async function (imageId, storagePath, category) {
        try {
            if (storagePath) await this.storage.ref(storagePath).delete();
            await this.db.collection('portfolioImages').doc(imageId).delete();
            await this.loadPortfolioImages(category);
        } catch (err) { alert('Delete Error: ' + err.message); }
    }
};
