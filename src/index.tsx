import { useState } from 'react';
import * as React from 'react';
import { range } from './util';
import { initBoard, getCellByCoordinate, putMinesRandomly, open, toggleFlagged } from './game';
import { Cell } from './Cell';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import { Config, persistConfig, unpersistConfig } from './Config';
import { ConfigForm } from './ConfigForm';
import { createRoot } from 'react-dom/client';

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

const App = ({ }) => {
  const [configDraft, setConfigDraft] = useState(
    (): Config =>
      unpersistConfig({
        width: 12,
        height: 12,
        rate: 0.1,
      }),
  );
  const [config, setConfig] = useState(() => configDraft);

  const { width, height, rate } = config;

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
            : {
              ...state,
              isStarted: true,
              board: putMinesRandomly(state.board, Math.floor(width * height * rate), x, y),
            };
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
      <StyledTable>
        <tbody>{rows}</tbody>
      </StyledTable>
      <button
        onClick={() => {
          setConfig(configDraft);
          setState({
            board: initBoard(configDraft.width, configDraft.height),
            isStarted: false,
            isGameOver: false,
          });
        }}
      >
        restart
      </button>
      <ConfigForm
        config={configDraft}
        onChangeConfig={(config) => {
          setConfigDraft(config);
          persistConfig(config);
        }}
      />
    </div>
  );
};

createRoot(document.getElementById('app')!).render(
  <>
    <Global styles={globalStyles} />
    <App />
  </>,
);
