import { useState, useEffect } from "react";

export default function VocabTrainer() {
  const [wordList, setWordList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);

  useEffect(() => {
    fetch('/words_full_570.json')
      .then((res) => res.json())
      .then((data) => setWordList(data));
  }, []);

  const current = wordList[currentIndex];
  const isCorrect = selected === current?.answer;

  const handleSelect = (option) => {
    setSelected(option);
  };

  useEffect(() => {
    if (selected !== null && current) {
      const timeout = setTimeout(() => {
        const updatedWords = [...wordList];
        const updated = { ...current };

        if (isCorrect) {
          updated.correctCount = (updated.correctCount || 0) + 1;
        }

        updatedWords.splice(currentIndex, 1, updated);

        const filtered = showOnlyUnlearned
          ? updatedWords.filter(w => (w.correctCount || 0) < 3)
          : updatedWords;

        const nextIndex = (currentIndex + 1) % filtered.length;

        setWordList(updatedWords);
        setCurrentIndex(nextIndex);
        setSelected(null);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [selected]);

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-white bg-black">
        🎉 Все слова выучены!
      </div>
    );
  }

  const displayQuestion = current.direction === "ru-en" ? current.ru : current.en;
  const showTranscription = current.transcription;
  const displayOptions = current.options;
  const learnedCount = wordList.filter(w => (w.correctCount || 0) >= 3).length;
  const progress = Math.round((learnedCount / wordList.length) * 100);

  return (
    <div className="min-h-screen w-full max-w-sm mx-auto px-4 py-6 flex flex-col items-center justify-start space-y-6 text-center bg-black text-white">
      <h2 className="text-xl font-bold">Урок {currentIndex + 1}</h2>
      <div className="text-3xl font-extrabold">{displayQuestion}</div>
      {showTranscription && <div className="text-md text-gray-400">{showTranscription}</div>}

      <div className="grid grid-cols-2 grid-rows-3 gap-4 w-full mt-4">
        {displayOptions.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(opt)}
            className={`h-20 flex items-center justify-center py-2 px-2 rounded-xl border text-base font-medium transition duration-300
              ${selected === opt ? (isCorrect ? 'bg-green-600' : 'bg-red-600') : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="mt-8 text-sm w-full text-left">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showOnlyUnlearned}
            onChange={() => setShowOnlyUnlearned(!showOnlyUnlearned)}
            className="mr-2"
          />
          Показывать только невыученные
        </label>
        <div className="mt-2">✅ Прогресс: {learnedCount} / {wordList.length} — <strong>{progress}%</strong></div>
      </div>
    </div>
  );
}