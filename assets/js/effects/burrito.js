
/* EFECTO — burrito sabanero con el Niño Dios.
   Camina de izquierda a derecha según el scroll, se voltea si subes,
   muestra frases en globos de diálogo y reacciona al toque.
   IMPORTANTE: no utiliza voz ni reproduce las frases. */

window.App = window.App || {};
App.Effects = App.Effects || {};

App.Effects.Burrito = function (o) {
  var el = o.el;
  var track = o.track;
  var bubble = o.bubble;
  var self = this;

  var x = 0;
  var target = 0;
  var w = 0;
  var vw = 0;
  var left = false;
  var busy = false;
  var idx = 0;

  var hideT = null;
  var hopT = null;
  var visible = false;
  var raf = null;
  var enabled = false;

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var frases = Array.isArray(o.frases) ? o.frases : [];

  function measure() {
    vw = window.innerWidth;
    w = el.offsetWidth;
  }

  function progress() {
    var max =
      document.documentElement.scrollHeight - window.innerHeight;

    return max > 0
      ? Math.min(1, Math.max(0, window.scrollY / max))
      : 0;
  }

  function targetFor(p) {
    var margin = 8;
    var reserve = 76; // deja libre el botón de música

    return (
      margin +
      p * Math.max(0, vw - w - margin - reserve)
    );
  }

  function fit() {
    if (!bubble) return;

    bubble.style.setProperty("--dx", "0px");

    var r = bubble.getBoundingClientRect();
    var dx = 0;

    if (r.left < 8) {
      dx = 8 - r.left;
    } else if (r.right > vw - 8) {
      dx = vw - 8 - r.right;
    }

    bubble.style.setProperty("--dx", dx + "px");
  }

  function loop() {
    var p = progress();

    target = targetFor(p);

    var dx = target - x;

    if (Math.abs(dx) > 0.4) {
      x += dx * 0.09;
    }

    var moving = Math.abs(dx) > 1.4;

    if (Math.abs(dx) > 3) {
      left = dx < 0;
      el.classList.toggle("left", left);
    }

    el.classList.toggle("walking", moving && !reduce);

    el.style.transform =
      "translate3d(" + x.toFixed(1) + "px,0,0)";

    // No mostrar frases automáticamente al hacer scroll.

    if (visible) {
      fit();
    }

    raf = requestAnimationFrame(loop);
  }

  // Mostrar únicamente texto. No utiliza speechSynthesis ni voz.
  this.say = function (text, ms) {
    if (!bubble || !text) return;

    bubble.textContent = text;
    bubble.classList.add("show");

    visible = true;
    fit();

    clearTimeout(hideT);

    if (ms) {
      hideT = setTimeout(function () {
        self.hush();
      }, ms);
    }
  };

  this.hush = function () {
    clearTimeout(hideT);

    if (bubble) {
      bubble.classList.remove("show");
    }

    visible = false;
  };

  this.setBusy = function (b) {
    busy = b;

    el.classList.toggle("talking", b && !reduce);
  };

  function hop() {
    el.classList.remove("hop");

    void el.offsetWidth;

    el.classList.add("hop");

    clearTimeout(hopT);

    hopT = setTimeout(function () {
      el.classList.remove("hop");
    }, 800);
  }

  // Solo al tocar muestra una frase.
  this.tap = function () {
    if (!enabled || busy) return;

    hop();

    var r = el.getBoundingClientRect();

    if (o.snow) {
      o.snow.burst(
        r.left + r.width / 2,
        r.top + r.height * 0.3
      );
    }

    // Efecto de sonido del toque, no voz.
    if (App.Effects.Sfx) {
      if (o.sonido) {
        App.Effects.Sfx.bray();
      } else {
        App.Effects.Sfx.ding();
      }
    }

    if (frases.length > 0) {
      var frase = frases[idx % frases.length];

      self.say(frase, 5200);

      idx++;
    }
  };

  // Al activarse, mostrar solo "¡Tócame!".
  this.enable = function () {
    enabled = true;

    if (track) {
      track.classList.add("on");
    }

    setTimeout(function () {
      if (!busy && !visible) {
        self.say("¡Tócame!", 3200);
      }
    }, 1900);
  };

  // Arranque
  measure();

  x = targetFor(progress());

  el.style.transform =
    "translate3d(" + x + "px,0,0)";

  window.addEventListener("resize", measure);

  el.addEventListener("click", function () {
    self.tap();
  });

  el.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      self.tap();
    }
  });

  loop();
};
