import * as React from 'react';
import {Cell} from './game';

interface CellProps {
  cell: Cell;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function Cell({
  cell: {isOpened, hasMine, isFlagged, surroundingMines},
  onClick,
  onContextMenu,
}: CellProps) {
  let classNames = [];
  if (isOpened) classNames.push('opened');
  if (hasMine) classNames.push('has-mine');
  if (isFlagged) classNames.push('flagged');
  let text = '';
  if (isOpened && !hasMine && surroundingMines > 0) {
    text = surroundingMines.toString();
  }
  return (
    <div className={'Cell ' + classNames.join(' ')} onClick={onClick} onContextMenu={onContextMenu}>
      {text}
    </div>
  );
}
