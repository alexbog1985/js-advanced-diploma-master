
import Vampire from '../Vampire';
import Character from '../../Character';

describe('Vampire class', () => {
  let vampire;

  beforeEach(() => {
    vampire = new Vampire(1);
  });

  test('должен корректно наследовать от Character', () => {
    expect(vampire instanceof Character).toBe(true);
    expect(vampire instanceof Vampire).toBe(true);
  });

  test('должен принимать уровень и тип персонажа', () => {
    expect(vampire.level).toBe(1);
    expect(vampire.type).toBe('vampire');
  });

  test('должен принимать тип персонажа как параметр', () => {
    const specialVampire = new Vampire(1, 'special');
    expect(specialVampire.type).toBe('special');
  });

  test('должен иметь базовые характеристики атаки и защиты', () => {
    expect(vampire.attack).toBe(25);
    expect(vampire.defense).toBe(25);
  });

  test('должен иметь корректные значения по умолчанию для типа', () => {
    const defaultVampire = new Vampire(1);
    expect(defaultVampire.type).toBe('vampire');
  });

  test('должен корректно обрабатывать различные уровни', () => {
    const level5Vampire = new Vampire(5);
    expect(level5Vampire.level).toBe(5);

    const level10Vampire = new Vampire(10);
    expect(level10Vampire.level).toBe(10);
  });
});
