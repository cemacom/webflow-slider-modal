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

  // ========== FUNCIÓN PARA CERRAR MODAL ==========
  function cerrarModal(modal) {
    const modalId = modal.getAttribute('data-item-id');
    console.log('Cerrando modal con ID:', modalId);

    const params = new URLSearchParams(window.location.search);
    if (params.get('modal') === modalId && modalId) {
      params.delete('modal');
      const url = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
      console.log('URL limpiada:', url);
      window.history.replaceState({}, '', url);
    }

    const iframe = modal.querySelector('.webview-iframe iframe') || modal.querySelector('iframe');
    if (iframe) iframe.src = '';
    modal.style.display = 'none';
    modal.style.opacity = '';
    modal.style.pointerEvents = '';
    modal.setAttribute('data-item-id', '');
    document.body.style.overflow = '';

    if (window.Webflow && window.Webflow.require) {
      try {
        const ix2 = window.Webflow.require('ix2');
        if (ix2) ix2.init();
      } catch (e) {
        console.warn('Error reiniciando Webflow IX2:', e);
      }
    }
  }

  // ========== FUNCIÓN PARA CARGAR CONTENIDO EN EL MODAL ==========
  function insertarContenidoEnModal(modal, modalId) {
    const modalContainer = modal.querySelector('.modal_container');
    if (!modalContainer) {
      console.warn('No se encontró .modal_container');
      return;
    }

    const iframe = modalContainer.querySelector('.webview-iframe iframe') || modalContainer.querySelector('iframe');
    if (!iframe) {
      console.warn('No se encontró iframe en .webview-iframe o .modal_container');
      modalContainer.innerHTML = '<p>Error: iframe no encontrado.</p>';
      return;
    }

    const baseUrl = window.location.origin;
    const templateUrl = `${baseUrl}/contenu/${modalId}`;
    console.log('Estableciendo iframe src:', templateUrl);
    iframe.src = templateUrl;

    console.log('Estilos de modal_container:', {
      width: modalContainer.style.width || getComputedStyle(modalContainer).width,
      height: modalContainer.style.height || getComputedStyle(modalContainer).height,
      position: getComputedStyle(modalContainer).position,
      overflow: getComputedStyle(modalContainer).overflow
    });

    setTimeout(() => {
      console.log('Iframe src actual:', iframe.src);
      if (!iframe.src) {
        console.warn('El src del iframe no se estableció correctamente');
      }
    }, 100);

    if (window.Webflow && window.Webflow.require) {
      try {
        const ix2 = window.Webflow.require('ix2');
        if (ix2) ix2.init();
      } catch (e) {
        console.warn('Error inicializando Webflow ix2:', e);
      }
    }
  }

  // ========== DELEGACIÓN PARA ABRIR MODALES DESDE SLIDE O BOTÓN ==========
  document.addEventListener('click', (event) => {
    const target = event.target.closest('.splide__slide, .button_slider_more_info');
    if (!target) {
      console.log('Clic fuera de un .splide__slide o .button_slider_more_info');
      return;
    }

    const modalId = target.getAttribute('data-item-id');
    console.log('data-item-id:', modalId);
    if (!modalId) {
      console.warn('No se encontró data-item-id en el elemento:', target);
      return;
    }

    abrirModalConId(modalId);
  });

  // ========== FUNCIÓN PARA ABRIR MODAL CON ID ==========
  function abrirModalConId(modalId) {
    const modal = document.querySelector('.modal_background');
    console.log('Modal encontrado:', modal);
    if (!modal) {
      console.warn('No se encontró .modal_background');
      return;
    }

    modal.setAttribute('data-item-id', modalId);
    console.log('Modal actualizado con ID:', modalId);

    document.querySelectorAll('.modal_background').forEach(m => {
      m.style.display = 'none';
      const iframe = m.querySelector('.webview-iframe iframe') || m.querySelector('iframe');
      if (iframe) iframe.src = '';
    });
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    console.log('Modal mostrado, display:', modal.style.display);

    setTimeout(() => {
      modal.style.setProperty('opacity', '1', 'important');
      modal.style.pointerEvents = 'auto';
      console.log('Modal visible, opacity:', modal.style.opacity);
      insertarContenidoEnModal(modal, modalId);
    }, 100);
    document.body.style.overflow = 'hidden';

    const url = new URL(window.location);
    url.searchParams.set('modal', modalId);
    console.log('URL actualizada:', url.toString());
    window.history.replaceState({}, '', url);

    if (window.Webflow && window.Webflow.require) {
      try {
        const ix2 = window.Webflow.require('ix2');
        if (ix2) ix2.init();
      } catch (e) {
        console.warn('Error inicializando Webflow ix2:', e);
      }
    }
  }

  // ========== DELEGACIÓN PARA CERRAR MODALES ==========
  document.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('.close, .icon_close, .modal_background_closer');
    if (!closeBtn) {
      console.log('Clic fuera de .close, .icon_close, o .modal_background_closer');
      return;
    }

    // Evitar que clics en .modal_container o iframe activen el cierre
    if (event.target.closest('.modal_container')) {
      console.log('Clic dentro de .modal_container, ignorando cierre');
      return;
    }

    const modal = closeBtn.closest('.modal_background');
    if (!modal) {
      console.warn('No se encontró .modal_background');
      return;
    }

    cerrarModal(modal);
  });

  // ========== EVITAR PROPAGACIÓN DE CLICS EN EL IFRAME ==========
  document.addEventListener('click', (event) => {
    if (event.target.tagName === 'IFRAME' || event.target.closest('.modal_container')) {
      console.log('Clic en iframe o .modal_container, evitando propagación');
      event.stopPropagation();
      event.preventDefault(); // Evitar cualquier acción predeterminada
    }
  });

  // ========== OBSERVADOR PARA DETECTAR CIERRE DE MODALES ==========
  document.querySelectorAll('.modal_background').forEach(modal => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'style' && modal.style.display === 'none') {
          cerrarModal(modal);
        }
      });
    });

    observer.observe(modal, { attributes: true });
  });

  // ========== ABRIR MODAL AUTOMÁTICAMENTE SEGÚN QUERY ==========
  function abrirModalDesdeQueryRobusto(reintentos = 60) {
    try {
      const params = new URLSearchParams(window.location.search);
      const modalId = params.get('modal');
      console.log(`Buscando modal con ID: ${modalId} (reintentos restantes: ${reintentos})`);
      if (!modalId) {
        console.log('No hay parámetro modal en la URL, limpiando modales');
        document.querySelectorAll('.modal_background').forEach(m => {
          cerrarModal(m);
        });
        return;
      }

      abrirModalConId(modalId);
    } catch (e) {
      console.error('Error en abrirModalDesdeQueryRobusto:', e);
    }
  }

  // ========== ESCUCHAR MENSAJES DESDE EL IFRAME ==========
  window.addEventListener('message', (event) => {
    console.log('Mensaje recibido desde iframe:', event.data);
    if (event.data && event.data.type === 'openModal') {
      const newSlug = event.data.slug;
      console.log('Slug recibido para abrir modal:', newSlug);
      if (newSlug) {
        const modal = document.querySelector('.modal_background');
        if (modal) {
          console.log('Cerrando modal actual para abrir nuevo con slug:', newSlug);
          cerrarModal(modal);
          abrirModalConId(newSlug);
        } else {
          console.warn('No se encontró .modal_background para abrir nuevo modal');
        }
      } else {
        console.warn('No se recibió slug válido en el mensaje');
      }
    } else if (event.data && event.data.type === 'redirectAndClose') {
      const redirectUrl = event.data.url;
      console.log('Cerrando modal y redirigiendo a:', redirectUrl);
      if (redirectUrl) {
        const modal = document.querySelector('.modal_background');
        if (modal) {
          cerrarModal(modal);
        }
        // Manejar desplazamiento suave para anclas en la misma página
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(redirectUrl, window.location.origin);
        if (currentUrl.pathname === targetUrl.pathname && targetUrl.hash) {
          const sectionId = targetUrl.hash.replace('#', '');
          const section = document.getElementById(sectionId);
          if (section) {
            console.log('Desplazamiento suave a:', sectionId);
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Actualizar la URL sin recargar
            window.history.replaceState({}, '', redirectUrl);
          } else {
            console.warn('No se encontró la sección:', sectionId);
            window.location.href = redirectUrl; // Fallback a redirección completa
          }
        } else {
          window.location.href = redirectUrl; // Redirigir para enlaces externos
        }
      } else {
        console.warn('No se recibió URL válida para redirección');
      }
    }
  });

  // Ejecutar al cargar la página
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM listo, ejecutando abrirModalDesdeQueryRobusto');
    abrirModalDesdeQueryRobusto();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOMContentLoaded disparado');
      abrirModalDesdeQueryRobusto();
    });
  }

  // Manejar cambios de URL (botón atrás/adelante)
  window.addEventListener('popstate', () => {
    console.log('Evento popstate disparado, URL:', window.location.href);
    abrirModalDesdeQueryRobusto();
  });

  // Ejecutar después de que todo esté cargado
  window.addEventListener('load', () => {
    console.log('Evento load disparado');
    abrirModalDesdeQueryRobusto();
  });

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
      else if (rawId.includes('ytu.be/')) videoId = rawId.split('youtu.be/')[1].split('?')[0];
      else if (rawId.includes('/embed/')) videoId = rawId.split('/embed/')[1].split('?')[0];
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&background=1`;
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      Object.assign(iframe.style, {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0',
        left: '0',
        border: 'none',
        backgroundColor: '#000',
        pointerEvents: 'none'
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
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0',
        left: '0',
        border: 'none',
        backgroundColor: '#000',
        pointerEvents: 'none'
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
});
