/* MODELO — datos y reglas de la invitación (sin tocar el DOM) */
window.App = window.App || {};

App.InvitationModel = function (config) {
  this.c = config;
};

App.InvitationModel.prototype = {
  coordsTexto: function () {
    return this.c.lugar.lat + ", " + this.c.lugar.lng;
  },

  diasRestantes: function () {
    var partes = this.c.fecha.iso.split("-");
    var evento = new Date(+partes[0], +partes[1] - 1, +partes[2]);
    var hoy = new Date();
    hoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    return Math.round((evento - hoy) / 86400000);
  },

  textoCuentaRegresiva: function () {
    var d = this.diasRestantes();
    if (d > 1) return "Faltan " + d + " días";
    if (d === 1) return "¡Es mañana!";
    if (d === 0) return "¡Es hoy!";
    return "";
  },

  urlWhatsApp: function () {
    return "https://wa.me/" + this.c.contacto.whatsapp + "?text=" + encodeURIComponent(this.c.contacto.mensaje);
  },

  urlLlamada: function () {
    return "tel:+" + this.c.contacto.whatsapp;
  },

  urlGoogleMaps: function () {
    return "https://www.google.com/maps/dir/?api=1&destination=" + this.c.lugar.lat + "," + this.c.lugar.lng;
  },

  urlWaze: function () {
    return "https://waze.com/ul?ll=" + this.c.lugar.lat + "," + this.c.lugar.lng + "&navigate=yes";
  }
};
