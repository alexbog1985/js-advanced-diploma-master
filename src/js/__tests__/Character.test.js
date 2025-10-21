import Character from '../Character';

class CharacterTest extends Character {
  constructor(level, type = 'test') {
    super(level, type);
    this.attack = 10;
    this.defense = 5;
  }
}

describe('Character', () => {
  test('тест на ошибку создания экземпляра класса напрямую', () => {
    expect(() => new Character(1))
      .toThrow('Нельзя создавать экземпляры базового класса Character напрямую');
  });
});

describe('Инициализация', () => {
  let character;

  beforeEach(() => {
    character = new CharacterTest(1);
  });

  test('должен устанавливать уровень', () => {
    expect(character.level).toBe(1);
  });

  test('должен устанавливать тип персонажа', () => {
    expect(character.type).toBe('test');
  });

  test('должен устанавливать здоровье по умолчанию', () => {
    expect(character.health).toBe(50);
  });

  test('должен позволять устанавливать атаку в наследнике', () =>{
    expect(character.attack).toBe(10);
  });

  test('должен позволять устанавливать защиту в наследнике', () => {
    expect(character.defense).toBe(5);
  });

});
