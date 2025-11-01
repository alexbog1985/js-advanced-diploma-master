import Character from '../Character';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

describe('Character', () => {
  test('должен выбрасывать исключение при попытке создать объект на прямую', () => {
    expect(() => new Character(1)).toThrow('Нельзя создавать экземпляры базового класса Character напрямую');
  });
});

const characterClasses = [
  { Class: Bowman, type: 'bowman', attack: 25, defence: 25 },
  { Class: Swordsman, type: 'swordsman', attack: 40, defence: 10 },
  { Class: Magician, type: 'magician', attack: 10, defence: 40 },
  { Class: Daemon, type: 'daemon', attack: 10, defence: 10 },
  { Class: Undead, type: 'undead', attack: 40, defence: 10 },
  { Class: Vampire, type: 'vampire', attack: 25, defence: 25 },
];

describe.each(characterClasses)(
  'Класс $Class.name',
  ({ Class, type, attack, defence }) => {
    test('должен корректно создавать экземпляр', () => {
      const character = new Class(1);
      expect(character).toBeInstanceOf(Class);
      expect(character).toBeInstanceOf(Character);
    });

    test('должен иметь правильные характеристики для 1 уровня', () => {
      const character = new Class(1);
      expect(character.level).toBe(1);
      expect(character.type).toBe(type);
      expect(character.attack).toBe(attack);
      expect(character.defence).toBe(defence);
      expect(character.health).toBe(50);
    });

    test('должен позволять задавать кастомный тип', () => {
      const customType = 'custom-type';
      const character = new Class(1, customType);
      expect(character.type).toBe(customType);
    });

    const levelTestCases = [2, 3, 4];
    test.each(levelTestCases)('должен корректно создавать персонажа уровня %i', (level) => {
      const character = new Class(level);
      expect(character.level).toBe(level);
    });
  }
);

