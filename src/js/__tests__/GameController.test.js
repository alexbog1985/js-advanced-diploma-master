import GameController from '../GameController';
import GamePlay from '../GamePlay';
import PositionedCharacter from '../PositionedCharacter';

// Мокаем зависимости
jest.mock('../GamePlay');
jest.mock('../PositionedCharacter');

describe('GameController onCellEnter', () => {
  let gameController;
  let mockGamePlay;
  let mockStateService;

  beforeEach(() => {
    mockGamePlay = new GamePlay();
    mockStateService = {};
    gameController = new GameController(mockGamePlay, mockStateService);

    // Мокаем getCharacterAt метод
    gameController.getCharacterAt = jest.fn();
  });

  test('should show tooltip when cell contains character', () => {
    // Arrange
    const cellIndex = 5;
    const mockCharacter = {
      level: 2,
      attack: 25,
      defense: 15,
      health: 80
    };
    const mockPositionedCharacter = {
      character: mockCharacter
    };

    gameController.getCharacterAt.mockReturnValue(mockPositionedCharacter);

    const expectedTooltip = '🎖2 ⚔25 🛡15 ❤80';

    // Act
    gameController.onCellEnter(cellIndex);

    // Assert
    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledWith(
      expectedTooltip,
      cellIndex
    );
  });

  test('should not show tooltip when cell does not contain character', () => {
    // Arrange
    const cellIndex = 10;
    gameController.getCharacterAt.mockReturnValue(null);

    // Act
    gameController.onCellEnter(cellIndex);

    // Assert
    expect(mockGamePlay.showCellTooltip).not.toHaveBeenCalled();
  });

  test('should handle character with zero values correctly', () => {
    // Arrange
    const cellIndex = 3;
    const mockCharacter = {
      level: 1,
      attack: 0,
      defense: 0,
      health: 0
    };
    const mockPositionedCharacter = {
      character: mockCharacter
    };

    gameController.getCharacterAt.mockReturnValue(mockPositionedCharacter);

    const expectedTooltip = '🎖1 ⚔0 🛡0 ❤0';

    // Act
    gameController.onCellEnter(cellIndex);

    // Assert
    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledWith(
      expectedTooltip,
      cellIndex
    );
  });

  test('should handle maximum character values correctly', () => {
    // Arrange
    const cellIndex = 7;
    const mockCharacter = {
      level: 99,
      attack: 999,
      defense: 999,
      health: 999
    };
    const mockPositionedCharacter = {
      character: mockCharacter
    };

    gameController.getCharacterAt.mockReturnValue(mockPositionedCharacter);

    const expectedTooltip = '🎖99 ⚔999 🛡999 ❤999';

    // Act
    gameController.onCellEnter(cellIndex);

    // Assert
    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledWith(
      expectedTooltip,
      cellIndex
    );
  });

  test('should call getCharacterAt with correct index', () => {
    // Arrange
    const cellIndex = 15;
    gameController.getCharacterAt.mockReturnValue(null);

    // Act
    gameController.onCellEnter(cellIndex);

    // Assert
    expect(gameController.getCharacterAt).toHaveBeenCalledWith(cellIndex);
  });

  test('should handle multiple consecutive cell enter events', () => {
    // Arrange
    const mockCharacter1 = {
      level: 1,
      attack: 10,
      defense: 10,
      health: 50
    };
    const mockCharacter2 = {
      level: 2,
      attack: 20,
      defense: 20,
      health: 60
    };

    const mockPositionedCharacter1 = { character: mockCharacter1 };
    const mockPositionedCharacter2 = { character: mockCharacter2 };

    // Act & Assert
    gameController.getCharacterAt.mockReturnValueOnce(mockPositionedCharacter1);
    gameController.onCellEnter(1);
    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledWith('🎖1 ⚔10 🛡10 ❤50', 1);

    gameController.getCharacterAt.mockReturnValueOnce(mockPositionedCharacter2);
    gameController.onCellEnter(2);
    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledWith('🎖2 ⚔20 🛡20 ❤60', 2);

    gameController.getCharacterAt.mockReturnValueOnce(null);
    gameController.onCellEnter(3);
    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledTimes(2); // Только два вызова для персонажей
  });
});

// Дополнительные тесты для интеграции с getCharacterAt
describe('GameController onCellEnter integration with getCharacterAt', () => {
  let gameController;
  let mockGamePlay;
  let mockStateService;

  beforeEach(() => {
    mockGamePlay = new GamePlay();
    mockStateService = {};
    gameController = new GameController(mockGamePlay, mockStateService);

    // Инициализируем реальные команды для интеграционного теста
    gameController.playerTeam = [
      {
        position: 5,
        character: {
          level: 3,
          attack: 30,
          defense: 25,
          health: 100
        }
      }
    ];
    gameController.enemyTeam = [
      {
        position: 10,
        character: {
          level: 2,
          attack: 20,
          defense: 15,
          health: 80
        }
      }
    ];
  });

  test('should show tooltip for player character', () => {
    // Act
    gameController.onCellEnter(5);

    // Assert
    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledWith(
      '🎖3 ⚔30 🛡25 ❤100',
      5
    );
  });

  test('should show tooltip for enemy character', () => {
    // Act
    gameController.onCellEnter(10);

    // Assert
    expect(mockGamePlay.showCellTooltip).toHaveBeenCalledWith(
      '🎖2 ⚔20 🛡15 ❤80',
      10
    );
  });

  test('should not show tooltip for empty cell', () => {
    // Act
    gameController.onCellEnter(15); // Пустая ячейка

    // Assert
    expect(mockGamePlay.showCellTooltip).not.toHaveBeenCalled();
  });
});
