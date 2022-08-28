import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

  function Square(props) {
    let classNameVar = props.highlight ? "square highlighted": "square";

    return (
      <button className={classNameVar} onClick={props.onClick}>
        {props.value}
      </button>
    );
  }
  
  class Board extends React.Component {

    renderSquare(i) {
      let highlight=false;
      if (this.props.winningSquares) {
        if (this.props.winningSquares.includes(i)) { highlight=true }
      }

      return (
        <Square 
          key={i}
          value={this.props.squares[i]} 
          onClick={() => this.props.onClick(i)}
          highlight={highlight}
        />
      );
    }
  
    renderBoard(size) {
      const board = [];
      for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
          row.push(this.renderSquare(i * size + j));
        }
        board.push(
          <div key={i} className="board-row">
            {row}
          </div>
        )
      }
      return board;
    }

    render() {
      return (
        <div>
          {this.renderBoard(3)}
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [{
          squares: Array(9).fill(null), 
          move: null
        }],
        stepNumber: 0,
        xIsNext: true,
        descendingHistory: false
      }
    }

    toggleSortButton() {
      const sortText = "Toggle Sort to " + (this.state.descendingHistory ? 
        "Ascending" : "Descending");

      return (
        <button onClick={() => this.setState({
          descendingHistory: !this.state.descendingHistory
        }
        )}>{sortText}</button>
      );
    }

    handleClick(i) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
        history: history.concat([{
          squares: squares,
          move: [i % 3 + 1, Math.floor(i / 3 + 1)]
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    }

    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
    }

    render() {
      const history = this.state.history.slice();
      const current = history[this.state.stepNumber];
      const winnerSquares = calculateWinner(current.squares);

      const moves = history.map((hist, move) => {
        let desc = move ?
          `Go to move #${move} Moved to: (${hist.move[0]}, ${hist.move[1]})` :
          'Go to game start';
        let histItem;
        if (this.state.stepNumber === move) {
          histItem = <button onClick={() => this.jumpTo(move)}><b>{desc}</b></button>;
        } else {
          histItem = <button onClick={() => this.jumpTo(move)}>{desc}</button>;
        }
        return (
          <li key={move}>
            {histItem}
          </li>
        );
      });

      if (this.state.descendingHistory) {
        moves.reverse();
      }

      let status;
      if (winnerSquares) {
        status = 'Winner: ' + current.squares[winnerSquares[0]];
      } else if (calculateTie(current.squares)) {
        status = "It's a Tie!";
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }

      return (
        <div className="game">
          <div className="game-board">
            <Board 
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
              winningSquares={winnerSquares ? winnerSquares : null}
            />
          </div>
          <div className="game-info">
            <div>{this.toggleSortButton()}</div>
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Game />);
  
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [a, b, c];
      }
    }
    return null;
  }

  function calculateTie(squares) {
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        return false;
      }
    }
    return true;
  }