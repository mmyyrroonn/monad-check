import React, { useState, lazy, Suspense } from 'react';
import './styles.css';

const ResultItem = lazy(() => import('./components/ResultItem'));

const App = () => {
    const [addresses, setAddresses] = useState('');
    const [results, setResults] = useState([]);
    const [isChecking, setIsChecking] = useState(false);

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const checkBalances = async () => {
        setIsChecking(true);
        const addressList = addresses.split('\n').map(addr => addr.trim()).filter(addr => addr);
        
        // 清空之前的结果
        setResults([]);

        for (const address of addressList) {
            try {
                // 添加1秒延迟
                await delay(1000);
                
                const response = await fetch(`https://monad-api.blockvision.org/testnet/api/account/tokenPortfolio?address=${address}`, {
                    headers: {
                        "accept": "application/json",
                        "origin": "https://testnet.monadexplorer.com",
                        "referer": "https://testnet.monadexplorer.com/"
                    }
                });
                const data = await response.json();
                const monToken = data.result.data.find(token => token.symbol === 'MON');
                const balance = monToken ? monToken.balance : 'N/A';
                
                // 实时更新结果
                setResults(prev => [...prev, { address, balance, status: 'success' }]);
            } catch (error) {
                setResults(prev => [...prev, { address, balance: 'Error fetching balance', status: 'error' }]);
            }
        }
        setIsChecking(false);
    };

    return (
        <div className="app-container">
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
