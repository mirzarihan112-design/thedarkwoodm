/* ===============================================
   THE DARK WOOD — Night Mode Toggle
   =============================================== */

(function () {
    'use strict';

    const toggle = document.getElementById('nightModeToggle');
    const root = document.documentElement;
    const STORAGE_KEY = 'dw_theme';

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }

    function getCurrentTheme() {
        return localStorage.getItem(STORAGE_KEY) || 'dark';
    }

    // Initialize
    setTheme(getCurrentTheme());

    // Toggle
    toggle.addEventListener('click', () => {
        const current = getCurrentTheme();
        const next = current === 'dark' ? 'night' : 'dark';
        setTheme(next);
    });
})();