
import React, { useState, useEffect, useCallback } from 'react';
import { COUNTRIES, TOTAL_GAME_TIME, INITIAL_LIVES } from './constants';
import { Country, GameStatus, GameState } from './types';
import Header from './components/Header';
import FlagDisplay from './components/FlagDisplay';
import GameOver from './components/GameOver';
import { getCountryFact, getDetailedCountryInfo } from './services/geminiService';

const QUESTION_TIME = 5;
const STORAGE_KEY = 'flagquest_highscore';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState & { detailedInfo: string | null; questionTimeLeft: number; highScore: number; isNewRecord: boolean }>({
    score: 0,
    totalFlags: 0,
    lives: INITIAL_LIVES,
    timeLeft: TOTAL_GAME_TIME,
    currentCountry: null,
    options: [],
    status: GameStatus.LOBBY,
    lastGuessCorrect: null,
    countryFact: null,
    detailedInfo: null,
    questionTimeLeft: QUESTION_TIME,
    isPaused: false,
    highScore: 0,
    isNewRecord: false,
  });

  const [isLoadingFact, setIsLoadingFact] = useState(false);
  const [isLoadingDetailed, setIsLoadingDetailed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setGameState(prev => ({ ...prev, highScore: parseInt(saved, 10) }));
    }
  }, []);

  const generateNewRound = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * COUNTRIES.length);
    const correctCountry = COUNTRIES[randomIndex];
    
    const otherCountries = COUNTRIES.filter(c => c.code !== correctCountry.code);
    const shuffledOthers = [...otherCountries].sort(() => 0.5 - Math.random());
    const options = [correctCountry, ...shuffledOthers.slice(0, 3)].sort(() => 0.5 - Math.random());

    setGameState(prev => ({
      ...prev,
      currentCountry: correctCountry,
      options,
      totalFlags: prev.status === GameStatus.PLAYING ? prev.totalFlags + 1 : prev.totalFlags,
      lastGuessCorrect: null,
      countryFact: null,
      detailedInfo: null,
      questionTimeLeft: QUESTION_TIME,
      isPaused: false,
    }));
  }, []);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      totalFlags: 1,
      lives: INITIAL_LIVES,
      timeLeft: TOTAL_GAME_TIME,
      status: GameStatus.PLAYING,
      lastGuessCorrect: null,
      countryFact: null,
      detailedInfo: null,
      questionTimeLeft: QUESTION_TIME,
      isPaused: false,
      isNewRecord: false,
    }));
    generateNewRound();
  };

  const togglePause = () => {
    if (gameState.status !== GameStatus.PLAYING) return;
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleGameOver = useCallback((finalScore: number) => {
    const currentHigh = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    const isNew = finalScore > currentHigh;
    
    if (isNew) {
      localStorage.setItem(STORAGE_KEY, finalScore.toString());
    }

    setGameState(prev => ({
      ...prev,
      status: GameStatus.GAME_OVER,
      isNewRecord: isNew,
      highScore: isNew ? finalScore : prev.highScore
    }));
  }, []);

  const handleWrongGuess = useCallback(() => {
    const newLives = gameState.lives - 1;
    if (newLives <= 0) {
      handleGameOver(gameState.score);
    } else {
      setGameState(prev => ({
        ...prev,
        lives: newLives,
        lastGuessCorrect: false,
      }));

      setTimeout(() => {
        setGameState(prev => ({ ...prev, lastGuessCorrect: null, isPaused: false }));
        generateNewRound();
      }, 800);
    }
  }, [gameState.lives, gameState.score, generateNewRound, handleGameOver]);

  const handleGuess = async (country: Country) => {
    if (gameState.status !== GameStatus.PLAYING || gameState.lastGuessCorrect !== null || gameState.isPaused) return;

    const isCorrect = country.code === gameState.currentCountry?.code;

    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        lastGuessCorrect: true
      }));

      setIsLoadingFact(true);
      const fact = await getCountryFact(country.name);
      setGameState(prev => ({ ...prev, countryFact: fact }));
      setIsLoadingFact(false);
    } else {
      handleWrongGuess();
    }
  };

  const handleLearnMore = async () => {
    if (!gameState.currentCountry || isLoadingDetailed || gameState.isPaused) return;
    setIsLoadingDetailed(true);
    const info = await getDetailedCountryInfo(gameState.currentCountry.name);
    setGameState(prev => ({ ...prev, detailedInfo: info }));
    setIsLoadingDetailed(false);
  };

  const handleNext = () => {
    if (gameState.isPaused) return;
    generateNewRound();
  };

  useEffect(() => {
    let timer: number | undefined;
    if (gameState.status === GameStatus.PLAYING && gameState.timeLeft > 0 && !gameState.isPaused) {
      timer = window.setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            handleGameOver(prev.score);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState.status, gameState.isPaused, handleGameOver]);

  useEffect(() => {
    let qTimer: number | undefined;
    if (gameState.status === GameStatus.PLAYING && gameState.lastGuessCorrect === null && !gameState.isPaused) {
      qTimer = window.setInterval(() => {
        setGameState(prev => {
          if (prev.questionTimeLeft <= 1) {
            clearInterval(qTimer);
            return { ...prev, questionTimeLeft: 0 };
          }
          return { ...prev, questionTimeLeft: prev.questionTimeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(qTimer);
  }, [gameState.status, gameState.lastGuessCorrect, gameState.currentCountry, gameState.isPaused]);

  useEffect(() => {
    if (gameState.questionTimeLeft === 0 && gameState.lastGuessCorrect === null && gameState.status === GameStatus.PLAYING && !gameState.isPaused) {
      handleWrongGuess();
    }
  }, [gameState.questionTimeLeft, gameState.lastGuessCorrect, gameState.status, handleWrongGuess, gameState.isPaused]);

  if (gameState.status === GameStatus.LOBBY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="max-w-xl w-full bg-white/10 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-12 text-center space-y-10 border border-white/20 relative overflow-hidden">
          
          <div className="space-y-6 relative z-10">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full"></div>
                <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl float relative overflow-hidden border-8 border-white/20">
                  <i className="fas fa-globe-americas text-7xl globe-rotate opacity-95"></i>
                </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">FlagQuest</h1>
              <p className="text-blue-100 font-medium text-lg max-w-sm mx-auto opacity-80">Master the world's banners in this high-stakes global challenge.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-lg flex flex-col items-center group hover:bg-white/20 transition-all cursor-default">
              <i className="fas fa-trophy text-amber-400 text-2xl mb-2 group-hover:scale-110 transition-transform"></i>
              <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Personal Best</span>
              <span className="text-3xl font-black text-white tracking-tighter">{gameState.highScore}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-lg flex flex-col items-center group hover:bg-white/20 transition-all cursor-default">
              <i className="fas fa-flag text-blue-400 text-2xl mb-2 group-hover:scale-110 transition-transform"></i>
              <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Regions</span>
              <span className="text-3xl font-black text-white tracking-tighter">Global</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-6 px-8 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.6)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-4 text-2xl tracking-tight"
            >
              <span>LAUNCH MISSION</span>
              <i className="fas fa-plane-departure text-xl"></i>
            </button>
            <p className="text-[10px] text-blue-300/60 font-black uppercase tracking-[0.3em]">Timed Session • 5 Lives • Global Knowledge</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center relative">
      <Header 
        score={gameState.score} 
        lives={gameState.lives} 
        timeLeft={gameState.timeLeft} 
      />

      {gameState.isPaused && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xl z-40 flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-white/10 backdrop-blur-3xl p-12 rounded-[3.5rem] shadow-2xl text-center space-y-8 border border-white/20 transform scale-110">
            <div className="w-24 h-24 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto border-4 border-orange-400/20">
              <i className="fas fa-pause text-5xl"></i>
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">Mission Halted</h2>
              <p className="text-blue-100/70 font-medium">Take a moment. The world awaits your return.</p>
            </div>
            <button
              onClick={togglePause}
              className="w-full bg-white text-blue-900 font-black py-5 px-10 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-3 active:scale-95 text-xl hover:bg-blue-50"
            >
              <i className="fas fa-play"></i>
              <span>RESUME TRACKING</span>
            </button>
          </div>
        </div>
      )}

      {gameState.currentCountry && (
        <div className={`w-full max-w-4xl flex flex-col items-center transition-all duration-700 ${gameState.isPaused ? 'opacity-20 blur-md scale-95' : 'opacity-100'}`}>
          
          {gameState.lastGuessCorrect === null && (
            <div className="w-full max-w-2xl mb-8 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 opacity-80">Response Window</span>
                <span className={`text-xl font-black tabular-nums ${gameState.questionTimeLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                   0:0{gameState.questionTimeLeft}
                </span>
              </div>
              <div className="h-4 bg-white/10 backdrop-blur-md rounded-full overflow-hidden shadow-inner border border-white/10">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] ${
                    gameState.questionTimeLeft <= 2 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(gameState.questionTimeLeft / QUESTION_TIME) * 100}%` }}
                />
              </div>
            </div>
          )}

          <FlagDisplay 
            country={gameState.currentCountry} 
            isWrong={gameState.lastGuessCorrect === false} 
          />

          {gameState.status === GameStatus.PLAYING && gameState.lastGuessCorrect === null && (
             <button
                onClick={togglePause}
                className="mb-8 flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full shadow-lg text-blue-200 hover:text-white hover:border-white/30 hover:bg-white/20 transition-all active:scale-95 group"
             >
                <i className="fas fa-pause text-sm group-hover:scale-110 transition-transform"></i>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Freeze Progress</span>
             </button>
          )}

          {gameState.lastGuessCorrect !== true ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
              {gameState.options.map((option) => (
                <button
                  key={option.code}
                  disabled={gameState.lastGuessCorrect !== null || gameState.isPaused}
                  onClick={() => handleGuess(option)}
                  className={`
                    group p-6 rounded-[2rem] border-2 transition-all duration-300 text-xl font-black
                    flex items-center justify-between shadow-xl
                    ${gameState.lastGuessCorrect === null 
                      ? 'bg-white/10 backdrop-blur-md border-transparent text-white hover:border-blue-400 hover:bg-white/20 hover:translate-x-1 active:scale-95' 
                      : 'bg-white/5 border-white/5 text-white/20'
                    }
                  `}
                >
                  <span className="truncate tracking-tight">{option.name}</span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white/10 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all`}>
                    <i className="fas fa-crosshairs text-sm"></i>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-2xl px-4 animate-in fade-in zoom-in-95 duration-500">
               <div className="bg-white/10 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-2xl border-t-[12px] border-green-500 space-y-8 relative overflow-hidden border border-white/20">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none text-white">
                    <i className="fas fa-globe text-[12rem] globe-rotate"></i>
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <h3 className="text-4xl font-black text-green-400 flex items-center tracking-tighter uppercase italic drop-shadow">
                        Verified
                      </h3>
                      <p className="text-blue-100/50 text-xs font-bold uppercase tracking-widest">Target Confirmed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white tracking-tighter">{gameState.currentCountry.name}</p>
                      <span className="bg-white/10 text-[10px] px-2 py-1 rounded-md font-black uppercase text-blue-200 tracking-tighter border border-white/10">Signal Code: {gameState.currentCountry.code}</span>
                    </div>
                  </div>

                  <div className="bg-blue-600/20 p-6 rounded-3xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <i className="fas fa-bolt text-6xl text-blue-400"></i>
                    </div>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Dossier Snippet</p>
                    {isLoadingFact ? (
                      <div className="h-6 w-3/4 bg-blue-400/20 animate-pulse rounded-full"></div>
                    ) : (
                      <p className="text-white font-bold italic leading-relaxed text-lg tracking-tight">"{gameState.countryFact}"</p>
                    )}
                  </div>

                  {gameState.detailedInfo && (
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 animate-in slide-in-from-top-2 duration-300 backdrop-blur-md">
                      <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Extended Archive</p>
                      <p className="text-blue-50 leading-relaxed font-medium opacity-90">{gameState.detailedInfo}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {!gameState.detailedInfo && (
                      <button
                        onClick={handleLearnMore}
                        disabled={isLoadingDetailed || gameState.isPaused}
                        className="flex-1 bg-white/10 hover:bg-white/20 border-2 border-amber-400/40 text-amber-400 font-black py-5 px-6 rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-lg active:scale-95 disabled:opacity-50"
                      >
                        {isLoadingDetailed ? (
                           <i className="fas fa-circle-notch fa-spin"></i>
                        ) : (
                          <i className="fas fa-microchip"></i>
                        )}
                        <span>{isLoadingDetailed ? 'FETCHING...' : 'DEEP DIVE'}</span>
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={gameState.isPaused}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-5 px-6 rounded-2xl shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] transition-all transform active:scale-95 flex items-center justify-center space-x-3"
                    >
                      <span>NEXT COORD</span>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {gameState.status === GameStatus.GAME_OVER && (
        <GameOver 
          score={gameState.score} 
          totalFlags={gameState.totalFlags}
          highScore={gameState.highScore}
          isNewRecord={gameState.isNewRecord}
          onRestart={startGame} 
        />
      )}
    </div>
  );
};

export default App;
