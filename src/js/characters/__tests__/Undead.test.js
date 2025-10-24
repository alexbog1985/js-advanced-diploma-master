
import Undead from '../Undead';
import Character from '../../Character';

describe('Undead class', () => {
  let undead;

  beforeEach(() => {
    undead = new Undead(1);
  });

  test('должен корректно наследовать от Character', () => {
    expect(undead instanceof Character).toBe(true);
    expect(undead instanceof Undead).toBe(true);
  });

  test('должен принимать уровень и тип персонажа', () => {
    expect(undead.level).toBe(1);
    expect(undead.type).toBe('undead');
  });

  test('должен принимать тип персонажа как параметр', () => {
    const specialUndead = new Undead(1, 'special');
    expect(specialUndead.type).toBe('special');
  });

  test('должен иметь базовые характеристики атаки и защиты', () => {
    expect(undead.attack).toBe(25);
    expect(undead.defense).toBe(25);
  });

  test('должен иметь корректные значения по умолчанию для типа', () => {
    const defaultUndead = new Undead(1);
    expect(defaultUndead.type).toBe('undead');
  });

  test('должен корректно обрабатывать различные уровни', () => {
    const level5Undead = new Undead(5);
    expect(level5Undead.level).toBe(5);

    const level10Undead = new Undead(10);
    expect(level10Undead.level).toBe(10);
  });
});
