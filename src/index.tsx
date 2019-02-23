import {useState} from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {List, Map, Range} from 'immutable';

function letval(value, f) {
  return f(value);
}

function initBoard(w, h) {
  let board = Range(0, w)
    .map((x) =>
      Range(0, h)
        .map((y) =>
          Map({
            opened: false,
            hasMine: false,
            surroundingMines: 0,
            flagged: false,
          }),
        )
        .toMap(),
    )
    .toMap();

  return board.merge({width: w, height: h});
}

const surrounding = List([
  List([-1, -1]),
  List([-1, 0]),
  List([-1, 1]),
  List([0, -1]),
  List([0, 1]),
  List([1, -1]),
  List([1, 0]),
  List([1, 1]),
]);

function _isInside(w, h) {
  return ([x, y]) => x >= 0 && x < w && y >= 0 && y < h;
}

function putMines(board, nMines, startX, startY) {
  let w = board.get('width');
  let h = board.get('height');
  if (nMines > w * h - 9) {
    throw new Error('nMines is too big: ' + nMines);
  }

  if (nMines === 0) return board;

  let x = Math.floor(Math.random() * w);
  let y = Math.floor(Math.random() * h);
  let forbiddenPoints = List.of(List.of(startX, startY)).concat(
    surrounding.map((l) => l.toArray()).map(([p, q]) => List.of(startX + p, startY + q)),
  );

  if (!forbiddenPoints.includes(List.of(x, y)) && !board.getIn([x, y, 'hasMine'])) {
    return letval(board.updateIn([x, y, 'hasMine'], () => true), (board_) =>
      putMines(
        surrounding
          .map((l) => l.toArray())
          .map(([p, q]) => [x + p, y + q])
          .filter(_isInside(w, h))
          .filter(([x, y]) => !board_.getIn([x, y, 'hasMine']))
          .reduce(
            (board, [x, y]) => board.updateIn([x, y, 'surroundingMines'], (c) => c + 1),
            board_,
          ),
        nMines - 1,
        startX,
        startY,
      ),
    );
  }

  return putMines(board, nMines, startX, startY);
}

function open(board, x, y) {
  let w = board.get('width');
  let h = board.get('height');
  let board_ = board.updateIn([x, y, 'opened'], () => true);

  if (board_.getIn([x, y, 'hasMine']) || board_.getIn([x, y, 'surroundingMines']) > 0) {
    return board_;
  }

  return surrounding
    .map((l) => l.toArray())
    .map(([a, b]) => [x + a, y + b])
    .filter(_isInside(w, h))
    .filter(([x_, y_]) => !board.getIn([x_, y_, 'hasMine']) && !board.getIn([x_, y_, 'opened']))
    .reduce((board, [x_, y_]) => open(board, x_, y_), board_);
}

function openedAll(board) {
  return Range(0, board.get('width')).every((x) =>
    Range(0, board.get('height')).every(
      (y) => board.getIn([x, y, 'hasMine']) || board.getIn([x, y, 'opened']),
    ),
  );
}

function toggleFlagged(board, x, y) {
  if (board.getIn([x, y, 'opened'])) return board;

  return board.updateIn([x, y, 'flagged'], (f) => !f);
}

interface GameState {
  board: Map<any, any>;
  isStarted: boolean;
  isGameOver: boolean;
}
const width = 12;
const height = 12;

const App = ({}) => {
  const [state, setState] = useState(() => ({
    board: initBoard(width, height),
    isStarted: false,
    isGameOver: false,
  }));

  let rows = [];
  for (let y = 0; y < height; y++) {
    let cols = [];
    for (let x = 0; x < width; x++) {
      let props = state.board.getIn([x, y]).toJS();
      let onClick = () => {
        setState(handleClick(x, y, state));
      };
      let onContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setState(handleContextMenu(x, y, state));
      };
      cols.push(
        <td key={x}>
          <Cell {...props} onClick={onClick} onContextMenu={onContextMenu} />
        </td>,
      );
    }
    rows.push(<tr key={y}>{cols}</tr>);
  }
  let gameOverClass = state.isGameOver ? 'game-over' : '';
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

function handleClick(x: number, y: number, {board, isStarted, isGameOver}: GameState): GameState {
  if (isGameOver) return;
  if (board.getIn([x, y, 'flagged'])) return;

  if (!isStarted) {
    board = putMines(board, 20, x, y);
    isStarted = true;
  }
  board = open(board, x, y);

  if (board.getIn([x, y, 'hasMine']) || openedAll(board)) {
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

interface CellProps {
  opened: boolean;
  hasMine: boolean;
  flagged: boolean;
  surroundingMines: number;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function Cell(props: CellProps) {
  let classNames = [];
  if (props.opened) classNames.push('opened');
  if (props.hasMine) classNames.push('has-mine');
  if (props.flagged) classNames.push('flagged');
  let text = '';
  if (props.opened && !props.hasMine && props.surroundingMines > 0) {
    text = props.surroundingMines.toString();
  }
  return (
    <div
      className={'Cell ' + classNames.join(' ')}
      onClick={props.onClick}
      onContextMenu={props.onContextMenu}
    >
      {text}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));
