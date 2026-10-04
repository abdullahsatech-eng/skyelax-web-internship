/* Shared navigation behaviour: mobile menu toggle with accessible state. */
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  // Safe exit if the expected elements are missing.
  if (!toggle || !nav) {
    return;
  }

  // Enables the collapsible mobile menu styles (without JavaScript the links stay visible).
  document.documentElement.classList.add('js-enabled');

  var desktopQuery = window.matchMedia('(min-width: 900px)');

  function setMenuState(isOpen) {
    nav.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? 'Close' : 'Menu';
  }

  toggle.addEventListener('click', function () {
    setMenuState(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a link.
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      setMenuState(false);
    }
  });

  // Escape closes the menu and returns focus to the toggle.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenuState(false);
      toggle.focus();
    }
  });

  // A click outside the menu closes it.
  document.addEventListener('click', function (event) {
    if (nav.classList.contains('is-open') && !nav.contains(event.target) && !toggle.contains(event.target)) {
      setMenuState(false);
    }
  });

  // Reset when the viewport becomes desktop width.
  function handleViewportChange(event) {
    if (event.matches) {
      setMenuState(false);
    }
  }

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleViewportChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleViewportChange);
  }
})();
