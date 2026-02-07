// Disable Right Click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, etc.)
document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
        e.preventDefault();
        redirectToHome();
    }
    // Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        redirectToHome();
    }
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        redirectToHome();
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        redirectToHome();
    }
});

function redirectToHome() {
    window.location.href = "index.html";
}

// Detect DevTools (Basic Detection)
// This uses a debugger trick. If devtools is open, the debugger statement pauses execution.
// We can measure the time it takes to execute. This is a heuristic.
setInterval(() => {
    const start = performance.now();
    debugger; // This will pause if DevTools is open
    const end = performance.now();
    if (end - start > 100) {
        redirectToHome();
    }
}, 1000);

// Detect DevTools via Resize
// Checks if the window inner size is significantly smaller than outer size
// This is a common side effect of opening DevTools docked to the side or bottom
window.addEventListener('resize', () => {
    const threshold = 200; // Increased threshold to avoid false positives on normal resizing
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
        redirectToHome();
    }
});

// Aggressive Console Clearing
// Makes using the console difficult
setInterval(() => {
    console.clear();
    console.log("%cSecurity Alert: DevTools Restricted", "color: red; font-size: 20px; font-weight: bold;");
}, 500);

// Initial check on load
window.addEventListener('load', () => {
    const threshold = 200;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
        redirectToHome();
    }
});
