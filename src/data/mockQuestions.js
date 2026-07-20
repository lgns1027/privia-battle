/**
 * 상식퀴즈대전 - 정밀 검증 퀴즈 데이터베이스
 * - 수량 채우기용 허위/유치한 퀴즈(예: 농구 3점슛 점수 등) 100% 전면 배제
 * - 실제 도전 골든벨 및 대중적으로 지적 자극을 주는 검증된 상식 퀴즈
 * - 1점 일반 대중 상식 / 2점 골든벨 역전 상식 문제
 */

export const MOCK_QUESTIONS = [
  // ==========================================
  // [1점] 일반 대중 상식 퀴즈 (Q1~Q9용)
  // ==========================================
  {
    id: "q_001",
    score: 1,
    category: "history",
    question: "조선시대 제4대 국왕이자, 훈민정음을 창제한 인물은 누구일까요?",
    answers: ["세종대왕", "세종", "세종 대왕"],
    hint: "만원권 지폐의 인물입니다."
  },
  {
    id: "q_002",
    score: 1,
    category: "science",
    question: "원소 기호 'Au'에 해당하는 귀금속의 명칭은 무엇일까요?",
    answers: ["금", "gold", "Gold"],
    hint: "순도 24k로 나타내기도 합니다."
  },
  {
    id: "q_003",
    score: 1,
    category: "geography",
    question: "세계에서 면적이 가장 넓은 국가의 이름은 무엇일까요?",
    answers: ["러시아", "russia", "Russia"],
    hint: "유라시아 대륙 북쪽에 위치해 있습니다."
  },
  {
    id: "q_004",
    score: 1,
    category: "art",
    question: "세계적 명화 '모나리자'와 '최후의 만찬'을 그린 이탈리아 화가는?",
    answers: ["레오나르도 다빈치", "레오나르도 다 빈치", "다빈치"],
    hint: "르네상스 시대를 대표하는 천재 예술가입니다."
  },
  {
    id: "q_005",
    score: 1,
    category: "science",
    question: "지구 대기 성분 중 가장 높은 비율(약 78%)을 차지하는 기체는?",
    answers: ["질소", "nitrogen"],
    hint: "과자 봉지 충전용으로 많이 쓰입니다."
  },
  {
    id: "q_006",
    score: 1,
    category: "history",
    question: "1592년 한산도 대첩에서 이순신 장군이 학이 날개를 펼친 모양으로 편 진법은?",
    answers: ["학익진", "학익진법"],
    hint: "조선 수군의 대표적인 해전 진법입니다."
  },
  {
    id: "q_007",
    score: 1,
    category: "sports",
    question: "올림픽 상징인 오륜기에서 5개의 고리가 상징하는 것은 무엇일까요?",
    answers: ["5대륙", "오대륙", "대륙"],
    hint: "세계의 대륙들을 의미합니다."
  },
  {
    id: "q_008",
    score: 1,
    category: "culture",
    question: "그리스 신화에서 모든 재앙이 퍼진 후 상자 맨 밑에 남은 유일한 것은?",
    answers: ["희망", "hope"],
    hint: "판도라의 상자에 남은 것입니다."
  },
  {
    id: "q_009",
    score: 1,
    category: "science",
    question: "물질의 세 가지 기본 상태는 기체, 액체, 그리고 무엇일까요?",
    answers: ["고체", "solid"],
    hint: "얼음과 같은 상태입니다."
  },
  {
    id: "q_010",
    score: 1,
    category: "geography",
    question: "아프리카 대륙을 관류하는 세계에서 가장 긴 강의 이름은?",
    answers: ["나일강", "나일 강", "nile"],
    hint: "이집트 문명의 젖줄입니다."
  },
  {
    id: "q_011",
    score: 1,
    category: "economy",
    question: "물가가 지속적으로 상승하여 화폐 가치가 하락하는 경제 현상은?",
    answers: ["인플레이션", "인플레", "inflation"],
    hint: "디플레이션의 반대말입니다."
  },
  {
    id: "q_012",
    score: 1,
    category: "history",
    question: "삼국시대 신라의 청소년 수련 단체로 세속오계를 지킨 조직은?",
    answers: ["화랑도", "화랑"],
    hint: "김유신 장군이 속했던 단체입니다."
  },
  {
    id: "q_013",
    score: 1,
    category: "sports",
    question: "축구에서 한 선수가 한 경기에 3골 이상을 기록하는 것을 무엇이라 하나요?",
    answers: ["해트트릭", "햇트릭", "hat trick"],
    hint: "모자에서 비둘기를 꺼내는 마술에서 유래했습니다."
  },
  {
    id: "q_014",
    score: 1,
    category: "science",
    question: "우리 몸에서 혈액 순환을 담당하며 펌프 역할을 하는 장기는?",
    answers: ["심장", "heart"],
    hint: "가슴 왼쪽에 위치해 있습니다."
  },
  {
    id: "q_015",
    score: 1,
    category: "culture",
    question: "셰익스피어의 비극으로 '사느냐 죽느냐 그것이 문제로다' 명대사가 나오는 작품은?",
    answers: ["햄릿", "Hamlet", "hamlet"],
    hint: "덴마크 왕자가 주인공입니다."
  },
  {
    id: "q_016",
    score: 1,
    category: "history",
    question: "대한민국 임시정부의 수장이자 한인애국단을 조직한 독립운동가는?",
    answers: ["김구", "백범 김구", "김구 선생"],
    hint: "호는 백범입니다."
  },
  {
    id: "q_017",
    score: 1,
    category: "geography",
    question: "남아메리카 대륙에서 가장 면적이 넓은 국가는 어디일까요?",
    answers: ["브라질", "brazil", "Brazil"],
    hint: "삼바와 축구로 유명합니다."
  },
  {
    id: "q_018",
    score: 1,
    category: "science",
    question: "식물이 빛 에너지를 이용하여 이산화탄소와 물로 유기물을 합성하는 과정은?",
    answers: ["광합성", "photosynthesis"],
    hint: "엽록체에서 일어납니다."
  },
  {
    id: "q_019",
    score: 1,
    category: "economy",
    question: "주식 시장에서 상승장을 'Bull'이라 할 때, 하락장을 뜻하는 동물은?",
    answers: ["곰", "bear", "Bear"],
    hint: "웅담을 가진 동물입니다."
  },
  {
    id: "q_020",
    score: 1,
    category: "culture",
    question: "오케스트라에서 악단 전체의 연주를 총괄하고 이끄는 인물은?",
    answers: ["지휘자", "maestro"],
    hint: "지휘봉을 들고 연주를 이끕니다."
  },
  {
    id: "q_021",
    score: 1,
    category: "science",
    question: "컴퓨터에서 핵심 연산을 담당하는 중앙처리장치의 영문 약자는?",
    answers: ["CPU", "cpu"],
    hint: "Central Processing Unit"
  },
  {
    id: "q_022",
    score: 1,
    category: "history",
    question: "프랑스 혁명 당시 단두대에서 처형당한 루이 16세의 왕비 이름은?",
    answers: ["마리 앙투아네트", "마리앙투아네트"],
    hint: "비운의 프랑스 왕비입니다."
  },
  {
    id: "q_023",
    score: 1,
    category: "geography",
    question: "세계에서 인구가 두 번째로 많은 국가의 이름은 무엇일까요?",
    answers: ["중국", "china", "China"],
    hint: "베이징이 수도인 나라입니다."
  },
  {
    id: "q_024",
    score: 1,
    category: "sports",
    question: "테니스 경기에서 점수가 40대 40 동점이 되었을 때의 명칭은?",
    answers: ["듀스", "deuce"],
    hint: "2점 차를 먼저 내야 승리합니다."
  },
  {
    id: "q_025",
    score: 1,
    category: "culture",
    question: "소설 '어린 왕자'를 쓴 프랑스의 작가 겸 비행사는 누구일까요?",
    answers: ["생텍쥐페리", "생텍쥐베리"],
    hint: "야간 비행의 저자이기도 합니다."
  },
  {
    id: "q_026",
    score: 1,
    category: "science",
    question: "물의 화학식은 H2O입니다. 그렇다면 이산화탄소의 화학식은?",
    answers: ["CO2", "co2"],
    hint: "탄소 원자 1개와 산소 원자 2개입니다."
  },
  {
    id: "q_027",
    score: 1,
    category: "history",
    question: "고려시대 강감찬 장군이 거란의 10만 대군을 대파한 전투는?",
    answers: ["귀주대첩", "귀주 대첩"],
    hint: "고려 3대 대첩 중 하나입니다."
  },
  {
    id: "q_028",
    score: 1,
    category: "geography",
    question: "대한민국에서 가장 면적이 넓은 섬의 이름은 무엇일까요?",
    answers: ["제주도", "제주"],
    hint: "한라산이 위치해 있습니다."
  },
  {
    id: "q_029",
    score: 1,
    category: "economy",
    question: "국내총생산을 뜻하는 대표적 경제 지표의 영문 약자 3글자는?",
    answers: ["GDP", "gdp"],
    hint: "Gross Domestic Product"
  },
  {
    id: "q_030",
    score: 1,
    category: "culture",
    question: "유네스코 세계문화유산 제1호인 파르테논 신전이 위치한 국가는?",
    answers: ["그리스", "greece"],
    hint: "아테네가 수도인 나라입니다."
  },
  {
    id: "q_031",
    score: 1,
    category: "science",
    question: "우리 태양계에서 부피와 질량이 가장 큰 행성의 이름은?",
    answers: ["목성", "jupiter"],
    hint: "거대한 대적점이 있는 행성입니다."
  },
  {
    id: "q_032",
    score: 1,
    category: "history",
    question: "조선 후기 실학자로 '목민심서'와 '경세유표'를 저술한 인물은?",
    answers: ["정약용", "다산 정약용"],
    hint: "호는 다산입니다."
  },
  {
    id: "q_033",
    score: 1,
    category: "geography",
    question: "이탈리아의 수도이자 과거 로마 제국의 수도였던 도시 이름은?",
    answers: ["로마", "rome"],
    hint: "콜로세움이 위치한 도시입니다."
  },
  {
    id: "q_034",
    score: 1,
    category: "culture",
    question: "고흐의 대표작으로 소용돌이치는 밤하늘을 그린 명화의 제목은?",
    answers: ["별이 빛나는 밤", "별이빛나는밤"],
    hint: "뉴욕 현대미술관에 전시되어 있습니다."
  },
  {
    id: "q_035",
    score: 1,
    category: "science",
    question: "인체의 뼈 중에서 가장 길이가 길고 강한 다리 부위의 뼈는?",
    answers: ["대퇴골", "넙다리뼈"],
    hint: "허벅지에 위치해 있습니다."
  },
  {
    id: "q_036",
    score: 1,
    category: "history",
    question: "1919년 3월 1일 독립선언서를 발표하고 서명한 대표 33인을 부르는 말은?",
    answers: ["민족대표 33인", "민족대표33인"],
    hint: "태화관에 모여 선언서를 낭독했습니다."
  },
  {
    id: "q_037",
    score: 1,
    category: "economy",
    question: "소비자 물가 지수를 뜻하는 영문 3글자 약자는 무엇일까요?",
    answers: ["CPI", "cpi"],
    hint: "Consumer Price Index"
  },
  {
    id: "q_038",
    score: 1,
    category: "sports",
    question: "마라톤 풀코스의 정식 통산 거리는 몇 km 일까요?",
    answers: ["42.195km", "42.195"],
    hint: "약 42.2 km 입니다."
  },
  {
    id: "q_039",
    score: 1,
    category: "culture",
    question: "피아노 전체 88개 건반 중 흰색 건반의 총 개수는 몇 개일까요?",
    answers: ["52개", "52"],
    hint: "검은 건반은 36개입니다."
  },
  {
    id: "q_040",
    score: 1,
    category: "science",
    question: "지구에서 가장 가까운 항성(스스로 빛을 내는 별)의 이름은?",
    answers: ["태양", "sun"],
    hint: "우리에게 빛과 에너지를 줍니다."
  },
  {
    id: "q_041",
    score: 1,
    category: "history",
    question: "고구려 장수 출신으로 발해를 건국한 인물의 이름은 무엇일까요?",
    answers: ["대조영"],
    hint: "동모산 인근에서 건국했습니다."
  },
  {
    id: "q_042",
    score: 1,
    category: "geography",
    question: "오스트레일리아(호주)의 행정 수도 도시의 이름은 어디일까요?",
    answers: ["캔버라", "canberra"],
    hint: "시드니와 멜버른 중간에 위치해 있습니다."
  },
  {
    id: "q_043",
    score: 1,
    category: "culture",
    question: "빅토르 위고 소설 '노트르담의 드 파리'의 꼽추 주인공 이름은?",
    answers: ["콰지모도", "quasimodo"],
    hint: "성당의 종지기입니다."
  },
  {
    id: "q_044",
    score: 1,
    category: "science",
    question: "췌장에서 분비되어 혈액 속 혈당 수치를 낮춰주는 호르몬은?",
    answers: ["인슐린", "insulin"],
    hint: "당뇨병 관리 핵심 호르몬입니다."
  },
  {
    id: "q_045",
    score: 1,
    category: "history",
    question: "조선 태조 이성계가 도읍으로 삼은 한양의 현재 도시 명칭은?",
    answers: ["서울", "seoul"],
    hint: "대한민국의 수도입니다."
  },
  {
    id: "q_046",
    score: 1,
    category: "economy",
    question: "한국은행 등 중앙은행이 시중 통화량을 조절하기 위해 설정하는 대표 금리는?",
    answers: ["기준금리", "기준 금리"],
    hint: "모든 시중 금리의 기준이 됩니다."
  },
  {
    id: "q_047",
    score: 1,
    category: "geography",
    question: "상징물인 머라이언 동상이 유명한 동남아시아의 도시 국가 이름은?",
    answers: ["싱가포르", "singapore"],
    hint: "아시아 최고의 금융 도시 국가 중 하나입니다."
  },
  {
    id: "q_048",
    score: 1,
    category: "science",
    question: "빛의 속도는 진공 상태에서 초당 약 몇 만 km 일까요?",
    answers: ["30만km", "30만", "300000"],
    hint: "1초에 지구를 7바퀴 반 돕니다."
  },
  {
    id: "q_049",
    score: 1,
    category: "culture",
    question: "헤밍웨이의 대표 소설 제목은 '노인과 ( ? )' 입니다. 빈칸은?",
    answers: ["바다", "sea"],
    hint: "청새치와의 사투를 다룬 작품입니다."
  },
  {
    id: "q_050",
    score: 1,
    category: "sports",
    question: "볼링에서 첫 번째 투구에 10개의 핀을 모두 넘어뜨리는 것은?",
    answers: ["스트라이크", "strike"],
    hint: "X 자 표기가 됩니다."
  },

  // ==========================================
  // [2점] 골든벨 역전 고품격 문제 (Q10용)
  // ==========================================
  {
    id: "q_201",
    score: 2,
    category: "science",
    question: "💡 [골든벨 2점] 빛이 1년 동안 진공 상태에서 이동하는 거리를 뜻하는 천문 단위는?",
    answers: ["광년", "light year", "lightyear"],
    hint: "약 9조 4600억 km 입니다."
  },
  {
    id: "q_202",
    score: 2,
    category: "history",
    question: "💡 [골든벨 2점] 1919년 대한민국 임시정부가 최초로 수립되었던 중국의 도시 명칭은?",
    answers: ["상하이", "상해", "shanghai"],
    hint: "중국 동부 해안의 최대 경제 도시입니다."
  },
  {
    id: "q_203",
    score: 2,
    category: "culture",
    question: "💡 [골든벨 2점] 조선시대 역대 왕과 왕비의 신위를 모시고 제사를 지내는 유네스코 세계유산은?",
    answers: ["종묘", "jongmyo"],
    hint: "종묘제례악이 보존된 곳입니다."
  },
  {
    id: "q_204",
    score: 2,
    category: "science",
    question: "💡 [골든벨 2점] 아인슈타인의 상대성 이론을 대표하는 질량-에너지 등가 방정식 공식은?",
    answers: ["E=mc^2", "E=mc2", "e=mc2"],
    hint: "E, m, c 가 들어가는 물리 방정식입니다."
  },
  {
    id: "q_205",
    score: 2,
    category: "geography",
    question: "💡 [골든벨 2점] 지구상에서 가장 깊은 바다로 깊이가 약 11,000m에 달하는 해구 이름은?",
    answers: ["마리아나 해구", "마리아나해구"],
    hint: "태평양 북서부에 위치해 있습니다."
  },
  {
    id: "q_206",
    score: 2,
    category: "economy",
    question: "💡 [골든벨 2점] 중앙은행이 시중에 통화를 직접 공급하여 경기 부양을 도모하는 통화 정책은?",
    answers: ["양적완화", "양적 완화", "QE"],
    hint: "Quantitative Easing 의 약자입니다."
  },
  {
    id: "q_207",
    score: 2,
    category: "art",
    question: "💡 [골든벨 2점] '별이 빛나는 밤', '해바라기'를 남긴 네덜란드 화가 반 ( ? ) 의 성은?",
    answers: ["고흐", "gogh", "Gogh"],
    hint: "빈센트 반 ( ? ) 입니다."
  },
  {
    id: "q_208",
    score: 2,
    category: "history",
    question: "💡 [골든벨 2점] 동서양 무역의 고대 교역로였던 '비단길'의 영문 명칭은?",
    answers: ["실크로드", "실크 로드", "silk road"],
    hint: "Silk Road 입니다."
  },
  {
    id: "q_209",
    score: 2,
    category: "science",
    question: "💡 [골든벨 2점] 푸른곰팡이에서 최초의 항생제인 페니실린을 발견한 영국의 과학자는?",
    answers: ["플레밍", "알렉산더 플레밍"],
    hint: "노벨 생리의학상을 수상했습니다."
  },
  {
    id: "q_210",
    score: 2,
    category: "history",
    question: "💡 [골든벨 2점] 1215년 영국의 국왕 존이 귀족들의 요구에 승인한 근대 헌법의 초석 대헌장은?",
    answers: ["마그나카르타", "마그나 카르타"],
    hint: "Magna Carta 입니다."
  }
];
