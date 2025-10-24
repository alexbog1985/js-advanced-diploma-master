
import Daemon from '../Daemon';
import Character from "../../Character";

describe('Daemon class', () => {
  let daemon;

  beforeEach(() => {
    daemon = new Daemon(1);
  });

  test('должен корректно наследовать от Character', () => {
    expect(daemon instanceof Character).toBe(true);
    expect(daemon instanceof Daemon).toBe(true);
  });

  test('должен принимать уровень и тип персонажа', () => {
    expect(daemon.level).toBe(1);
    expect(daemon.type).toBe('daemon');
  });

  test('должен принимать тип персонажа как параметр', () => {
    const specialDaemon = new Daemon(1, 'special');
    expect(specialDaemon.type).toBe('special');
  });

  test('должен иметь базовые характеристики атаки и защиты', () => {
    expect(daemon.attack).toBe(10);
    expect(daemon.defense).toBe(10);
  });

  test('должен иметь корректные значения по умолчанию для типа', () => {
    const defaultDaemon = new Daemon(1);
    expect(defaultDaemon.type).toBe('daemon');
  });

  test('должен корректно обрабатывать различные уровни', () => {
    const level5Daemon = new Daemon(5);
    expect(level5Daemon.level).toBe(5);

    const level10Daemon = new Daemon(10);
    expect(level10Daemon.level).toBe(10);
  });
});
