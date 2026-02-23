import React from 'react';

const Skeleton = ({ width, height, borderRadius = '12px', className = '' }) => {
    return (
        <div
            className={`skeleton-base ${className}`}
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius: borderRadius
            }}
        >
            <style>{`
                .skeleton-base {
                    background: linear-gradient(
                        90deg, 
                        rgba(255, 255, 255, 0.03) 25%, 
                        rgba(255, 255, 255, 0.06) 50%, 
                        rgba(255, 255, 255, 0.03) 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                    position: relative;
                    overflow: hidden;
                }

                @keyframes shimmer {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

export default Skeleton;
