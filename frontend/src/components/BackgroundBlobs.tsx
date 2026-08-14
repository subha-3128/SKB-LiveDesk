import React from 'react';

export const BackgroundBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 no-print">
      {/* Rose Blob */}
      <div 
        className="absolute top-[-10%] left-[-5%] w-[450px] sm:w-[500px] h-[450px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[100px] opacity-75"
        style={{
          background: 'radial-gradient(circle, rgba(183, 110, 121, 0.4) 0%, transparent 70%)',
          animation: 'liquidFloat 20s infinite alternate ease-in-out',
        }}
      />
      {/* Plum Blob */}
      <div 
        className="absolute bottom-[-10%] right-[-5%] w-[550px] sm:w-[600px] h-[550px] sm:h-[600px] rounded-full blur-[80px] sm:blur-[100px] opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(74, 23, 51, 0.3) 0%, transparent 70%)',
          animation: 'liquidFloat 28s infinite alternate ease-in-out',
        }}
      />
      {/* Soft Center Beige Glow */}
      <div 
        className="absolute top-[40%] left-[30%] w-[350px] h-[350px] rounded-full blur-[90px] opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(231, 222, 216, 0.5) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
