import Character from '../Character';

export default class Daemon extends Character {
  constructor(level, type = 'daemon') {
    super(level, type);
    this.attack = 10;
    this.defense = 10;
    this.moveRange = 1;
    this.attackRange = 4;
  };
}
