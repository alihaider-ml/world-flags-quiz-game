
import React from 'react';

interface GameOverProps {
  score: number;
  totalFlags: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, totalFlags, highScore, isNewRecord, onRestart }) => {
  const percentage = totalFlags > 0 ? (score / totalFlags) * 100 : 0;

  const getMotivationalMessage = () => {
    if (isNewRecord && score > 0) return {
      title: "New World Record!",
      msg: "History has been made! You've officially surpassed your previous best. You're a true master of geography!",
      icon: "fa-fire",
      color: "text-orange-500"
    };
    if (percentage >= 90) return {
      title: "Global Legend!",
      msg: "Your knowledge of world flags is truly unmatched. You're practically a world ambassador!",
      icon: "fa-crown",
      color: "text-yellow-500"
    };
    if (percentage >= 70) return {
      title: "Exceptional Explorer!",
      msg: "Magnificent performance! You have a keen eye for detail and a great memory.",
      icon: "fa-award",
      color: "text-blue-500"
    };
    if (percentage >= 50) return {
      title: "Adventurous Spirit!",
      msg: "Great job! You're well on your way to mastering the world map. Keep it up!",
      icon: "fa-map-marked-alt",
      color: "text-green-500"
    };
    return {
      title: "Keep Exploring!",
      msg: "The world is big and full of colors. Every round makes you smarter. Ready to try again?",
      icon: "fa-compass",
      color: "text-blue-400"
    };
  };

  const { title, msg, icon, color } = getMotivationalMessage();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full text-center space-y-6 transform animate-in zoom-in-95 duration-500 border border-white/20">
        
        {isNewRecord && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl animate-bounce">
            New Record Set!
          </div>
        )}

        <div className={`w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg ${color} relative`}>
          <i className={`fas ${icon} text-5xl`}></i>
          {isNewRecord && (
             <div className="absolute -inset-2 rounded-full border-2 border-orange-400 animate-ping opacity-25"></div>
          )}
        </div>
        
        <div className="space-y-2">
          <h2 className={`text-4xl font-black tracking-tighter ${isNewRecord ? 'text-orange-600' : 'text-gray-900'}`}>{title}</h2>
          <p className="text-gray-500 font-medium text-sm leading-relaxed px-2">{msg}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-3xl p-4 border border-blue-100">
            <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest mb-1">Session Score</p>
            <p className="text-4xl font-black text-blue-600">{score}</p>
          </div>
          <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100">
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Personal Best</p>
            <p className="text-4xl font-black text-gray-800">{highScore}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accuracy</span>
              <span className="text-sm font-bold text-gray-700">{Math.round(percentage)}%</span>
           </div>
           <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ease-out rounded-full ${percentage > 50 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${percentage}%` }}
              ></div>
           </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-6 rounded-2xl shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] transition-all transform active:scale-95 flex items-center justify-center space-x-3 text-lg"
        >
          <i className="fas fa-redo-alt"></i>
          <span>EXPLORE AGAIN</span>
        </button>
      </div>
    </div>
  );
};

export default GameOver;
