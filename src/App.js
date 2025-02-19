import React, { useState, lazy, Suspense } from 'react';
import './styles.css';

const ResultItem = lazy(() => import('./components/ResultItem'));

const App = () => {
    const [addresses, setAddresses] = useState('');
    const [results, setResults] = useState([]);
    const [isChecking, setIsChecking] = useState(false);

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchWithRetry = async (address, retries = 2) => {
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fetch(`https://monad-api.blockvision.org/testnet/api/account/tokenPortfolio?address=${address}`, {
                    headers: {
                        "accept": "application/json",
                        "origin": "https://testnet.monadexplorer.com",
                        "referer": "https://testnet.monadexplorer.com/"
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const monToken = data.result.data.find(token => token.symbol === 'MON');
                return { balance: monToken ? monToken.balance : 'N/A', status: 'success' };
            } catch (error) {
                if (i === retries) {
                    return { balance: `Error fetching balance (${retries + 1} attempts)`, status: 'error' };
                }
                // 在重试之前等待越来越长的时间
                await delay(1000 * (i + 1));
                continue;
            }
        }
    };

    const checkBalances = async () => {
        setIsChecking(true);
        const addressList = addresses.split('\n').map(addr => addr.trim()).filter(addr => addr);
        setResults([]);

        for (const address of addressList) {
            await delay(1000); // 添加1秒延迟
            const result = await fetchWithRetry(address);
            setResults(prev => [...prev, { 
                address, 
                balance: result.balance, 
                status: result.status 
            }]);
        }
        
        setIsChecking(false);
    };

    return (
        <div className="app-container">
            <div className="twitter-banner">
                <a href="https://x.com/moshuishapaozi" target="_blank" rel="noopener noreferrer" className="twitter-link">
                    Follow me on 𝕏 @moshuishapaozi
                </a>
            </div>
            <h1 className="title">MONAD Balance Checker</h1>
            <div className="input-area">
                <textarea
                    className="textarea"
                    value={addresses}
                    onChange={(e) => setAddresses(e.target.value)}
                    placeholder="Enter addresses, one per line"
                    disabled={isChecking}
                />
                <button 
                    className={`button ${isChecking ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={checkBalances}
                    disabled={isChecking}
                >
                    {isChecking ? 'Checking...' : 'Check Balances'}
                </button>
            </div>
            <div className="results-container">
                <Suspense fallback={<div>Loading results...</div>}>
                    {results.map((result, index) => (
                        <ResultItem 
                            key={`${result.address}-${index}`} 
                            result={result} 
                            isNew={index === results.length - 1}
                        />
                    ))}
                </Suspense>
            </div>
        </div>
    );
};

export default App;
