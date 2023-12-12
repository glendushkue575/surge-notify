/*
Filename: ComplexCode.js

Description: This code is a complex implementation of a web-based game called "Maze Runner". It generates and displays a randomly generated maze using the Depth-First Search algorithm. The player's objective is to navigate through the maze and reach the exit point using the arrow keys on the keyboard. The code also includes collision detection, scoring system, game timer, and various game mechanics. Enjoy!

Author: AI Assistant

Date: October 1, 2022
*/

// Game Variables
let canvas;
let context;
let maze;
let player;
let exit;
let score;
let timer;
let gameInterval;

// Constants
const MAZE_SIZE = 15;
const CELL_SIZE = 40;
const PLAYER_COLOR = "#FF6347";
const EXIT_COLOR = "#00FF00";
const WALL_COLOR = "#333333";
const PATH_COLOR = "#FFFFFF";
const SCORE_INCREMENT = 10;
const TIMER_INTERVAL = 1000;
const GAME_DURATION = 180;

// Maze Constructor
function Maze() {
  this.cells = [];

  // Generate maze cells
  for (let i = 0; i < MAZE_SIZE; i++) {
    let row = [];
    for (let j = 0; j < MAZE_SIZE; j++) {
      row.push(new Cell(i, j));
    }
    this.cells.push(row);
  }

  // Generate maze paths using Depth-First Search algorithm
  let stack = [];
  let current = this.cells[0][0];
  current.visited = true;

  while (true) {
    let unvisitedNeighbors = current.getUnvisitedNeighbors();
    if (unvisitedNeighbors.length > 0) {
      let randomNeighbor = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
      stack.push(current);
      current.removeWall(randomNeighbor);
      randomNeighbor.visited = true;
      current = randomNeighbor;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      break;
    }
  }
}

// Render the maze
Maze.prototype.render = function () {
  for (let i = 0; i < MAZE_SIZE; i++) {
    for (let j = 0; j < MAZE_SIZE; j++) {
      this.cells[i][j].render();
    }
  }
};

// Cell Constructor
function Cell(row, col) {
  this.row = row;
  this.col = col;
  this.walls = {
    top: true,
    right: true,
    bottom: true,
    left: true
  };
  this.visited = false;
}

// Get unvisited neighboring cells
Cell.prototype.getUnvisitedNeighbors = function () {
  let neighbors = [];

  if (this.row > 0 && !maze.cells[this.row - 1][this.col].visited) {
    neighbors.push(maze.cells[this.row - 1][this.col]);
  }
  if (this.col < MAZE_SIZE - 1 && !maze.cells[this.row][this.col + 1].visited) {
    neighbors.push(maze.cells[this.row][this.col + 1]);
  }
  if (this.row < MAZE_SIZE - 1 && !maze.cells[this.row + 1][this.col].visited) {
    neighbors.push(maze.cells[this.row + 1][this.col]);
  }
  if (this.col > 0 && !maze.cells[this.row][this.col - 1].visited) {
    neighbors.push(maze.cells[this.row][this.col - 1]);
  }

  return neighbors;
};

// Remove wall between cells
Cell.prototype.removeWall = function (neighbor) {
  if (this.row < neighbor.row) {
    this.walls.bottom = false;
    neighbor.walls.top = false;
  } else if (this.row > neighbor.row) {
    this.walls.top = false;
    neighbor.walls.bottom = false;
  } else if (this.col < neighbor.col) {
    this.walls.right = false;
    neighbor.walls.left = false;
  } else if (this.col > neighbor.col) {
    this.walls.left = false;
    neighbor.walls.right = false;
  }
};

