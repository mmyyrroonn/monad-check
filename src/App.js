import React, { useState, lazy, Suspense } from 'react';
import './styles.css';
import Web3 from 'web3';

const ResultItem = lazy(() => import('./components/ResultItem'));

const App = () => {
    const [addresses, setAddresses] = useState('');
    const [results, setResults] = useState([]);
    const [isChecking, setIsChecking] = useState(false);

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchWithRetry = async (address, retries = 2) => {
        for (let i = 0; i <= retries; i++) {
            try {
                const web3 = new Web3('https://testnet-rpc.monad.xyz');
                const balance = await web3.eth.getBalance(address);
                const formattedBalance = web3.utils.fromWei(balance, 'ether');
                return { balance: formattedBalance, status: 'success' };
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
            <h1 className="title">MONAD Test Balance Checker</h1>
            <div className="input-area">
                <div className="input-label">
                    <span className="text-gray-600">Input Addresses</span>
                    <span className="text-sm text-gray-500">(one address per line)</span>
                </div>
                <textarea
                    className="textarea"
                    value={addresses}
                    onChange={(e) => setAddresses(e.target.value)}
                    placeholder={`Example:
0x1234...5678
0xabcd...efgh
0x9876...5432`}
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
