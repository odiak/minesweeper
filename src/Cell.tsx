import * as React from 'react';
import type {Cell} from './game';
import styled from '@emotion/styled';
import {css} from '@emotion/react';

const StyledCell = styled.div<Cell & {isGameOver: boolean}>`
  width: 28px;
  height: 28px;
  background: #999999;
  text-align: center;
  font-size: 18px;
  line-height: 28px;

  ${(props) =>
    props.isOpened &&
    css`
      background: #dddddd;
    `}

  ${(props) =>
    props.isFlagged &&
    css`
      background: royalblue;
    `}

  ${(props) =>
    props.isGameOver &&
    props.hasMine &&
    css`
      background: #000000;
    `}

  ${(props) =>
    props.isGameOver &&
    props.isFlagged &&
    css`
      background: orange;
    `}

  ${(props) =>
    props.isGameOver &&
    props.isFlagged &&
    props.hasMine &&
    css`
      background: green;
    `}

  ${(props) =>
    props.isGameOver &&
    props.isOpened &&
    props.hasMine &&
    css`
      background: #ff0000;
    `}
`;

interface CellProps {
  cell: Cell;
  isGameOver: boolean;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function Cell({cell, isGameOver, onClick, onContextMenu}: CellProps) {
  return (
    <StyledCell {...cell} isGameOver={isGameOver} onClick={onClick} onContextMenu={onContextMenu}>
      {cell.isOpened && !cell.hasMine && cell.surroundingMines > 0 ? cell.surroundingMines : null}
    </StyledCell>
  );
}
