
/* EFECTO — mensaje del anfitrión.
   1) Reproduce assets/audio/anfitrion si existe.
   2) Si no existe, utiliza síntesis de voz en español.
   3) Solo controla la reproducción.
   4) No muestra líneas de texto ni interactúa con el burrito. */

window.App = window.App || {};
App.Effects = App.Effects || {};

App.Effects.HostAudio = function (opts, audioEl, cb) {
  var self = this;

  opts = opts || {};
  cb = cb || {};

  var lines = Array.isArray(opts.lineas) ? opts.lineas : [];
  var files = Array.isArray(opts.archivos) ? opts.archivos : [];

  var hasFile = null;
  var token = 0;
  var voice = null;

  var tts =
    ("speechSynthesis" in window) &&
    ("SpeechSynthesisUtterance" in window);

  this.playing = false;

  function pickVoice() {
    if (!tts) return;

    var vs = speechSynthesis.getVoices() || [];
    var want = (opts.idioma || "es-MX").toLowerCase();

    voice =
      vs.filter(function (v) {
        return v.lang.toLowerCase() === want;
      })[0] ||
      vs.filter(function (v) {
        return v.lang.toLowerCase().indexOf("es") === 0;
      })[0] ||
      null;
  }

  if (tts) {
    pickVoice();

    if (speechSynthesis.addEventListener) {
      speechSynthesis.addEventListener("voiceschanged", pickVoice);
    }
  }

  this.available = function () {
    return hasFile !== false || tts;
  };

  /* Archivos de audio */
  var types = {
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    webm: "audio/webm"
  };

  files.forEach(function (src, i) {
    var s = document.createElement("source");

    s.src = src;

    s.type =
      types[src.split(".").pop().toLowerCase()] || "";

    if (i === files.length - 1) {
      s.addEventListener("error", function () {
        hasFile = false;

        if (cb.onReady) {
          cb.onReady(self.available());
        }
      });
    }

    audioEl.appendChild(s);
  });

  audioEl.addEventListener("loadedmetadata", function () {
    hasFile = true;

    if (cb.onReady) {
      cb.onReady(true);
    }
  });

  audioEl.addEventListener("error", function () {
    if (hasFile !== true) {
      hasFile = false;

      if (cb.onReady) {
        cb.onReady(self.available());
      }
    }
  });

  audioEl.addEventListener("ended", function () {
    finish();
  });

  try {
    audioEl.load();
  } catch (e) {}

  /* Síntesis de voz.
     No actualiza texto en pantalla ni llama a cb.onLine. */
  function speakFrom(i, t) {
    if (!self.playing || t !== token) return;

    if (i >= lines.length) {
      finish();
      return;
    }

    var u = new SpeechSynthesisUtterance(lines[i]);

    u.lang = voice
      ? voice.lang
      : (opts.idioma || "es-MX");

    if (voice) {
      u.voice = voice;
    }

    u.rate = opts.velocidad || 0.95;
    u.pitch = 1.05;

    u.onend = function () {
      setTimeout(function () {
        speakFrom(i + 1, t);
      }, 300);
    };

    u.onerror = function () {
      finish();
    };

    speechSynthesis.speak(u);
  }

  function finish() {
    if (!self.playing) return;

    self.playing = false;
    token++;

    try {
      audioEl.pause();
    } catch (e) {}

    if (tts) {
      speechSynthesis.cancel();
    }

    if (cb.onEnd) {
      cb.onEnd();
    }
  }

  this.stop = finish;

  /* Play / Pausa */
  this.toggle = function () {
    if (this.playing) {
      finish();
      return;
    }

    this.playing = true;
    token++;

    var t = token;

    if (cb.onStart) {
      cb.onStart();
    }

    if (hasFile !== false) {
      try {
        audioEl.currentTime = 0;
      } catch (e) {}

      var p = audioEl.play();

      if (p && p.catch) {
        p.catch(function () {
          if (self.playing && t === token) {
            if (tts) {
              speakFrom(0, t);
            } else {
              finish();
            }
          }
        });
      }
    } else if (tts) {
      speechSynthesis.cancel();
      speakFrom(0, t);
    } else {
      finish();
    }
  };
};
