const { emitEvent } = require("../services/socket.service");

const handleChangeScreenEvent = (req, res) => {
  emitEvent("next-screen");
  res.send({ message: "Cambio de pantalla exitoso" });
};

module.exports = {
  handleChangeScreenEvent,
};
