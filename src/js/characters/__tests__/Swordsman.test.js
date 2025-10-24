
import Swordsman from '../Swordsman';
import Character from '../../Character';

describe('Swordsman class', () => {
  let swordsman;

  beforeEach(() => {
    swordsman = new Swordsman(1);
  });

  test('должен корректно наследовать от Character', () => {
    expect(swordsman instanceof Character).toBe(true);
    expect(swordsman instanceof Swordsman).toBe(true);
  });

  test('должен принимать уровень и тип персонажа', () => {
    expect(swordsman.level).toBe(1);
    expect(swordsman.type).toBe('swordsman');
  });

  test('должен принимать тип персонажа как параметр', () => {
    const specialSwordsman = new Swordsman(1, 'special');
    expect(specialSwordsman.type).toBe('special');
  });

  test('должен иметь базовые характеристики атаки и защиты', () => {
    expect(swordsman.attack).toBe(40);
    expect(swordsman.defense).toBe(10);
  });

  test('должен иметь корректные значения по умолчанию для типа', () => {
    const defaultSwordsman = new Swordsman(1);
    expect(defaultSwordsman.type).toBe('swordsman');
  });

  test('должен корректно обрабатывать различные уровни', () => {
    const level5Swordsman = new Swordsman(5);
    expect(level5Swordsman.level).toBe(5);

    const level10Swordsman = new Swordsman(10);
    expect(level10Swordsman.level).toBe(10);
  });
});
