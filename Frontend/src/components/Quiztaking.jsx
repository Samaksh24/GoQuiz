
import React, { useContext, useState } from 'react';
import ProgressBar from './Progressbar';
import OptionButton from './OptionButton';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const renderQuestionText = (text) => {
  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const codeContent = part
        .replace(/^```[a-zA-Z0-9+#.-]*\s*\n?/, '')
        .replace(/\n?```$/, '');

      return (
        <pre
          key={index}
          className="my-4 p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-sm leading-relaxed font-mono whitespace-pre"
        >
          <code>{codeContent}</code>
        </pre>
      );
    }

    return part.trim() ? (
      <span key={index} className="whitespace-pre-wrap">
        {part}
      </span>
    ) : null;
  });
};

export default function QuizTakingPage({ onFinishQuiz }) {
  const questions = JSON.parse(
    sessionStorage.getItem('quizQuestions')
  ) || [];

  const quizConfig = JSON.parse(sessionStorage.getItem('quizConfig'));
  const { user } = useContext(UserContext);
  const isDemo = user === null;

  const [currentIndex, setCurrentIndex] = useState(
    Number(sessionStorage.getItem('currentIndex')) || 0
  );
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const [answeredCount, setAnsweredCount] = useState(0);

  const currentQuestion = questions[currentIndex] || {};
  const isLastQuestion = currentIndex === questions.length - 1;
  const navigate = useNavigate();

  const handleSelectOption = (index) => {
    if (isAnswerSubmitted) return;

    setSelectedOption(index);
    setIsAnswerSubmitted(true);
    setIsExplanationOpen(true);
    setAnsweredCount((prev) => prev + 1);
  };

  const handleNextQuestion = async () => {
    const answerRecord = {
      questionId: currentQuestion._id,
      question: currentQuestion.questionText,
      options: currentQuestion.options,
      selectedIndex: selectedOption,
      userAnswer: currentQuestion.options[selectedOption],
      correctIndex: currentQuestion.correctIndex,
      correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
      explanation: currentQuestion.explanation,
      isCorrect: selectedOption === currentQuestion.correctIndex,
    };

    const updatedAnswers = [...recordedAnswers, answerRecord];
    setRecordedAnswers(updatedAnswers);

    if (isLastQuestion) {
      const payLoad = {
        subject: quizConfig.subject,
        topic: quizConfig.topic,
        difficulty: quizConfig.difficulty,
        answers: updatedAnswers,
        startedAt: quizConfig.startedAt
      };

      try {
        let response;

        if (isDemo) {
          response = await axios.post(
            `${import.meta.env.VITE_API_URL}/quiz/submitDemo`,
            payLoad
          );
        } else {
          response = await axios.post(
            `${import.meta.env.VITE_API_URL}/quiz/submit`,
            payLoad,
            { withCredentials: true }
          );
        }

        console.log(response.data);
        sessionStorage.setItem('quizResult', JSON.stringify(response.data));
        sessionStorage.setItem('userAnswers', JSON.stringify(updatedAnswers));

        navigate('/quiz/result', { replace: true });
      } catch (error) {
        console.log(error.response.data);
      }
    } else {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        sessionStorage.setItem('currentIndex', nextIndex);
        return nextIndex;
      });

      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsExplanationOpen(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
        <ProgressBar current={answeredCount} total={questions.length} />
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Question {currentIndex + 1}
          </span>

          <div className="text-lg sm:text-xl font-semibold text-slate-900 mt-3 leading-snug">
            {renderQuestionText(currentQuestion.questionText)}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {currentQuestion.options?.map((optionText, idx) => (
            <OptionButton
              key={idx}
              index={idx}
              text={optionText}
              isSelected={selectedOption === idx}
              isCorrect={idx === currentQuestion.correctIndex}
              isAnswerSubmitted={isAnswerSubmitted}
              onClick={handleSelectOption}
              disabled={isAnswerSubmitted}
            />
          ))}
        </div>

        {isAnswerSubmitted && (
          <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60 transition-all">
            <button
              type="button"
              onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              className="w-full px-4 py-3 text-left flex justify-between items-center text-xs font-semibold text-slate-700 hover:bg-slate-100/60 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Explanation
              </span>

              <span className="text-slate-400 text-xs">
                {isExplanationOpen ? 'Collapse ▲' : 'Expand ▼'}
              </span>
            </button>

            {isExplanationOpen && (
              <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/70 bg-white">
                {currentQuestion.explanation}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={!isAnswerSubmitted}
            className={`py-2.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-xs ${
              isAnswerSubmitted
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <span>{isLastQuestion ? 'Finish Quiz' : 'Next Question'}</span>

            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
