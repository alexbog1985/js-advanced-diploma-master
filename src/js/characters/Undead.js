import Character from '../Character';

export default class Undead extends Character {
  constructor(level, type = 'undead') {
    super(level, type);
    this.attack = 40;
    this.defense = 10;
    this.moveRange = 4;
    this.attackRange = 1;
  };
}
