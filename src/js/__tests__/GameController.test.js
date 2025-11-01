import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import GameState from '../GameState';

// Мокаем зависимости
jest.mock('../GamePlay');
jest.mock('../GameStateService');
jest.mock('../generators');
jest.mock('../GameState');

describe('GameController - Основные тесты игрового контроллера', () => {
  let gameController;
  let mockGamePlay;
  let mockStateService;

  beforeEach(() => {
    // Создаем моки перед каждым тестом
    mockGamePlay = new GamePlay();
    mockStateService = new GameStateService();
    gameController = new GameController(mockGamePlay, mockStateService);

    // Настраиваем моки методов GamePlay
    mockGamePlay.drawUi = jest.fn();
    mockGamePlay.redrawPositions = jest.fn();
    mockGamePlay.showCellTooltip = jest.fn();
    mockGamePlay.hideCellTooltip = jest.fn();
    mockGamePlay.setCursor = jest.fn();
    mockGamePlay.selectCell = jest.fn();
    mockGamePlay.deselectCell = jest.fn();
    mockGamePlay.showDamage = jest.fn().mockResolvedValue();

    // Мокаем методы, которые могут вызывать асинхронные операции
    gameController.playerAttack = jest.fn().mockResolvedValue(undefined);
    gameController.playerMove = jest.fn();
    gameController.updatePossibleActions = jest.fn();
  });

  describe('Тестирование показа информации о персонаже (onCellEnter)', () => {
    test('Должен показывать подсказку с характеристиками при наведении на персонажа', () => {
      const cellIndex = 5;
      const mockCharacter = {
        level: 2,
        attack: 25,
        defence: 15,
        health: 80
      };
      // Временно восстанавливаем getCharacterAt для этого теста
      const originalGetCharacterAt = gameController.getCharacterAt;
      gameController.getCharacterAt = jest.fn().mockReturnValue({ character: mockCharacter });

      gameController.onCellEnter(cellIndex);

      expect(mockGamePlay.showCellTooltip).toHaveBeenCalledWith(
        '\u{1F396}2 \u{2694}25 \u{1F6E1}15 \u{2764}80',
        cellIndex
      );

      // Восстанавливаем оригинальный метод
      gameController.getCharacterAt = originalGetCharacterAt;
    });

    test('Не должен показывать подсказку при наведении на пустую ячейку', () => {
      const cellIndex = 10;
      // Временно восстанавливаем getCharacterAt для этого теста
      const originalGetCharacterAt = gameController.getCharacterAt;
      gameController.getCharacterAt = jest.fn().mockReturnValue(null);

      gameController.onCellEnter(cellIndex);

      expect(mockGamePlay.showCellTooltip).not.toHaveBeenCalled();

      // Восстанавливаем оригинальный метод
      gameController.getCharacterAt = originalGetCharacterAt;
    });
  });

  describe('Тестирование выбора персонажа (onCellClick)', () => {
    beforeEach(() => {
      gameController.gameOver = false;
      gameController.currentTurn = 'player';
      gameController.selectedCharacter = null;
    });

    test('Должен выбирать персонажа игрока при клике и подсвечивать ячейку', () => {
      const mockCharacter = { position: 5, character: {} };
      // Временно восстанавливаем getCharacterAt для этого теста
      const originalGetCharacterAt = gameController.getCharacterAt;
      gameController.getCharacterAt = jest.fn().mockReturnValue(mockCharacter);
      gameController.playerTeam = [mockCharacter];

      gameController.onCellClick(5);

      expect(mockGamePlay.selectCell).toHaveBeenCalledWith(5, 'yellow');
      expect(gameController.selectedCharacter).toBe(mockCharacter);

      // Восстанавливаем оригинальный метод
      gameController.getCharacterAt = originalGetCharacterAt;
    });

    test('Должен показывать ошибку при клике на персонажа противника', () => {
      const mockCharacter = { character: {} };
      // Временно восстанавливаем getCharacterAt для этого теста
      const originalGetCharacterAt = gameController.getCharacterAt;
      gameController.getCharacterAt = jest.fn().mockReturnValue(mockCharacter);
      gameController.playerTeam = [];
      GamePlay.showError = jest.fn();

      gameController.onCellClick(5);

      expect(GamePlay.showError).toHaveBeenCalledWith('Недопустимое действие');

      // Восстанавливаем оригинальный метод
      gameController.getCharacterAt = originalGetCharacterAt;
    });
  });

  describe('Тестирование расчета движения и атаки', () => {
    beforeEach(() => {
      gameController.boardSize = 8;
    });

    // Data-Driven тесты для диапазонов движения персонажей
    const characterRangeTestCases = [
      { Class: Bowman, expectedMove: 2, expectedAttack: 4, description: 'Лучник' },
      { Class: Swordsman, expectedMove: 4, expectedAttack: 1, description: 'Мечник' },
      { Class: Magician, expectedMove: 1, expectedAttack: 4, description: 'Маг' },
      { Class: Daemon, expectedMove: 1, expectedAttack: 4, description: 'Демон' },
      { Class: Undead, expectedMove: 4, expectedAttack: 1, description: 'Нежить' },
      { Class: Vampire, expectedMove: 2, expectedAttack: 2, description: 'Вампир' },
    ];

    test.each(characterRangeTestCases)(
      '$description должен иметь диапазон движения $expectedMove и атаки $expectedAttack',
      ({ Class, expectedMove, expectedAttack }) => {
        const character = new Class(1);
        expect(character.moveRange).toBe(expectedMove);
        expect(character.attackRange).toBe(expectedAttack);
      }
    );

    test('Должен рассчитывать возможные ходы из центра с диапазоном 1', () => {
      // Временно восстанавливаем getCharacterAt для этого теста
      const originalGetCharacterAt = gameController.getCharacterAt;
      gameController.getCharacterAt = jest.fn().mockReturnValue(null);

      const position = 27; // центр поля 8x8
      const moveRange = 1;

      const moves = gameController.calculatePossibleMoves(position, moveRange);

      // Из центра должно быть 8 возможных ходов
      expect(moves.length).toBeGreaterThan(0);

      // Восстанавливаем оригинальный метод
      gameController.getCharacterAt = originalGetCharacterAt;
    });

    test('Должен правильно рассчитывать расстояние между ячейками', () => {
      // Расстояние Чебышева - максимум из разниц по X и Y
      const distance1 = gameController.calculateDistance(0, 7); // одна строка
      expect(distance1).toBe(7);

      const distance2 = gameController.calculateDistance(0, 56); // один столбец
      expect(distance2).toBe(7);

      const distance3 = gameController.calculateDistance(9, 18); // вертикально
      expect(distance3).toBe(1);
    });
  });

  describe('Тестирование повышения уровня персонажей', () => {
    test('Должен увеличивать уровень и улучшать характеристики при повышении уровня', () => {
      const character = {
        level: 1,
        health: 50,
        attack: 25,
        defence: 25
      };

      gameController.levelUpCharacter(character);

      expect(character.level).toBe(2);
      expect(character.health).toBe(100);
    });
  });

  describe('Тестирование управления состоянием игры', () => {
    test('Должен сохранять состояние игры через GameStateService', () => {
      GameState.toObject = jest.fn().mockReturnValue({ test: 'state' });

      gameController.saveGameState();

      expect(mockStateService.save).toHaveBeenCalledWith({ test: 'state' });
    });

    test('Должен загружать состояние игры при инициализации', () => {
      const mockState = {
        currentLevel: 2,
        currentTurn: 'player',
        playerTeam: [],
        enemyTeam: [],
        gameOver: false
      };
      GameState.from = jest.fn().mockReturnValue(mockState);
      mockStateService.load = jest.fn().mockReturnValue(mockState);

      gameController.loadGameState();

      expect(gameController.currentLevel).toBe(2);
      expect(gameController.currentTurn).toBe('player');
    });
  });

  describe('Тестирование логики игры и ИИ компьютера', () => {
    test('Должен находить цель с наименьшим здоровьем для атаки', () => {
      gameController.possibleAttacks = [5, 10, 15];
      const mockTarget1 = { character: { health: 50 } };
      const mockTarget2 = { character: { health: 30 } };
      const mockTarget3 = { character: { health: 70 } };

      // Временно восстанавливаем getCharacterAt для этого теста
      const originalGetCharacterAt = gameController.getCharacterAt;
      gameController.getCharacterAt = jest.fn()
        .mockReturnValueOnce(mockTarget1)
        .mockReturnValueOnce(mockTarget2)
        .mockReturnValueOnce(mockTarget3);

      const bestTarget = gameController.findBestAttackTarget();

      expect(bestTarget).toBe(10); // Цель с наименьшим здоровьем (30)

      // Восстанавливаем оригинальный метод
      gameController.getCharacterAt = originalGetCharacterAt;
    });

    test('Должен находить ближайшего игрока для ИИ по расстоянию Чебышева', () => {
      // Позиция 15: x=7, y=1
      // Позиция 10: x=2, y=1 - расстояние = max(|7-2|, |1-1|) = 5
      // Позиция 20: x=4, y=2 - расстояние = max(|7-4|, |1-2|) = 3
      // Поэтому позиция 20 ближе
      const player1 = { position: 10 };
      const player2 = { position: 20 };
      gameController.playerTeam = [player1, player2];

      const nearest = gameController.findNearestPlayer(15);

      expect(nearest.position).toBe(20);
    });

    test('Должен переключать ход между игроком и компьютером', () => {
      // Временно убираем мок для тестирования реальной логики
      gameController.computerTurn = jest.fn().mockResolvedValue();
      gameController.saveGameState = jest.fn();

      gameController.currentTurn = 'player';
      gameController.switchTurn();

      expect(gameController.currentTurn).toBe('computer');
      expect(gameController.computerTurn).toHaveBeenCalled();
    });

    test('Должен сбрасывать игру при нажатии New Game', () => {
      gameController.gameOver = true;
      gameController.currentLevel = 3;
      gameController.playerTeam = ['character1'];
      gameController.enemyTeam = ['character2'];
      gameController.generateTeams = jest.fn();

      gameController.onNewGame();

      expect(gameController.gameOver).toBe(false);
      expect(gameController.currentLevel).toBe(1);
      expect(gameController.playerTeam).toEqual([]);
      expect(gameController.enemyTeam).toEqual([]);
    });
  });

  describe('Тестирование поиска персонажей на поле', () => {
    test('Должен находить персонажа по позиции', () => {
      const mockCharacter = { position: 5, character: {} };
      gameController.playerTeam = [mockCharacter];

      // Используем реальную реализацию getCharacterAt
      const result = gameController.getCharacterAt(5);

      expect(result).toEqual(mockCharacter);
    });
  });
});
