
import Magician from '../Magician';
import Character from '../../Character';

describe('Magician class', () => {
  let magician;

  beforeEach(() => {
    magician = new Magician(1);
  });

  test('должен корректно наследовать от Character', () => {
    expect(magician instanceof Character).toBe(true);
    expect(magician instanceof Magician).toBe(true);
  });

  test('должен принимать уровень и тип персонажа', () => {
    expect(magician.level).toBe(1);
    expect(magician.type).toBe('magician');
  });

  test('должен принимать тип персонажа как параметр', () => {
    const specialMagician = new Magician(1, 'special');
    expect(specialMagician.type).toBe('special');
  });

  test('должен иметь базовые характеристики атаки и защиты', () => {
    expect(magician.attack).toBe(10);
    expect(magician.defense).toBe(40);
  });

  test('должен иметь корректные значения по умолчанию для типа', () => {
    const defaultMagician = new Magician(1);
    expect(defaultMagician.type).toBe('magician');
  });

  test('должен корректно обрабатывать различные уровни', () => {
    const level5Magician = new Magician(5);
    expect(level5Magician.level).toBe(5);

    const level10Magician = new Magician(10);
    expect(level10Magician.level).toBe(10);
  });
});
