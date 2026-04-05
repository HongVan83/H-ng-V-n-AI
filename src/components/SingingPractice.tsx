import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Play, RotateCcw, MessageCircle, AlertCircle } from 'lucide-react';
import { analyzeSinging } from '../lib/audioEngine';

export default function SingingPractice() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        handleAnalyze();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      visualize(stream);
    } catch (err) {
      setError('Không thể truy cập micro. Hãy kiểm tra quyền trình duyệt nhé!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const visualize = (stream: MediaStream) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(168, 85, 247)`; // Purple-500
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // In a real app, we'd process the audio. Here we simulate analysis.
    const mockData = {
      duration: audioChunksRef.current.length * 0.1, // very rough
      timestamp: new Date().toISOString()
    };
    const feedback = await analyzeSinging(mockData);
    setAnalysis(feedback);
    setIsAnalyzing(false);
  };

  const reset = () => {
    setAudioUrl(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border-4 border-purple-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">Luyện Hát Với AI</h2>
        <p className="text-gray-600">Hãy hát một đoạn nhạc yêu thích và nhận xét từ Cô Hồng Vân nhé!</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-8 mb-12">
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            className="w-full h-32 bg-gray-50 rounded-2xl border-2 border-purple-100"
            width={400}
            height={128}
          />
          {!isRecording && !audioUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">
              Sẵn sàng ghi âm...
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {!isRecording ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-700 transition-all"
            >
              <Mic className="w-6 h-6" />
              Bắt đầu hát
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="flex items-center gap-2 px-8 py-4 bg-red-500 text-white rounded-full font-bold text-lg shadow-lg hover:bg-red-600 transition-all"
            >
              <Square className="w-6 h-6" />
              Dừng ghi âm
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-200">
              <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Play className="w-5 h-5" /> Nghe lại giọng hát:
              </h3>
              <audio src={audioUrl} controls className="w-full" />
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-purple-100 shadow-sm relative">
              <div className="absolute -top-4 left-6 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Nhận xét từ AI
              </div>
              
              {isAnalyzing ? (
                <div className="flex items-center gap-3 text-purple-600 py-4">
                  <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="font-bold">Cô Hồng Vân đang lắng nghe...</p>
                </div>
              ) : (
                <div className="text-lg text-gray-700 leading-relaxed py-2">
                  {analysis}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 text-gray-500 font-bold hover:text-purple-600 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Hát lại bài khác
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
