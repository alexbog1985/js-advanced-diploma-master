import themes from './themes';
import PositionedCharacter from "./PositionedCharacter";
import {generateTeam} from "./generators";
import Bowman from "./characters/Bowman";
import Magician from "./characters/Magician";
import Swordsman from "./characters/Swordsman";
import Daemon from "./characters/Daemon";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = 8;
    this.playerTeam = [];
    this.enemyTeam = [];
    this.currentLevel = 1;
  }

  init() {
    const selectedTheme = themes.prairie;
    this.gamePlay.drawUi(selectedTheme);
    this.generateTeams();
    this.redrawAllPositions()
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
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

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
