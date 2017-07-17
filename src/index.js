import React from 'react';
import ReactDOM from 'react-dom';

import {List, Map, Range} from 'immutable';

function initBoard(w, h) {
  let board = Range(0, w).map(x =>
    Range(0, h).map(y =>
      Map({
        opened: true,
        hasMine: false,
        surroundingMines: 0,
        flagged: false,
      })
    ).toList()
  ).toList();

  return board;
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

function putMines(board, w, h, nMines, startX, startY) {
  if (nMines > w * h) {
    throw new Error("nMines is too big: " + nMines);
  }

  return Range()
    .map(() => [
      Math.floor(Math.random() * w),
      Math.floor(Math.random() * h),
    ])
    .filter(([x, y]) => x !== startX && y != startY && !board.getIn([x, y, 'hasMine']))
    .take(nMines)
    .reduce((board, [x, y]) => {
      let board_ = board.updateIn([x, y, 'hasMine'], () => true)
      return surrounding
        .map(([p, q]) => [x + p, y + q])
        .filter(_isInside(w, h))
        .reduce((board, [x, y]) =>
          board.updateIn([x, y, 'surroundingMines'], c => c + 1),
          board_
        );
    }, board);
}

function open(board, x, y) {
  let board_ = board.updateIn([x, y, 'opened'], () => true);

  if (board_.getIn([x, y, 'hasMine']) ||
      board_.getIn([x, y, 'surroundingMines']) > 0) {
    return board_;
  }

  return board_;
}

class App extends React.Component {
  constructor() {
    super();

    let width = 12;
    let height = 12;
    this.state = {
      width,
      height,
      board: initBoard(width, height),
      started: false,
    };
  }

  render() {
    let rows = [];
    for (let y = 0; y < this.state.height; y++) {
      let cols = [];
      for (let x = 0; x < this.state.width; x++) {
        let props = this.state.board.getIn([x, y]).toJS();
        let onClick = (event) => { this.handleClick(x, y) };
        cols.push(<td key={x}><Cell {...props} onClick={onClick}/></td>);
      }
      rows.push(<tr key={y}>{cols}</tr>);
    }
    return (<div>
      <table className="board"><tbody>{rows}</tbody></table>
    </div>);
  }

  handleClick(x, y) {
    if (this.state.board.getIn([x, y, 'flagged'])) return;

    this.setState((prev, props) => {
      let board = prev.board;
      if (!prev.started) {
        board = putMines(board, prev.width, prev.height, 10, x, y);
      }
      return {
        board: open(board, x, y),
        started: true,
      };
    });
  }
}

function Cell(props) {
  let classNames = [];
  if (props.opened) classNames.push('opened');
  if (props.hasMine) classNames.push('has-mine');
  if (props.flagged) classNames.push('flagged');
  let text = '';
  if (props.opened && props.surroundingMines > 0) {
    text = props.surroundingMines;
  }
  return <div className={'Cell ' + classNames.join(' ')}
      onClick={props.onClick}>{text}</div>;
}

ReactDOM.render(
  <App/>,
  document.getElementById('app')
)
