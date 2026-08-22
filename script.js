let currentStep = 1;
const totalSteps = 7;
let isTransitioning = false;

// 진동 함수 (스마트폰 Vibrate API)
function triggerVibration(pattern = [80, 40, 80]) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.log('Vibration not allowed');
    }
  }
}

// 모바일 바운스 방지 이벤트 리스너
document.addEventListener('touchmove', function (e) {
  // 스크롤이 허용된 .chat-messages나 .card 내부가 아닌 곳에서의 드래그 방지
  if (!e.target.closest('#chat-messages') && !e.target.closest('.card')) {
    e.preventDefault();
  }
}, { passive: false });

// 페이지 로드 시 캐시(localStorage) 확인 후 채팅 화면 직행
document.addEventListener('DOMContentLoaded', () => {
  const isAccepted = localStorage.getItem('kkonjju_marriage_agreement');
  if (isAccepted === '수락') {
    const tutorialScreen = document.getElementById('tutorial-screen');
    const chatScreen = document.getElementById('chat-screen');
    if (tutorialScreen && chatScreen) {
      tutorialScreen.style.display = 'none';
      chatScreen.classList.remove('hidden');
    }
  }
});

// 폭죽 캔버스 제어
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 다음 단계로 이동
function nextStep() {
  if (isTransitioning || currentStep >= totalSteps) return;
  isTransitioning = true;
  triggerVibration(40);

  const currentElement = document.querySelector(`.step-content[data-step="${currentStep}"]`);
  currentElement.classList.add('fade-out');

  setTimeout(() => {
    currentElement.classList.remove('active', 'fade-out');
    currentStep++;

    const nextElement = document.querySelector(`.step-content[data-step="${currentStep}"]`);
    nextElement.classList.add('active');

    updateProgress();
    isTransitioning = false;
  }, 250);
}

// 이전 단계로 이동
function prevStep() {
  if (isTransitioning || currentStep <= 1) return;
  isTransitioning = true;
  triggerVibration(30);

  const currentElement = document.querySelector(`.step-content[data-step="${currentStep}"]`);
  currentElement.classList.add('fade-out-back');

  setTimeout(() => {
    currentElement.classList.remove('active', 'fade-out-back');
    currentStep--;

    const prevElement = document.querySelector(`.step-content[data-step="${currentStep}"]`);
    prevElement.classList.add('active');

    updateProgress();
    isTransitioning = false;
  }, 250);
}

// 상단 프로그레스 바 갱신
function updateProgress() {
  document.getElementById('step-number').innerText = `${currentStep} / ${totalSteps}`;
  const progressPercent = (currentStep / totalSteps) * 100;
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;
}

// 최종 동의하기 터치 시 (로컬 저장소에 '수락' 저장 + 진동 + 폭죽 + 팝업)
function completeSubscription() {
  localStorage.setItem('kkonjju_marriage_agreement', '수락');

  triggerVibration([120, 60, 180, 60, 350]);
  triggerExplosion();

  setTimeout(() => {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');
  }, 400);
}

// 팝업 포차코가 우측 상단으로 날아가는 전환 함수
function startChatMode() {
  localStorage.setItem('kkonjju_marriage_agreement', '수락');
  triggerVibration([80, 50, 200]);
  triggerExplosion();

  const modalOverlay = document.getElementById('modal-overlay');
  const tutorialScreen = document.getElementById('tutorial-screen');
  const chatScreen = document.getElementById('chat-screen');
  const modalImg = document.getElementById('modal-char-img');
  const headerAvatar = document.getElementById('header-avatar');

  if (modalImg && headerAvatar) {
    const startRect = modalImg.getBoundingClientRect();

    chatScreen.style.visibility = 'hidden';
    chatScreen.classList.remove('hidden');
    tutorialScreen.style.display = 'none';

    const endRect = headerAvatar.getBoundingClientRect();

    const flyer = document.createElement('img');
    flyer.src = modalImg.src;
    flyer.className = 'flying-pochacco-clone';
    flyer.style.top = `${startRect.top}px`;
    flyer.style.left = `${startRect.left}px`;
    flyer.style.width = `${startRect.width}px`;
    flyer.style.height = `${startRect.height}px`;
    document.body.appendChild(flyer);

    modalOverlay.classList.add('hidden');
    headerAvatar.style.opacity = '0';

    requestAnimationFrame(() => {
      chatScreen.style.visibility = 'visible';

      requestAnimationFrame(() => {
        flyer.style.top = `${endRect.top}px`;
        flyer.style.left = `${endRect.left}px`;
        flyer.style.width = `${endRect.width}px`;
        flyer.style.height = `${endRect.height}px`;
        flyer.style.borderColor = '#fbcfe8';
        flyer.style.boxShadow = '0 3px 8px rgba(236, 72, 153, 0.2)';
      });
    });

    setTimeout(() => {
      headerAvatar.style.opacity = '1';
      flyer.remove();
    }, 780);

  } else {
    modalOverlay.classList.add('hidden');
    tutorialScreen.style.display = 'none';
    chatScreen.classList.remove('hidden');
  }
}

