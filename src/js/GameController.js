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
import cursors from "./cursors";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = 8;
    this.playerTeam = [];
    this.enemyTeam = [];
    this.currentLevel = 1;

    this.currentTurn = 'player';
    this.selectedCharacter = null;
    this.possibleMovies = [];
    this.possibleAttacs = [];

    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
  }

  init() {
    const selectedTheme = themes.prairie;
    this.gamePlay.drawUi(selectedTheme);
    this.generateTeams();
    this.redrawAllPositions();

    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
  }

  generateTeams() {
    const playerTypes = [Swordsman, Bowman, Magician];
    const enemyTypes = [Daemon, Undead, Vampire];

    const playerCharacters = generateTeam(playerTypes, this.currentLevel, 2);
    const playerPositions = this.generatePositions([0, 1], playerCharacters.characters.length);
    this.playerTeam = playerCharacters.characters.map((character, index) => {
      return new PositionedCharacter(character, playerPositions[index]);
    });

    const enemyCharacters = generateTeam(enemyTypes, this.currentLevel, 2);
    const enemyPositions = this.generatePositions([6, 7], enemyCharacters.characters.length);
    this.enemyTeam = enemyCharacters.characters.map((character, index) => {
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
    this.allPositionedCharacters = [...this.playerTeam, ...this.enemyTeam];
    this.gamePlay.redrawPositions(this.allPositionedCharacters);
  }

  getGameState() {
    return {
      currentTurn: this.currentTurn
    };
  }

  loadGameState() {
    const savedState = this.stateService.load();
    const gameState = GameState.from(savedState);

    if (gameState) {
      this.currentTurn = gameState.currentTurn;
    } else {
      console.log('Начните новую игру');
    }
  }

  saveGameState() {
    const gameState = this.getGameState();
    this.stateService.save(gameState);
  }

  onCellClick(index) {
    if (this.currentTurn !== 'player') {
      return;
    }

    const positionedCharacter = this.getCharacterAt(index);

    if (positionedCharacter && this.playerTeam.includes(positionedCharacter)) {
      console.log('персонаж выбран');
    }

    if (!positionedCharacter) {
      GamePlay.showError('Кликнул по пустой ячейке, Кликни по игроку своей команды!');
      return;
    }

    if (this.enemyTeam.includes(positionedCharacter)) {
      GamePlay.showError('Кликни по игроку своей команды!');
      return;
    }

    if (this.selectedCharacter) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
    }

    this.gamePlay.selectCell(index, 'yellow');
    this.selectedCharacter = positionedCharacter;

    // this.currentTurn = this.currentTurn === 'player' ? 'computer' : 'player';
    // this.saveGameState(); // Сохраняем состояние после смены хода
  }

  onCellEnter(index) {
    const positionedCharacter = this.getCharacterAt(index);
    if (positionedCharacter) {
      const char = positionedCharacter.character;
      const tooltipContent =
        `\u{1F396}${ char.level } \u{2694}${char.attack} \u{1F6E1}${char.defense} \u{2764}${char.health}`;
      this.gamePlay.showCellTooltip(tooltipContent, index);
      this.gamePlay.setCursor(cursors.pointer);
    }
  }

  onCellLeave(index) {
    if (!this.selectedCharacter || this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
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

    const moveRange = this.selectedCharacter.moveRange;
    const attackRange = this.selectedCharacter.attackRange;

    this.possibleMoves = this.calculatePossibleMoves(this.selectedCharacter.position, moveRange);
    this.possibleAttacks = this.calculatePossibleAttacks(this.selectedCharacter.position, attackRange);
  }

  calculatePossibleMoves(position, moveRange) {
    const moves = [];
    const x0 = position % this.boardSize;
    const y0 = Math.floor(position / this.boardSize);

    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        const distance = Math.max(Math.abs(x - x0), Math.abs(y - y0));
        if (distance <= moveRange && distance > 0) {
          const index = y * this.boardSize + x;
          // Проверяем, что клетка пустая
          if (!this.getCharacterAt(index)) {
            moves.push(index);
          }
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
          // Проверяем, что в клетке вражеский персонаж
          if (character && !this.playerTeam.includes(character)) {
            attacks.push(index);
          }
        }
      }
    }
    return attacks;
  }
}
