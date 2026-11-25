"use strict";

/* =====================================================
   ESTADO GLOBAL
===================================================== */
let promoSwiper = null;
let modoConsulta = null;
let detailingSeleccionado = null;

/* =====================================================
   CONFIGURACIÓN / DATOS
===================================================== */
const preciosLavado = {
  "auto-chico": 500,
  "auto-mediano": 550,
  "auto-grande": 650,
  "camioneta-chica": 650,
  "camioneta-suv": 750,
  "4x4": 850,
  "furgon-van": 950,
  "camion-van": 1100,
  "moto": 350,
  "exterior": 300,
  "indefinido": "a definir"
};

/* =====================================================
   PROMO SWIPER (CELU)
===================================================== */
function initPromoSwiper() {
  const swiperEl = document.querySelector(".promo-swiper");
  if (!swiperEl) return;

  if (window.innerWidth <= 768) {
    if (!promoSwiper) {
      promoSwiper = new Swiper(".promo-swiper", {
        slidesPerView: 1,
        spaceBetween: 16,
        loop: true,
        pagination: {
          el: ".promo-swiper .swiper-pagination",
          clickable: true,
        },
      });
    } else {
      promoSwiper.update(); // fuerza recálculo
    }
  } else {
    if (promoSwiper) {
      promoSwiper.destroy(true, true);
      promoSwiper = null;
    }
  }
}


/* =====================================================
   SLIDERS CLÁSICOS
===================================================== */
function initSlider(container) {
  let track = container.querySelector(".slides") 
           || container.querySelector(".slides-servicio");
  if (!track) return;

  const total = track.children.length;
  if (total <= 1) return;

  const dotsBox = container.querySelector(".dots");
  const autoTime = Number(container.dataset.auto) || 6000;
  let index = 0;

  // LIMPIAR INTERVALO ANTERIOR
  if (container._interval) {
    clearInterval(container._interval);
  }

  if (dotsBox) {
    dotsBox.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("span");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => go(i));
      dotsBox.appendChild(dot);
    }
  }

  function go(n) {
    index = n;
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsBox?.querySelectorAll("span").forEach((dot, i) =>
      dot.classList.toggle("active", i === index)
    );
  }

  container._interval = setInterval(() => {
    index = (index + 1) % total;
    go(index);
  }, autoTime);
}
/* =====================================================
   PARKING
===================================================== */
function openParkingList(tipo, boton) {
  // Oculta todas las listas
  document.querySelectorAll(".parking-list").forEach(lista => {
    lista.style.display = "none";
  });

  // Muestra la lista seleccionada
  const lista = document.getElementById("lista-" + tipo);
  if (lista) lista.style.display = "block";

  // Quita "active" de todos los botones
  document.querySelectorAll(".parking-tabs .section-btn").forEach(b => {
    b.classList.remove("active");
  });

  // Agrega "active" al botón correspondiente
  if (boton) boton.classList.add("active");
}

// Evento para el botón "Ver parking"
document.getElementById("btn-toggle-parking")?.addEventListener("click", () => {
  const box = document.querySelector(".contenido-expandido");
  if (!box) return;

  const visible = window.getComputedStyle(box).display !== "none";
  box.style.display = visible ? "none" : "block";

  if (!visible) {
    // Forzamos reflujo para que el navegador reconozca el cambio
    box.offsetHeight;

    // Abrimos la lista por defecto: "hora"
    const defaultBoton = box.querySelector(".section-btn:nth-child(1)"); // Primer botón
    openParkingList("hora", defaultBoton);
  }
});

