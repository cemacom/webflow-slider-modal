<script>
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
                  window.Webflow.require('ix2').init();
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

    // Oculta cualquier otro y muestra este
    document.querySelectorAll('.modal_background').forEach(m => m.style.display = 'none');
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.style.setProperty('opacity', '1', 'important');
      modal.style.pointerEvents = 'auto';
      insertarContenidoEnModal(modal);
    }, 50);
    document.body.style.overflow = 'hidden';

    // Actualiza URL con ?modal=
    const url = new URL(window.location);
    url.searchParams.set('modal', modalId);
    window.history.replaceState({}, '', url);

    // Re-inicia IX2 para animaciones
    if (window.Webflow && window.Webflow.require) {
      try {
        window.Webflow.require('ix2').init();
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

    // Limpia contenido y oculta
    const videoContainer = modal.querySelector('.video_modal_hero');
    if (videoContainer) videoContainer.innerHTML = '';
    modal.style.display = 'none';
    modal.style.opacity = '';
    modal.style.pointerEvents = '';
    document.body.style.overflow = '';

    // Elimina ?modal= de la URL y fuerza limpieza
    const modalId = modal.getAttribute('data-modal-id');
    const params = new URLSearchParams(window.location.search);
    if (params.get('modal') === modalId) {
      params.delete('modal');
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
      abrirModalDesdeQueryRobusto(0);
    }

    // Re-inicia IX2
    if (window.Webflow && window.Webflow.require) {
      try {
        window.Webflow.require('ix2').init();
      } catch (e) {
        console.warn('Error reiniciando Webflow ix2:', e);
      }
    }
  });

  // ========== ABRIR MODAL AUTOMÁTICAMENTE SEGÚN QUERY ==========
  function abrirModalDesdeQueryRobusto(reintentos = 40) {
    try {
      const params = new URLSearchParams(window.location.search);
      const modalId = params.get('modal');

      if (!modalId) {
        // Si no hay modal=, oculta todos y restaura overflow
        document.querySelectorAll('.modal_background').forEach(m => {
          m.style.display = 'none';
          m.style.opacity = '';
          m.style.pointerEvents = '';
          const vc = m.querySelector('.video_modal_hero');
          if (vc) vc.innerHTML = '';
        });
        document.body.style.overflow = '';
        return;
      }

      const modal = document.querySelector(`.modal_background[data-modal-id="${modalId}"]`);
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
            window.Webflow.require('ix2').init();
          } catch {}
        }
      } else if (reintentos > 0) {
        // Recursión CORRECTA
        setTimeout(() => abrirModalDesdeQueryRobusto(reintentos - 1), 50);
      }
    } catch (e) {
      console.error('Error en abrirModalDesdeQueryRobusto:', e);
    }
  }

  // Ejecuta al cargar o al navegar con back/forward
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    abrirModalDesdeQueryRobusto();
  } else {
    document.addEventListener('DOMContentLoaded', abrirModalDesdeQueryRobusto);
  }
  window.addEventListener('popstate', abrirModalDesdeQueryRobusto);

  // ========== HOVER VIDEO EN SLIDE ==========
  document.addEventListener('mouseenter', (e) => {
    const slide = e.target.closest('.splide__slide');
    if (!slide) return;
    const contenedor = slide.querySelector('.video_slider');
    if (!contenedor) return;

    const tipo = contenedor.dataset.videoType;
    const rawId = contenedor.dataset.videoId;
    if (!tipo || !rawId) return;
    contenedor.innerHTML = '';

    let iframe;
    if (tipo === 'youtube') {
      let videoId = rawId.split(/(?:watch\?v=|youtu\.be\/|\/embed\/)/)[1].split(/[&?]/)[0];
      iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&background=1`;
    } else if (tipo === 'vimeo') {
      const videoId = rawId.split('/').pop().split('?')[0];
      iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1`;
    }
    if (iframe) {
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      Object.assign(iframe.style, {
        width: '100%', height: '100%', position: 'absolute',
        top: '0', left: '0', border: 'none', backgroundColor: '#000'
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

  // ========== FUNCIÓN PARA INSERTAR CONTENIDO EN MODAL ==========
  function insertarContenidoEnModal(modal) {
    const vc = modal.querySelector('.video_modal_hero');
    if (!vc) return;
    const tipo = vc.dataset.videoType;
    const rawId = vc.dataset.videoId;
    if (!tipo || !rawId) return;

    vc.innerHTML = '';
    let el;
    if (tipo === 'youtube' || tipo === 'vimeo') {
      const base = tipo === 'youtube'
        ? 'https://www.youtube.com/embed/'
        : 'https://player.vimeo.com/video/';
      const videoId = tipo === 'youtube'
        ? rawId.split(/(?:watch\?v=|youtu\.be\/|\/embed\/)/)[1].split(/[&?]/)[0]
        : rawId.split('/').pop().split('?')[0];
      el = document.createElement('iframe');
      el.src = `${base}${videoId}?autoplay=1&mute=1`;
    } else if (tipo === 'image') {
      el = document.createElement('img');
      el.src = rawId;
      el.alt = 'Aperçu';
      el.loading = 'lazy';
      el.style.objectFit = 'cover';
    }
    if (el) {
      Object.assign(el.style, {
        width: '100%', height: '100%', position: 'absolute',
        top: '0', left: '0', border: 'none', backgroundColor: '#000'
      });
      vc.appendChild(el);
    }
  }
});
</script>
