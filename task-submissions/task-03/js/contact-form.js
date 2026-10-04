/* Contact form: client-side validation for a frontend-only demonstration.
   The form does NOT send or store any message. */
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  if (!form || !status) {
    return;
  }

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MIN_MESSAGE_LENGTH = 20;

  var validators = {
    name: function (value) {
      if (!value) { return 'Enter your full name.'; }
      if (value.length < 2) { return 'Your name must be at least 2 characters.'; }
      return '';
    },
    email: function (value) {
      if (!value) { return 'Enter your email address.'; }
      if (!EMAIL_PATTERN.test(value)) { return 'Enter a valid email address, for example name@example.com.'; }
      return '';
    },
    service: function (value) {
      return value ? '' : 'Select a service.';
    },
    message: function (value) {
      if (!value) { return 'Describe your project.'; }
      if (value.length < MIN_MESSAGE_LENGTH) {
        return 'Write at least ' + MIN_MESSAGE_LENGTH + ' characters (currently ' + value.length + ').';
      }
      return '';
    }
  };

  function getField(name) {
    return form.querySelector('[name="' + name + '"]');
  }

  function validateField(name) {
    var field = getField(name);
    if (!field) { return true; }

    var message = validators[name](field.value.trim());
    var errorElement = document.getElementById(field.id + '-error');

    if (errorElement) { errorElement.textContent = message; }
    if (message) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
    return !message;
  }

  function showStatus(type, text) {
    status.className = 'form-status form-status--' + type;
    status.textContent = '';
    var paragraph = document.createElement('p');
    paragraph.textContent = text;
    status.appendChild(paragraph);
  }

  function clearStatus() {
    status.className = 'form-status';
    status.textContent = '';
  }

  // Re-validate a field while the person corrects it, and when they leave a filled field.
  Object.keys(validators).forEach(function (name) {
    var field = getField(name);
    if (!field) { return; }
    field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', function () {
      if (field.getAttribute('aria-invalid') === 'true') { validateField(name); }
    });
    field.addEventListener('blur', function () {
      if (field.value.trim() !== '') { validateField(name); }
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearStatus();

    var firstInvalid = null;
    var invalidCount = 0;

    Object.keys(validators).forEach(function (name) {
      if (!validateField(name)) {
        invalidCount += 1;
        if (!firstInvalid) { firstInvalid = getField(name); }
      }
    });

    if (firstInvalid) {
      showStatus('error', 'Fix ' + invalidCount + (invalidCount === 1 ? ' field' : ' fields') + ' before submitting.');
      firstInvalid.focus();
      return;
    }

    form.reset();
    showStatus('success', 'Your entries are valid. This is a demonstration form, so your message was not sent or stored.');
  });
})();
