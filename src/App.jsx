import { useState, useEffect, useRef } from 'react';

function App() {
  const socketRef = useRef(null);
  const [activeKeys, setActiveKeys] = useState({}); // 활성화된 키 상태

  useEffect(() => {
    // WebSocket 연결
    socketRef.current = new WebSocket('ws://192.168.137.186:9000');

    socketRef.current.onopen = () => {
      console.log('WebSocket 연결 성공');
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket 연결 종료');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.log('WebSocket 연결이 닫혀 있습니다.');
    }
  };

  const handleKeyDown = (e) => {
    if (!e.key.startsWith('Arrow')) {
      return;
    }

    if (
      (e.key === 'ArrowLeft' && activeKeys.ArrowRight) ||
      (e.key === 'ArrowRight' && activeKeys.ArrowLeft) ||
      (e.key === 'ArrowUp' && activeKeys.ArrowDown) ||
      (e.key === 'ArrowDown' && activeKeys.ArrowUp)
    ) {
      return;
    }

    if (!activeKeys[e.key]) {
      setActiveKeys((prevKeys) => ({
        ...prevKeys,
        [e.key]: true,
      }));
    }
  };

  const handleKeyUp = (e) => {
    setActiveKeys((prevKeys) => {
      const newKeys = { ...prevKeys };
      delete newKeys[e.key];
      return newKeys;
    });
  };

  useEffect(() => {
    const combinedActions = () => {
      if (activeKeys.ArrowUp && activeKeys.ArrowLeft) {
        sendMessage('FORWARD_LEFT');
      } else if (activeKeys.ArrowUp && activeKeys.ArrowRight) {
        sendMessage('FORWARD_RIGHT');
      } else if (activeKeys.ArrowUp) {
        sendMessage('FORWARD');
      } else if (activeKeys.ArrowDown) {
        sendMessage('BACKWARD');
      } else if (activeKeys.ArrowLeft) {
        sendMessage('LEFT');
      } else if (activeKeys.ArrowRight) {
        sendMessage('RIGHT');
      } else {
        sendMessage('STOP');
      }
    };

    combinedActions();
  }, [activeKeys, handleKeyDown]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>RC 카 컨트롤러</h1>
      <p>방향키를 사용해 RC 카를 조작하세요:</p>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: '50px 50px 50px',
          gridGap: '10px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <button
          style={{
            gridColumn: '2',
            backgroundColor: activeKeys.ArrowUp ? 'lightgreen' : 'white',
          }}
        >
          ↑
        </button>
        <button
          style={{
            gridColumn: '1',
            backgroundColor: activeKeys.ArrowLeft ? 'lightgreen' : 'white',
          }}
        >
          ←
        </button>
        <button
          style={{
            gridColumn: '3',
            backgroundColor: activeKeys.ArrowRight ? 'lightgreen' : 'white',
          }}
        >
          →
        </button>
        <button
          style={{
            gridColumn: '2',
            backgroundColor: activeKeys.ArrowDown ? 'lightgreen' : 'white',
          }}
        >
          ↓
        </button>
      </div>
      <p style={{ marginTop: '20px' }}>
        현재 활성화된 키: {Object.keys(activeKeys).join(', ') || '없음'}
      </p>
    </div>
  );
}

export default App;
