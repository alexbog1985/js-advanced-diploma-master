
import Bowman from '../Bowman';
import Character from '../../Character';

describe('Bowman class', () => {
  let bowman;

  beforeEach(() => {
    bowman = new Bowman(1);
  });

  test('должен корректно наследовать от Character', () => {
    expect(bowman instanceof Character).toBe(true);
    expect(bowman instanceof Bowman).toBe(true);
  });

  test('должен принимать уровень и тип персонажа', () => {
    expect(bowman.level).toBe(1);
    expect(bowman.type).toBe('bowman');
  });

  test('должен принимать тип персонажа как параметр', () => {
    const specialBowman = new Bowman(1, 'special');
    expect(specialBowman.type).toBe('special');
  });

  test('должен иметь базовые характеристики атаки и защиты', () => {
    expect(bowman.attack).toBe(25);
    expect(bowman.defense).toBe(25);
  });

  test('должен иметь корректные значения по умолчанию для типа', () => {
    const defaultBowman = new Bowman(1);
    expect(defaultBowman.type).toBe('bowman');
  });

  test('должен корректно обрабатывать различные уровни', () => {
    const level5Bowman = new Bowman(5);
    expect(level5Bowman.level).toBe(5);

    const level10Bowman = new Bowman(10);
    expect(level10Bowman.level).toBe(10);
  });
});
