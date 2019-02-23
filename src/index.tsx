import {useState} from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {range} from './util';
import {initBoard, getCellByCoordinate, putMinesRandomly, open, toggleFlagged} from './game';
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
        const beforeState =
          state.isStarted || state.isGameOver
            ? state
            : {...state, isStarted: true, board: putMinesRandomly(state.board, 20, x, y)};
        setState(open(beforeState, x, y));
      };
      const onContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        if (state.isStarted && !state.isGameOver) {
          setState(toggleFlagged(state, x, y));
        }
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

ReactDOM.render(<App />, document.getElementById('app'));
