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
