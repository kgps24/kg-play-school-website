const header = document.querySelector('#site-header');
const menuButton = document.querySelector('#menu-button');
const mobileNav = document.querySelector('#mobile-nav');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 24 || menuButton.getAttribute('aria-expanded') === 'true');
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  mobileNav.hidden = open;
  document.body.classList.toggle('menu-open', !open);
  updateHeader();
});

mobileNav.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    mobileNav.hidden = true;
    document.body.classList.remove('menu-open');
    updateHeader();
  }
});

const programmeContent = {
  playgroup: { number: '01', title: 'Belonging comes before learning.', body: 'Gentle routines, sensory play and caring relationships help children feel secure as they begin to explore the world beyond home.', items: ['Social comfort and communication', 'Movement and sensory discovery', 'Stories, music and creative play'], action: 'Ask about Playgroup' },
  nursery: { number: '02', title: 'Curiosity becomes a daily habit.', body: 'Language-rich play and purposeful activities help children ask questions, share ideas and build early confidence with numbers and words.', items: ['Early language and phonics', 'Number sense through play', 'Creative and social expression'], action: 'Ask about Nursery' }
};

const tabs = [...document.querySelectorAll('[role="tab"]')];
const programmePanel = document.querySelector('#programme-panel');

function activateProgramme(tab) {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  const key = tab.dataset.programme;
  const data = programmeContent[key];
  programmePanel.innerHTML = `<div role="tabpanel" id="panel-${key}" aria-labelledby="tab-${key}"><p class="programme-number">${data.number}</p><h3>${data.title}</h3><p>${data.body}</p><ul class="check-list">${data.items.map((item) => `<li>${item}</li>`).join('')}</ul><a class="text-link" href="#admissions">${data.action} <span aria-hidden="true">→</span></a></div>`;
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateProgramme(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    activateProgramme(next);
    next.focus();
  });
});

const form = document.querySelector('#admission-form');
const status = document.querySelector('#form-status');

function setError(field, message) {
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  const error = document.querySelector(`#${field.id}-error`);
  if (error) error.textContent = message;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#parent-name');
  const mobile = document.querySelector('#mobile');
  const age = document.querySelector('#child-age');
  const city = document.querySelector('#enquiry-city');
  const consent = document.querySelector('#consent');
  const validations = [
    [name, name.value.trim() ? '' : 'Please enter your name.'],
    [mobile, /^[0-9]{10}$/.test(mobile.value.trim()) ? '' : 'Enter a 10-digit mobile number.'],
    [age, age.value ? '' : 'Please select your child’s age.'],
    [city, city.value.trim() ? '' : 'Please enter your city.']
  ];
  validations.forEach(([field, message]) => setError(field, message));
  document.querySelector('#consent-error').textContent = consent.checked ? '' : 'Please confirm consent before submitting.';
  const firstInvalid = validations.find(([, message]) => message)?.[0];
  if (firstInvalid || !consent.checked) {
    status.textContent = 'Please review the highlighted fields.';
    (firstInvalid || consent).focus();
    return;
  }
  const message = document.querySelector('#message');
  const enquiry = [
    'Hello KG Play School, I would like to enquire about admission.',
    `Parent/guardian: ${name.value.trim()}`,
    `Mobile: ${mobile.value.trim()}`,
    `Child age: ${age.value}`,
    `City: ${city.value.trim()}`,
    message.value.trim() ? `Message: ${message.value.trim()}` : ''
  ].filter(Boolean).join('\n');
  const whatsappUrl = `https://wa.me/919812981298?text=${encodeURIComponent(enquiry)}`;
  status.textContent = 'Opening WhatsApp so you can review and send your enquiry.';
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
