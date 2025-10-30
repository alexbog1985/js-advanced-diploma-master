import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import Bowman from './characters/Bowman';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = 8;
    this.playerTeam = [];
    this.enemyTeam = [];
    this.currentLevel = 1;
    this.gameOver = false;

    this.themeOrder = [themes.prairie, themes.desert, themes.arctic, themes.mountain];

    this.currentTurn = 'player';
    this.selectedCharacter = null;
    this.possibleMoves = [];
    this.possibleAttacks = [];

    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onNewGame = this.onNewGame.bind(this);
    this.onSaveGame = this.onSaveGame.bind(this);
    this.onLoadGame = this.onLoadGame.bind(this);
  }

  init() {
    this.loadGameState()

    const theme = this.getCurrentTheme();
    this.gamePlay.drawUi(theme);

    if (this.playerTeam.length === 0 && this.enemyTeam.length === 0) {
      this.generateTeams();
    }

    this.redrawAllPositions();

    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addNewGameListener(this.onNewGame);
    this.gamePlay.addSaveGameListener(this.onSaveGame);
    this.gamePlay.addLoadGameListener(this.onLoadGame);

  }

  getCurrentTheme() {
    const themeIndex = Math.min(this.currentLevel - 1, this.themeOrder.length - 1);
    return this.themeOrder[themeIndex];
  }

  generateTeams() {
    const playerTypes = [Swordsman, Bowman, Magician];
    const enemyTypes = [Daemon, Undead, Vampire];

    const playerCharacters = generateTeam(playerTypes, this.currentLevel, 2);
    const playerPositions = this.generatePositions([0, 1], playerCharacters.characters.length);
    this.playerTeam = playerCharacters.characters.map((character, index) => {
      while (character.level < this.currentLevel) {
        this.levelUpCharacter(character);
      }
      return new PositionedCharacter(character, playerPositions[index]);
    });

    const enemyCharacters = generateTeam(enemyTypes, this.currentLevel, 2);
    const enemyPositions = this.generatePositions([6, 7], enemyCharacters.characters.length);
    this.enemyTeam = enemyCharacters.characters.map((character, index) => {
      while (character.level < this.currentLevel) {
        this.levelUpCharacter(character);
      }
      return new PositionedCharacter(character, enemyPositions[index]);
    });
  }

  generatePositions(columns, count) {
    const allPossiblePositions = [];

    for (let row = 0; row < this.boardSize; row++) {
      for (const col of columns) {
        allPossiblePositions.push(row * this.boardSize + col);
      }
    }

    const shuffled = [...allPossiblePositions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  redrawAllPositions() {
    const allPositionedCharacters = [...this.playerTeam, ...this.enemyTeam];
    this.gamePlay.redrawPositions(allPositionedCharacters);
  }

  levelUpCharacter(character) {
    const currentHealth = character.health;
    character.level += 1;
    character.health = Math.min(character.health + 80, 100);

    const improvementRatio = ((80 + currentHealth) / 100);

    character.attack = Math.max(
      character.attack,
      Math.floor(character.attack * improvementRatio)
    );
    console.log('защита', character.defence)
    character.defence = Math.max(
      character.defence,
      Math.floor(character.defence * improvementRatio)
    );
  }

  nextLevel() {
    this.currentLevel += 1;

    if (this.currentLevel > this.themeOrder.length) {
      this.finishGame('Поздравляем! Вы выиграли!');
      return;
    }

    this.playerTeam.forEach(positionedCharacter => {
      this.levelUpCharacter(positionedCharacter.character);
    });

    const theme = this.getCurrentTheme();
    this.gamePlay.drawUi(theme);

    const enemyTypes = [Daemon, Undead, Vampire];
    const enemyCharacters = generateTeam(enemyTypes, this.currentLevel, 2);
    const enemyPositions = this.generatePositions([6, 7], enemyCharacters.characters.length);
    this.enemyTeam = enemyCharacters.characters.map((character, index) => {
      while (character.level < this.currentLevel) {
        this.levelUpCharacter(character);
      }
      return new PositionedCharacter(character, enemyPositions[index]);
    });

    this.currentTurn = 'player';
    this.selectedCharacter = null;
    this.clearHighlights();
    this.redrawAllPositions();

    GamePlay.showMessage(`Уровень ${this.currentLevel}!`);
  }

  getGameState() {
    return GameState.toObject(this);
  }

  calculateMaxScore() {
    return Math.max(
      (this.stateService.load()?.maxScore || 0),
      (this.currentLevel - 1) * 100
    );
  }

  loadGameState() {
    try {
      const savedState = this.stateService.load();
      const gameState = GameState.from(savedState);

      if (gameState) {
        this.currentLevel = gameState.currentLevel;
        this.currentTurn = gameState.currentTurn;
        this.playerTeam = gameState.playerTeam;
        this.enemyTeam = gameState.enemyTeam;
        this.gameOver = gameState.gameOver;

        console.log('Состояние игры успешно загружено');
      } else {
        console.log('Сохраненное состояние не найдено или повреждено, начинаем новую игру');
      }
    } catch (error) {
      // Обработка ошибки загрузки
      console.error('Ошибка загрузки состояния игры:', error);
      GamePlay.showError('Не удалось загрузить сохраненную игру. Начинаем новую игру.');
    }
  }

  saveGameState() {
    try {
      const gameState = GameState.toObject(this);
      this.stateService.save(gameState);
      console.log('Игра успешно сохранена');
    } catch (error) {
      console.error('Ошибка сохранения состояния игры:', error);
      GamePlay.showError('Не удалось сохранить игру.');
    }
  }

  switchTurn() {
    this.currentTurn = this.currentTurn === 'player' ? 'computer' : 'player';
    this.saveGameState();
    if (this.currentTurn === 'computer') {
      this.computerTurn().then();
    }
  }

  findBestAttackTarget() {
    let bestTarget = null;
    let lowestHealth = Infinity;

    for (const attackIndex of this.possibleAttacks) {
      const target = this.getCharacterAt(attackIndex);
      if (target && target.character.health < lowestHealth) {
        lowestHealth = target.character.health;
        bestTarget = attackIndex;
      }
    }
    return bestTarget;
  }

  findBestMovePosition(enemy) {
    const nearestPlayer = this.findNearestPlayer(enemy.position);
    if (!nearestPlayer) return null;

    let bestMove = null;
    let shortestDistance = Infinity;

    for (const moveIndex of this.possibleMoves) {
      const distance = this.calculateDistance(moveIndex, nearestPlayer.position);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        bestMove = moveIndex;
      }
    }
    return bestMove;
  }

  findNearestPlayer(enemyPosition) {
    let nearestPlayer = null;
    let shortestDistance = Infinity;

    for (const player of this.playerTeam) {
      const distance = this.calculateDistance(enemyPosition, player.position);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestPlayer = player;
      }
    }

    return nearestPlayer;
  }

  calculateDistance(pos1, pos2) {
    const x1 = pos1 % this.boardSize;
    const y1 = Math.floor(pos1 / this.boardSize);
    const x2 = pos2 % this.boardSize;
    const y2 = Math.floor(pos2 / this.boardSize);

    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
  }

  async computerAttack(index) {
    const targetCharacter = this.getCharacterAt(index);

    if (targetCharacter && this.playerTeam.includes(targetCharacter)) {
      const damage = Math.max(
        this.selectedCharacter.character.attack - targetCharacter.character.defence,
        this.selectedCharacter.character.attack * 0.1
      );

      await this.gamePlay.showDamage(index, damage);

      targetCharacter.character.health -= damage;

      if (targetCharacter.character.health <= 0) {
        this.playerTeam = this.playerTeam.filter(char => char !== targetCharacter);
      }

      this.redrawAllPositions();
      console.log(`Компьютер атаковал и нанес ${damage} урона`);

      if (this.playerTeam.length === 0 ) this.finishGame('Game Over');
    }
  }

  computerMove(index) {
    const oldPosition = this.selectedCharacter.position;

    this.selectedCharacter.position = index;
    this.redrawAllPositions();
    console.log(`Компьютер переместил персонажа с ${oldPosition} на ${index}`);
  }

  async computerTurn() {
    console.log('Ход противника');

    let actionPerformed = false;
    const shuffledEnemyTeam = [...this.enemyTeam].sort(() => Math.random() - 0.5);

    for (const enemy of shuffledEnemyTeam) {
      this.selectedCharacter = enemy;
      this.updatePossibleActions();

      if (this.possibleAttacks.length > 0) {
        const attackTarget = this.findBestAttackTarget();
        if (attackTarget) {
          await this.computerAttack(attackTarget);
          actionPerformed = true;
          break;
        }
      }
      if (this.possibleMoves.length > 0) {
        const movePosition = this.findBestMovePosition(enemy);
        if (movePosition) {
          this.computerMove(movePosition);
          actionPerformed = true;
          break;
        }
      }
    }
    this.selectedCharacter = null;
    this.clearHighlights();

    if (actionPerformed) {
      this.switchTurn();
    } else {
      this.switchTurn();
    }
  }

  playerMove(index) {
    if (this.gameOver) return;

    const oldPosition = this.selectedCharacter.position;

    this.selectedCharacter.position = index;
    this.redrawAllPositions();

    this.gamePlay.deselectCell(oldPosition);
    this.gamePlay.deselectCell(index);

    this.selectedCharacter = null;

    this.clearHighlights();

    this.switchTurn();
    console.log(`Персонаж перемещен с ${oldPosition} на ${index}`);
  }

  async playerAttack(index) {
    if (this.gameOver) return;
    console.log('Атакуем ', index);

    const targetCharacter = this.getCharacterAt(index);

    if (targetCharacter && this.enemyTeam.includes(targetCharacter)) {
      const damage = Math.max(
        this.selectedCharacter.character.attack - targetCharacter.character.defence,
        this.selectedCharacter.character.attack * 0.1
      );

      await this.gamePlay.showDamage(index, damage);
      targetCharacter.character.health -= damage;

      if (targetCharacter.character.health <= 0) {
        this.enemyTeam = this.enemyTeam.filter(char => char !== targetCharacter);

        if (this.enemyTeam.length === 0) {
          this.nextLevel();
          return; // Не переключаем ход, начинаем новый уровень
        }
      }

      this.redrawAllPositions();
      console.log(`Атака нанесла ${damage} урона`);
    }

    this.gamePlay.deselectCell(this.selectedCharacter.position);
    this.selectedCharacter = null;

    this.clearHighlights();
    this.switchTurn();
  }

  clearHighlights() {
    for (let i = 0; i < this.boardSize * this.boardSize; i++) {
      this.gamePlay.deselectCell(i);
    }
    this.possibleMoves = [];
    this.possibleAttacks = [];
  }

  onCellClick(index) {
    if (this.gameOver || this.currentTurn !== 'player') return;

    const positionedCharacter = this.getCharacterAt(index);
    this.updatePossibleActions();

    if (positionedCharacter && this.playerTeam.includes(positionedCharacter)) {
      if (this.selectedCharacter) this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.gamePlay.selectCell(index, 'yellow');
      this.selectedCharacter = positionedCharacter;
      this.updatePossibleActions();
    } else if (this.possibleMoves.includes(index)) {
      this.playerMove(index);
    } else if (this.possibleAttacks.includes(index)) {
      this.playerAttack(index).then();
    } else {
      GamePlay.showError('Недопустимое действие');
    }

  }

  onCellEnter(index) {
    if (this.gameOver) return;

    const positionedCharacter = this.getCharacterAt(index);

    if (positionedCharacter) {
      const char = positionedCharacter.character;
      const tooltipContent =
        `\u{1F396}${char.level} \u{2694}${char.attack} \u{1F6E1}${char.defence} \u{2764}${char.health}`;
      this.gamePlay.showCellTooltip(tooltipContent, index);
    }

    if (this.playerTeam.includes(positionedCharacter)) {
      this.gamePlay.setCursor(cursors.pointer);
    } else {this.gamePlay.setCursor(cursors.notallowed);}

    if (this.selectedCharacter) {
      this.updatePossibleActions();

      if (positionedCharacter && this.playerTeam.includes(positionedCharacter)) {
        this.gamePlay.setCursor(cursors.pointer);
      } else if (this.possibleMoves.includes(index)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      } else if (this.possibleAttacks.includes(index)) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    if (this.gameOver) return;

    if (!this.selectedCharacter || this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  onNewGame() {
    this.gameOver = false;
    this.currentLevel = 1;
    this.playerTeam = [];
    this.enemyTeam = [];
    this.selectedCharacter = null;
    this.clearHighlights();

    const theme = this.getCurrentTheme();
    this.gamePlay.drawUi(theme);
    this.generateTeams();
    this.redrawAllPositions();

    this.saveGameState();
  }

  getCharacterAt(index) {
    const allCharacters = [...this.playerTeam, ...this.enemyTeam];
    return allCharacters.find(positionedChar => positionedChar.position === index);
  }

  updatePossibleActions() {
    if (!this.selectedCharacter) {
      this.possibleMoves = [];
      this.possibleAttacks = [];
      return;
    }

    const moveRange = this.selectedCharacter.character.moveRange;
    const attackRange = this.selectedCharacter.character.attackRange;

    this.possibleMoves = this.calculatePossibleMoves(this.selectedCharacter.position, moveRange);
    this.possibleAttacks = this.calculatePossibleAttacks(this.selectedCharacter.position, attackRange);
  }

  calculatePossibleMoves(position, moveRange) {
    const moves = [];
    const x0 = position % this.boardSize;
    const y0 = Math.floor(position / this.boardSize);

    const directions = [
      [-1, -1], [-1, 0], [-1, 1], // влево-вверх, вверх, вправо-вверх
      [0, -1], [0, 1], // влево, ______, вправо
      [1, -1], [1, 0], [1, 1] // влево-вниз, вниз, вправо-вниз
    ];

    for (const [dx, dy] of directions) {
      for (let step = 1; step <= moveRange; step++) {
        const x = x0 + dx * step;
        const y = y0 + dy * step;

        if (x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize) {
          const index = y * this.boardSize + x;

          if (!this.getCharacterAt(index)) {
            moves.push(index);
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }

    return moves;
  }

  calculatePossibleAttacks(position, attackRange) {
    const attacks = [];
    const x0 = position % this.boardSize;
    const y0 = Math.floor(position / this.boardSize);

    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        const distance = Math.max(Math.abs(x - x0), Math.abs(y - y0));
        if (distance <= attackRange && distance > 0) {
          const index = y * this.boardSize + x;
          const character = this.getCharacterAt(index);
          if (this.currentTurn === 'player') {
            if (character && this.enemyTeam.includes(character)) {
              attacks.push(index);
            }
          } else {
            if (character && this.playerTeam.includes(character)) {
              attacks.push(index);
            }
          }
        }
      }
    }

    console.log(`Возможных атак ${attacks.length}`);
    return attacks;
  }

  finishGame(message) {
    this.gameOver = true;
    GamePlay.showMessage(message)
    this.saveGameState();
  }

  onSaveGame() {
    this.saveGameState();
    GamePlay.showMessage('Игра сохранена!');
  }

  onLoadGame() {
    this.loadGameState();

    const theme = this.getCurrentTheme();
    this.gamePlay.drawUi(theme);
    this.redrawAllPositions();

    this.selectedCharacter = null;
    this.clearHighlights();

    GamePlay.showMessage('Игра загружена!');
  }
}
