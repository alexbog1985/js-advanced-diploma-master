import Character from "../Character";

export default class Bowman extends Character {
  constructor(level, type = 'bowman') {
    super(level, type);
    this.attack = 10;
    this.defense = 10;
  };
}
