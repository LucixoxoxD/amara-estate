(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const photos = [
    {id:'pexels-33417234', caption:'An open-air Indian wedding setting — a garden ceremony'},
    {id:'photo-1519225421980-715cb0215aed', caption:'The little details — a table set with love'},
    {id:'photo-1511285560929-80b456fea0bc', caption:'Just the two of you — a moment to remember'},
    {id:'photo-1464366400600-7168b8af9bc3', caption:'A night to remember — the grand reception'}
  ];
  const spaces = {
    garden: {title:'The Garden Lawn', label:'OPEN AIR · 150–500 GUESTS', photo:photos[0].id, description:'A green canvas for your biggest, happiest moments. Imagine a floral mandap in the afternoon light, an open-air ceremony, and dinner beneath a sky full of possibilities.', features:['Suggested guest count: 150–500','A setting for ceremonies, receptions and sangeet','Flexible ceremony and dining layouts','Ask about indoor backup arrangements'], guests:'300–500'},
    pavilion: {title:'The Grand Pavilion', label:'INDOOR ELEGANCE · 200–400 GUESTS', photo:photos[3].id, description:'For a celebration with a little more sparkle. A beautiful indoor setting for a reception, a lively sangeet, or a dinner that turns into a night of dancing.', features:['Suggested guest count: 200–400','An indoor setting for year-round celebrations','Room for dining, a stage and a dance floor','Layout and inclusions tailored to your function'], guests:'150–300'},
    courtyard: {title:'The Courtyard', label:'INTIMATE & PERSONAL · 50–150 GUESTS', photo:'photo-1511795409834-ef04bbd61622', description:'Some of the best moments happen with your closest people. Picture a colourful mehendi, a sunlit haldi, or a beautifully personal engagement celebration.', features:['Suggested guest count: 50–150','An intimate setting for pre-wedding functions','Flexible seating for your closest friends and family','A lovely starting point for a multi-function celebration'], guests:'50–150'}
  };
  const photoURL = (id, width = 1600) => id.startsWith('pexels-') ? `https://images.pexels.com/photos/${id.slice(7)}/pexels-photo-${id.slice(7)}.jpeg?auto=compress&cs=tinysrgb&w=${width}` : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
  let galleryIndex = 0;
  let activeSpace = null;
  let enquiry = null;
  let whatsappMessage = '';
  const form = $('#enquiry-form');
  const mobileMenu = $('#mobile-menu');
  const menuToggle = $('.menu-toggle');

  function closeMenu() {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }
  menuToggle.addEventListener('click', () => {
    const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    mobileMenu.hidden = !willOpen;
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
  });
  $$('a', mobileMenu).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if(event.matches) closeMenu(); });

  $$('dialog').forEach(dialog => {
    $$('[data-close]', dialog).forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });

  $$('[data-space-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-space-filter]').forEach(chip => { const active = chip === button; chip.classList.toggle('active', active); chip.setAttribute('aria-pressed', String(active)); });
    const filter = button.dataset.spaceFilter;
    let count = 0;
    $$('.space-card').forEach(card => {
      const min = Number(card.dataset.min), max = Number(card.dataset.capacity);
      const show = filter === 'all' || (filter === '150' && min < 150) || (filter === '300' && min <= 300 && max >= 200) || (filter === '500' && max > 300);
      card.hidden = !show;
      if(show) count++;
    });
    $('#space-count').textContent = `${count} beautiful ${count === 1 ? 'possibility' : 'possibilities'}`;
  }));

  $$('[data-space]').forEach(button => button.addEventListener('click', () => {
    activeSpace = spaces[button.dataset.space];
    $('#space-dialog-title').textContent = activeSpace.title;
    $('#space-dialog-label').textContent = activeSpace.label;
    $('#space-dialog-description').textContent = activeSpace.description;
    const img = $('#space-dialog-image'); img.src = photoURL(activeSpace.photo); img.alt = activeSpace.title;
    $('#space-dialog-features').replaceChildren(...activeSpace.features.map(feature => { const li = document.createElement('li'); li.textContent = feature; return li; }));
    $('#space-dialog').setAttribute('aria-labelledby', 'space-dialog-title');
    $('#space-dialog').showModal();
  }));
  $('#space-enquire').addEventListener('click', () => {
    form.elements.guests.value = activeSpace.guests;
    const note = `I’m interested in ${activeSpace.title}.`;
    if(!form.elements.message.value.includes(note)) form.elements.message.value = [form.elements.message.value, note].filter(Boolean).join('\n');
    $('#space-dialog').close();
    $('#visit').scrollIntoView({behavior:'smooth'});
    form.elements.name.focus({preventScroll:true});
  });

  function renderGallery() {
    const photo = photos[galleryIndex];
    const img = $('#lightbox-image'); img.src = photoURL(photo.id, 2000); img.alt = photo.caption;
    $('#lightbox-caption').textContent = photo.caption;
    $('#lightbox-counter').textContent = `${String(galleryIndex + 1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
  }
  function changePhoto(amount) { galleryIndex = (galleryIndex + amount + photos.length) % photos.length; renderGallery(); }
  $$('[data-open-gallery]').forEach(button => button.addEventListener('click', () => { galleryIndex = Number(button.dataset.openGallery); renderGallery(); $('#gallery-dialog').showModal(); }));
  $('.gallery-prev').addEventListener('click', () => changePhoto(-1));
  $('.gallery-next').addEventListener('click', () => changePhoto(1));
  $('#gallery-dialog').addEventListener('keydown', event => { if(event.key === 'ArrowLeft') {event.preventDefault(); changePhoto(-1);} if(event.key === 'ArrowRight') {event.preventDefault(); changePhoto(1);} });
  let touchStartX = null;
  $('#lightbox-image').addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, {passive:true});
  $('#lightbox-image').addEventListener('touchend', event => { if(touchStartX === null) return; const change = event.changedTouches[0].clientX - touchStartX; if(Math.abs(change) > 45) changePhoto(change > 0 ? -1 : 1); touchStartX = null; }, {passive:true});

  $$('[data-package]').forEach(button => button.addEventListener('click', () => {
    form.elements.celebration.value = button.dataset.package;
    form.elements.guests.value = {'Intimate celebration':'50–150','Signature wedding':'150–300','Estate celebration':'300–500'}[button.dataset.package];
    $('#visit').scrollIntoView({behavior:'smooth'});
    form.elements.name.focus({preventScroll:true});
  }));

  const localDate = new Date();
  const today = `${localDate.getFullYear()}-${String(localDate.getMonth()+1).padStart(2,'0')}-${String(localDate.getDate()).padStart(2,'0')}`;
  form.elements.date.min = today;
  $('#year').textContent = String(localDate.getFullYear());
  const formatDate = value => new Date(`${value}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  form.elements.phone.addEventListener('input', () => form.elements.phone.setCustomValidity(''));
  form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const digits = form.elements.phone.value.replace(/\D/g,'');
    if(digits.length < 10 || digits.length > 15) { form.elements.phone.setCustomValidity('Please enter a phone number with 10–15 digits.'); form.elements.phone.reportValidity(); return; }
    if(!form.elements.name.value.trim()) { form.elements.name.setCustomValidity('Please enter your name.'); form.elements.name.reportValidity(); return; }
    if(!form.reportValidity()) return;
    enquiry = Object.fromEntries(new FormData(form));
    enquiry.name = enquiry.name.trim();
    $('#success-message').textContent = `Thanks, ${enquiry.name}. Here’s a little outline of the celebration you have in mind.`;
    const entries = [['Name',enquiry.name],['Phone',enquiry.phone],['Email',enquiry.email],['Wedding date',formatDate(enquiry.date)],['Guests',enquiry.guests],['Celebration',enquiry.celebration || 'Let’s explore together']];
    if(enquiry.message.trim()) entries.push(['Your note',enquiry.message.trim()]);
    $('#enquiry-summary').replaceChildren(...entries.flatMap(([label,value]) => { const dt=document.createElement('dt'),dd=document.createElement('dd'); dt.textContent=label; dd.textContent=value; return [dt,dd]; }));
    $('#success-dialog').showModal();
  });
  $('#download-enquiry').addEventListener('click', () => {
    if(!enquiry) return;
    const content = ['THE AMARA ESTATE — DEMO VISIT ENQUIRY','',`Name: ${enquiry.name}`,`Phone: ${enquiry.phone}`,`Email: ${enquiry.email}`,`Wedding date: ${formatDate(enquiry.date)}`,`Guests: ${enquiry.guests}`,`Celebration: ${enquiry.celebration || 'Still exploring'}`,`Notes: ${enquiry.message || 'None'}`,'','This is a fictional venue website concept. No enquiry has been sent and no date has been reserved.'].join('\n');
    const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a'); link.href=url; link.download='Amara-Estate-Visit-Enquiry.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
  });

  $$('[data-chat]').forEach(button => button.addEventListener('click', () => { $('#chat-dialog').showModal(); }));
  const chatAnswers = {
    spaces:'Planning something intimate? The Courtyard suits 50–150 guests. For 200–400 guests, explore The Grand Pavilion. The Garden Lawn offers an open-air setting for 150–500. You can compare them in Our spaces.',
    collections:'The Intimate Collection starts with a courtyard celebration. The Signature Collection brings together a garden or pavilion wedding. The Estate Collection imagines multiple functions across the venue. These are sample concepts; there are no fixed prices.',
    whatsapp:'This demo has no venue phone number connected. You can copy a draft below, then share it with your own chosen contact.'
  };
  $$('[data-chat-topic]').forEach(button => button.addEventListener('click', () => {
    const topic=button.dataset.chatTopic;
    if(topic==='visit') {$('#chat-dialog').close(); $('#visit').scrollIntoView({behavior:'smooth'}); form.elements.name.focus({preventScroll:true}); return;}
    const answer=$('#chat-answer'); answer.hidden=false; answer.textContent=chatAnswers[topic];
    $('#copy-whatsapp').hidden=topic!=='whatsapp';
    $('#copy-whatsapp').textContent='Copy message ↗';
    whatsappMessage='Hi! I’d like to know more about your wedding venue and arrange a visit.';
    if(form.elements.date.value) whatsappMessage+=` Our wedding date is ${formatDate(form.elements.date.value)}.`;
    if(form.elements.guests.value) whatsappMessage+=` We’re expecting ${form.elements.guests.value} guests.`;
    if(topic==='whatsapp') answer.textContent+=`\n\n${whatsappMessage}`;
  }));
  $('#copy-whatsapp').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(whatsappMessage); $('#copy-whatsapp').textContent='Message copied ✓'; }
    catch { $('#chat-answer').textContent=`Select and copy this message:\n\n${whatsappMessage}`; }
  });

  $$('img').forEach(img => {
    function failed() { const frame = img.closest('.image-frame, .hero'); if(frame) frame.classList.add('image-failed'); }
    img.addEventListener('error', failed);
    if(img.complete && img.naturalWidth===0) failed();
    img.addEventListener('load', () => img.closest('.image-frame, .hero')?.classList.remove('image-failed'));
  });

  // A day at the estate: manual tabs, including standard keyboard navigation.
  const moments = [
    {space:'courtyard', photo:'photo-1511795409834-ef04bbd61622', label:'THE COURTYARD', kicker:'A SLOW, SUNLIT BEGINNING', title:['First hugs.', 'Familiar faces.'], description:'Welcome drinks, a courtyard catch-up, and that lovely moment when everyone is finally in the same place. Let the day begin at its own pace.', alt:'An intimate table setting for a courtyard gathering'},
    {space:'garden', photo:photos[0].id, label:'THE GARDEN LAWN', kicker:'THE MOMENT YOU CAME FOR', title:['A few promises.', 'A whole new chapter.'], description:'An open sky, a floral mandap, and your favourite people gathered close. A garden ceremony with room for all the traditions that make the moment yours.', alt:'An Indian wedding mandap with red flowers in a garden'},
    {space:'pavilion', photo:photos[3].id, label:'THE GRAND PAVILION', kicker:'NO ONE IS READY TO LEAVE', title:['One more song.', 'One more memory.'], description:'Make the entrance. Raise a glass. Settle into dinner, speeches, and a dance floor that brings every generation together. This is the part you will talk about for years.', alt:'A reception setting ready for dinner and an evening celebration'}
  ];
  const momentTabs = $$('[data-moment]');
  function selectMoment(index, focus = false) {
    const moment = moments[index];
    momentTabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    $('#day-panel').setAttribute('aria-labelledby', 'day-tab-' + index);
    const heading = $('#day-heading'), emphasis = document.createElement('em');
    emphasis.textContent = moment.title[1];
    heading.replaceChildren(moment.title[0], document.createElement('br'), emphasis);
    $('#day-kicker').textContent = moment.kicker;
    $('#day-description').textContent = moment.description;
    $('.day-number').textContent = String(index + 1).padStart(2, '0');
    $('#day-image-label').textContent = String(index + 1).padStart(2, '0') + ' / ' + moment.label;
    $('#day-image').src = photoURL(moment.photo, 1400);
    $('#day-image').alt = moment.alt;
    $('#day-explore').dataset.space = moment.space;
    if(focus) momentTabs[index].focus();
  }
  momentTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectMoment(index));
    tab.addEventListener('keydown', event => {
      let next;
      if(event.key === 'ArrowRight') next = (index + 1) % moments.length;
      if(event.key === 'ArrowLeft') next = (index + moments.length - 1) % moments.length;
      if(event.key === 'Home') next = 0;
      if(event.key === 'End') next = moments.length - 1;
      if(next !== undefined) { event.preventDefault(); selectMoment(next, true); }
    });
  });

  // One-time, restrained reveals. Content remains visible without JavaScript.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if('IntersectionObserver' in window && !motion.matches) {
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting) { entry.target.classList.remove('reveal-pending'); reveals.unobserve(entry.target); }
    }), {threshold:0.08});
    $$('.estate-pictures, .estate-copy, .section-heading, .space-card, .day-layout, .collection, .visit-copy').forEach(element => {
      if(element.getBoundingClientRect().top > window.innerHeight) { element.classList.add('reveal-pending'); reveals.observe(element); }
    });
    motion.addEventListener('change', event => { if(event.matches) { reveals.disconnect(); $$('.reveal-pending').forEach(el => el.classList.remove('reveal-pending')); } });
  }
  if('IntersectionObserver' in window) {
    const navLinks = $$('.desktop-nav a');
    const sections = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting) navLinks.forEach(link => {
        if(link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }), {rootMargin:'-20% 0px -55% 0px'});
    $$('main section[id]').forEach(section => sections.observe(section));
  }

})();
