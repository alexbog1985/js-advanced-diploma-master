import { calcTileType } from '../utils';

describe('calcTileType', () => {
  test.each([
    // Угловые случаи для boardSize = 8
    { index: 0, boardSize: 8, expected: 'top-left' },
    { index: 7, boardSize: 8, expected: 'top-right' },
    { index: 56, boardSize: 8, expected: 'bottom-left' },
    { index: 63, boardSize: 8, expected: 'bottom-right' },

    // Граничные случаи для boardSize = 8
    { index: 1, boardSize: 8, expected: 'top' },
    { index: 6, boardSize: 8, expected: 'top' },
    { index: 57, boardSize: 8, expected: 'bottom' },
    { index: 62, boardSize: 8, expected: 'bottom' },
    { index: 8, boardSize: 8, expected: 'left' },
    { index: 16, boardSize: 8, expected: 'left' },
    { index: 15, boardSize: 8, expected: 'right' },
    { index: 23, boardSize: 8, expected: 'right' },

    // Центральные случаи для boardSize = 8
    { index: 9, boardSize: 8, expected: 'center' },
    { index: 18, boardSize: 8, expected: 'center' },
    { index: 45, boardSize: 8, expected: 'center' },

    // Проверка минимального размера доски (3x3)
    { index: 0, boardSize: 3, expected: 'top-left' },
    { index: 2, boardSize: 3, expected: 'top-right' },
    { index: 6, boardSize: 3, expected: 'bottom-left' },
    { index: 8, boardSize: 3, expected: 'bottom-right' },
    { index: 1, boardSize: 3, expected: 'top' },
    { index: 3, boardSize: 3, expected: 'left' },
    { index: 5, boardSize: 3, expected: 'right' },
    { index: 7, boardSize: 3, expected: 'bottom' },
    { index: 4, boardSize: 3, expected: 'center' },

  ])('для index=$index и boardSize=$boardSize должен вернуть $expected',
    ({ index, boardSize, expected }) => {
      expect(calcTileType(index, boardSize)).toBe(expected);
    }
  );
});
