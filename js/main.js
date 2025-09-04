/* ===================================================================
 * Ceevee 2.0.0 - Main JS
 *
 * ------------------------------------------------------------------- */

(function(html) {

    "use strict";
    
    html.className = html.className.replace(/\bno-js\b/g, '') + ' js ';


   /* Pr    }; // end ssTypewriter


   /* Portfolio Show More
    * -------------------------------------------------- */
    const ssPortfolioShowMore = function() {
        
        console.log('ssPortfolioShowMore function called');
        
        const showMoreBtn = document.querySelector('#showMoreBtn');
        console.log('Button element:', showMoreBtn);
        
        if (!showMoreBtn) {
            console.error('Show More button not found!');
            return;
        }

        console.log('Show More button found, adding event listener');
        
        showMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Show More button clicked!');
            
            const hiddenItems = document.querySelectorAll('.folio-item.hidden');
            console.log('Found hidden items:', hiddenItems.length);
            
            if (hiddenItems.length === 0) {
                console.log('No hidden items found, checking all items:');
                const allItems = document.querySelectorAll('.folio-item');
                console.log('Total items:', allItems.length);
                allItems.forEach((item, index) => {
                    console.log(`Item ${index}:`, item.className);
                });
            }
            
            hiddenItems.forEach(function(item, index) {
                console.log('Showing item', index, item);
                item.classList.remove('hidden');
                item.style.display = 'block';
            });
            
            if (hiddenItems.length > 0) {
                this.style.display = 'none';
                console.log('Button hidden');
            }
        });

    }; // end ssPortfolioShowMore


   /* Initializeder
    * -------------------------------------------------- */
    const ssPreloader = function() {

        const preloader = document.querySelector('#preloader');
        if (!preloader) return;

        window.addEventListener('load', function() {
            
            document.querySelector('body').classList.remove('ss-preload');
            document.querySelector('body').classList.add('ss-loaded');

            preloader.addEventListener('transitionend', function(e) {
                if (e.target.matches("#preloader")) {
                    this.style.display = 'none';
                }
            });

        });

        // force page scroll position to top at page refresh
        // window.addEventListener('beforeunload' , function () {
        //     window.scrollTo(0, 0);
        // });

    }; // end ssPreloader


   /* Parallax
    * -------------------------------------------------- */
    const ssParallax = function() { 

        const rellax = new Rellax('.rellax');

    }; // end ssParallax


   /* Move header menu
    * -------------------------------------------------- */
    const ssMoveHeader = function () {

        const hdr = document.querySelector('.s-header');
        const hero = document.querySelector('#hero');
        let triggerHeight;

        if (!(hdr && hero)) return;

        setTimeout(function(){
            triggerHeight = hero.offsetHeight - 170;
        }, 300);

        window.addEventListener('scroll', function () {

            let loc = window.scrollY;
           

            if (loc > triggerHeight) {
                hdr.classList.add('sticky');
            } else {
                hdr.classList.remove('sticky');
            }

            if (loc > triggerHeight + 20) {
                hdr.classList.add('offset');
            } else {
                hdr.classList.remove('offset');
            }

            if (loc > triggerHeight + 150) {
                hdr.classList.add('scrolling');
            } else {
                hdr.classList.remove('scrolling');
            }

        });

    }; // end ssMoveHeader


   /* Mobile Menu
    * ---------------------------------------------------- */ 
    const ssMobileMenu = function() {

        const toggleButton = document.querySelector('.s-header__menu-toggle');
        const headerNavWrap = document.querySelector('.s-header__nav-wrap');
        const siteBody = document.querySelector("body");

        if (!(toggleButton && headerNavWrap)) return;

        toggleButton.addEventListener('click', function(event){
            event.preventDefault();
            toggleButton.classList.toggle('is-clicked');
            siteBody.classList.toggle('menu-is-open');
        });

        headerNavWrap.querySelectorAll('.s-header__nav a').forEach(function(link) {
            link.addEventListener("click", function(evt) {

                // at 800px and below
                if (window.matchMedia('(max-width: 800px)').matches) {
                    toggleButton.classList.toggle('is-clicked');
                    siteBody.classList.toggle('menu-is-open');
                }

                // Avoid sticky focus color after click
                if (typeof link.blur === 'function') {
                    setTimeout(() => link.blur(), 0);
                }
            });
        });

        window.addEventListener('resize', function() {

            // above 800px
            if (window.matchMedia('(min-width: 801px)').matches) {
                if (siteBody.classList.contains('menu-is-open')) siteBody.classList.remove('menu-is-open');
                if (toggleButton.classList.contains("is-clicked")) toggleButton.classList.remove("is-clicked");
            }
        });

    }; // end ssMobileMenu


   /* Highlight active menu link on pagescroll
    * ------------------------------------------------------ */
    const ssScrollSpy = function() {

        const sections = document.querySelectorAll(".target-section");
        const navLinks = document.querySelectorAll(".s-header__nav a");

        // Add an event listener listening for scroll
        window.addEventListener("scroll", navHighlight);

        function navHighlight() {
        
            // Get current scroll position
            let scrollY = window.pageYOffset;
            
            // Clear all current classes first
            navLinks.forEach(link => {
                link.parentNode.classList.remove("current");
            });
            
            // Find the current section based on scroll position
            let currentSection = null;
            
            // Special case: if we're at the very top, make Home active
            if (scrollY < 150) {
                currentSection = "hero";
            } else {
                // Loop through sections to find which one we're currently in
                sections.forEach(function(section) {
                    const sectionHeight = section.offsetHeight;
                    const sectionTop = section.offsetTop - 150; // Offset for better detection
                    const sectionId = section.getAttribute("id");
                
                    // Check if we're in this section
                    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                        currentSection = sectionId;
                    }
                });
            }
            
            // If we found a current section, activate its navigation link
            if (currentSection) {
                const activeLink = document.querySelector(".s-header__nav a[href*=" + currentSection + "]");
                if (activeLink) {
                    activeLink.parentNode.classList.add("current");
                }
            }
        }

    }; // end ssScrollSpy


   /* Swiper
    * ------------------------------------------------------ */ 
    const ssSwiper = function() {

        const mySwiper = new Swiper('.swiper-container', {

            slidesPerView: 1,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },          
            breakpoints: {
                // when window width is >= 401px
                401: {
                    slidesPerView: 1,
                    spaceBetween: 20
                },
                // when window width is >= 801px
                801: {
                    slidesPerView: 2,
                    spaceBetween: 48
                }
            }
         });

    }; // end ssSwiper


   /* Lightbox
    * ------------------------------------------------------ */
    const ssLightbox = function() {

        const folioLinks = document.querySelectorAll('.folio-item a');
        const modals = [];

        folioLinks.forEach(function(link) {
            let modalbox = link.getAttribute('href');
            
            // Skip if href is an external URL (starts with http)
            if (modalbox && modalbox.startsWith('http')) {
                return;
            }
            
            // Only create modal for internal selectors (starting with #)
            if (modalbox && modalbox.startsWith('#')) {
                let instance = basicLightbox.create(
                    document.querySelector(modalbox),
                    {
                        onShow: function(instance) {
                            //detect Escape key press
                            document.addEventListener("keydown", function(evt) {
                                evt = evt || window.event;
                                if(evt.keyCode === 27){
                                instance.close();
                                }
                            });
                        }
                    }
                )
                modals.push(instance);
            }
        });

        folioLinks.forEach(function(link, index) {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                modals[index].show();
            });
        });

    };  // end ssLightbox


   /* Alert boxes
    * ------------------------------------------------------ */
    const ssAlertBoxes = function() {

        const boxes = document.querySelectorAll('.alert-box');
  
        boxes.forEach(function(box) {

            box.addEventListener('click', function(e){
                if (e.target.matches(".alert-box__close")) {
                    e.stopPropagation();
                    e.target.parentElement.classList.add("hideit");

                    setTimeout(function() {
                        box.style.display = "none";
                    }, 500)
                }    
            });

        })

    }; // end ssAlertBoxes


   /* Smoothscroll
    * ------------------------------------------------------ */
    const ssSmoothScroll = function () {
        
    const triggers = document.querySelectorAll(".smoothscroll");

        triggers.forEach(function(trigger) {
            trigger.addEventListener("click", function(e) {
                const target = trigger.getAttribute("href");
                const targetElement = document.querySelector(target);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Use native smooth scroll for better performance
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });

                    // Remove focus from clicked link to prevent persistent focus styles
                    if (typeof trigger.blur === 'function') {
                        setTimeout(() => trigger.blur(), 0);
                    }
                }
            });
        });

    }; // end ssSmoothScroll


   /* back to top
    * ------------------------------------------------------ */
    const ssBackToTop = function() {

        const pxShow = 900;
        const goTopButton = document.querySelector(".ss-go-top");

        if (!goTopButton) return;

        // Show or hide the button
        if (window.scrollY >= pxShow) goTopButton.classList.add("link-is-visible");

        window.addEventListener('scroll', function() {
            if (window.scrollY >= pxShow) {
                if(!goTopButton.classList.contains('link-is-visible')) goTopButton.classList.add("link-is-visible")
            } else {
                goTopButton.classList.remove("link-is-visible")
            }
        });

    }; // end ssBackToTop



   /* Typewriter effect
    * -------------------------------------------------- */
    const ssTypewriter = function() {

        const helloWorld = document.getElementById('hello-world');
        if (!helloWorld) return;

        // After typing animation ends, remove the cursor
        setTimeout(function() {
            helloWorld.style.borderRight = 'none';
        }, 2500); // 2.5 seconds (1s delay + 1.5s animation)

    }; // end ssTypewriter


   /* Reading Progress Bar
    * -------------------------------------------------- */
    const ssReadingProgress = function() {
        
        const progressBar = document.getElementById('readingProgress');
        if (!progressBar) return;

        window.addEventListener('scroll', function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;
            
            // Update progress width
            progressBar.style.width = Math.min(progress, 100) + '%';
            
            // Check if we're past About section
            const aboutSection = document.querySelector('#about');
            const resumeSection = document.querySelector('#resume');
            
            if (aboutSection && resumeSection) {
                const aboutBottom = aboutSection.offsetTop + aboutSection.offsetHeight;
                const resumeTop = resumeSection.offsetTop;
                
                // Change color when scrolling past About section
                if (scrolled > aboutBottom || scrolled > resumeTop - 100) {
                    progressBar.classList.add('turquoise');
                } else {
                    progressBar.classList.remove('turquoise');
                }
            }
        });

    }; // end ssReadingProgress


   /* Pull to Refresh
    * -------------------------------------------------- */
    const ssPullToRefresh = function() {
        
        let startY = 0;
        let pullDistance = 0;
        const threshold = 80;
        
        document.addEventListener('touchstart', function(e) {
            startY = e.touches[0].pageY;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            if (window.scrollY === 0) {
                pullDistance = e.touches[0].pageY - startY;
                
                if (pullDistance > threshold) {
                    document.body.style.transform = `translateY(${Math.min(pullDistance - threshold, 50)}px)`;
                    document.body.style.opacity = '0.8';
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', function() {
            if (pullDistance > threshold && window.scrollY === 0) {
                window.location.reload();
            }
            
            document.body.style.transform = '';
            document.body.style.opacity = '';
            pullDistance = 0;
        }, { passive: true });

    }; // end ssPullToRefresh


   /* initialize
    * ------------------------------------------------------ */
    (function ssInit() {

        ssPreloader();
        ssParallax();
        ssMoveHeader();
        ssMobileMenu();
        ssScrollSpy();
        ssSwiper();
        ssLightbox();
        ssAlertBoxes();
        ssSmoothScroll();
        ssBackToTop();
        ssTypewriter();
        ssPortfolioShowMore();
        ssReadingProgress();
        ssPullToRefresh();

    })();

})(document.documentElement);

/* Legal Menu Toggle Function
 * -------------------------------------------------- */
function toggleLegalMenu() {
    console.log('Legal menu toggle clicked!');
    const dropdown = document.getElementById('legalDropdown');
    
    if (dropdown) {
        const isVisible = dropdown.classList.contains('show');
        
        if (isVisible) {
            dropdown.classList.remove('show');
            console.log('Menu closed');
        } else {
            dropdown.classList.add('show');
            console.log('Menu opened');
        }
    } else {
        console.error('Dropdown element not found!');
    }
}

// Close the dropdown if clicked outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('legalDropdown');
    const toggle = document.querySelector('.legal-menu__toggle');
    
    if (dropdown && toggle) {
        // If click is outside both toggle and dropdown
        if (!toggle.contains(event.target) && !dropdown.contains(event.target)) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
                console.log('Menu closed by outside click');
            }
        }
    }
});

// Ensure function is available globally
window.toggleLegalMenu = toggleLegalMenu;