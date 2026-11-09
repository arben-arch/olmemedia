document.addEventListener('click', function (event) {
  const link = event.target.closest('a.reel-link');
  if (!link) return;

  const reel = new URL(link.href);
  const match = reel.protocol === 'https:' && reel.hostname === 'www.instagram.com'
    ? reel.pathname.match(/^\/reel\/([A-Za-z0-9_-]+)\/$/)
    : null;
  if (!match) return;

  event.preventDefault();
  const item = link.closest('.video-item');
  const frame = document.createElement('iframe');
  frame.className = 'reel-frame';
  frame.title = link.querySelector('img').alt + ' on Instagram';
  frame.src = 'https://www.instagram.com/reel/' + match[1] + '/embed/';
  link.replaceWith(frame);
  item.classList.add('is-playing');
});
