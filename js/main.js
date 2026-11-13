(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('video[preload="none"]')];

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (entry.isIntersecting && !reduceMotion.matches) {
          const playing = video.play();
          if (playing && typeof playing.catch === 'function') playing.catch(() => {});
        } else {
          video.pause();
        }
      }
    }, { threshold: 0.12 });
    videos.forEach((video) => observer.observe(video));
  }
  reduceMotion.addEventListener?.('change', (event) => {
    if (event.matches) videos.forEach((video) => video.pause());
  });

  const dialog = document.querySelector('.reel-dialog');
  const slot = dialog.querySelector('.embed-slot');
  const closeButton = dialog.querySelector('.dialog-close');
  let opener = null;
  const clearEmbed = () => slot.replaceChildren();
  const closeDialog = () => {
    if (dialog.open) dialog.close();
    clearEmbed();
  };

  document.querySelectorAll('.reel-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      const match = link.href.match(/^https:\/\/www\.instagram\.com\/reel\/([A-Za-z0-9_-]+)\/?$/);
      if (!match || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      opener = link;
      const frame = document.createElement('iframe');
      frame.src = 'https://www.instagram.com/reel/' + match[1] + '/embed/';
      frame.title = 'Instagram video';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      slot.replaceChildren(frame);
      dialog.showModal();
      closeButton.focus();
    });
  });

  // Arrows under Our work (shown only for a mouse): move the row by one card; dimmed at either end.
  const track = document.querySelector('.reel-track');
  const prev = document.querySelector('.reel-prev');
  const next = document.querySelector('.reel-next');
  if (track && prev && next) {
    const step = () => {
      const card = track.querySelector('.reel');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.offsetWidth + gap : track.clientWidth * 0.8;
    };
    const update = () => {
      prev.setAttribute('aria-disabled', String(track.scrollLeft <= 2));
      next.setAttribute('aria-disabled', String(track.scrollLeft >= track.scrollWidth - track.clientWidth - 2));
    };
    const go = (dir, button) => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      track.scrollBy({ left: dir * step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => go(-1, prev));
    next.addEventListener('click', () => go(1, next));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Browsers without scroll-driven CSS (Safari before 26, older iPhones): light up the card nearest the middle
  // of the row as it scrolls, as newer browsers do in CSS, instead of always the 4th card (2026-11-13).
  const scrollDriven = window.CSS && typeof CSS.supports === 'function' && CSS.supports('animation-timeline', 'view()');
  if (track && !scrollDriven) {
    const cards = [...track.querySelectorAll('.reel')];
    let queued = false;
    const focus = () => {
      queued = false;
      const box = track.getBoundingClientRect();
      const middle = box.left + box.width / 2;
      let best = 0;
      let bestDistance = Infinity;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const distance = Math.abs(r.left + r.width / 2 - middle);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      cards.forEach((card, i) => {
        card.classList.toggle('reel-main', i === best);
        card.classList.toggle('reel-left', i < best);
        card.classList.toggle('reel-right', i > best);
      });
    };
    const queue = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(focus);
    };
    track.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    focus();
  }

  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('close', () => {
    clearEmbed();
    if (opener) opener.focus();
    opener = null;
  });
})();
