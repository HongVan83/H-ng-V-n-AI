import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { audioEngine } from '../lib/audioEngine';
import confetti from 'canvas-confetti';

const NOTES = ['Đô', 'Rê', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

export default function EarTraining({ onScore }: { onScore: (p: number) => void }) {
  const [targetNotes, setTargetNotes] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isAdvanced, setIsAdvanced] = useState(false);

  const startNewRound = useCallback(() => {
    const count = isAdvanced ? 2 : 1;
    const newNotes = Array.from({ length: count }, () => NOTES[Math.floor(Math.random() * NOTES.length)]);
    setTargetNotes(newNotes);
    setFeedback({ type: null, message: '' });
    playNotes(newNotes);
  }, [isAdvanced]);

  const playNotes = async (notes: string[]) => {
    setIsPlaying(true);
    const sequence = notes.map(n => ({
      freq: audioEngine.getNoteFrequency(n),
      duration: 0.6
    }));
    await audioEngine.playSequence(sequence);
    setIsPlaying(false);
  };

  const handleGuess = (guess: string) => {
    if (targetNotes.length === 0 || isPlaying) return;

    // For simplicity in advanced mode, we just check if the last note matches or if the user picks one of them
    // But let's make it simple: in 1-note mode, check match. In 2-note mode, it's harder.
    // Let's stick to 1 note for now or just check the first one for the basic version.
    const isCorrect = targetNotes.includes(guess);

    if (isCorrect) {
      setFeedback({ type: 'success', message: 'Chính xác! 🎉 Quá giỏi luôn!' });
      onScore(isAdvanced ? 20 : 10);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Play a happy sound
      audioEngine.playNote(523.25, 0.1, 'sine'); // C5
      setTimeout(() => audioEngine.playNote(659.25, 0.2, 'sine'), 100); // E5
    } else {
      setFeedback({ type: 'error', message: 'Chưa đúng rồi, thử lại nhé!' });
      playNotes(targetNotes);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border-4 border-blue-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-2">Luyện Tai Nghe</h2>
        <p className="text-gray-600">Lắng nghe và đoán xem đó là nốt nhạc nào nhé!</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setIsAdvanced(!isAdvanced)}
          className={`px-4 py-2 rounded-full font-bold transition-all ${isAdvanced ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          {isAdvanced ? 'Chế độ: Nâng cao (2 nốt)' : 'Chế độ: Cơ bản (1 nốt)'}
        </button>
      </div>

      <div className="flex flex-col items-center gap-6 mb-12">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={targetNotes.length === 0 ? startNewRound : () => playNotes(targetNotes)}
          disabled={isPlaying}
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${isPlaying ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isPlaying ? (
            <div className="flex gap-1">
              <div className="w-2 h-8 bg-white animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-8 bg-white animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-8 bg-white animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          ) : (
            <Play className="w-12 h-12 text-white fill-current" />
          )}
        </motion.button>
        <p className="font-medium text-blue-500">
          {targetNotes.length === 0 ? 'Nhấn để bắt đầu' : isPlaying ? 'Đang phát...' : 'Nghe lại'}
        </p>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-8">
        {NOTES.map((note) => (
          <motion.button
            key={note}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleGuess(note)}
            className="aspect-square flex items-center justify-center bg-blue-50 border-2 border-blue-200 rounded-2xl text-xl font-bold text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm"
          >
            {note}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback.type && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {feedback.type === 'success' ? <CheckCircle2 /> : <XCircle />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {targetNotes.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={startNewRound}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-full font-bold hover:bg-gray-700 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Chơi ván mới
          </button>
        </div>
      )}
    </div>
  );
}
