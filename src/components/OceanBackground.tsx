import React from 'react';

const OceanBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient waves */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          className="relative block w-full h-40"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(20, 184, 166, 0.4)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
              <stop offset="100%" stopColor="rgba(20, 184, 166, 0.1)" />
            </linearGradient>
          </defs>
          
          {/* First wave layer */}
          <path
            d="M0,60 C150,120 300,0 450,60 C600,120 750,0 900,60 C1050,120 1200,60 1200,60 V120 H0 V60 Z"
            fill="url(#wave-gradient-1)"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          
          {/* Second wave layer */}
          <path
            d="M0,80 C200,140 400,20 600,80 C800,140 1000,20 1200,80 V120 H0 V80 Z"
            fill="url(#wave-gradient-2)"
            className="animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '1s' }}
          />
        </svg>
      </div>
      
      {/* Floating particles representing sonar pings */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              backgroundColor: `rgba(${Math.random() > 0.5 ? '20, 184, 166' : '59, 130, 246'}, ${0.2 + Math.random() * 0.3})`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle grid pattern for sonar effect */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};

export default OceanBackground;