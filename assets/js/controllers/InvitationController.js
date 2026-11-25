/* CONTROLADOR — conecta modelo, vista y efectos */
window.App = window.App || {};

App.InvitationController = function (model, view) {
  var c = model.c;
  this.model = model;
  this.view = view;
  this.snow = new App.Effects.Snow(view.el.snow);
  this.music = new App.Effects.Music(c.musica);
  this.burrito = new App.Effects.Burrito({
    el: view.el.burro, track: view.el.burroTrack, bubble: view.el.bubble,
    frases: c.mensajes, sonido: c.burrito.sonido, snow: this.snow
  });
  var self = this;
  this.host = new App.Effects.HostAudio(
    { archivos: c.anfitrion.archivos, lineas: c.mensajes, idioma: c.anfitrion.idioma, velocidad: c.anfitrion.velocidad },
    view.el.hostAudio,
    {
      onStart: function () {
        self.music.duck(true);
        self.burrito.setBusy(true);
        view.setHostState(true);
      },
      onLine: function (i) {
        view.highlightLine(i);
        self.burrito.say(c.mensajes[i], 0);
      },
      onEnd: function () {
        self.music.duck(false);
        self.burrito.setBusy(false);
        self.burrito.hush();
        view.setHostState(false);
        view.highlightLine(-1);
      },
      onReady: function (ok) { view.setHostAvailable(ok); }
    }
  );
};

App.InvitationController.prototype = {
  init: function () {
    var self = this, v = this.view;

    document.body.classList.add("locked");
    v.renderTexts(this.model);
    v.renderSky();
    v.decorateFrames();
    v.renderMap(this.model);
    v.initReveal();
    this.snow.start();

    // Abrir invitación: puertas + música (el navegador exige un toque para el sonido)
    v.el.btnOpen.addEventListener("click", function (e) {
      v.openGate();
      self.snow.burst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      self.music.start();
      v.setMusicState(self.music.playing);
      if (self.model.c.burrito.activo) self.burrito.enable();
    });

    // Música
    v.el.btnMusic.addEventListener("click", function () {
      var on = self.music.toggle();
      v.setMusicState(on);
      v.showToast(on ? "Música activada" : "Música en pausa");
    });

    // Mensaje del anfitrión
    v.el.btnHost.addEventListener("click", function () { self.host.toggle(); });

    // Tipo de mapa
    v.el.mapSat.addEventListener("click", function () { v.setMapLayer("sat"); });
    v.el.mapStreet.addEventListener("click", function () { v.setMapLayer("street"); });

    // Confirmar asistencia
    v.el.btnRsvp.addEventListener("click", function (e) {
      self.snow.burst(e.clientX, e.clientY);
      v.showToast("Abriendo WhatsApp…");
    });
  }
};
