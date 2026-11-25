/* EFECTO — nieve y ráfaga de estrellas */
window.App = window.App || {};
App.Effects = App.Effects || {};

App.Effects.Snow = function (canvas) {
  var ctx = canvas.getContext("2d");
  var flakes = [], w = 0, h = 0, raf = null, bursts = [];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(140, Math.floor(w / 9));
    while (flakes.length < n) flakes.push(make(true));
    flakes.length = n;
  }

  function make(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      r: Math.random() * 2.8 + 0.8,
      v: Math.random() * 0.9 + 0.4,
      s: Math.random() * Math.PI * 2,
      d: Math.random() * 0.02 + 0.005,
      gold: Math.random() < 0.2
    };
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      ctx.fillStyle = f.gold ? "rgba(246,226,164,.95)" : "rgba(255,255,255,.88)";
      ctx.shadowColor = f.gold ? "rgba(246,226,164,.9)" : "transparent";
      ctx.shadowBlur = f.gold ? 8 : 0;
      f.s += f.d;
      f.y += f.v;
      f.x += Math.sin(f.s) * 0.5;
      if (f.y > h + 10) flakes[i] = make(false);
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, 6.283);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (var j = bursts.length - 1; j >= 0; j--) {
      var b = bursts[j];
      b.x += b.vx; b.y += b.vy; b.vy += 0.12; b.life -= 0.018;
      if (b.life <= 0) { bursts.splice(j, 1); continue; }
      ctx.save();
      ctx.globalAlpha = b.life;
      ctx.fillStyle = b.c;
      ctx.translate(b.x, b.y); ctx.rotate(b.life * 8);
      ctx.fillRect(-b.s, -b.s, b.s * 2, b.s * 2);
      ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  }

  this.burst = function (x, y) {
    if (reduce) return;
    var colors = ["#F0C05A", "#FFE9A8", "#C22A2F", "#1F7A57", "#fff"];
    for (var i = 0; i < 46; i++) {
      var a = Math.random() * 6.283, sp = Math.random() * 6 + 2;
      bursts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, s: Math.random() * 3 + 2, life: 1, c: colors[i % colors.length] });
    }
  };

  this.start = function () {
    if (reduce) return;
    resize();
    window.addEventListener("resize", resize);
    frame();
  };
};
