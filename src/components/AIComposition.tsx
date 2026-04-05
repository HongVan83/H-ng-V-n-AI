import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Send, Download, Loader2, Sparkles } from 'lucide-react';
import { composeMusic, audioEngine } from '../lib/audioEngine';

export default function AIComposition() {
  const [lyrics, setLyrics] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCompose = async () => {
    if (!lyrics.trim()) return;
    setIsComposing(true);
    setResult(null);
    
    const composition = await composeMusic(lyrics);
    setResult(composition);
    setIsComposing(false);

    if (composition) {
      playComposition(composition);
    }
  };

  const playComposition = (comp: any) => {
    const sequence = comp.notes.map((n: string, i: number) => ({
      freq: audioEngine.getNoteFrequency(n),
      duration: comp.durations[i] || 0.5
    }));
    audioEngine.playSequence(sequence);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-xl border-4 border-green-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-600 mb-2">AI Sáng Tác Nhạc</h2>
        <p className="text-gray-600">Nhập lời bài hát và để AI tạo ra giai điệu cho bạn!</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Ví dụ: Em yêu trường em, với bao bạn thân..."
            className="w-full h-32 p-4 rounded-2xl border-2 border-green-100 focus:border-green-400 focus:ring-0 transition-all text-lg resize-none"
          />
          <button
            onClick={handleCompose}
            disabled={isComposing || !lyrics.trim()}
            className="absolute bottom-4 right-4 bg-green-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-green-600 disabled:opacity-50 transition-all shadow-md"
          >
            {isComposing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Tạo nhạc
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 p-6 rounded-2xl border-2 border-green-200"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-green-800 mb-1">{result.title}</h3>
                <p className="text-green-600 italic">Sáng tác bởi Cô Hồng Vân AI</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => playComposition(result)}
                  className="p-3 bg-white border-2 border-green-400 text-green-600 rounded-full hover:bg-green-100 transition-all"
                >
                  <Music className="w-6 h-6" />
                </button>
                <button
                  className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all"
                  onClick={() => alert('Tính năng tải xuống đang được phát triển!')}
                >
                  <Download className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-green-700 mb-2 uppercase text-sm tracking-widest">Lời bài hát:</h4>
                <p className="text-lg text-gray-700 leading-relaxed">{lyrics}</p>
              </div>
              <div>
                <h4 className="font-bold text-green-700 mb-2 uppercase text-sm tracking-widest">Giai điệu (Nốt nhạc):</h4>
                <div className="bg-white p-4 rounded-xl border border-green-100 font-mono text-xl text-green-800 break-words">
                  {result.vietnameseNotes}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !isComposing && (
        <div className="text-center py-12 text-gray-400">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Giai điệu của bạn sẽ xuất hiện tại đây</p>
        </div>
      )}
    </div>
  );
}
