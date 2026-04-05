import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Ear, Drum, Mic, PenTool, Home, ChevronLeft } from 'lucide-react';
import EarTraining from './components/EarTraining';
import RhythmGame from './components/RhythmGame';
import AIComposition from './components/AIComposition';
import SingingPractice from './components/SingingPractice';

type View = 'home' | 'ear' | 'rhythm' | 'compose' | 'sing';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const savedScore = localStorage.getItem('music_app_score');
    if (savedScore) setScore(parseInt(savedScore));
  }, []);

  const updateScore = (points: number) => {
    const newScore = score + points;
    setScore(newScore);
    localStorage.setItem('music_app_score', newScore.toString());
  };

  const renderView = () => {
    switch (view) {
      case 'ear': return <EarTraining onScore={updateScore} />;
      case 'rhythm': return <RhythmGame onScore={updateScore} />;
      case 'compose': return <AIComposition />;
      case 'sing': return <SingingPractice />;
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 max-w-4xl mx-auto">
          <MenuButton 
            icon={<Ear className="w-12 h-12 text-blue-500" />}
            title="Luyện tai nghe"
            description="Phân biệt các nốt nhạc Đô, Rê, Mi..."
            color="bg-blue-50 hover:bg-blue-100 border-blue-200"
            onClick={() => setView('ear')}
          />
          <MenuButton 
            icon={<Drum className="w-12 h-12 text-orange-500" />}
            title="Trò chơi tiết tấu"
            description="Gõ theo nhịp điệu ta - ta - ti ti"
            color="bg-orange-50 hover:bg-orange-100 border-orange-200"
            onClick={() => setView('rhythm')}
          />
          <MenuButton 
            icon={<PenTool className="w-12 h-12 text-green-500" />}
            title="AI Sáng tác nhạc"
            description="Tạo giai điệu từ lời bài hát của bạn"
            color="bg-green-50 hover:bg-green-100 border-green-200"
            onClick={() => setView('compose')}
          />
          <MenuButton 
            icon={<Mic className="w-12 h-12 text-purple-500" />}
            title="Luyện hát với AI"
            description="Ghi âm và nhận xét giọng hát"
            color="bg-purple-50 hover:bg-purple-100 border-purple-200"
            onClick={() => setView('sing')}
          />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 font-sans text-gray-800 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {view !== 'home' && (
            <button 
              onClick={() => setView('home')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-orange-500" />
            <h1 className="text-xl md:text-2xl font-bold text-blue-600">
              Cô Hồng Vân AI - Nhạc sĩ tí hon
            </h1>
          </div>
        </div>
        <div className="bg-orange-100 px-4 py-1 rounded-full border border-orange-200">
          <span className="font-bold text-orange-700">⭐ {score} điểm</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-yellow-400 to-orange-400" />
    </div>
  );
}

function MenuButton({ icon, title, description, color, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col items-center text-center p-8 rounded-3xl border-4 transition-all shadow-lg ${color}`}
    >
      <div className="mb-4 p-4 bg-white rounded-2xl shadow-sm">
        {icon}
      </div>
      <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </motion.button>
  );
}
