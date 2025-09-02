// Security and Anti-Debug Protection
(function() {
    'use strict';
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (Developer Tools)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            return false;
        }
    });
    
    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable drag and drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Anti-debug console detection
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.clear();
                console.log('%cDeveloper tools detected!', 'color: red; font-size: 20px; font-weight: bold;');
                console.log('%cUnauthorized access to source code is not allowed.', 'color: red; font-size: 14px;');
                // Optionally redirect or take action
                // window.location.href = 'about:blank';
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    // Console warning message
    console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers. Unauthorized access to this site\'s code is prohibited.', 'color: red; font-size: 16px;');
    console.log('%cIf someone told you to copy-paste something here, it\'s probably a scam.', 'color: orange; font-size: 14px;');
    
    // Prevent console clear
    const originalClear = console.clear;
    console.clear = function() {
        console.log('%cConsole clearing is disabled for security reasons.', 'color: red; font-weight: bold;');
    };
    
    // Obfuscate sensitive data
    window.addEventListener('load', function() {
        // Hide email from bots
        const emailElements = document.querySelectorAll('[href^="mailto:"]');
        emailElements.forEach(function(element) {
            const email = element.getAttribute('href').replace('mailto:', '');
            const obfuscated = email.split('').map(function(char, index) {
                return index % 2 === 0 ? char : String.fromCharCode(char.charCodeAt(0) + 1);
            }).join('');
            element.setAttribute('data-email', obfuscated);
        });
    });
    
    // Disable print screen (limited effectiveness)
    document.addEventListener('keyup', function(e) {
        if (e.keyCode === 44) {
            console.log('%cPrint screen detected!', 'color: red; font-weight: bold;');
        }
    });
    
})();

// Form security enhancements
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
        // Add CSRF-like token
        const token = btoa(Date.now() + Math.random()).substr(0, 32);
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = '_token';
        hiddenInput.value = token;
        form.appendChild(hiddenInput);
        
        // Input validation and sanitization
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
        inputs.forEach(function(input) {
            input.addEventListener('input', function(e) {
                // Basic XSS prevention
                let value = e.target.value;
                value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                value = value.replace(/javascript:/gi, '');
                value = value.replace(/on\w+=/gi, '');
                e.target.value = value;
            });
        });
        
        // Rate limiting for form submissions
        let lastSubmit = 0;
        form.addEventListener('submit', function(e) {
            const now = Date.now();
            if (now - lastSubmit < 3000) { // 3 second cooldown
                e.preventDefault();
                alert('Please wait before submitting again.');
                return false;
            }
            lastSubmit = now;
        });
    });
});
