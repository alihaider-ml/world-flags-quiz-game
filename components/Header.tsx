
import React from 'react';

interface HeaderProps {
  score: number;
  lives: number;
  timeLeft: number;
}

const Header: React.FC<HeaderProps> = ({ score, lives, timeLeft }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 bg-white/10 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white/20 mb-10 w-full max-w-2xl mx-auto">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600/30 text-blue-400 p-2.5 rounded-xl border border-blue-400/20">
          <i className="fas fa-trophy text-xl"></i>
        </div>
        <div>
          <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest opacity-60">Score</p>
          <p className="text-2xl font-black text-white tracking-tighter">{score}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="bg-red-600/30 text-red-400 p-2.5 rounded-xl border border-red-400/20">
          <i className="fas fa-heart-pulse text-xl"></i>
        </div>
        <div>
          <p className="text-[10px] text-red-200 uppercase font-black tracking-widest opacity-60">Health</p>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`fas fa-heart text-xs ${i < lives ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'text-white/10'}`}
              ></i>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className={`p-2.5 rounded-xl border transition-colors ${timeLeft < 30 ? 'bg-orange-600/30 text-orange-400 border-orange-400/20' : 'bg-green-600/30 text-green-400 border-green-400/20'}`}>
          <i className="fas fa-clock text-xl"></i>
        </div>
        <div>
          <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest opacity-60">Remaining</p>
          <p className={`text-2xl font-black tabular-nums tracking-tighter ${timeLeft < 30 ? 'text-orange-400' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;
