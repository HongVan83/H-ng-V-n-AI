import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Drum, Info } from 'lucide-react';
import { audioEngine } from '../lib/audioEngine';
import confetti from 'canvas-confetti';

const RHYTHMS = [
  { name: 'Cơ bản', pattern: 'ta - ta - ta - ta', values: [1, 1, 1, 1] },
  { name: 'Vui vẻ', pattern: 'ta - ta - ti ti - ta', values: [1, 1, 0.5, 0.5, 1] },
  { name: 'Nhanh nhẹn', pattern: 'ti ti - ti ti - ta - ta', values: [0.5, 0.5, 0.5, 0.5, 1, 1] },
  { name: 'Hành khúc', pattern: 'ta - ti ti - ta - ti ti', values: [1, 0.5, 0.5, 1, 0.5, 0.5] },
];

export default function RhythmGame({ onScore }: { onScore: (p: number) => void }) {
  const [currentRhythm, setCurrentRhythm] = useState(RHYTHMS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const startTimeRef = useRef<number>(0);

  const playSample = async () => {
    setIsPlaying(true);
    const tempo = 600; // ms per beat
    for (const val of currentRhythm.values) {
      audioEngine.playNote(200, 0.1, 'square'); // Low drum sound
      await new Promise(r => setTimeout(r, val * tempo));
    }
    setIsPlaying(false);
  };

  const startRecording = () => {
    setIsRecording(true);
    setUserTaps([]);
    setScore(null);
    setFeedback('Bắt đầu gõ nào!');
    startTimeRef.current = Date.now();
  };

  const handleTap = () => {
    if (!isRecording) return;
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 600; // in beats
    setUserTaps(prev => [...prev, elapsed]);
    audioEngine.playNote(300, 0.05, 'sine');
  };

  const finishRecording = useCallback(() => {
    setIsRecording(false);
    
    // Simple scoring logic
    const targetBeats: number[] = [];
    let current = 0;
    currentRhythm.values.forEach(v => {
      targetBeats.push(current);
      current += v;
    });

    if (userTaps.length === 0) {
      setScore(0);
      setFeedback('Bạn chưa gõ gì cả!');
      return;
    }

    let totalDiff = 0;
    const maxDiff = 0.5; // max allowed diff per note in beats

    // Compare each tap to the closest target beat
    userTaps.forEach(tap => {
      const diffs = targetBeats.map(tb => Math.abs(tap - tb));
      totalDiff += Math.min(...diffs);
    });

    // Penalize for missing or extra taps
    const countDiff = Math.abs(userTaps.length - targetBeats.length);
    totalDiff += countDiff * 0.5;

    const finalScore = Math.max(0, Math.round(100 - (totalDiff * 20)));
    setScore(finalScore);

    if (finalScore >= 80) {
      setFeedback('Tuyệt vời! Nhịp điệu rất chuẩn! 🌟');
      onScore(finalScore);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    } else if (finalScore >= 50) {
      setFeedback('Khá tốt, nhưng cần đều tay hơn một chút nhé! 👍');
      onScore(Math.floor(finalScore / 2));
    } else {
      setFeedback('Cố gắng lên, hãy nghe kỹ mẫu và thử lại nhé! 💪');
    }
  }, [currentRhythm, userTaps, onScore]);

  useEffect(() => {
    if (isRecording) {
      const timer = setTimeout(finishRecording, currentRhythm.values.reduce((a, b) => a + b, 0) * 600 + 1000);
      return () => clearTimeout(timer);
    }
  }, [isRecording, currentRhythm, finishRecording]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border-4 border-orange-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-orange-600 mb-2">Trò Chơi Tiết Tấu</h2>
        <p className="text-gray-600">Gõ theo mẫu tiết tấu bằng phím Cách (Space) hoặc nhấn nút Trống!</p>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Chọn mẫu:</label>
        <div className="flex flex-wrap gap-2">
          {RHYTHMS.map(r => (
            <button
              key={r.name}
              onClick={() => { setCurrentRhythm(r); setScore(null); setFeedback(''); }}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${currentRhythm.name === r.name ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-orange-50 p-8 rounded-2xl border-2 border-dashed border-orange-300 mb-8 text-center">
        <p className="text-4xl font-mono font-bold text-orange-700 tracking-widest mb-4">
          {currentRhythm.pattern}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={playSample}
            disabled={isPlaying || isRecording}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-400 text-orange-600 rounded-full font-bold hover:bg-orange-100 disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            Nghe mẫu
          </button>
          <button
            onClick={startRecording}
            disabled={isPlaying || isRecording}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 disabled:opacity-50 shadow-md"
          >
            <Drum className="w-5 h-5" />
            Bắt đầu gõ
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <motion.button
          animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          onMouseDown={handleTap}
          className={`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl border-8 transition-all ${isRecording ? 'bg-orange-500 border-orange-300 cursor-pointer' : 'bg-gray-200 border-gray-300 cursor-not-allowed'}`}
        >
          <Drum className={`w-20 h-20 ${isRecording ? 'text-white' : 'text-gray-400'}`} />
        </motion.button>
        
        {isRecording && (
          <div className="flex gap-2">
            {userTaps.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 bg-orange-500 rounded-full"
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {score !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-5xl font-black text-orange-600 mb-2">{score} điểm</div>
              <p className="text-xl font-bold text-gray-700">{feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl flex gap-3 items-start">
        <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          <strong>Mẹo:</strong> "ta" là nốt đen (1 phách), "ti ti" là hai nốt móc đơn (mỗi nốt nửa phách). Hãy gõ thật đều tay nhé!
        </p>
      </div>
    </div>
  );
}