document.querySelectorAll(".parking-tabs .section-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tipo = btn.dataset.tipo; // "hora", "dia", "mes"
    openParkingList(tipo, btn);
  });
});
/* =====================================================
   WHATSAPP
===================================================== */
function abrirWhatsAppConLoader(url) {
  const loader = document.createElement("div");
  loader.textContent = "Abriendo WhatsApp…";
  loader.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,.85);
    color: #f4d76b;
    padding: 10px 16px;
    border-radius: 999px;
    font-size: 13px;
    z-index: 99999;
  `;
  document.body.appendChild(loader);

  setTimeout(() => {
    window.open(url, "_blank");
    loader.remove();
  }, 400);
}

/* =====================================================
   TEXTO PREVIEW
===================================================== */
function actualizarTextoParking() {
  const info = document.getElementById("parking-preview");
  if (!info) return;

  const tipo = document.getElementById("tipo-dia")?.value;
  const diaAprox = document.getElementById("parking-dia")?.value;
  const fechaInput = document.getElementById("parking-fecha")?.value;
  const hora = document.getElementById("parking-hora")?.value;
  const lavadoTipo = document.getElementById("lavado-tipo")?.value;

  let texto = "";

  if (modoConsulta === "detailing") {
    texto = "✨ Consulta de detailing";
    if (detailingSeleccionado) texto += `\n🛠 ${detailingSeleccionado}`;
    if (hora) texto += `\n⏰ ${hora}`;
    info.textContent = texto;
    return;
  }

  if (tipo === "fecha" && fechaInput) {
    texto = `📅 ${new Date(fechaInput).toLocaleDateString("es-UY")}`;
  } else if (tipo === "aprox" && diaAprox) {
    texto = `📅 Día aproximado: ${diaAprox}`;
  } else {
    texto = "📅 Consulta libre";
  }

  if (hora) texto += `\n⏰ ${hora}`;

  if (lavadoTipo) {
    texto += lavadoTipo === "indefinido"
      ? `\n🧼 Vehículo a definir`
      : `\n🧼 ${lavadoTipo.replace("-", " ")} – $${preciosLavado[lavadoTipo]}`;
  }

  info.textContent = texto;
}

function cambiarTipoDia() {
  const tipo = document.getElementById("tipo-dia")?.value;
  document.getElementById("dia-aproximado").style.display = tipo === "aprox" ? "block" : "none";
  document.getElementById("dia-fecha").style.display = tipo === "fecha" ? "block" : "none";
  actualizarTextoParking();
}
/* =====================================================
   DOM READY
===================================================== */
document.addEventListener("DOMContentLoaded", () => {

  /* INIT */
  initPromoSwiper();
  window.addEventListener("resize", initPromoSwiper);
  window.addEventListener("orientationchange", initPromoSwiper);
  document.querySelectorAll(".slider, .slider-servicio").forEach(initSlider);

  document.querySelectorAll(".expandible").forEach(b => {
    b.querySelector(".toggle-btn")?.addEventListener("click", () => {
      b.classList.toggle("expandido");
    });
  });

document.getElementById("btn-toggle-parking")?.addEventListener("click", () => {
  const box = document.querySelector(".contenido-expandido"); // sección que se expande
  if (!box) return;

  const visible = window.getComputedStyle(box).display !== "none";
  box.style.display = visible ? "none" : "block";

  if (!visible) {
    // Forzar reflujo
    box.offsetHeight;

    // Seleccionamos la lista por defecto: "Día"
    const defaultBoton = box.querySelector(".section-btn:nth-child(2)"); // botón "Día"
    if (defaultBoton) openParkingList("dia", defaultBoton);
  }
});


  /* ELEMENTOS */
  const popup = document.getElementById("popupParking");
  const popupTitle = document.getElementById("popup-title");
  const btnCerrar = document.getElementById("popup-cerrar");
  const btnEnviar = document.getElementById("popup-enviar");
  const lavadoExtra = document.getElementById("lavado-extra");

function resetPopupExtras() {
  lavadoExtra.style.display = "none";

  document.getElementById("lavado-tipo").value = "";
  document.getElementById("parking-dia").value = "";
  document.getElementById("parking-fecha").value = "";
  document.getElementById("parking-hora").value = "";

  detailingSeleccionado = null;
}

  /* LAVADOS */
  document.querySelectorAll(".seleccionar-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();

      modoConsulta = "lavado";
      document.getElementById("lavado-tipo").value = btn.dataset.lavado;

      popupTitle.textContent = "🧼 Consulta de lavado";

      resetPopupExtras();
      lavadoExtra.style.display = "block";

      popup.classList.add("active");
      actualizarTextoParking();
    });
  });

  /* CAMBIO TIPO DÍA (PARKING) */
  document.getElementById("tipo-dia")
    ?.addEventListener("change", cambiarTipoDia);

  /* DETAILING */
  document.querySelectorAll(".seleccionar-detail-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();

      modoConsulta = "detailing";
      detailingSeleccionado = btn.dataset.detailing;

      popupTitle.textContent = "✨ Consulta de detailing";

      resetPopupExtras();

      popup.classList.add("active");
      actualizarTextoParking();
    });
  });

  /* PARKING */
  document.getElementById("btn-consultar")?.addEventListener("click", e => {
    e.preventDefault();

    modoConsulta = "parking";
    popupTitle.textContent = "🚗 Consulta de parking";

    resetPopupExtras();
    popup.classList.add("active");
    cambiarTipoDia();
  });

  /* CAMBIO LAVADO */
  document.getElementById("lavado-tipo")
    ?.addEventListener("change", actualizarTextoParking);

  /* ENVIAR */
  btnEnviar?.addEventListener("click", e => {
    e.preventDefault();

    const mensaje = document.getElementById("parking-preview")?.textContent || "";

    abrirWhatsAppConLoader(
      "https://wa.me/59895107054?text=" + encodeURIComponent(mensaje)
    );

    popup.classList.remove("active");
  });

  btnCerrar?.addEventListener("click", () => popup.classList.remove("active"));

  /* INPUTS PARKING */
  document.getElementById("parking-dia")
    ?.addEventListener("change", actualizarTextoParking);

  document.getElementById("parking-fecha")
    ?.addEventListener("change", actualizarTextoParking);

  document.getElementById("parking-hora")
    ?.addEventListener("input", actualizarTextoParking);

});
/* =====================================================
   LIGHTBOX
===================================================== */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxWpp = document.getElementById("lightbox-whatsapp");

if (lightbox && lightboxImg) {
  document.querySelectorAll(".lightbox-trigger").forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightbox.classList.add("active");
    });
  });

  // cerrar clickeando fondo
  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) {
      lightbox.classList.remove("active");
    }
  });

  // cerrar botón X
  lightboxClose?.addEventListener("click", e => {
    e.stopPropagation();
    lightbox.classList.remove("active");
  });

  // whatsapp explícito
  lightboxWpp?.addEventListener("click", e => {
    e.stopPropagation();
    abrirWhatsAppConLoader("https://wa.me/59895107054");
  });
}

window.openParkingList = openParkingList;

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.getElementById("popupParking")?.classList.remove("active");
    document.getElementById("lightbox")?.classList.remove("active");
  }
});
