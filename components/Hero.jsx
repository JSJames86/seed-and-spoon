useEffect(() => {
  const video = document.querySelector('video');
  if (video) {
    video.play().catch(() => {
      // Autoplay blocked — show poster
      video.poster = '/media/hero/hero-poster.jpg';
    });
  }
}, []);
