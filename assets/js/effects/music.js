/* EFECTO — música navideña
   Si config.musica.archivo tiene un mp3, lo reproduce.
   Si no, genera un villancico (Jingle Bells, dominio público) con Web Audio. */
window.App = window.App || {};
App.Effects = App.Effects || {};

App.Effects.Music = function (opts) {
  var self = this;
  var ctx = null, master = null, noiseBuf = null, timer = null;
  var audioEl = null;
  this.playing = false;
  var ducked = false;

  var BPM = 138, BEAT = 60 / BPM;
  var N = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0 };
  var MELODY = [
    "E","E","E:2","E","E","E:2","E","G","C","D","E:4",
    "F","F","F","F","F","E","E","E","E","D","D","E","D:2","G:2",
    "E","E","E:2","E","E","E:2","E","G","C","D","E:4",
    "F","F","F","F","F","E","E","E","G","G","F","D","C:4"
  ];

  function setup() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    var delay = ctx.createDelay(); delay.delayTime.value = BEAT * 0.75;
    var fb = ctx.createGain(); fb.gain.value = 0.28;
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    master.connect(ctx.destination);
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
    var len = ctx.sampleRate * 0.1;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function note(freq, t, dur) {
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o1.type = "triangle"; o1.frequency.value = freq;
    o2.type = "sine"; o2.frequency.value = freq * 2;
    var g2 = ctx.createGain(); g2.gain.value = 0.35;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur * 1.6, 0.5));
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    o1.start(t); o2.start(t);
    o1.stop(t + dur * 1.8 + 0.3); o2.stop(t + dur * 1.8 + 0.3);
  }

  function bell(t) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 7000; f.Q.value = 3;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t);
  }

  function schedule() {
    var t = ctx.currentTime + 0.15, total = 0;
    MELODY.forEach(function (tok) {
      var p = tok.split(":"), beats = p[1] ? +p[1] : 1;
      note(N[p[0]], t + total * BEAT, beats * BEAT * 0.9);
      total += beats;
    });
    for (var b = 0; b < total; b += 1) bell(t + b * BEAT);
    // bajo suave al inicio de cada compás
    for (var m = 0; m < total; m += 4) note(m % 8 === 0 ? N.C / 2 : N.G / 2, t + m * BEAT, BEAT * 2);
    timer = setTimeout(function () { if (self.playing) schedule(); }, (total * BEAT + 2.2) * 1000);
  }

  this.start = function () {
    if (this.playing) return;
    var vol = ducked ? opts.volumen * 0.15 : opts.volumen;
    if (opts.archivo) {
      if (!audioEl) { audioEl = new Audio(opts.archivo); audioEl.loop = true; }
      audioEl.volume = vol;
      var pr = audioEl.play();
      if (pr && pr.catch) pr.catch(function () {});
      this.playing = true;
      return;
    }
    if (!ctx && !setup()) return;
    if (ctx.state === "suspended") ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.2);
    this.playing = true;
    schedule();
  };

  this.stop = function () {
    if (!this.playing) return;
    this.playing = false;
    clearTimeout(timer);
    if (audioEl) { audioEl.pause(); return; }
    if (ctx) {
      var c = ctx, m = master;
      ctx = null; master = null;
      m.gain.cancelScheduledValues(c.currentTime);
      m.gain.linearRampToValueAtTime(0, c.currentTime + 0.4);
      setTimeout(function () { c.close(); }, 600);
    }
  };

  this.duck = function (on) {
    ducked = on;
    var v = on ? opts.volumen * 0.15 : opts.volumen;
    if (audioEl) audioEl.volume = v;
    if (ctx && master && this.playing) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.5);
    }
  };

  this.toggle = function () { this.playing ? this.stop() : this.start(); return this.playing; };
};
