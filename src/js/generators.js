/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */ import Team from './Team';

export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const randomIndex = Math.floor(Math.random() * allowedTypes.length);
    const SelectedType = allowedTypes[randomIndex];
    const randomLevel = Math.floor(Math.random() * maxLevel);

    yield new SelectedType(randomLevel);
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const generator = characterGenerator(allowedTypes, maxLevel);
  const characters = [];

  for (let i = 0; i < characterCount; i++) {
    characters.push(generator.next().value);
  }

  return new Team(characters);
}
