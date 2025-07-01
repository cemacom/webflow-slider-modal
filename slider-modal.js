document.addEventListener('DOMContentLoaded', function () {
  // ========== SPLIDE SLIDER ==========
  try {
    const options = {
      perPage: 5,
      perMove: 3,
      type: 'loop',
      focus: 0,
      arrows: false,
      pagination: false,
      speed: 550,
      drag: true,
      dragAngleThreshold: 20,
      autoWidth: false,
      rewind: false,
      rewindSpeed: 800,
      waitForTransition: false,
      updateOnMove: true,
      trimSpace: false,
      breakpoints: {
        768: { perPage: 1, perMove: 1, autoWidth: true },
        1024: { perPage: 2, perMove: 1 }
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slider = entry.target;
          if (!slider.classList.contains('is-initialized')) {
            const splide = new Splide(slider, options);

            splide.on('refresh move', () => {
              slider.querySelectorAll('.splide__slide').forEach(slide =>
                slide.classList.add('webflow-slide')
              );
              if (window.Webflow && window.Webflow.require) {
                try {
                  const ix2 = window.Webflow.require('ix2');
                  if (ix2) ix2.init();
                } catch (e) {
                  console.warn('Error inicializando Webflow ix2:', e);
                }
              }
            });

            splide.mount();
            slider.classList.add('is-initialized');

            const prev = slider.querySelector('.splide__arrow--prev');
            const next = slider.querySelector('.splide__arrow--next');
            if (prev) prev.addEventListener('click', () => splide.go('<'));
            if (next) next.addEventListener('click', () => splide.go('>'));

            observer.unobserve(slider);
          }
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.slider2').forEach(slider => {
      observer.observe(slider);
    });
  } catch (e) {
    console.error('Error inicializando Splide:', e);
  }

  // ========== DELEGACIÓN PARA ABRIR MODALES ==========
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-modal-open]');
    if (!button) return;

    const modalId = button.getAttribute('data-modal-open');
    const modal = document.querySelector(`.modal_background[data-modal-id="${modalId}"]`);
    if (!modal) return;

    document.querySelectorAll('.modal_background').forEach(m => m.style.display = 'none');
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.style.setProperty('opacity', '1', 'important');
      modal.style.pointerEvents = 'auto';
      insertarContenidoEnModal(modal);
    }, 50);
    document.body.style.overflow = 'hidden';

    const url = new URL(window.location);
    url.searchParams.set('modal', modalId);
    console.log('URL actualizada:', window.location.href); // Depura aquí
    window.history.replaceState({}, '', url);

    if (window.Webflow && window.Webflow.require) {
      try {
        const ix2 = window.Webflow.require('ix2');
        if (ix2) ix2.init();
      } catch (e) {
        console.warn('Error inicializando Webflow ix2:', e);
      }
    }
  });

  // ========== DELEGACIÓN PARA CERRAR MODALES ==========
  document.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('.close, .Icon_close, .Modal_background_closer');
    if (!closeBtn) return;

    const modal = closeBtn.closest('.modal_background');
    if (!modal) return;

    const videoContainer = modal.querySelector('.video_modal_hero');
    if (videoContainer) videoContainer.innerHTML = '';
    modal.style.display = 'none';
    modal.style.opacity = '';
    modal.style.pointerEvents = '';
    document.body.style.overflow = '';

    const modalId = modal.getAttribute('data-modal-id');
    const params = new URLSearchParams(window.location.search);
    if (params.get('modal') === modalId) {
      params.delete('modal');
      const url = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
      console.log('URL limpiada (clic):', url); // Depura aquí
      window.history.replaceState({}, '', url);
    }

    if (window.Webflow && window.Webflow.require) {
      try {
        const ix2 = window.Webflow.require('ix2');
        if (ix2) ix2.init();
      } catch (e) {
        console.warn('Error reiniciando Webflow IX2:', e);
      }
    }
  });

  // ========== OBSERVADOR PARA DETECTAR CIERRE DE MODALES ==========
  document.querySelectorAll('.modal_background').forEach(modal => {
    const modalId = modal.getAttribute('data-modal-id');
    if (!modalId) {
      console.warn('Modal sin data-modal-id:', modal);
      return;
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'style' && modal.style.display === 'none') {
          console.log(`Modal ${modalId} cerrado (observado)`); // Depura aquí
          const videoContainer = modal.querySelector('.video_modal_hero');
          if (videoContainer) videoContainer.innerHTML = '';
          document.body.style.overflow = '';

          const params = new URLSearchParams(window.location.search);
          if (params.get('modal') === modalId) {
            params.delete('modal');
            const url = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
            console.log('URL limpiada (observador):', url); // Depura aquí
            window.history.replaceState({}, '', url);
          }
        }
      });
    });

    observer.observe(modal, { attributes: true });
  });

  // ========== ABRIR MODAL AUTOMÁTICAMENTE SEGÚN QUERY ==========
  function abrirModalDesdeQueryRobusto(reintentos = 40) {
    try {
      const params = new URLSearchParams(window.location.search);
      const modalId = params.get('modal');
      console.log(`Buscando modal con ID: ${modalId}`); // Depura aquí
      if (!modalId) {
        console.log('No hay parámetro modal en la URL, limpiando modales'); // Depura aquí
        document.querySelectorAll('.modal_background').forEach(m => {
          m.style.display = 'none';
          m.style.opacity = '';
          m.style.pointerEvents = '';
          const videoContainer = m.querySelector('.video_modal_hero');
          if (videoContainer) videoContainer.innerHTML = '';
        });
        document.body.style.overflow = '';
        return; // Salir si no hay modalId
      }

      const modal = document.querySelector(`.modal_background[data-modal-id="${modalId}"]`);
      console.log(`Modal encontrado:`, modal); // Depura aquí
      if (modal) {
        document.querySelectorAll('.modal_background').forEach(m => m.style.display = 'none');
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        setTimeout(() => {
          modal.style.setProperty('opacity', '1', 'important');
          modal.style.pointerEvents = 'auto';
          insertarContenidoEnModal(modal);
        }, 50);
        document.body.style.overflow = 'hidden';
        if (window.Webflow && window.Webflow.require) {
          try {
            const ix2 = window.Webflow.require('ix2');
            if (ix2) ix2.init();
          } catch (e) {
            console.warn('Error inicializando Webflow ix2:', e);
          }
        }
      } else if (reintentos > 0) {
        console.log(`Reintentando (${reintentos} restantes)`); // Depura aquí
        setTimeout(() => abrirModalshawDesdeQueryRobusto(reintentos - 1), 50);
      } else {
        console.warn(`Modal ${modalId} no encontrado tras ${reintentos} reintentos`);
      }
    } catch (e) {
      console.error('Error en abrirModalDesdeQueryRobusto:', e);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    abrirModalDesdeQueryRobusto();
  } else {
    document.addEventListener('DOMContentLoaded', () => abrirModalDesdeQueryRobusto());
  }
  window.addEventListener('popstate', () => {
    console.log('Evento popstate disparado, URL:', window.location.href); // Depura aquí
    abrirModalDesdeQueryRobusto();
  });
  window.addEventListener('load', () => abrirModalDesdeQueryRobusto());

  // ========== HOVER VIDEO EN SLIDE ==========
  document.addEventListener('mouseenter', (e) => {
    const slide = e.target.closest('.splide__slide');
    if (!slide) return;

    const contenedor = slide.querySelector('.video_slider');
    if (!contenedor) return;

    const tipo = contenedor.getAttribute('data-video-type');
    const rawId = contenedor.getAttribute('data-video-id');
    if (!tipo || !rawId) return;

    contenedor.innerHTML = '';

    if (tipo === 'youtube') {
      let videoId = rawId;
      if (rawId.includes('watch?v=')) videoId = rawId.split('watch?v=')[1].split('&')[0];
      else if (rawId.includes('youtu.be/')) videoId = rawId.split('youtu.be/')[1].split('?')[0];
      else if (rawId.includes('/embed/')) videoId = rawId.split('/embed/')[1].split('?')[0];
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&background=1`;
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      Object.assign(iframe.style, {
        width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', border: 'none', backgroundColor: '#000'
      });
      contenedor.appendChild(iframe);
    } else if (tipo === 'vimeo') {
      const videoId = rawId.split('/').pop().split('?')[0];
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1`;
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      Object.assign(iframe.style, {
        width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', border: 'none', backgroundColor: '#000'
      });
      contenedor.appendChild(iframe);
    }
  }, true);

  document.addEventListener('mouseleave', (e) => {
    const slide = e.target.closest('.splide__slide');
    if (!slide) return;
    const contenedor = slide.querySelector('.video_slider');
    if (contenedor) contenedor.innerHTML = '';
  }, true);

  // ========== FUNCIÓN REUTILIZABLE PARA INSERTAR CONTENIDO ==========
  function insertarContenidoEnModal(modal) {
    const videoContainer = modal.querySelector('.video_modal_hero');
    if (!videoContainer) return;
    const type = videoContainer.getAttribute('data-video-type');
    const rawId = videoContainer.getAttribute('data-video-id');
    if (!type || !rawId) return;

    videoContainer.innerHTML = '';

    if (type === 'youtube') {
      let videoId = rawId;
      if (rawId.includes('watch?v=')) videoId = rawId.split('watch?v=')[1].split('&')[0];
      else if (rawId.includes('youtu.be/')) videoId = rawId.split('youtu.be/')[1].split('?')[0];
      else if (rawId.includes('/embed/')) videoId = rawId.split('/embed/')[1].split('?')[0];
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      Object.assign(iframe.style, {
        width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', border: 'none', backgroundColor: '#000'
      });
      videoContainer.appendChild(iframe);
    } else if (type === 'vimeo') {
      const videoId = rawId.split('/').pop().split('?')[0];
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&autopause=1`;
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      Object.assign(iframe.style, {
        width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', border: 'none', backgroundColor: '#000'
      });
      videoContainer.appendChild(iframe);
    } else if (type === 'image') {
      const img = document.createElement('img');
      img.src = rawId;
      img.alt = 'Aperçu';
      img.loading = 'lazy';
      Object.assign(img.style, {
        width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', objectFit: 'cover'
      });
      videoContainer.appendChild(img);
    }
  }
});
