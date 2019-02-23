import {useState} from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

function* range(start: number, end: number): Iterable<number> {
  for (let n = start; n < end; n++) {
    yield n;
  }
}

function assignArray<Elem, Arr extends Array<Elem> | ReadonlyArray<Elem>>(
  array: Arr,
  index: number,
  value: Elem,
): Arr {
  const newArray = array.slice();
  newArray[index] = value;
  return newArray as Arr;
}

interface Cell {
  readonly isOpened: boolean;
  readonly hasMine: boolean;
  readonly surroundingMines: number;
  readonly isFlagged: boolean;
}

interface Board {
  readonly width: number;
  readonly height: number;
  readonly cells: ReadonlyArray<Cell>;
}

function initBoard(width: number, height: number): Board {
  return {
    width,
    height,
    cells: new Array<Cell>(width * height).fill({
      isOpened: false,
      hasMine: false,
      surroundingMines: 0,
      isFlagged: false,
    }),
  };
}

const surrounding: ReadonlyArray<[number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function indexToCoodinate(i: number, width: number): [number, number] {
  const x = i % width;
  const y = (i - x) / width;
  return [x, y];
}

function coordinateToIndex(x: number, y: number, width: number): number {
  return x + y * width;
}

function assignCell(board: Board, i: number, partialCell: Partial<Cell>): Board {
  const cell = board.cells[i];
  return {...board, cells: assignArray(board.cells, i, {...cell, ...partialCell})};
}

function isInsideBoard(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

function putMinesRandomly(board: Board, nMines: number, startX: number, startY: number): Board {
  if (nMines <= 0) return board;

  const {width, height, cells} = board;

  const candidates = [...cells.entries()].filter(([i, cell]) => {
    if (cell.isOpened || cell.hasMine) return false;

    const [x, y] = indexToCoodinate(i, width);

    return Math.abs(x - startX) > 1 || Math.abs(y - startY) > 1;
  });

  if (candidates.length === 0) {
    return board;
  }

  const n = Math.min(nMines, candidates.length);
  const targetIndices: number[] = [];

  while (targetIndices.length < n) {
    const [i] = candidates[Math.floor(Math.random() * candidates.length)];
    if (!targetIndices.includes(i)) {
      targetIndices.push(i);
    }
  }

  const newCells = targetIndices.reduce((cells, targetIndex) => {
    const [targetX, targetY] = indexToCoodinate(targetIndex, width);
    return cells.map((cell, i) => {
      if (i === targetIndex) {
        return {...cell, hasMine: true};
      }

      const [x, y] = indexToCoodinate(i, width);
      if (Math.abs(x - targetX) <= 1 && Math.abs(y - targetY) <= 1) {
        return {...cell, surroundingMines: cell.surroundingMines + 1};
      }

      return cell;
    });
  }, cells);

  return {...board, cells: newCells};
}

function open(board: Board, x: number, y: number): Board {
  const {width, height} = board;

  const i = coordinateToIndex(x, y, width);
  const openedBoard = assignCell(board, i, {isOpened: true});
  const cell = openedBoard.cells[i];

  if (cell.hasMine || cell.surroundingMines > 0) {
    return openedBoard;
  }

  return surrounding
    .map(([dx, dy]) => [x + dx, y + dy])
    .filter(([x, y]) => isInsideBoard(x, y, width, height))
    .filter(([x, y]) => {
      const {hasMine, isOpened} = openedBoard.cells[coordinateToIndex(x, y, width)];
      return !hasMine && !isOpened;
    })
    .reduce((board, [x, y]) => open(board, x, y), openedBoard);
}

function isOpenedAll(board: Board): boolean {
  return board.cells.every(({hasMine, isOpened}) => hasMine || isOpened);
}

function toggleFlagged(board: Board, x: number, y: number): Board {
  const i = coordinateToIndex(x, y, board.width);
  const cell = board.cells[i];

  if (cell.isOpened) return board;

  return {...board, cells: assignArray(board.cells, i, {...cell, isFlagged: !cell.isFlagged})};
}

interface GameState {
  board: Board;
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

  const rows = [];
  for (const y of range(0, height)) {
    const cols = [];
    for (const x of range(0, width)) {
      const props = state.board.cells[coordinateToIndex(x, y, width)];
      const onClick = () => {
        setState(handleClick(x, y, state));
      };
      const onContextMenu = (event: React.MouseEvent) => {
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
  const i = coordinateToIndex(x, y, board.width);
  if (board.cells[i].isFlagged) return state;

  if (!isStarted) {
    board = putMinesRandomly(board, 20, x, y);
    isStarted = true;
  }
  board = open(board, x, y);

  if (board.cells[i].hasMine || isOpenedAll(board)) {
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
  isOpened: boolean;
  hasMine: boolean;
  isFlagged: boolean;
  surroundingMines: number;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function Cell(props: CellProps) {
  let classNames = [];
  if (props.isOpened) classNames.push('opened');
  if (props.hasMine) classNames.push('has-mine');
  if (props.isFlagged) classNames.push('flagged');
  let text = '';
  if (props.isOpened && !props.hasMine && props.surroundingMines > 0) {
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
