import { characterGenerator, generateTeam} from '../generators';
import Team from '../Team';
import Bowman from "../characters/Bowman";
import Daemon from "../characters/Daemon";
import Magician from "../characters/Magician";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";
import Swordsman from "../characters/Swordsman";

describe('characterGenerator', () => {
  const testCases = [
    {
      name: 'один тип персонажа',
      allowedTypes: [Swordsman],
      maxLevel: 1,
      expectedTypes: [Swordsman],
      iterations: 10
    },
    {
      name: 'несколько типов персонажей',
      allowedTypes: [Swordsman, Magician],
      maxLevel: 2,
      expectedTypes: [Swordsman, Magician],
      iterations: 20
    },
    {
      name: 'все типы персонажей',
      allowedTypes: [Swordsman, Magician, Daemon, Bowman, Vampire, Undead],
      maxLevel: 4,
      expectedTypes: [Swordsman, Magician, Daemon, Bowman, Vampire, Undead],
      iterations: 30
    },
    {
      name: 'высокий уровень персонажей',
      allowedTypes: [Swordsman, Magician],
      maxLevel: 10,
      expectedTypes: [Swordsman, Magician],
      iterations: 15
    }
  ];

  test.each(testCases)(
    'должен генерировать корректных персонажей для $name',
    ({allowedTypes, maxLevel, expectedTypes, iterations}) => {
      const generator = characterGenerator(allowedTypes, maxLevel);
      const generatedTypes = new Set();

      for (let i = 0; i < iterations; i++) {
        const character = generator.next().value;

        // Проверяем уровень
        expect(character.level).toBeGreaterThanOrEqual(1);
        expect(character.level).toBeLessThanOrEqual(maxLevel);

        // Проверяем тип
        const isValidType = expectedTypes.some(
          Type => character instanceof Type
        );
        expect(isValidType).toBe(true);

        // Собираем уникальные типы для проверки распределения
        generatedTypes.add(character.constructor.name);
      }

      if (iterations >= expectedTypes.length * 3) {
        expect(generatedTypes.size).toBe(expectedTypes.length);
      }
    });
});
