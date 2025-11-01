import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

const CHARACTER_CLASSES = {
  'bowman': Bowman,
  'magician': Magician,
  'swordsman': Swordsman,
  'daemon': Daemon,
  'undead': Undead,
  'vampire': Vampire,
};

export default class GameState {
  static from(object) {
    if (!object || typeof object !== 'object') {
      return null;
    }

    if (object.currentTurn !== 'player' && object.currentTurn !== 'computer') {
      return null;
    }

    const gameState = new GameState();

    gameState.currentLevel = object.currentLevel || 1;
    gameState.currentTurn = object.currentTurn;
    gameState.maxScore = object.maxScore || 0;
    gameState.gameOver = object.gameOver || false;

    if (object.playerTeam && Array.isArray(object.playerTeam)) {
      gameState.playerTeam = object.playerTeam.map(charData =>
        GameState.restorePositionedCharacter(charData)
      ).filter(Boolean);
    } else {
      gameState.playerTeam = [];
    }

    if (object.enemyTeam && Array.isArray(object.enemyTeam)) {
      gameState.enemyTeam = object.enemyTeam.map(charData =>
        GameState.restorePositionedCharacter(charData)
      ).filter(Boolean);
    } else {
      gameState.enemyTeam = [];
    }
    return gameState;
  }

  static toObject(gameController) {
    return {
      currentLevel: gameController.currentLevel,
      currentTurn: gameController.currentTurn,
      playerTeam: gameController.playerTeam.map(pc =>
        GameState.serializePositionedCharacter(pc)
      ),
      enemyTeam: gameController.enemyTeam.map(pc =>
        GameState.serializePositionedCharacter(pc)
      ),
      maxScore: gameController.calculateMaxScore(),
      gameOver: gameController.gameOver || false,
    };
  }

  static serializePositionedCharacter(positionedCharacter) {
    const character = positionedCharacter.character;
    return {
      type: character.constructor.name.toLowerCase(),
      level: character.level,
      health: character.health,
      attack: character.attack,
      defence: character.defence,
      position: positionedCharacter.position
    };
  }

  static restorePositionedCharacter(charData) {
    try {
      const CharacterClass = CHARACTER_CLASSES[charData.type];
      if (!CharacterClass) {
        console.error(`Неизвестный тип персонажа: ${charData.type}`);
        return null;
      }

      const character = new CharacterClass(charData.level);

      character.health = Math.min(charData.health, 100);
      character.attack = charData.attack;
      character.defence = charData.defence;

      return new PositionedCharacter(character, charData.position);
    } catch (e) {
      console.error('Ошибка восстановления персонажа', e);
      return null;
    }
  }
}
