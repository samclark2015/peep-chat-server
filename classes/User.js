module.exports = class User {
  constructor(name, ws) {
    this.name = name;
    this.socket = ws;
  }
}
