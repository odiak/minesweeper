import {assignArray} from './util';

export interface Cell {
  readonly isOpened: boolean;
  readonly hasMine: boolean;
  readonly surroundingMines: number;
  readonly isFlagged: boolean;
}

export interface Board {
  readonly width: number;
  readonly height: number;
  readonly cells: ReadonlyArray<Cell>;
}

export interface GameState {
  board: Board;
  isStarted: boolean;
  isGameOver: boolean;
}

export function initBoard(width: number, height: number): Board {
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

export function getCellByCoordinate(board: Board, x: number, y: number): Cell {
  return board.cells[coordinateToIndex(x, y, board.width)];
}

function assignCell(board: Board, i: number, partialCell: Partial<Cell>): Board {
  const cell = board.cells[i];
  return {...board, cells: assignArray(board.cells, i, {...cell, ...partialCell})};
}

function isInsideBoard(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function putMinesRandomly(
  board: Board,
  nMines: number,
  startX: number,
  startY: number,
): Board {
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

export function open(board: Board, x: number, y: number): Board {
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

export function isOpenedAll(board: Board): boolean {
  return board.cells.every(({hasMine, isOpened}) => hasMine || isOpened);
}

export function toggleFlagged(board: Board, x: number, y: number): Board {
  const i = coordinateToIndex(x, y, board.width);
  const cell = board.cells[i];

  if (cell.isOpened) return board;

  return {...board, cells: assignArray(board.cells, i, {...cell, isFlagged: !cell.isFlagged})};
}
