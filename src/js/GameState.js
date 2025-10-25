export default class GameState {
  static from(object) {
    // Проверяем, что объект существует и содержит текущий ход
    if (!object || typeof object !== 'object' || !object.currentTurn) {
      return null;
    }

    // Проверяем, что currentTurn имеет допустимое значение
    if (object.currentTurn !== 'player' && object.currentTurn !== 'computer') {
      return null;
    }

    return object;
  }
}
