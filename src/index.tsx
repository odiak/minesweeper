import {useState} from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {range} from './util';
import {
  initBoard,
  getCellByCoordinate,
  GameState,
  putMinesRandomly,
  open,
  isOpenedAll,
  toggleFlagged,
} from './game';
import {Cell} from './Cell';

const width = 12;
const height = 12;

const App = ({}) => {
  const [state, setState] = useState(() => ({
    board: initBoard(width, height),
    isStarted: false,
    isGameOver: false,
  }));

  const rows = [];
  for (const y of range(0, height)) {
    const cols = [];
    for (const x of range(0, width)) {
      const cell = getCellByCoordinate(state.board, x, y);
      const onClick = () => {
        setState(handleClick(x, y, state));
      };
      const onContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setState(handleContextMenu(x, y, state));
      };
      cols.push(
        <td key={x}>
          <Cell cell={cell} onClick={onClick} onContextMenu={onContextMenu} />
        </td>,
      );
    }
    rows.push(<tr key={y}>{cols}</tr>);
  }
  const gameOverClass = state.isGameOver ? 'game-over' : '';
  return (
    <div>
      <button
        onClick={() => {
          setState({board: initBoard(width, height), isStarted: false, isGameOver: false});
        }}
      >
        restart
      </button>
      <table className={'board ' + gameOverClass}>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

function handleClick(x: number, y: number, state: GameState): GameState {
  let {board, isStarted, isGameOver} = state;

  if (isGameOver) return state;
  if (getCellByCoordinate(board, x, y).isFlagged) return state;

  if (!isStarted) {
    board = putMinesRandomly(board, 20, x, y);
    isStarted = true;
  }
  board = open(board, x, y);

  if (getCellByCoordinate(board, x, y).hasMine || isOpenedAll(board)) {
    isGameOver = true;
  }

  return {board, isStarted, isGameOver};
}

function handleContextMenu(
  x: number,
  y: number,
  {board, isStarted, isGameOver}: GameState,
): GameState {
  if (isStarted && !isGameOver) {
    board = toggleFlagged(board, x, y);
  }

  return {board, isStarted, isGameOver};
}

ReactDOM.render(<App />, document.getElementById('app'));
