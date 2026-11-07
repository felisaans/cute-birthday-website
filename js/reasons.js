/* ================================================================
   LIGHTBOX — klik foto yang gantung di "jemuran" buat lihat
   versi lebih besarnya.
================================================================= */
const hangPhotos      = document.querySelectorAll('.hang-photo img');
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxClose   = document.getElementById('lightboxClose');

hangPhotos.forEach((img) => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxOverlay.classList.add('open');
  });
});

function closeLightbox(){
  lightboxOverlay.classList.remove('open');
}

lightboxClose.addEventListener('click', closeLightbox);

lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightboxOverlay.classList.contains('open')) closeLightbox();
});

/* ================================================================
   AUTO-SCROLL PELAN buat kontainer "100 reasons" (.reasons-list)
   -----------------------------------------------------------
   // Slow, continuous auto-scroll (like movie credits).

   KENAPA DIPERBAIKI / WHY THE FIX:
   Browser sering membulatkan `scrollTop` ke angka bulat, jadi
   `scrollTop += 0.35` bisa dianggap +0 dan scroll-nya "diam".
   Sekarang posisi disimpan sendiri di variabel desimal (`pos`),
   lalu baru diterapkan ke scrollTop. Kecepatan juga pakai waktu
   (px per detik), jadi sama di layar 60Hz maupun 120Hz.
   // Keep a float position in JS, apply it to scrollTop; speed is
   // time-based so it is identical on 60Hz and 120Hz screens.

   EDIT DI SINI kalau mau ubah kecepatan / pengaturan lain.
================================================================= */
const reasonsBox = document.getElementById('reasonsBox');

if (reasonsBox){
  // <!-- GANTI DI SINI --> kecepatan scroll (px per detik). Kecil = pelan.
  const SCROLL_SPEED_PX_PER_SEC = 22;
  // <!-- GANTI DI SINI --> jeda (ms) saat sampai bawah sebelum balik ke atas
  const END_PAUSE_MS = 2000;
  // <!-- GANTI DI SINI --> jeda (ms) sebelum lanjut scroll setelah user interaksi
  const RESUME_DELAY_MS = 2500;

  // Hormati pengaturan "reduce motion" dari perangkat
  // // Respect the user's reduced-motion setting
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion){
    let pos = reasonsBox.scrollTop;   // posisi desimal / float position
    let lastTime = null;              // timestamp frame sebelumnya
    let isPaused = false;             // lagi di-pause karena interaksi?
    let isHolding = false;            // lagi nahan di dasar (end pause)?
    let resumeTimeout = null;

    // Pause saat user interaksi, lanjut lagi setelah dianggurin
    // // Pause on user interaction, resume after idle
    function pauseAutoScroll(){
      isPaused = true;
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        pos = reasonsBox.scrollTop;   // sinkron ke posisi terakhir user
        lastTime = null;
        isPaused = false;
      }, RESUME_DELAY_MS);
    }

    ['mouseenter', 'touchstart', 'wheel', 'pointerdown', 'keydown'].forEach(evt => {
      reasonsBox.addEventListener(evt, pauseAutoScroll, { passive: true });
    });

    // Kalau user drag scrollbar / scroll manual, ikuti posisinya
    // // If the user scrolls manually, follow their position
    reasonsBox.addEventListener('scroll', () => {
      if (isPaused) pos = reasonsBox.scrollTop;
    }, { passive: true });

    // Berhenti kalau tab disembunyikan (hemat baterai)
    // // Stop timing when tab is hidden
    document.addEventListener('visibilitychange', () => { lastTime = null; });

    function autoScrollStep(now){
      if (lastTime === null) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1); // detik, dibatasi
      lastTime = now;

      if (!isPaused && !isHolding){
        const maxScroll = reasonsBox.scrollHeight - reasonsBox.clientHeight;

        pos += SCROLL_SPEED_PX_PER_SEC * dt;
        reasonsBox.scrollTop = pos;

        // Sampai dasar: tahan sebentar, lalu balik ke atas
        // // Reached the bottom: hold, then loop back to the top
        if (pos >= maxScroll - 1){
          isHolding = true;
          setTimeout(() => {
            pos = 0;
            reasonsBox.scrollTop = 0;
            lastTime = null;
            isHolding = false;
          }, END_PAUSE_MS);
        }
      }
      requestAnimationFrame(autoScrollStep);
    }

    requestAnimationFrame(autoScrollStep);
  }
}
