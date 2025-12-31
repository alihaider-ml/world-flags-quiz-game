
import React from 'react';
import { Country } from '../types';

interface FlagDisplayProps {
  country: Country;
  isWrong: boolean;
}

const FlagDisplay: React.FC<FlagDisplayProps> = ({ country, isWrong }) => {
  return (
    <div className={`relative flex flex-col justify-center items-center mb-10 transition-all duration-500 ${isWrong ? 'animate-shake' : ''}`}>
      <div className="bg-white p-5 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-[8px] border-white ring-1 ring-gray-100 transform hover:scale-[1.02] transition-all relative">
        <img
          src={`https://flagcdn.com/w640/${country.code}.png`}
          alt="Guess the flag"
          className="w-72 h-44 md:w-[28rem] md:h-72 object-cover rounded-3xl shadow-inner bg-gray-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x480?text=SCANNING+ARCHIVES...';
          }}
        />
        <div className="absolute top-8 right-8 w-12 h-12 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-white">
          <i className="fas fa-fingerprint text-2xl"></i>
        </div>
      </div>
      <div className="absolute -bottom-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 py-3 rounded-full shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] font-black text-xs tracking-[0.25em] uppercase border-2 border-white">
        Identity Request
      </div>
    </div>
  );
};

export default FlagDisplay;
