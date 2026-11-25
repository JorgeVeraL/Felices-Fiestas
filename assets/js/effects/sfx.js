/* EFECTO — sonidos cortos (rebuzno del burrito y campanita), generados con Web Audio */
window.App = window.App || {};
App.Effects = App.Effects || {};

App.Effects.Sfx = (function () {
  var ctx = null;
  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function bray() {
    var c = ac(); if (!c) return;
    var t = c.currentTime;
    var out = c.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.28, t + 0.06);
    out.gain.setValueAtTime(0.28, t + 0.75);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
    var f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 950; f.Q.value = 2.2;
    f.connect(out); out.connect(c.destination);

    [1, 0.5].forEach(function (mul, i) {
      var o = c.createOscillator();
      o.type = i === 0 ? "sawtooth" : "square";
      var g = c.createGain(); g.gain.value = i === 0 ? 1 : 0.35;
      // "hii" sube, "jooo" baja
      o.frequency.setValueAtTime(260 * mul, t);
      o.frequency.exponentialRampToValueAtTime(640 * mul, t + 0.38);
      o.frequency.exponentialRampToValueAtTime(420 * mul, t + 0.55);
      o.frequency.exponentialRampToValueAtTime(190 * mul, t + 1.2);
      var lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 17; lg.gain.value = 18 * mul;
      lfo.connect(lg); lg.connect(o.frequency);
      o.connect(g); g.connect(f);
      o.start(t); lfo.start(t); o.stop(t + 1.3); lfo.stop(t + 1.3);
    });
  }

  function ding() {
    var c = ac(); if (!c) return;
    var t = c.currentTime;
    [1760, 2637].forEach(function (fr, i) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = fr;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(i ? 0.05 : 0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 1);
    });
  }

  return { bray: bray, ding: ding };
})();
