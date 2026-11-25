/* ARRANQUE */
(function () {
  function start() {
    var model = new App.InvitationModel(App.Config);
    var view = new App.InvitationView();
    new App.InvitationController(model, view).init();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();


/* =====================================================
   CUENTA REGRESIVA NAVIDEÑA
   24 de diciembre de 2026 - 4:00 PM
===================================================== */

(function initChristmasCountdown() {
  const countdown = document.getElementById("countdown");

  if (!countdown) return;

  // Fecha local del evento: 24 diciembre 2026, 16:00
  const eventDate = new Date(2026, 11, 24, 16, 0, 0);

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function renderCountdown() {
    const now = new Date();
    const difference = eventDate.getTime() - now.getTime();

    countdown.hidden = false;

    if (difference <= 0) {
      countdown.innerHTML = `
        <span class="countdown-message">
          ¡Hoy celebramos juntos la Navidad!<br>
          <span style="color:#d9b873;">Que el Niño Dios llene sus hogares de amor y bendiciones.</span>
        </span>
      `;
      return;
    }

    const totalSeconds = Math.floor(difference / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdown.innerHTML = `
      <span class="countdown-title">
        Faltan para nuestra celebración
      </span>

      <div class="countdown-grid">
        <div class="countdown-unit">
          <span class="countdown-number">${pad(days)}</span>
          <span class="countdown-label">Días</span>
        </div>

        <div class="countdown-unit">
          <span class="countdown-number">${pad(hours)}</span>
          <span class="countdown-label">Horas</span>
        </div>

        <div class="countdown-unit">
          <span class="countdown-number">${pad(minutes)}</span>
          <span class="countdown-label">Minutos</span>
        </div>

        <div class="countdown-unit">
          <span class="countdown-number">${pad(seconds)}</span>
          <span class="countdown-label">Segundos</span>
        </div>
      </div>
    `;
  }

  renderCountdown();
  setInterval(renderCountdown, 1000);
})();
