import React, { useEffect, useState } from 'react';

const ResultItem = ({ result, isNew }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    return (
        <div className={`result-item ${show ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 ${isNew ? 'animate-fade-in' : ''}`}>
            <span className="address">{result.address}</span>
            <span className={`balance ${result.status === 'error' ? 'error' : 'success'}`}>
                {result.balance}
            </span>
        </div>
    );
};

export default ResultItem;
