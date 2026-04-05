import { GoogleGenAI, Type } from "@google/genai";

// Audio Engine for synthesis
class AudioEngine {
  private ctx: AudioContext | null = null;

  private getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  playNote(frequency: number, duration: number = 0.5, type: OscillatorType = 'sine') {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  async playSequence(notes: { freq: number, duration: number }[]) {
    const ctx = this.getCtx();
    let time = ctx.currentTime;
    
    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(note.freq, time);
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + note.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + note.duration);
      time += note.duration;
    });
  }

  getNoteFrequency(note: string): number {
    const notes: Record<string, number> = {
      'Đô': 261.63,
      'Rê': 293.66,
      'Mi': 329.63,
      'Fa': 349.23,
      'Sol': 392.00,
      'La': 440.00,
      'Si': 493.88,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
    };
    return notes[note] || 440;
  }
}

export const audioEngine = new AudioEngine();

// AI Service
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function composeMusic(lyrics: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `Bạn là một nhạc sĩ chuyên sáng tác cho thiếu nhi. Hãy sáng tác một giai điệu ngắn (8-16 nốt) cho lời bài hát sau: "${lyrics}".
  Trả về kết quả dưới dạng JSON với cấu trúc:
  {
    "title": "Tên bài hát",
    "notes": ["C4", "E4", "G4", ...],
    "durations": [0.5, 0.5, 1.0, ...],
    "vietnameseNotes": "Đô - Mi - Sol..."
  }
  Chỉ sử dụng các nốt trong quãng C4 đến B5. Giai điệu nên vui tươi, trong sáng.`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            notes: { type: Type.ARRAY, items: { type: Type.STRING } },
            durations: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            vietnameseNotes: { type: Type.STRING }
          },
          required: ["title", "notes", "durations", "vietnameseNotes"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Composition error:", error);
    return null;
  }
}

export async function analyzeSinging(feedbackData: any) {
    // Mock analysis for now as we don't have real-time audio processing in this turn
    // In a real app, we'd send pitch data or a summary to Gemini
    const model = "gemini-3-flash-preview";
    const prompt = `Học sinh vừa thực hiện bài luyện hát. Dựa trên dữ liệu sau: ${JSON.stringify(feedbackData)}, hãy đưa ra lời nhận xét ngắn gọn, khích lệ và thân thiện (tiếng Việt).`;
    
    try {
        const response = await genAI.models.generateContent({
            model,
            contents: prompt
        });
        return response.text;
    } catch (error) {
        return "Bạn hát rất hay! Hãy tiếp tục luyện tập nhé.";
    }
}
