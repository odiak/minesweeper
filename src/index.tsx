import {useState} from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {range} from './util';
import {initBoard, getCellByCoordinate, putMinesRandomly, open, toggleFlagged} from './game';
import {Cell} from './Cell';
import styled from '@emotion/styled';
import {Global, css} from '@emotion/core';

const globalStyles = css`
  font-family: sans-serif;
`;

const StyledTable = styled.table`
  border-collapse: collapse;

  & td {
    border: 2px solid #cccccc;
    padding: 0;
  }
`;

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
          <Cell
            cell={cell}
            isGameOver={state.isGameOver}
            onClick={onClick}
            onContextMenu={onContextMenu}
          />
        </td>,
      );
    }
    rows.push(<tr key={y}>{cols}</tr>);
  }
  return (
    <div>
      <button
        onClick={() => {
          setState({board: initBoard(width, height), isStarted: false, isGameOver: false});
        }}
      >
        restart
      </button>
      <StyledTable>
        <tbody>{rows}</tbody>
      </StyledTable>
    </div>
  );
};

ReactDOM.render(
  <>
    <Global styles={globalStyles} />
    <App />
  </>,

  document.getElementById('app'),
);
