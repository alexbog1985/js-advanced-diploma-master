import { characterGenerator, generateTeam } from '../generators';
import Team from '../Team';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import Swordsman from '../characters/Swordsman';

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
    ({ allowedTypes, maxLevel, expectedTypes, iterations }) => {
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
      expect(generatedTypes.size).toBe(expectedTypes.length);
    });
  const infinityTestCases = [
    { allowedTypes: [Swordsman], maxLevel: 1 },
    { allowedTypes: [Bowman, Magician], maxLevel: 3 },
    { allowedTypes: [Undead, Vampire, Daemon], maxLevel: 5 }
  ];
  test.each(infinityTestCases)(
    'должен генерировать бесконечную последовательность типов: $allowedTypes.length',
    ({ allowedTypes, maxLevel }) => {
      const generator = characterGenerator(allowedTypes, maxLevel);
      const largeNumber = 1000;

      for (let i = 0; i < largeNumber; i++) {
        const result = generator.next();
        expect(result.done).toBe(false);
        expect(result.value).toBeDefined();
        expect(result.value.level).toBeGreaterThanOrEqual(1);
      }
    }
  );
});

describe('generateTeam - Data Driven Tests', () => {
  const teamTestCases = [
    {
      name: 'small team with one type',
      allowedTypes: [Swordsman],
      maxLevel: 2,
      characterCount: 1,
      expectedTeamSize: 1
    },
    {
      name: 'medium team with multiple types',
      allowedTypes: [Bowman, Magician],
      maxLevel: 3,
      characterCount: 4,
      expectedTeamSize: 4
    },
    {
      name: 'large team with all types',
      allowedTypes: [Swordsman, Bowman, Magician, Undead, Vampire, Daemon],
      maxLevel: 4,
      characterCount: 10,
      expectedTeamSize: 10
    },
    {
      name: 'high level team',
      allowedTypes: [Magician, Daemon],
      maxLevel: 10,
      characterCount: 5,
      expectedTeamSize: 5
    },
    {
      name: 'empty team (edge case)',
      allowedTypes: [Swordsman],
      maxLevel: 1,
      characterCount: 0,
      expectedTeamSize: 0
    }
  ];

  test.each(teamTestCases)(
    'should create team correctly for: $name',
    ({ allowedTypes, maxLevel, characterCount, expectedTeamSize }) => {
      const team = generateTeam(allowedTypes, maxLevel, characterCount);

      expect(team).toBeInstanceOf(Team);
      expect(team.characters).toHaveLength(expectedTeamSize);

      // Проверяем каждого персонажа в команде
      team.characters.forEach(character => {
        const isValidType = allowedTypes.some(
          Type => character instanceof Type
        );
        expect(isValidType).toBe(true);
        expect(character.level).toBeGreaterThanOrEqual(1);
        expect(character.level).toBeLessThanOrEqual(maxLevel);
      });
    }
  );

  // Тесты на распределение уровней
  const levelDistributionCases = [
    { maxLevel: 1, expectedLevels: [1] },
    { maxLevel: 2, expectedLevels: [1, 2] },
    { maxLevel: 3, expectedLevels: [1, 2, 3] },
    { maxLevel: 5, expectedLevels: [1, 2, 3, 4, 5] }
  ];

  test.each(levelDistributionCases)(
    'should generate characters with levels in range 1-$maxLevel',
    ({ maxLevel, expectedLevels }) => {
      const team = generateTeam([Swordsman, Bowman], maxLevel, 50);
      const generatedLevels = new Set();

      team.characters.forEach(character => {
        generatedLevels.add(character.level);
        expect(character.level).toBeGreaterThanOrEqual(1);
        expect(character.level).toBeLessThanOrEqual(maxLevel);
      });

      // Проверяем, что все ожидаемые уровни были сгенерированы
      // (при достаточно большой выборке)
      expectedLevels.forEach(level => {
        expect(generatedLevels.has(level)).toBe(true);
      });
    }
  );
});
