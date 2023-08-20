import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import './index.less';

/**
 * type: 1：全部填充；2：向右填充；3：向下填充；
 */

const Index = () => {
  const contextMenuClassName = 'menuRoot';

  const setMenuRoot = () => {
    const attr = document.createAttribute('class');
    attr.value = contextMenuClassName;

    const node = document.createElement('div');
    node.setAttributeNode(attr);
    setTimeout(() => {
      document?.querySelector('#root')?.appendChild(node);
    }, 0);
  };

  const ContextMenu = ({
    handleWithFill,
    left,
    top,
  }: {
    handleWithFill: (type: 1 | 2 | 3) => (event: React.MouseEvent) => void;
    left: number;
    top: number;
  }) => (
    <div className={'rightClickMenu'} style={{ left, top }}>
      <div role="alert" onClick={handleWithFill(2)}>
        向右填充
      </div>
      <div role="alert" onClick={handleWithFill(3)}>
        向下填充
      </div>
      <div role="alert" onClick={handleWithFill(1)}>
        全部填充
      </div>
    </div>
  );

  const useRightClick = (
    handleFill: (
      type: 1 | 2 | 3,
      cellInfo: ExcelTableType.ChangeCellData,
    ) => void,
    needMenu: boolean,
  ) => {
    const cellInfo = useRef<ExcelTableType.ChangeCellData>();
    const showMenuRef = useRef<boolean>(false);

    const handleMenuHide = () => {
      if (showMenuRef.current) {
        ReactDOM.unmountComponentAtNode(
          document.querySelector(`.${contextMenuClassName}`) as HTMLElement,
        );
        showMenuRef.current = false;
      }
    };

    function handleOtherContextMenu(
      this: Window | GlobalEventHandlers,
      ev: MouseEvent,
    ) {
      handleMenuHide();
    }

    useEffect(() => {
      if (needMenu) {
        window.oncontextmenu = handleOtherContextMenu;
        window.onclick = handleOtherContextMenu;
      }

      return () => {
        handleMenuHide();
        window.oncontextmenu = null;
        window.onclick = null;
      };
    }, []);

    const handleWithFill = (type: 1 | 2 | 3) => (event: React.MouseEvent) => {
      handleFill(type, cellInfo.current as ExcelTableType.ChangeCellData);
      handleMenuHide();
    };

    const handleContextMenu = (
      event: React.MouseEvent,
      cell: ExcelTableType.Grid,
      i: number,
      j: number,
    ) => {
      if (!needMenu || !cell.fillable) {
        return;
      }

      const { clientX, clientY } = event;
      event.preventDefault();
      event.stopPropagation();

      ReactDOM.render(
        <ContextMenu
          handleWithFill={handleWithFill}
          top={clientY}
          left={clientX}
        />,
        document.querySelector(`.${contextMenuClassName}`),
      );

      showMenuRef.current = true;

      cellInfo.current = {
        id: cell.id,
        cell,
        row: i,
        col: j,
        value: cell.value,
      };
    };

    return { handleContextMenu, handleMenuHide };
  };

  setMenuRoot();

  return useRightClick;
};

export default Index();
