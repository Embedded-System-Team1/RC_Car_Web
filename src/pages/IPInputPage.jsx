import { useState, useCallback } from 'react';
import styles from './ipInputPage.module.css';
import { useNavigate } from 'react-router-dom';

function IPInputPage() {
  const [ipAddress, setIpAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleConnect = useCallback(() => {
    if (isValidIP(ipAddress)) {
      setErrorMessage('');
      console.log('페이지 이동');
      navigate('/control', { state: { ipAddress } });
    } else {
      setErrorMessage('올바른 IP 주소를 입력하세요.');
    }
  }, [ipAddress]);

  const isValidIP = (ip) => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>RC카 연결</h1>
        <p className={styles.description}>라즈베리파이의 IP 주소를 입력하세요.</p>

        <div className={styles.inputContainer}>
          <label htmlFor='ipAddress' className={styles.label}>
            IP 주소
          </label>
          <input
            id='ipAddress'
            type='text'
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className={styles.input}
            placeholder='예: 192.168.0.100'
          />
        </div>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <button onClick={handleConnect} className={styles.connectButton}>
          연결
        </button>
      </div>
    </div>
  );
}

export default IPInputPage;
