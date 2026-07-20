/**
 * Smart Normalizer v2 (주관식 정밀 정규화 채점 엔진)
 * - 띄어쓰기, 대소문자 무시
 * - 특수문자 제거
 * - 숫자 및 대표 단위(km, 개, 점, 명, %, 등) 유연 수용
 */

export function normalizeText(str) {
  if (str === null || str === undefined) return "";
  
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "") // 모든 띄어쓰기 제거
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "") // 주요 특수문자 제거
    .replace(/킬로미터/g, "km")
    .replace(/미터/g, "m")
    .replace(/개/g, "")
    .replace(/점/g, "");
}

/**
 * 정답 여부 정밀 판정 함수
 * @param {string} userInput - 플레이어가 입력한 답안
 * @param {string[]} validAnswers - 정답으로 인정되는 답안 배열
 * @returns {boolean} 정답 여부
 */
export function isCorrectAnswer(userInput, validAnswers) {
  if (!userInput || !validAnswers || !Array.isArray(validAnswers)) {
    return false;
  }

  const cleanInput = normalizeText(userInput);
  if (!cleanInput) return false;

  return validAnswers.some(ans => {
    const cleanTarget = normalizeText(ans);
    if (cleanTarget === cleanInput) return true;

    // 숫자 완전 일치 여부 체크 (예: 42.195 vs 42.195km)
    const numInput = cleanInput.replace(/[^0-9.]/g, "");
    const numTarget = cleanTarget.replace(/[^0-9.]/g, "");
    if (numInput && numTarget && numInput === numTarget) {
      return true;
    }

    return false;
  });
}
