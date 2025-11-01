import Character from "../Character";
import Bowman from "../characters/Bowman";
import Daemon from "../characters/Daemon";
import Magician from "../characters/Magician";
import Swordsman from "../characters/Swordsman";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";


describe("Character", () => {
  test('должен выбрасывать исключение при попытке создать объект на прямую', () => {
    expect(() => new Character(1)).toThrow('Нельзя создавать экземпляры базового класса Character напрямую');
  });
});

  const inheritedClassesTestCases = [
    { Class: Bowman, level: 1, type: 'bowman' },
    { Class: Swordsman, level: 1, type: 'swordsman' },
    { Class: Magician, level: 1, type: 'magician' },
    { Class: Daemon, level: 1, type: 'daemon' },
    { Class: Undead, level: 1, type: 'undead' },
    { Class: Vampire, level: 1, type: 'vampire' }
  ];

  inheritedClassesTestCases.forEach(({ Class, level, type }) => {
    test(`не должен выбрасывать исключение при создании объекта ${type}`, () => {
      expect(() => new Class(level)).not.toThrow();
    });
  });
