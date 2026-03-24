/* ===============================================
   THE DARK WOOD — Admin Authentication & Upload
   =============================================== */

(function() {
    'use strict';

    const SECRET_CODE = '852456';

    // DOM elements
    const settingsBtn = document.getElementById('settingsBtn');
    const authModal = document.getElementById('authModal');
    const authModalClose = document.getElementById('authModalClose');
    const authBackdrop = authModal.querySelector('.auth-modal__backdrop');
    const accessCodeInput = document.getElementById('accessCode');
    const verifyBtn = document.getElementById('verifyBtn');
    const authBody = document.getElementById('authBody');
    const authSuccess = document.getElementById('authSuccess');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBadge = document.getElementById('adminBadge');

    // Hero image change (Removed — Hero is now text-only)
    // const heroUploadTrigger = document.getElementById('heroUploadTrigger');
    // const heroFileInput = document.getElementById('heroFileInput');
    // const heroChangeBtn = document.getElementById('heroChangeBtn');

    // Upload modal
    const uploadModal = document.getElementById('uploadModal');
    const uploadModalClose = document.getElementById('uploadModalClose');
    const uploadBackdrop = uploadModal.querySelector('.upload-modal__backdrop');
    const uploadFileInput = document.getElementById('uploadFileInput');
    const uploadPreviews = document.getElementById('uploadPreviews');
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressFill = document.getElementById('uploadProgressFill');
    const uploadProgressText = document.getElementById('uploadProgressText');
    const uploadCategory = document.getElementById('uploadCategory');

    let currentUploadCategory = '';
    let selectedFiles = [];

    // ---- Auth State ----
    function isAdmin() {
        return localStorage.getItem('dw_admin') === 'true';
    }

    function setAdminState(active) {
        if (active) {
            localStorage.setItem('dw_admin', 'true');
            document.body.classList.add('is-admin');
            adminBadge.classList.add('is-active');
            // Show admin-only elements
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'flex';
            });
        } else {
            localStorage.removeItem('dw_admin');
            document.body.classList.remove('is-admin');
            if (adminBadge) adminBadge.classList.remove('is-active');
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'none';
            });
        }
    }

    function showAuthModal() {
        if (isAdmin()) {
            authBody.style.display = 'none';
            authSuccess.style.display = 'block';
        } else {
            authBody.style.display = 'block';
            authSuccess.style.display = 'none';
            accessCodeInput.value = '';
        }
        authModal.classList.add('is-open');
    }

    function closeAuthModal() {
        authModal.classList.remove('is-open');
    }

    function verifyCode() {
        const code = accessCodeInput.value.trim();
        if (code === SECRET_CODE) {
            setAdminState(true);
            authBody.style.display = 'none';
            authSuccess.style.display = 'block';
        } else {
            accessCodeInput.classList.add('shake');
            accessCodeInput.style.borderColor = '#c0392b';
            setTimeout(() => {
                accessCodeInput.classList.remove('shake');
                accessCodeInput.style.borderColor = '';
            }, 600);
        }
    }

    function logout() {
        setAdminState(false);
        closeAuthModal();
    }

    // ---- Upload Modal ----
    function openUploadModal(category) {
        currentUploadCategory = category;
        uploadCategory.textContent = category === 'installations' 
            ? 'Executed Project Installations' 
            : 'CNC Creations & Product Showcase';
        uploadPreviews.innerHTML = '';
        selectedFiles = [];
        uploadSubmitBtn.disabled = true;
        uploadProgress.style.display = 'none';
        uploadProgressFill.style.width = '0%';
        uploadFileInput.value = '';
        uploadModal.classList.add('is-open');
    }

    function closeUploadModal() {
        uploadModal.classList.remove('is-open');
        selectedFiles = [];
    }

    function handleFileSelect(files) {
        selectedFiles = Array.from(files);
        uploadPreviews.innerHTML = '';
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'upload-modal__preview';
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                uploadPreviews.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
        uploadSubmitBtn.disabled = selectedFiles.length === 0;
    }

    async function handleUpload() {
        if (selectedFiles.length === 0 || !window.DWFirebase) return;

        if (!window.DWFirebase.isConfigured) {
            alert('Firebase is not configured. Please add your Firebase config to js/firebase.js to enable uploads.');
            return;
        }

        uploadSubmitBtn.disabled = true;
        uploadProgress.style.display = 'block';

        try {
            await window.DWFirebase.uploadPortfolioImages(
                selectedFiles,
                currentUploadCategory,
                (percent, current, total) => {
                    uploadProgressFill.style.width = percent + '%';
                    uploadProgressText.textContent = `Uploading ${current} of ${total}...`;
                }
            );
            uploadProgressText.textContent = 'Upload complete!';
            setTimeout(() => closeUploadModal(), 1000);
        } catch (err) {
            uploadProgressText.textContent = 'Upload failed. Please try again.';
            uploadSubmitBtn.disabled = false;
            console.error('[DarkWood] Upload error:', err);
        }
    }

    // ---- Delete Handler (delegated) ----
    document.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.portfolio__item-delete');
        if (!deleteBtn || !isAdmin()) return;

        e.stopPropagation();
        const imageId = deleteBtn.getAttribute('data-id');
        const storagePath = deleteBtn.getAttribute('data-path');
        const category = deleteBtn.getAttribute('data-category');

        if (!confirm('Delete this image?')) return;

        try {
            await window.DWFirebase.deletePortfolioImage(imageId, storagePath, category);
        } catch (err) {
            alert('Could not delete image. Please try again.');
        }
    });

    // ---- Hero Image Change (Disabled) ----
    /*
    function handleHeroChange() {
        if (heroFileInput) heroFileInput.click();
    }
    ...
    */

    // ---- Event Listeners ----
    settingsBtn.addEventListener('click', showAuthModal);
    authModalClose.addEventListener('click', closeAuthModal);
    authBackdrop.addEventListener('click', closeAuthModal);
    verifyBtn.addEventListener('click', verifyCode);
    accessCodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') verifyCode();
    });
    logoutBtn.addEventListener('click', logout);

    // heroUploadTrigger.addEventListener('click', handleHeroChange);
    // heroChangeBtn.addEventListener('click', () => {
    //     showAuthModal(); // Open admin panel which contains hero change
    // });

    uploadModalClose.addEventListener('click', closeUploadModal);
    uploadBackdrop.addEventListener('click', closeUploadModal);
    uploadFileInput.addEventListener('change', (e) => handleFileSelect(e.target.files));
    uploadSubmitBtn.addEventListener('click', handleUpload);

    // Upload buttons in portfolio sections
    document.getElementById('uploadInstallationsBtn').addEventListener('click', () => openUploadModal('installations'));
    document.getElementById('uploadCncBtn').addEventListener('click', () => openUploadModal('cnc-products'));

    // Restore admin state on load
    if (isAdmin()) {
        setAdminState(true);
    }
})();
