import React from 'react';
import './App.css';

function App() {
  return (
    <center>
      <audio autoPlay loop>
        <source src="https://archive.org/download/TetrisThemeMusic/Tetris.mp3" type="audio/mpeg"/>
      </audio>
      <Game/>
    </center>
  );
}

const I = [
  [10],
  [10],
  [10],
  [10]
];
const T = [
  [20, 20, 20],
  [ 0, 20,  0]
];
const L = [
  [30,  0],
  [30,  0],
  [30, 30]
];
const J = [
  [ 0, 40],
  [ 0, 40],
  [40, 40],
];
const O = [
  [50, 50],
  [50, 50]
];
const Z = [
  [60, 60,  0],
  [ 0, 60, 60]
];
const S = [
  [ 0, 70, 70],
  [70, 70,  0]
];
const TITLE = [
  [60, 60,  0, 50, 50,  0, 20,  0,  0, 30, 30,  0, 10,  0, 70, 70],
  [ 0, 60,  0, 50,  0,  0, 20,  0,  0, 30,  0,  0,  0,  0, 70,  0],
  [60,  0,  0, 50, 50,  0, 20, 20,  0, 30,  0,  0, 10,  0,  0, 70],
  [60,  0,  0, 50,  0,  0, 20,  0,  0, 30,  0,  0, 10,  0,  0, 70],
  [60, 60,  0, 50, 50,  0, 20, 20,  0, 30,  0,  0, 10,  0, 70, 70]
];
const shapes = [I, J, L, O, S, T, Z];

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.map = Array(200).fill(0);
    this.currPiece = this.getRandomPiece();
    this.nextPiece = this.getRandomPiece();
    this.state = { 
      grid: this.map,
      next: this.nextPiece,
      score: 0,
      gameover: false
    };
    this.totalRows = 0;
    this.x = 5 - Math.floor(this.currPiece[0].length / 2);
    this.y = 0;
    this.ticks = 0;
    this.timer = setTimeout(() => this.tick(this), 10);
    window.addEventListener("keydown", (e) => this.handleKeyDown(this, e));
  }

  getRandomPiece() {
    let rnd = Math.floor(Math.random() * shapes.length);
    return shapes[rnd].slice(0);
  }

  tick(self) {
    if(++self.ticks % 25 == 0) {
      self.y += 1;
    }
    let newScore = self.state.score;
    if(self.collides(self, self.x)) {
      for(let i = 0; i < 200; i++) {
        if(self.map[i] > 0 && self.map[i] % 10 == 0) {
          self.map[i] -= 1;
        }
      }

      for(let i = 0; i < 200; i++) {
        if(self.map[i] > 0 && self.map[i] % 10 == 0) {
          self.map[i] = 0;
        }
      }
      
      let rows = [];

      for(let n = 19; n >= 0; n--) {
        let row = true;
        for(let m = 0; m < 10; m++) {
          row = row && ((self.map[n*10 + m] + 1) % 10 == 0);
        }
        if(row) {
          rows.push(n);
        }
      }

      if(rows.length > 0) {
        for(let r = 0; r < rows.length; r++) {
          self.map.splice(rows[r]*10, 10);
        }

        self.totalRows += rows.length;

        let newMap = Array(rows.length * 10).fill(0);
        self.map = newMap.concat(self.map);

        newScore += 1000 * Math.floor(Math.pow(2, rows.length));
      }

      self.y = 0;
      self.x = 5 - Math.floor(self.currPiece[0].length / 2);
      self.currPiece = self.nextPiece; 
      self.nextPiece = self.getRandomPiece();

      let gameover = false;
      for(let q = 0; q < 10; q++) {
        gameover = gameover || (self.map[q] > 0 && (self.map[q] + 1) % 10 == 0);
      }
      if(gameover) {
        self.setState({
          gameover: gameover
        });
        return;
      }
    }
    for(let i = 0; i < 200; i++) {
      if(self.map[i] % 10 == 0) {
        self.map[i] = 0;
      }
    }
    for(let y = 0; y < self.currPiece.length; y++) {
      for(let x = 0; x < self.currPiece[0].length; x++) {
        if(self.currPiece[y][x]) {
          self.map[(y + self.y)*10 + (x + self.x)] = self.currPiece[y][x];
        }
      }
    }
    self.setState({
      grid: self.map,
      next: self.nextPiece,
      score: newScore
    });
    self.timer = setTimeout(() => self.tick(self), 10);
  }

  collides(self, newX) {
    if(self.currPiece.length + self.y > 20) { 
      return true; 
    }
    for(let y = 0; y < self.currPiece.length; y++) {
      for(let x = 0; x < self.currPiece[0].length; x++) {
        let i = (y + self.y)*10 + x + newX;
        if((self.map[i] + 1) % 10 == 0 && self.currPiece[y][x] > 0 && self.currPiece[y][x] % 10 == 0) {
          return true;
        }       
      }
    }
    return false;    
  }

  handleKeyDown(self, event) {
    event.preventDefault();
    switch(event.key) {
      case "Down":
      case "ArrowDown":
      case " ":
        var y = self.y += 1;
        if(y + self.currPiece.length > 19) {
          y = 20 - self.currPiece.length;
        }
        self.y = y;
        break;
      case "Left":
      case "ArrowLeft":
        var x = self.x -= 1;
        if(x < 0) {
          x = 0;
        }
        if(!this.collides(self, x)) {
          self.x = x;
        }
        break;
      case "Right":
      case "ArrowRight":
        var x = self.x + 1;
        if(x + self.currPiece[0].length > 9) {
          x = 10 - self.currPiece[0].length;
        }
        if(!this.collides(self, x)) {
          self.x = x;
        }        
        break;
      case "Up":
      case "ArrowUp":
      case "Shift":
        let rotated = self.rotateRight(self.currPiece);
        if(self.x + rotated[0].length <= 10 && !this.collides(self, self.x)) {
          self.currPiece = rotated;
        }
        break;
    }
  }

  rotateRight(array) {
    var result = [];
    array.forEach(function (a, i, aa) {
        a.forEach(function (b, j, bb) {
            result[bb.length - j - 1] = result[bb.length - j - 1] || [];
            result[bb.length - j - 1][i] = b;
        });
    });
    return result;
  }

  renderCell(i) {
    return (
      <Cell i={i} />
    );
  }

  render() {
    let cells = [];

    for(let y = 0; y < TITLE.length; y++) {
      for(let x = 0; x < TITLE[0].length; x++) {
        cells.push(this.renderCell(TITLE[y][x], 'next' + y * 3 + x));
      }
    }
    
    let styles = {
      "grid-template-columns": Array(TITLE[0].length).fill("20px").join(" "),
      "grid-template-rows": Array(TITLE.length).fill("20px").join(" ")
    };

    return (
      <div>
        <div className={"gameover is-" + this.state.gameover}>
          <div className="gameover-popup">
            <div className="gameover-text">
              <h1>GAME OVER</h1>
              <p>score: {this.state.score}</p>
            </div>
          </div>
        </div>
        <table cellPadding="10px">
          <tr>
            <td colSpan="2">
              <div className="zetris">
                <div className="next-piece" style={styles}>       
                  {cells}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <Grid grid={this.state.grid}/>
            </td>
            <td style={{"vertical-align": "top"}}>
              <p>SCORE: <div className="score">{this.state.score}</div></p>
              NEXT: <Next next={this.state.next}/>
            </td>
          </tr>
        </table>
      </div>
    );
  }
}

class Next extends React.Component {
  renderCell(i) {
    return (
      <Cell i={i} />
    );
  }

  render() {
    let cells = [];

    for(let y = 0; y < this.props.next.length; y++) {
      for(let x = 0; x < this.props.next[0].length; x++) {
        cells.push(this.renderCell(this.props.next[y][x], 'next' + y * 3 + x));
      }
    }
    
    let styles = {
      "grid-template-columns": Array(this.props.next[0].length).fill("20px").join(" "),
      "grid-template-rows": Array(this.props.next.length).fill("20px").join(" ")
    };

    return (
      <div class="next-container">
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div className="next-piece" style={styles}>       
          {cells}
        </div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
      </div>
    );
  }
}

class Grid extends React.Component {
  renderCell(i) {
    return (
      <Cell i={i} />
    );
  }

  render() {
    let cells = [];
    for(let i = 0; i < this.props.grid.length; i++) {
      cells.push(this.renderCell(this.props.grid[i], 'cell' + i));
    }

    return (
      <div className="grid-container">       
        {cells}
      </div>
    );
  }
}

class Cell extends React.Component {
  render() {
    let className = "grid-cell piece-" + this.props.i;
    return (
      <div className={className}>&nbsp;</div>
    );
  }
}

export default App;
