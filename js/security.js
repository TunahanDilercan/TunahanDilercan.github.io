/* Preserve normal browser controls and editable form content.
 * Form validation and submission state live in contact.js.
 * GitHub Pages serves public static files; this is not an access-control layer.
 */
(function () {
    'use strict';
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
        link.relList.add('noopener', 'noreferrer');
    });
})();