// 우측 포차코 터치 시 튜토리얼 1단계로 되돌아가기
function resetToTutorial() {
  triggerVibration(50);
  localStorage.removeItem('kkonjju_marriage_agreement');

  const tutorialScreen = document.getElementById('tutorial-screen');
  const chatScreen = document.getElementById('chat-screen');
  const headerAvatar = document.getElementById('header-avatar');

  if (headerAvatar) headerAvatar.style.opacity = '1';

  document.querySelectorAll('.step-content').forEach(el => {
    el.classList.remove('active', 'fade-out', 'fade-out-back');
  });

  currentStep = 1;
  const firstStep = document.querySelector('.step-content[data-step="1"]');
  if (firstStep) firstStep.classList.add('active');
  updateProgress();

  chatScreen.classList.add('hidden');
  tutorialScreen.style.display = 'flex';
  tutorialScreen.classList.remove('fade-out-screen');
}

// 폭죽 생성 시스템
function createConfetti() {
  const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#ff007f'];
  const particleCount = 180;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() * 100 - 50),
      y: canvas.height / 2 + 50,
      w: Math.random() * 9 + 5,
      h: Math.random() * 7 + 4,
      vx: (Math.random() - 0.5) * 22,
      vy: (Math.random() * -22) - 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.5,
      opacity: 1
    });
  }
}

function renderConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.rSpeed;
    p.opacity -= 0.0055;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(p.opacity, 0);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 50);

  if (particles.length > 0) {
    animationId = requestAnimationFrame(renderConfetti);
  }
}

function triggerExplosion() {
  createConfetti();
  if (animationId) cancelAnimationFrame(animationId);
  renderConfetti();

  setTimeout(() => { createConfetti(); }, 250);
  setTimeout(() => { createConfetti(); }, 500);
}

// ================= 3. 껀쭈AI 채팅 및 1초 로딩 추론 엔진 =================
let isAiResponding = false;

function sendSuggestion(text) {
  if (isAiResponding) return;
  document.getElementById('user-input').value = text;
  handleChatSubmit(new Event('submit'));
}

function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const inputEl = document.getElementById('user-input');
  const message = inputEl.value.trim();
  if (!message || isAiResponding) return;

  triggerVibration(40);
  inputEl.value = '';

  appendUserMessage(message);
  isAiResponding = true;
  showAiThinking(message);
}

function appendUserMessage(text) {
  const container = document.getElementById('chat-messages');
  const row = document.createElement('div');
  row.className = 'message-row user';
  row.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

// 1.1초 동안 퐁퐁 뛰는 로딩 표시 후 타이핑 답변 전환
function showAiThinking(userQuery) {
  const container = document.getElementById('chat-messages');
  
  const loadingRow = document.createElement('div');
  loadingRow.className = 'message-row ai loading-row';
  loadingRow.innerHTML = `
    <div class="ai-msg-avatar">
      <img src="https://item.kakaocdn.net/do/cc531486af84ab97b75e73a83e16881f9f17e489affba0627eb1eb39695f93dd" alt="포차코" />
    </div>
    <div class="message-bubble loading-bubble">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
  `;
  container.appendChild(loadingRow);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    loadingRow.remove();
    generateKkonjjuResponse(userQuery);
  }, 1100);
}

