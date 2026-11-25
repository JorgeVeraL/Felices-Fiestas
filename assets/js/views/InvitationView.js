
/* VISTA — todo lo que toca el DOM */
window.App = window.App || {};

App.InvitationView = function () {
  var $ = function (id) {
    return document.getElementById(id);
  };

  this.el = {
    gate: $("gate"),
    btnOpen: $("btn-open"),
    btnMusic: $("btn-music"),

    btnRsvp: $("btn-rsvp"),
    btnCall: $("btn-call"),
    btnGmaps: $("btn-gmaps"),
    btnWaze: $("btn-waze"),

    mapSat: $("map-sat"),
    mapStreet: $("map-street"),

    countdown: $("countdown"),
    toast: $("toast"),
    sky: $("sky"),
    snow: $("snow"),

    host: $("host"),
    btnHost: $("btn-host"),
    hostLabel: $("host-label"),
    hostLines: $("host-lines"),
    hostAudio: $("host-audio"),

    burro: $("burro"),
    burroTrack: $("burro-track"),
    bubble: $("bubble")
  };

  this._toastTimer = null;
  this.map = null;
  this.layers = {};
  this.currentLayer = null;
};

App.InvitationView.prototype = {
  /* Rellena los textos [data-bind] y los enlaces */
  renderTexts: function (model) {
    var c = model.c;

    var map = {
      titulo: c.titulo,
      familia: c.familia,
      saludo: c.saludo,
      agradecimiento: c.agradecimiento,

      dia: c.fecha.dia,
      mes: c.fecha.mes,
      ciclo: c.fecha.ciclo,

      pueblo: c.lugar.pueblo,
      calle: c.lugar.calle,

      coords: model.coordsTexto(),
      telefono: c.contacto.telefonoVisible,

      anfTitulo: c.anfitrion.titulo
    };

    document.querySelectorAll("[data-bind]").forEach(function (n) {
      var k = n.getAttribute("data-bind");

      if (map[k] != null) {
        n.textContent = map[k];
      }
    });

    this.el.btnRsvp.href = model.urlWhatsApp();
    this.el.btnCall.href = model.urlLlamada();
    this.el.btnGmaps.href = model.urlGoogleMaps();
    this.el.btnWaze.href = model.urlWaze();

    var txt = model.textoCuentaRegresiva();

    if (txt) {
      this.el.countdown.textContent = txt;
      this.el.countdown.hidden = false;
    }

    /* SECCIÓN DEL ANFITRIÓN
       No cargar App.Config.mensajes aquí.
       Las frases pertenecen exclusivamente al burrito.
       El anfitrión muestra únicamente su reproductor. */

    if (!c.anfitrion.activo) {
      this.el.host.hidden = true;
    } else {
      this.el.host.hidden = false;

      if (this.el.hostLines) {
        this.el.hostLines.innerHTML = "";
        this.el.hostLines.hidden = true;
      }
    }

    /* BURRITO INTERACTIVO */
    if (!c.burrito.activo) {
      this.el.burroTrack.hidden = true;
    }
  },

  /* Esquinas doradas en los marcos */
  decorateFrames: function () {
    document.querySelectorAll(".frame").forEach(function (f) {
      ["tl", "tr", "bl", "br"].forEach(function (pos) {
        var i = document.createElement("img");

        i.src = "assets/img/esquina.svg";
        i.alt = "";
        i.className = "corner " + pos;

        f.appendChild(i);
      });
    });
  },

  /* Estrellitas y destellos (bokeh) de fondo */
  renderSky: function () {
    var frag = document.createDocumentFragment();
    var i;

    var tones = [
      "#D8B25A",
      "#B3202E",
      "#2a8a63",
      "#F6E2A4"
    ];

    for (i = 0; i < 9; i++) {
      var b = document.createElement("b");
      var s = 90 + Math.random() * 220;

      b.style.width = b.style.height = s + "px";
      b.style.left = Math.random() * 100 + "%";
      b.style.top = Math.random() * 100 + "%";
      b.style.background = tones[i % tones.length];

      b.style.animationDuration =
        (20 + Math.random() * 20).toFixed(1) + "s";

      b.style.animationDelay =
        (-Math.random() * 20).toFixed(1) + "s";

      frag.appendChild(b);
    }

    for (i = 0; i < 55; i++) {
      var st = document.createElement("i");

      st.style.left = Math.random() * 100 + "%";
      st.style.top = Math.random() * 100 + "%";

      st.style.animationDelay =
        (Math.random() * 3).toFixed(2) + "s";

      st.style.animationDuration =
        (2 + Math.random() * 3).toFixed(2) + "s";

      frag.appendChild(st);
    }

    this.el.sky.appendChild(frag);
  },

  /* Mapa con gorro navideño */
  renderMap: function (model) {
    var self = this;
    var l = model.c.lugar;

    var fallback = document.getElementById("map-fallback");
    var mapDiv = document.getElementById("map");

    if (typeof L === "undefined") {
      mapDiv.style.display = "none";
      fallback.hidden = false;
      return;
    }

    this.map = L.map("map", {
      scrollWheelZoom: false,
      tap: false
    }).setView([l.lat, l.lng], l.zoom);

    this.layers.sat = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        maxNativeZoom: 17,
        attribution:
          "Imágenes © Esri, Maxar, Earthstar Geographics"
      }
    );

    this.layers.street = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
        attribution: "© OpenStreetMap, © CARTO"
      }
    );

    var stats = {
      sat: { ok: 0, bad: 0 },
      street: { ok: 0, bad: 0 }
    };

    Object.keys(this.layers).forEach(function (k) {
      self.layers[k].on("tileload", function () {
        stats[k].ok++;
      });

      self.layers[k].on("tileerror", function () {
        stats[k].bad++;

        if (
          self.currentLayer === k &&
          stats[k].ok === 0 &&
          stats[k].bad >= 4
        ) {
          var other = k === "sat" ? "street" : "sat";

          if (
            stats[other].bad >= 4 &&
            stats[other].ok === 0
          ) {
            fallback.hidden = false;
          } else {
            self.setMapLayer(other);
          }
        }
      });
    });

    this.setMapLayer("sat");

    var icon = L.divIcon({
      className: "",
      html:
        '<div class="pin">' +
          '<img class="pin-hat" src="assets/img/gorro.svg" alt="">' +
          '<span class="pin-pulse"></span>' +
          '<span class="pin-body"></span>' +
        "</div>",
      iconSize: [60, 78],
      iconAnchor: [30, 70],
      popupAnchor: [0, -66]
    });

    L.marker([l.lat, l.lng], {
      icon: icon,
      title: l.pueblo
    })
      .addTo(this.map)
      .bindPopup("<strong>" + l.pueblo + "</strong><br>" + l.calle)
      .openPopup();
  },

  setMapLayer: function (name) {
    if (!this.map || !this.layers[name]) return;

    var self = this;

    Object.keys(this.layers).forEach(function (k) {
      if (
        k !== name &&
        self.map.hasLayer(self.layers[k])
      ) {
        self.map.removeLayer(self.layers[k]);
      }
    });

    if (!this.map.hasLayer(this.layers[name])) {
      this.layers[name].addTo(this.map);
    }

    this.currentLayer = name;

    this.el.mapSat.setAttribute(
      "aria-pressed",
      name === "sat" ? "true" : "false"
    );

    this.el.mapStreet.setAttribute(
      "aria-pressed",
      name === "street" ? "true" : "false"
    );
  },

  /* Aparición al hacer scroll */
  initReveal: function () {
    var items = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (n) {
        n.classList.add("in");
      });

      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.12
    });

    items.forEach(function (n) {
      io.observe(n);
    });
  },

  openGate: function () {
    var g = this.el.gate;
    var map = this.map;

    g.classList.add("open");
    document.body.classList.remove("locked");

    setTimeout(function () {
      g.classList.add("gone");
    }, 1500);

    if (map) {
      setTimeout(map.invalidateSize.bind(map), 300);
    }
  },

  setMusicState: function (on) {
    this.el.btnMusic.setAttribute(
      "aria-pressed",
      on ? "true" : "false"
    );

    this.el.btnMusic.setAttribute(
      "aria-label",
      on ? "Pausar música" : "Activar música"
    );
  },

  /* Estado del mensaje del anfitrión */
  setHostState: function (playing) {
    this.el.host.classList.toggle("playing", playing);

    this.el.btnHost.setAttribute(
      "aria-pressed",
      playing ? "true" : "false"
    );

    this.el.btnHost.setAttribute(
      "aria-label",
      playing ? "Detener mensaje" : "Reproducir mensaje"
    );

    this.el.hostLabel.textContent =
      playing ? "Escuchando…" : "Reproducir mensaje";
  },

  /* Ya no se resaltan frases debajo del audio */
  highlightLine: function () {
    if (this.el.hostLines) {
      this.el.hostLines.innerHTML = "";
      this.el.hostLines.hidden = true;
    }
  },

  setHostAvailable: function (ok) {
    this.el.btnHost.disabled = !ok;

    if (!ok) {
      this.el.hostLabel.textContent =
        "Mensaje no disponible en este dispositivo";
    }
  },

  showToast: function (msg) {
    var t = this.el.toast;

    t.textContent = msg;
    t.classList.add("show");

    clearTimeout(this._toastTimer);

    this._toastTimer = setTimeout(function () {
      t.classList.remove("show");
    }, 2800);
  }
};
