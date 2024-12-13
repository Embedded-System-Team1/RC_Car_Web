import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './App.module.css';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

function App() {
  const socketRef = useRef(null);
  const [activeKeys, setActiveKeys] = useState({}); // 활성화된 키 상태
  const [lastMessage, setLastMessage] = useState(''); // 마지막 전송 메시지 상태
  const [spaceCoolDown, setSpaceCoolDown] = useState(false); // 스페이스바 쿨다운 상태
  const intervalRef = useRef(null); // Interval 참조

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

  const sendMessage = useCallback(
    (message) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        if (message !== 'STOP' || lastMessage !== 'STOP') {
          socketRef.current.send(message);
          setLastMessage(message); // 마지막 메시지 업데이트
        }
      } else {
        console.log('WebSocket 연결이 닫혀 있습니다.');
      }
    },
    [lastMessage]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === ' ' && !spaceCoolDown) {
        // 스페이스바 메시지 전송 및 쿨다운 설정
        sendMessage('HORN');
        setSpaceCoolDown(true);
        setTimeout(() => setSpaceCoolDown(false), 500); // 0.5초 쿨다운
        return;
      }

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
    },
    [activeKeys, sendMessage, spaceCoolDown]
  );

  const handleKeyUp = useCallback((e) => {
    if (!e.key.startsWith('Arrow')) {
      return;
    }

    setActiveKeys((prevKeys) => {
      const newKeys = { ...prevKeys };
      delete newKeys[e.key];
      return newKeys;
    });
  }, []);

  useEffect(() => {
    const combinedActions = () => {
      if (activeKeys.ArrowUp && activeKeys.ArrowLeft) {
        sendMessage('FORWARD_LEFT');
      } else if (activeKeys.ArrowUp && activeKeys.ArrowRight) {
        sendMessage('FORWARD_RIGHT');
      } else if (activeKeys.ArrowUp) {
        sendMessage('FORWARD');
      } else if (activeKeys.ArrowDown && activeKeys.ArrowLeft) {
        sendMessage('BACKWARD_LEFT');
      } else if (activeKeys.ArrowDown && activeKeys.ArrowRight) {
        sendMessage('BACKWARD_RIGHT');
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

    // 기존 interval 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 새로운 interval 설정
    intervalRef.current = setInterval(() => {
      combinedActions();
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeKeys, lastMessage, sendMessage]); // lastMessage 추가

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>RC 카 컨트롤러</h1>

        <p className={styles.description}>
          방향키를 사용해 RC 카를 조작하고, 스페이스바로 특수 동작을 실행하세요:
        </p>

        {/* Up arrow */}
        <div className={styles.topCenter}>
          <div className={styles.gridItem}>
            <div className={`${styles.arrowButton} ${activeKeys.ArrowUp ? styles.active : ''}`}>
              <ArrowUp
                className={`${styles.arrowIcon} ${activeKeys.ArrowUp ? styles.activeIcon : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Left arrow */}
        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <div className={`${styles.arrowButton} ${activeKeys.ArrowLeft ? styles.active : ''}`}>
              <ArrowLeft
                className={`${styles.arrowIcon} ${activeKeys.ArrowLeft ? styles.activeIcon : ''}`}
              />
            </div>
          </div>

          {/* Down arrow */}
          <div className={styles.gridItem}>
            <div className={`${styles.arrowButton} ${activeKeys.ArrowDown ? styles.active : ''}`}>
              <ArrowDown
                className={`${styles.arrowIcon} ${activeKeys.ArrowDown ? styles.activeIcon : ''}`}
              />
            </div>
          </div>

          {/* Right arrow */}
          <div className={styles.gridItem}>
            <div className={`${styles.arrowButton} ${activeKeys.ArrowRight ? styles.active : ''}`}>
              <ArrowRight
                className={`${styles.arrowIcon} ${activeKeys.ArrowRight ? styles.activeIcon : ''}`}
              />
            </div>
          </div>
        </div>

        <div className={styles.statusText}>
          현재 활성화된 키:{' '}
          <span className={styles.activeKey}>
            {Object.keys(activeKeys).length > 0
              ? Object.keys(activeKeys)
                  .map((key) => key.replace('Arrow', ''))
                  .join(', ')
              : '없음'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
