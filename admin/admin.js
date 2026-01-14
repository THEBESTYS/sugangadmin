// 로컬 스토리지에서 데이터 로드
function loadApplicationsFromLocalStorage() {
    const data = localStorage.getItem('courseApplications');
    return data ? JSON.parse(data) : [];
}

// 데이터를 로컬 스토리지에 저장
function saveApplicationsToLocalStorage(apps) {
    localStorage.setItem('courseApplications', JSON.stringify(apps));
}

// 전역 변수 (로컬 스토리지에서 로드)
let applications = loadApplicationsFromLocalStorage();

// 레벨 정보
const levelInfo = {
    "first-discoveries": "First Discoveries (Pre-A1)",
    "basic-1": "Basic 1 (A1)",
    "basic-2": "Basic 2 (A1+)",
    "basic-3": "Basic 3 (A2)",
    "intermediate-1": "Intermediate 1 (A2+)",
    "intermediate-2": "Intermediate 2 (B1)",
    "intermediate-3": "Intermediate 3 (B1+)",
    "advanced-1": "Advanced 1 (B2)",
    "advanced-2": "Advanced 2 (B2+)",
    "advanced-3": "Advanced 3 (C1)",
    "test-needed": "레벨 테스트 후 결정"
};

const scheduleInfo = {
    "morning": "오전반 (09:00 - 12:00)",
    "afternoon": "오후반 (13:00 - 16:00)",
    "evening": "저녁반 (18:30 - 21:30)",
    "weekend": "주말반 (토요일 10:00 - 16:00)"
};

// 상태 관리
let currentPage = 1;
let applicationsPerPage = 10;
let currentFilter = "all";
let currentLevelFilter = "all";
let currentSearch = "";
let selectedApplications = [];

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkLoginStatus();
});

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginForm = document.getElementById('login-form');
    const adminContainer = document.querySelector('.admin-container');
    
    if (!isLoggedIn) {
        // 로그인되지 않았으면 로그인 폼 표시
        if (loginForm) loginForm.style.display = 'block';
        if (adminContainer) adminContainer.style.display = 'none';
        
        // 로그인 폼 처리
        document.getElementById('admin-login')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('admin-id').value;
            const pw = document.getElementById('admin-pw').value;
            
            // 간단한 인증 (실제 운영에서는 서버 인증 필요)
            if (id === 'admin' && pw === 'password123') {
                localStorage.setItem('adminLoggedIn', 'true');
                location.reload(); // 페이지 새로고침
            } else {
                alert('아이디 또는 비밀번호가 잘못되었습니다.');
            }
        });
    } else {
        // 로그인되었으면 관리자 페이지 초기화
        if (loginForm) loginForm.style.display = 'none';
        if (adminContainer) adminContainer.style.display = 'flex';
        
        initAdminPage();
    }
}

function initAdminPage() {
    // 날짜와 시간 업데이트
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // 네비게이션 이벤트
    setupNavigation();
    
    // 대시보드 초기화
    initDashboard();
    
    // 수강신청 목록 초기화
    initApplications();
    
    // 통계 초기화
    initStatistics();
    
    // 레벨 관리 초기화
    initLevelManagement();
    
    // 설정 초기화
    initSettings();
    
    // 모달 이벤트 설정
    setupModalEvents();
    
    // 폼 제출 이벤트 설정
    setupFormEvents();
}

// 날짜와 시간 업데이트
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    const timeStr = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    document.getElementById('current-date').textContent = dateStr;
    document.getElementById('current-time').textContent = timeStr;
}

// 네비게이션 설정
function setupNavigation() {
    // 사이드바 메뉴 클릭
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // 모든 섹션과 메뉴 항목 비활성화
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.querySelectorAll('.admin-nav a').forEach(item => {
                item.classList.remove('active');
            });
            
            // 대상 섹션과 메뉴 항목 활성화
            document.getElementById(targetId).classList.add('active');
            this.classList.add('active');
            
            // 페이지 제목 업데이트
            updatePageTitle(targetId);
            
            // 각 섹션별 초기화 함수 호출
            switch(targetId) {
                case 'applications':
                    refreshApplicationsTable();
                    break;
                case 'statistics':
                    updateStatistics();
                    break;
            }
        });
    });
    
    // 로그아웃 버튼
    document.getElementById('logout-btn').addEventListener('click', function() {
        if(confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('adminLoggedIn');
            location.reload();
        }
    });
}

// 페이지 제목 업데이트
function updatePageTitle(pageId) {
    const titles = {
        'dashboard': '대시보드',
        'applications': '수강신청 현황',
        'statistics': '통계 분석',
        'levels': '레벨 관리',
        'settings': '시스템 설정'
    };
    
    const subtitles = {
        'dashboard': '수강신청 현황을 관리하세요',
        'applications': '수강신청 내역을 확인하고 관리하세요',
        'statistics': '데이터 분석 및 통계를 확인하세요',
        'levels': '레벨 정보를 관리하세요',
        'settings': '시스템 설정을 관리하세요'
    };
    
    document.getElementById('page-title').textContent = titles[pageId] || '관리자 페이지';
    document.getElementById('page-subtitle').textContent = subtitles[pageId] || '';
}

// 대시보드 초기화
function initDashboard() {
    updateDashboardStats();
    createCharts();
    loadRecentApplications();
}

// 대시보드 통계 업데이트
function updateDashboardStats() {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const confirmed = applications.filter(app => app.status === 'confirmed').length;
    const canceled = applications.filter(app => app.status === 'canceled').length;
    
    document.getElementById('total-applicants').textContent = total;
    document.getElementById('pending-applicants').textContent = pending;
    document.getElementById('confirmed-applicants').textContent = confirmed;
    document.getElementById('canceled-applicants').textContent = canceled;
    
    // 대기 중인 신청 수 배지 업데이트
    document.getElementById('pending-count').textContent = pending;
}

// 차트 생성
function createCharts() {
    // 레벨별 신청 현황 차트
    const levelCounts = {};
    applications.forEach(app => {
        const levelGroup = getLevelGroup(app.courseLevel);
        levelCounts[levelGroup] = (levelCounts[levelGroup] || 0) + 1;
    });
    
    const levelCtx = document.getElementById('levelChart').getContext('2d');
    new Chart(levelCtx, {
        type: 'doughnut