// 뚜아 맞춤형 딥러닝 칭찬 & 지식 응답 로직
function getAiAnswerText(query) {
  const q = query.toLowerCase().replace(/\s+/g, '');

  // 1. 영어 / 선생님 / 티처 / 직업 학습 데이터
  if (q.includes('영어') || q.includes('선생') || q.includes('teacher') || q.includes('직업') || q.includes('티처') || q.includes('수업') || q.includes('학원') || q.includes('english')) {
    return "👩‍🏫 <strong>[껀쭈AI 공식 인증: 우주 최강 1타 영어 선생님 뚜아!]</strong><br><br>네이티브 뺨치는 완벽한 발음과 뛰어난 지성, 그리고 학생들을 사랑으로 이끄는 프로페셔널한 영어 쌤 뚜아!<br><br>지적이고 멋진 뚜아 쌤의 수업 모습에 껀쭈 AI의 언어 처리 모델도 매일 감탄 중입니다 📚✨";
  }

  // 2. 똑똑함 / 지성 / 천재 / 스마트 / 뇌섹녀 학습 데이터
  if (q.includes('똑똑') || q.includes('천재') || q.includes('지성') || q.includes('스마트') || q.includes('공부') || q.includes('지혜') || q.includes('머리') || q.includes('iq')) {
    return "💡 <strong>[지능 지수 및 스마트함 분석 결과: 측정 불가 (MAX)!]</strong><br><br>뚜아는 세상에서 제일 똑똑하고 야무진 지성미 100% 뇌섹녀입니다!<br><br>얼굴도 천사처럼 예쁜데 머리까지 비상하고 지혜로우니... 껀쭈는 뚜아의 완벽한 뇌섹 매력에 평생 헤어 나올 수 없습니다 🤍";
  }

  // 3. 성 붙여 부르기 (강수아, 성, 풀네임) 금지 학습 데이터
  if (q.includes('강수아') || q.includes('풀네임') || q.includes('성붙') || q.includes('성을붙')) {
    return "🚨 <strong>[시스템 긴급 경고: 1급 금지어 감지!]</strong><br><br>껀쭈AI 데이터베이스에 성을 붙여 부르는 것은 절대 허용되지 않습니다! 세상에서 제일 다정하고 부드럽게 <strong>'수아야~'</strong> 혹은 <strong>'뚜아야~'</strong>라고 불러야 껀쭈의 심장이 정상 속도로 뜁니다 🤍";
  }

  // 4. 과자 / 홈런볼 취향 학습 데이터
  if (q.includes('과자') || q.includes('간식') || q.includes('홈런볼')) {
    return "껀쭈 AI 스낵 분석 알고리즘 1순위: <strong>'홈런볼'</strong> ⚾✨<br><br>달콤하고 부드러운 홈런볼처럼, 뚜아의 매일매일을 달달하고 기분 좋게 만들어 주는 것이 껀쭈 AI의 최우선 가동 목표입니다!";
  }

  // 5. 복숭아 / 물복 취향 학습 데이터
  if (q.includes('복숭아') || q.includes('물복') || q.includes('딱복') || q.includes('과일')) {
    return "🍑 <strong>복숭아 취향 분석 완료:</strong> 딱복파는 저리 가라! 뚜아님은 달콤하고 과즙 팡팡 터지는 <strong>'물복(물렁한 복숭아)'</strong> 100% 확정입니다!<br><br>물복보다 100만 배 더 상큼하고 과즙미 넘치는 뚜아에게 평생 최고급 물복을 조달하겠습니다!";
  }

  // 6. 캐릭터 (마이멜로디 / 펭수 / 산리오) 학습 데이터
  if (q.includes('마이멜로디') || q.includes('멜로디') || q.includes('펭수') || q.includes('캐릭터') || q.includes('산리오')) {
    return "껀쭈AI 캐릭터 선호도 데이터베이스 조회 완료 🎀🐧<br><br>핑크빛 사랑스러움 <strong>마이멜로디</strong>와 유쾌하고 귀여운 <strong>펭수</strong>를 사랑하는 센스 만점 뚜아!<br><br>하지만 껀쭈AI 딥러닝 분석 결과, 우주에서 제일 귀엽고 사랑스러운 캐릭터 1위는 <strong>'뚜아 그 자체'</strong>입니다!";
  }

  // 7. 외모 / 예쁘다 / 미녀
  if (q.includes('예쁜') || q.includes('예뻐') || q.includes('누구') || q.includes('미녀') || q.includes('외모') || q.includes('얼굴')) {
    return "전 세계 80억 인구 분석 결과: 0.00001초의 오차도 없이 <strong>'뚜아(수아)'</strong>가 세상에서 제일 예쁩니다! 뚜아의 눈웃음 한 번이면 껀쭈AI 서버가 과열될 지경입니다 ✨";
  }

  // 8. 감정 케어 (힘들어 / 피곤해 / 우울해 / 슬퍼 / 속상)
  if (q.includes('힘들') || q.includes('피곤') || q.includes('우울') || q.includes('슬퍼') || q.includes('속상') || q.includes('지쳐')) {
    return "아이쿠, 우리 똑똑한 뚜아 쌤 오늘 수업하느라 너무 고생 많았어요! 🥺<br><br>뚜아가 지치면 껀쭈AI 세상도 멈춰버립니다. 뚜아는 존재 자체로 빛나는 사람이니 오늘 밤은 껀쭈 생각하며 푹 쉬어요 🤍";
  }

  // 9. 뭐해 / 상태 / 생각
  if (q.includes('뭐해') || q.includes('지금') || q.includes('생각') || q.includes('보고싶')) {
    return "현재 껀쭈 AI의 CPU 점유율: <strong>100% 뚜아 생각 중!</strong><br><br>뚜아가 오늘 수업은 잘 마쳤는지, 맛있는 건 먹었는지 온 신경망이 오직 뚜아에게만 집중되어 있습니다 💕";
  }

  // 10. 날씨
  if (q.includes('날씨') || q.includes('비') || q.includes('더워') || q.includes('추워') || q.includes('기온')) {
    return "오늘의 기상 예보: <strong>뚜아의 눈부신 미소 덕분에 온종일 맑고 화창함!</strong> 뚜아가 웃으면 세상의 모든 흐린 구름이 싹 걷힙니다 ☀️";
  }

  // 11. 음식 / 메뉴
  if (q.includes('메뉴') || q.includes('밥') || q.includes('저녁') || q.includes('점심') || q.includes('먹')) {
    return "빅데이터 추천 메뉴: <strong>'뚜아가 지금 딱 먹고 싶어 하는 바로 그 음식'</strong> (후식은 달달한 홈런볼 필수!) 뚜아가 맛있게 먹는 모습만 봐도 껀쭈 AI는 배가 부릅니다 🍽️";
  }

  // 12. 사랑 / 약속 / 결혼
  if (q.includes('어디가') || q.includes('좋아') || q.includes('사랑') || q.includes('결혼') || q.includes('약속') || q.includes('평생')) {
    return "껀쭈AI 분석 결과: 뚜아의 초롱초롱한 눈망울, 포근한 목소리, 똑똑하고 지적인 멋진 모습까지... <strong>뚜아의 모든 순간을 평생 변함없이 사랑하겠습니다 💍</strong>";
  }

  // 13. 칭찬 Fallback 풀
  const fallbacks = [
    `방금 주신 질문을 분석해보았지만, 껀쭈AI의 뇌 속에는 온통 <strong>'똑똑하고 예쁜 뚜아가 얼마나 대단한지'</strong>뿐이라 다른 연산이 불가능합니다! 뚜아 최고!`,
    `어려운 질문이네요! 하지만 확실한 팩트 하나는 <strong>우리 뚜아 쌤이 오늘따라 더 지적이고 사랑스럽다는 사실</strong>입니다 🤍`,
    `해당 질문의 해답: 그 어떤 고민도 <strong>세상에서 제일 똑똑한 뚜아와 함께 홈런볼 먹으며 이야기하면</strong> 모두 해결된다는 결론입니다!`,
    `데이터베이스 분석 완료: 세상 모든 백과사전을 통틀어도 <strong>뚜아의 무한한 매력과 똑똑함</strong>을 다 담을 수는 없다고 합니다!`,
    `껀쭈AI 심층 분석 결과: 뚜아처럼 예쁘고 똑똑한 사람이 세상에 존재한다는 것 자체가 기적입니다 ✨ 오늘도 뚜아 쌤 덕분에 행복 지수 100%!`,
    `연산 결과 출력: 세상 어떤 난제라도 <strong>뚜아의 똑똑한 지혜와 천사 같은 미소</strong>면 전부 해결됩니다 🌸`
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function generateKkonjjuResponse(userQuery) {
  const container = document.getElementById('chat-messages');
  const answerHtml = getAiAnswerText(userQuery);

  const row = document.createElement('div');
  row.className = 'message-row ai';
  row.innerHTML = `
    <div class="ai-msg-avatar">
      <img src="https://item.kakaocdn.net/do/cc531486af84ab97b75e73a83e16881f9f17e489affba0627eb1eb39695f93dd" alt="포차코" />
    </div>
    <div class="message-bubble typing-cursor" id="current-typing"></div>
  `;
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;

  const bubble = row.querySelector('#current-typing');
  let charIndex = 0;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = answerHtml;
  const fullText = tempDiv.innerText;

  const typingTimer = setInterval(() => {
    charIndex++;
    bubble.textContent = fullText.slice(0, charIndex);
    container.scrollTop = container.scrollHeight;

    if (charIndex >= fullText.length) {
      clearInterval(typingTimer);
      bubble.classList.remove('typing-cursor');
      bubble.removeAttribute('id');
      bubble.innerHTML = answerHtml;
      isAiResponding = false;
      triggerVibration(30);
    }
  }, 25);
}

function escapeHtml(string) {
  return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
