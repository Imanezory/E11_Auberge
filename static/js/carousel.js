
document.addEventListener("DOMContentLoaded", () => {

  const slider = document.getElementById("auberge-slider");
  if (!slider) return;

  const cards = [
    ...slider.querySelectorAll(".auberge-slider__card")
  ];

  const title = slider.querySelector("#slide-title");
  const description = slider.querySelector("#slide-description");
  const number = slider.querySelector("#slide-number");
  const text = slider.querySelector("#slide-text");
  const progressBar = slider.querySelector("#slide-progress");

  const prevBtn = slider.querySelector("#slide-prev");
  const nextBtn = slider.querySelector("#slide-next");

  // CONTENU DES SLIDES
  // Même ordre que les images dans HTML
  const slides = [
    {
      title: "Notre Auberge",
      description:
        "Découvrez un lieu d'exception où le charme et le confort se rencontrent."
    },
    {
      title: "Nos Chambres",
      description:
        "Des chambres élégantes et chaleureuses pour un séjour inoubliable."
    },
    {
      title: "La Piscine",
      description:
        "Profitez d'un moment de détente au bord de notre piscine."
    },
    {
      title: "Notre Restaurant",
      description:
        "Découvrez une cuisine savoureuse dans une ambiance raffinée."
    },
    {
      title: "Notre Spa",
      description:
        "Offrez-vous une parenthèse de bien-être et de sérénité."
    },
    {
      title: "Notre Jardin",
      description:
        "Un espace naturel et paisible pour se ressourcer."
    }
  ];

  if (
    cards.length !== slides.length ||
    !title ||
    !description ||
    !number ||
    !text ||
    !progressBar
  ) {
    console.error("Vérifiez le HTML du carousel.");
    return;
  }

  let current = 0;
  let timer = null;

  // Temps de chaque slide : 5 secondes
  const delay = 5000;

  // AFFICHER LE SLIDE
  function updateSlider(index) {

    const total = cards.length;

    // Revenir à la première image après la dernière
    current = (index + total) % total;

    const previous = (current - 1 + total) % total;
    const next = (current + 1) % total;

    // CHANGER LES IMAGES
    cards.forEach((card, i) => {

      card.classList.remove(
        "is-active",
        "is-prev",
        "is-next"
      );

      if (i === current) {
        card.classList.add("is-active");
      }

      else if (i === previous) {
        card.classList.add("is-prev");
      }

      else if (i === next) {
        card.classList.add("is-next");
      }

    });

    // CHANGER LE TEXTE
    title.textContent = slides[current].title;
    description.textContent = slides[current].description;

    number.textContent =
      String(current + 1).padStart(2, "0") +
      " / " +
      String(total).padStart(2, "0");

    // ANIMATION DU TEXTE
    text.classList.remove("is-changing");

    void text.offsetWidth;

    text.classList.add("is-changing");

    // RECOMMENCER LA BARRE DE PROGRESSION
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    void progressBar.offsetWidth;

    progressBar.style.transition =
      `width ${delay}ms linear`;

    progressBar.style.width = "100%";
  }

  // ARRÊTER LE TIMER
  function stopAuto() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  // DÉMARRER LE CHANGEMENT AUTOMATIQUE
  function startAuto() {

    stopAuto();

    timer = setInterval(() => {

      // Passer à la prochaine image
      updateSlider(current + 1);

    }, delay);
  }

  // NAVIGATION MANUELLE
  function goTo(index) {

    updateSlider(index);

    // Recommencer les 5 secondes
    startAuto();
  }

  // FLÈCHE PRÉCÉDENTE
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goTo(current - 1);
    });
  }

  // FLÈCHE SUIVANTE
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goTo(current + 1);
    });
  }

  // CLICK SUR UNE IMAGE
  cards.forEach((card, index) => {

    card.addEventListener("click", () => {

      if (index !== current) {
        goTo(index);
      }

    });

  });

  // CLAVIER : FLÈCHES GAUCHE / DROITE
  slider.addEventListener("keydown", (event) => {

    if (event.key === "ArrowLeft") {
      goTo(current - 1);
    }

    if (event.key === "ArrowRight") {
      goTo(current + 1);
    }

  });

  // ÉVITER LES TIMERS EN ARRIÈRE-PLAN
  document.addEventListener("visibilitychange", () => {

    if (document.hidden) {
      stopAuto();
    } else {
      updateSlider(current);
      startAuto();
    }

  });

  // INITIALISATION
  updateSlider(0);
  startAuto();

});
