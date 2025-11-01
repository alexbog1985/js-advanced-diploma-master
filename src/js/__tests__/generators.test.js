import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Team from '../Team';

describe('characterGenerator', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;

  test('должен генерировать бесконечную последовательность персонажей', () => {
    const generator = characterGenerator(allowedTypes, maxLevel);
    const characters = new Set();

    // Генерируем достаточно много персонажей для проверки
    for (let i = 0; i < 50; i++) {
      const character = generator.next().value;
      characters.add(character);

      // Проверяем, что персонаж имеет правильный тип
      expect(allowedTypes.some(Type => character instanceof Type)).toBe(true);

      // Проверяем, что уровень в допустимом диапазоне
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(maxLevel);
    }

    // Должны быть сгенерированы разные персонажи
    expect(characters.size).toBeGreaterThan(1);
  });

  test('должен учитывать allowedTypes', () => {
    const singleType = [Bowman];
    const generator = characterGenerator(singleType, 1);

    for (let i = 0; i < 10; i++) {
      const character = generator.next().value;
      expect(character).toBeInstanceOf(Bowman);
    }
  });
});

describe('generateTeam', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 2;
  const characterCount = 4;

  test('должен создавать команду с правильным количеством персонажей', () => {
    const team = generateTeam(allowedTypes, maxLevel, characterCount);

    expect(team).toBeInstanceOf(Team);
    expect(team.characters).toHaveLength(characterCount);
  });

  test('должен создавать персонажей в правильном диапазоне уровней', () => {
    const team = generateTeam(allowedTypes, maxLevel, 10);

    team.characters.forEach(character => {
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(maxLevel);
    });
  });

  test('должен создавать персонажей только из allowedTypes', () => {
    const team = generateTeam(allowedTypes, maxLevel, 5);

    team.characters.forEach(character => {
      const isValidType = allowedTypes.some(Type => character instanceof Type);
      expect(isValidType).toBe(true);
    });
  });
});