// Render the cell
Cell.prototype.render = function () {
  let x = this.col * CELL_SIZE;
  let y = this.row * CELL_SIZE;

  // Render walls
  context.fillStyle = WALL_COLOR;
  if (this.walls.top) {
    context.fillRect(x, y, CELL_SIZE, 1);
  }
  if (this.walls.right) {
    context.fillRect(x + CELL_SIZE - 1, y, 1, CELL_SIZE);
  }
  if (this.walls.bottom) {
    context.fillRect(x, y + CELL_SIZE - 1, CELL_SIZE, 1);
  }
  if (this.walls.left) {
    context.fillRect(x, y, 1, CELL_SIZE);
  }

  // Render visited cells
  if (this.visited) {
    context.fillStyle = PATH_COLOR;
    context.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  }
};

// Player Constructor
function Player() {
  this.row = 0;
  this.col = 0;

  // Handle player movement
  this.move = function (keyCode) {
    switch (keyCode) {
      case 37: // Left
        if (this.col > 0 && !maze.cells[this.row][this.col].walls.left) {
          this.col--;
        }
        break;

      case 38: // Up
        if (this.row > 0 && !maze.cells[this.row][this.col].walls.top) {
          this.row--;
        }
        break;

      case 39: // Right
        if (this.col < MAZE_SIZE - 1 && !maze.cells[this.row][this.col + 1].walls.left) {
          this.col++;
        }
        break;

      case 40: // Down
        if (this.row < MAZE_SIZE - 1 && !maze.cells[this.row + 1][this.col].walls.top) {
          this.row++;
        }
        break;
    }

    // Check if player reached the exit
    if (this.row === MAZE_SIZE - 1 && this.col === MAZE_SIZE - 1) {
      stopGame(true);
    }

    // Check for collision with walls
    if (maze.cells[this.row][this.col].walls.top ||
        maze.cells[this.row][this.col].walls.right ||
        maze.cells[this.row][this.col].walls.bottom ||
        maze.cells[this.row][this.col].walls.left) {
      stopGame(false);
    }

    // Update player position
    context.fillStyle = PLAYER_COLOR;
    context.fillRect(this.col * CELL_SIZE + 5, this.row * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
  };
}

// Exit Constructor
function Exit() {
  this.row = MAZE_SIZE - 1;
  this.col = MAZE_SIZE - 1;

  // Render the exit
  this.render = function () {
    context.fillStyle = EXIT_COLOR;
    context.fillRect(this.col * CELL_SIZE + 1, this.row * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  };
}

// Initialize the game
function initGame() {
  canvas = document.getElementById("game-canvas");
  context = canvas.getContext("2d");
  context.fillStyle = WALL_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);

  maze = new Maze();
  player = new Player();
  exit = new Exit();
  score = 0;
  timer = GAME_DURATION;

  document.addEventListener("keydown", handleKeyPress);
  gameInterval = setInterval(updateGame, TIMER_INTERVAL);
}

// Handle key press events
function handleKeyPress(event) {
  player.move(event.keyCode);
}

// Update game logic
function updateGame() {
  timer--;

  if (timer === 0) {
    stopGame(false);
  }

  // Render game elements
  context.clearRect(0, 0, canvas.width, canvas.height);
  maze.render();
  exit.render();
  renderScore();
  renderTimer();
}

// Render the player's score
function renderScore() {
  context.fillStyle = "#FFFFFF";
  context.font = "20px Arial Bold";
  context.fillText("Score: " + score, 10, 25);
}

// Render the game timer
function renderTimer() {
  context.fillStyle = "#FFFFFF";
  context.font = "20px Arial Bold";
  context.fillText("Time: " + timer + "s", canvas.width - 110, 25);
}

// Stop the game
function stopGame(hasWon) {
  clearInterval(gameInterval);
  document.removeEventListener("keydown", handleKeyPress);
  displayResult(hasWon);
}

// Display game result
function displayResult(hasWon) {
  context.fillStyle = "#FFFFFF";
  context.font = "50px Arial Bold";
  context.fillText(hasWon ? "You Won!" : "Game Over!", canvas.width / 2 - 100, canvas.height / 2);
}

// Start the game
initGame();
