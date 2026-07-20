import { MOCK_QUESTIONS } from '../data/mockQuestions.js';
import { isCorrectAnswer } from '../utils/normalizer.js';

/**
 * Fisher-Yates 셔플 알고리즘
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 10문제 1세트 문제 구성 생성기
 * - 1~9번: 1점 문제중 9개 랜덤 선택
 * - 10번: 2점 골든벨 문제중 1개 랜덤 선택
 * - 한 세트 내 동일 문제 중복 100% 방지
 */
export function generateQuizSet(category = "all") {
  // 카테고리 필터링
  let pool1 = MOCK_QUESTIONS.filter(q => q.score === 1);
  let pool2 = MOCK_QUESTIONS.filter(q => q.score === 2);

  if (category !== "all") {
    const catPool1 = pool1.filter(q => q.category === category);
    if (catPool1.length >= 9) {
      pool1 = catPool1;
    }
  }

  // 1점 문제 9개 무작위 추출
  const shuffled1 = shuffleArray(pool1);
  const selected9 = shuffled1.slice(0, 9);

  // 2점 문제 1개 무작위 추출
  const shuffled2 = shuffleArray(pool2);
  const selected10 = shuffled2[0];

  return [...selected9, selected10];
}

/**
 * 답안 제출 채점
 */
export function evaluateAnswer(question, userInput) {
  const correct = isCorrectAnswer(userInput, question.answers);
  const earnedScore = correct ? question.score : 0;
  return {
    isCorrect: correct,
    score: earnedScore,
    correctAnswerText: question.answers[0]
  };
}
