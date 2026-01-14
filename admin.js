// Mock 데이터 (실제 구현 시 서버 API로 교체)
let applications = [
    {
        id: 1,
        name: "김영희",
        birth: "1990-05-15",
        phone: "010-1234-5678",
        email: "younghee@email.com",
        englishLevel: "intermediate",
        courseLevel: "intermediate-2",
        schedule: "evening",
        options: ["level-test"],
        message: "레벨 테스트를 원합니다",
        status: "pending",
        appliedAt: "2023-10-15"
    },
    {
        id: 2,
        name: "이민수",
        birth: "1985-11-22",
        phone: "010-2345-6789",
        email: "minsoo@email.com",
        englishLevel: "beginner",
        courseLevel: "basic-1",
        schedule: "morning",
        options: ["level-test", "trial"],
        message: "체험 수강 후 결정하려고 합니다",
        status: "confirmed",
        appliedAt: "2023-10-14"
    },
    {
        id: 3,
        name: "박지훈",
        birth: "1992-03-08",
        phone: "010-3456-7890",
        email: "jihun@email.com",
        englishLevel: "advanced",
        courseLevel: "advanced-1",
        schedule: "weekend",
        options: ["material"],
        message: "비즈니스 영어를 집중적으로 배우고 싶습니다",
        status: "pending",
        appliedAt: "2023-10-13"
    },
    {
        id: 4,
        name: "정수진",
        birth: "1995-07-30",
        phone: "010-4567-8901",
        email: "sujin@email.com",
        englishLevel: "intermediate",
        courseLevel: "intermediate-1",
        schedule: "afternoon",
        options: [],
        message: "",
        status: "canceled",
        appliedAt: "2023-10-12"
    },
    {
        id: 5,
        name: "최윤호",
        birth: "1988-12-05",
        phone: "010-5678-9012",
        email: "yunho@email.com",
        englishLevel: "beginner",
        courseLevel: "first-discoveries",
        schedule: "evening",
        options: ["level-test", "trial"],
        message: "처음 배우는 영어입니다",
        status: "confirmed",
        appliedAt: "2023-10-11"
    }
];

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
    "advanced-3": "Advanced 3 (C1)"
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
    initAdminPage();
});

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
            // 실제 구현 시 로그아웃 처리
            alert('로그아웃 되었습니다.');
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
        type: 'doughnut',
        data: {
            labels: ['초급 과정', '중급 과정', '고급 과정'],
            datasets: [{
                data: [
                    levelCounts['beginner'] || 0,
                    levelCounts['intermediate'] || 0,
                    levelCounts['advanced'] || 0
                ],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#9C27B0'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // 일별 신청 추이 차트 (예시 데이터)
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: ['10/10', '10/11', '10/12', '10/13', '10/14', '10/15'],
            datasets: [{
                label: '신청 수',
                data: [3, 5, 4, 6, 7, 5],
                borderColor: '#2C5AA0',
                backgroundColor: 'rgba(44, 90, 160, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 레벨 그룹 가져오기
function getLevelGroup(level) {
    if(level.includes('basic') || level.includes('first-discoveries')) {
        return 'beginner';
    } else if(level.includes('intermediate')) {
        return 'intermediate';
    } else if(level.includes('advanced')) {
        return 'advanced';
    }
    return 'beginner';
}

// 최근 신청내역 로드
function loadRecentApplications() {
    const tableBody = document.querySelector('#recent-applications-table tbody');
    tableBody.innerHTML = '';
    
    // 최근 5개 신청내역
    const recentApps = [...applications]
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 5);
    
    recentApps.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.id}</td>
            <td>${app.name}</td>
            <td>${levelInfo[app.courseLevel] || app.courseLevel}</td>
            <td>${scheduleInfo[app.schedule] || app.schedule}</td>
            <td>${app.appliedAt}</td>
            <td><span class="status-badge status-${app.status}">${getStatusText(app.status)}</span></td>
        `;
        
        row.addEventListener('click', () => showApplicationDetail(app.id));
        tableBody.appendChild(row);
    });
}

// 수강신청 목록 초기화
function initApplications() {
    setupApplicationFilters();
    setupApplicationActions();
    refreshApplicationsTable();
}

// 필터 설정
function setupApplicationFilters() {
    document.getElementById('filter-status').addEventListener('change', function() {
        currentFilter = this.value;
        currentPage = 1;
        refreshApplicationsTable();
    });
    
    document.getElementById('filter-level').addEventListener('change', function() {
        currentLevelFilter = this.value;
        currentPage = 1;
        refreshApplicationsTable();
    });
    
    document.getElementById('search-name').addEventListener('input', function() {
        currentSearch = this.value;
        currentPage = 1;
        refreshApplicationsTable();
    });
    
    document.getElementById('search-btn').addEventListener('click', function() {
        refreshApplicationsTable();
    });
}

// 액션 설정
function setupApplicationActions() {
    // 전체 선택 체크박스
    document.getElementById('select-all').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#applications-table tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            toggleApplicationSelection(checkbox);
        });
    });
    
    // 일괄 처리
    document.getElementById('apply-batch').addEventListener('click', function() {
        const action = document.getElementById('batch-action').value;
        if(!action) {
            alert('처리할 작업을 선택하세요.');
            return;
        }
        
        if(selectedApplications.length === 0) {
            alert('선택된 항목이 없습니다.');
            return;
        }
        
        if(action === 'delete') {
            if(!confirm(`선택된 ${selectedApplications.length}개의 항목을 삭제하시겠습니까?`)) {
                return;
            }
        } else {
            const actionText = action === 'confirm' ? '확정' : '취소';
            if(!confirm(`선택된 ${selectedApplications.length}개의 항목을 ${actionText} 처리하시겠습니까?`)) {
                return;
            }
        }
        
        // 선택된 항목 처리
        selectedApplications.forEach(id => {
            const index = applications.findIndex(app => app.id === id);
            if(index !== -1) {
                if(action === 'delete') {
                    applications.splice(index, 1);
                } else {
                    applications[index].status = action;
                }
            }
        });
        
        // 테이블 새로고침
        refreshApplicationsTable();
        updateDashboardStats();
        document.getElementById('batch-action').value = '';
    });
    
    // 내보내기 버튼
    document.getElementById('export-btn').addEventListener('click', function() {
        exportApplications();
    });
}

// 수강신청 테이블 새로고침
function refreshApplicationsTable() {
    const tableBody = document.querySelector('#applications-table tbody');
    tableBody.innerHTML = '';
    
    // 필터링된 목록 가져오기
    let filteredApps = filterApplications();
    
    // 페이지네이션
    const totalPages = Math.ceil(filteredApps.length / applicationsPerPage);
    const startIndex = (currentPage - 1) * applicationsPerPage;
    const endIndex = startIndex + applicationsPerPage;
    const pagedApps = filteredApps.slice(startIndex, endIndex);
    
    // 테이블 채우기
    pagedApps.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" value="${app.id}" class="select-application"></td>
            <td>${app.id}</td>
            <td>${app.name}</td>
            <td>${app.birth}</td>
            <td>${app.phone}</td>
            <td>${app.email}</td>
            <td>${levelInfo[app.courseLevel] || app.courseLevel}</td>
            <td>${scheduleInfo[app.schedule] || app.schedule}</td>
            <td>${app.appliedAt}</td>
            <td><span class="status-badge status-${app.status}">${getStatusText(app.status)}</span></td>
            <td>
                <button class="btn-icon btn-view" data-id="${app.id}" title="보기">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon btn-edit" data-id="${app.id}" title="상태 변경">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" data-id="${app.id}" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // 체크박스 이벤트
        const checkbox = row.querySelector('.select-application');
        checkbox.addEventListener('change', function() {
            toggleApplicationSelection(this);
        });
        
        // 액션 버튼 이벤트
        row.querySelector('.btn-view').addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            showApplicationDetail(id);
        });
        
        row.querySelector('.btn-edit').addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            editApplicationStatus(id);
        });
        
        row.querySelector('.btn-delete').addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            deleteApplication(id);
        });
        
        tableBody.appendChild(row);
    });
    
    // 페이지네이션 업데이트
    updatePagination(totalPages);
}

// 필터링된 목록 가져오기
function filterApplications() {
    return applications.filter(app => {
        // 상태 필터
        if(currentFilter !== 'all' && app.status !== currentFilter) {
            return false;
        }
        
        // 레벨 필터
        if(currentLevelFilter !== 'all') {
            const levelGroup = getLevelGroup(app.courseLevel);
            if(levelGroup !== currentLevelFilter) {
                return false;
            }
        }
        
        // 이름 검색
        if(currentSearch && !app.name.includes(currentSearch)) {
            return false;
        }
        
        return true;
    });
}

// 페이지네이션 업데이트
function updatePagination(totalPages) {
    const pageNumbers = document.querySelector('.page-numbers');
    pageNumbers.innerHTML = '';
    
    for(let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            refreshApplicationsTable();
        });
        pageNumbers.appendChild(pageBtn);
    }
    
    // 이전/다음 버튼 이벤트
    document.getElementById('prev-page').addEventListener('click', function() {
        if(currentPage > 1) {
            currentPage--;
            refreshApplicationsTable();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', function() {
        if(currentPage < totalPages) {
            currentPage++;
            refreshApplicationsTable();
        }
    });
}

// 신청내역 선택 토글
function toggleApplicationSelection(checkbox) {
    const id = parseInt(checkbox.value);
    const isChecked = checkbox.checked;
    
    if(isChecked && !selectedApplications.includes(id)) {
        selectedApplications.push(id);
    } else if(!isChecked) {
        selectedApplications = selectedApplications.filter(appId => appId !== id);
    }
}

// 신청내역 상세보기
function showApplicationDetail(id) {
    const app = applications.find(a => a.id === id);
    if(!app) return;
    
    const modalBody = document.querySelector('#detail-modal .modal-body');
    modalBody.innerHTML = `
        <div class="application-detail">
            <div class="detail-section">
                <h4>기본 정보</h4>
                <div class="detail-row">
                    <div class="detail-label">이름:</div>
                    <div class="detail-value">${app.name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">생년월일:</div>
                    <div class="detail-value">${app.birth}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">연락처:</div>
                    <div class="detail-value">${app.phone}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">이메일:</div>
                    <div class="detail-value">${app.email}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>수강 정보</h4>
                <div class="detail-row">
                    <div class="detail-label">영어 실력:</div>
                    <div class="detail-value">${getEnglishLevelText(app.englishLevel)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">희망 레벨:</div>
                    <div class="detail-value">${levelInfo[app.courseLevel] || app.courseLevel}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">희망 시간:</div>
                    <div class="detail-value">${scheduleInfo[app.schedule] || app.schedule}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">추가 옵션:</div>
                    <div class="detail-value">${getOptionsText(app.options)}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>신청 정보</h4>
                <div class="detail-row">
                    <div class="detail-label">신청일:</div>
                    <div class="detail-value">${app.appliedAt}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">상태:</div>
                    <div class="detail-value"><span class="status-badge status-${app.status}">${getStatusText(app.status)}</span></div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>문의사항</h4>
                <div class="detail-message">${app.message || '문의사항 없음'}</div>
            </div>
        </div>
    `;
    
    // 모달 제어 버튼 이벤트
    document.getElementById('confirm-application').onclick = () => updateApplicationStatus(id, 'confirmed');
    document.getElementById('cancel-application').onclick = () => updateApplicationStatus(id, 'canceled');
    
    // 모달 열기
    document.getElementById('detail-modal').classList.add('active');
}

// 영어 실력 텍스트 변환
function getEnglishLevelText(level) {
    const levels = {
        'beginner': '초보 (기초부터 배우고 싶어요)',
        'intermediate': '중급 (기본 회화는 가능해요)',
        'advanced': '고급 (비즈니스 영어가 필요해요)'
    };
    return levels[level] || level;
}

// 옵션 텍스트 변환
function getOptionsText(options) {
    if(!options || options.length === 0) return '없음';
    
    const optionTexts = {
        'level-test': '무료 레벨 테스트',
        'trial': '체험 수강 (1회 무료)',
        'material': '교재 미리 받기'
    };
    
    return options.map(opt => optionTexts[opt] || opt).join(', ');
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusTexts = {
        'pending': '대기 중',
        'confirmed': '확정',
        'canceled': '취소'
    };
    return statusTexts[status] || status;
}

// 신청내역 상태 수정
function editApplicationStatus(id) {
    const app = applications.find(a => a.id === id);
    if(!app) return;
    
    const newStatus = prompt('상태를 변경하세요:\n1. 대기 중\n2. 확정\n3. 취소\n\n현재 상태: ' + getStatusText(app.status));
    
    if(!newStatus) return;
    
    let status;
    if(newStatus.includes('대기') || newStatus === '1') {
        status = 'pending';
    } else if(newStatus.includes('확정') || newStatus === '2') {
        status = 'confirmed';
    } else if(newStatus.includes('취소') || newStatus === '3') {
        status = 'canceled';
    } else {
        alert('올바른 상태를 입력해주세요.');
        return;
    }
    
    updateApplicationStatus(id, status);
}

// 신청내역 상태 업데이트
function updateApplicationStatus(id, status) {
    const index = applications.findIndex(app => app.id === id);
    if(index !== -1) {
        applications[index].status = status;
        refreshApplicationsTable();
        updateDashboardStats();
        alert('상태가 변경되었습니다.');
        closeAllModals();
    }
}

// 신청내역 삭제
function deleteApplication(id) {
    if(!confirm('이 신청내역을 삭제하시겠습니까?')) return;
    
    const index = applications.findIndex(app => app.id === id);
    if(index !== -1) {
        applications.splice(index, 1);
        refreshApplicationsTable();
        updateDashboardStats();
        alert('삭제되었습니다.');
    }
}

// 데이터 내보내기
function exportApplications() {
    const dataStr = JSON.stringify(applications, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `수강신청_내역_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// 통계 초기화
function initStatistics() {
    document.getElementById('stat-period').addEventListener('change', updateStatistics);
}

// 통계 업데이트
function updateStatistics() {
    // 실제 구현 시 기간별 데이터 필터링 및 차트 업데이트
    const period = document.getElementById('stat-period').value;
    alert(`${period} 동안의 통계를 업데이트합니다.`);
    
    // 차트 생성 (예시)
    createStatisticsCharts();
}

// 통계 차트 생성
function createStatisticsCharts() {
    // 전체 신청 추이 차트
    const overviewCtx = document.getElementById('overviewChart').getContext('2d');
    new Chart(overviewCtx, {
        type: 'line',
        data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
            datasets: [{
                label: '신청 수',
                data: [10, 15, 12, 18, 22, 25],
                borderColor: '#2C5AA0',
                backgroundColor: 'rgba(44, 90, 160, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true
        }
    });
    
    // 레벨 분포 차트
    const levelDistCtx = document.getElementById('levelDistributionChart').getContext('2d');
    new Chart(levelDistCtx, {
        type: 'bar',
        data: {
            labels: ['초급', '중급', '고급'],
            datasets: [{
                label: '신청자 수',
                data: [15, 10, 5],
                backgroundColor: ['#4CAF50', '#2196F3', '#9C27B0']
            }]
        },
        options: {
            responsive: true
        }
    });
    
    // 시간대 선호도 차트
    const timePrefCtx = document.getElementById('timePreferenceChart').getContext('2d');
    new Chart(timePrefCtx, {
        type: 'pie',
        data: {
            labels: ['오전', '오후', '저녁', '주말'],
            datasets: [{
                data: [8, 12, 15, 5],
                backgroundColor: ['#FF6B35', '#4CAF50', '#2C5AA0', '#9C27B0']
            }]
        },
        options: {
            responsive: true
        }
    });
}

// 레벨 관리 초기화
function initLevelManagement() {
    document.getElementById('add-level-btn').addEventListener('click', showAddLevelModal);
    loadLevels();
}

// 레벨 목록 로드
function loadLevels() {
    // 실제 구현 시 서버에서 레벨 데이터 가져오기
    const levelsContainer = document.querySelector('.levels-list');
    levelsContainer.innerHTML = `
        <div class="level-card">
            <h4>First Discoveries (Pre-A1)</h4>
            <p>영어 입문 과정 - 영어를 처음 배우는 학습자를 위한 기초 과정</p>
            <div class="level-stats">
                <div class="level-stat">
                    <div class="number">8/15</div>
                    <div class="label">정원</div>
                </div>
                <div class="level-stat">
                    <div class="number">₩300,000</div>
                    <div class="label">수강료</div>
                </div>
            </div>
            <div class="level-actions">
                <button class="btn-primary btn-sm">수정</button>
                <button class="btn-secondary btn-sm">통계</button>
            </div>
        </div>
        
        <div class="level-card">
            <h4>Basic 1 (A1)</h4>
            <p>기초 회화 과정 - 일상 생활 기초 표현 학습</p>
            <div class="level-stats">
                <div class="level-stat">
                    <div class="number">12/15</div>
                    <div class="label">정원</div>
                </div>
                <div class="level-stat">
                    <div class="number">₩350,000</div>
                    <div class="label">수강료</div>
                </div>
            </div>
            <div class="level-actions">
                <button class="btn-primary btn-sm">수정</button>
                <button class="btn-secondary btn-sm">통계</button>
            </div>
        </div>
        
        <div class="level-card">
            <h4>Intermediate 2 (B1)</h4>
            <p>실용 영어 과정 - 사회적, 직업적 상황에서 효과적인 의사소통</p>
            <div class="level-stats">
                <div class="level-stat">
                    <div class="number">10/12</div>
                    <div class="label">정원</div>
                </div>
                <div class="level-stat">
                    <div class="number">₩450,000</div>
                    <div class="label">수강료</div>
                </div>
            </div>
            <div class="level-actions">
                <button class="btn-primary btn-sm">수정</button>
                <button class="btn-secondary btn-sm">통계</button>
            </div>
        </div>
    `;
}

// 레벨 추가 모달 표시
function showAddLevelModal() {
    document.getElementById('level-modal-title').textContent = '새 레벨 추가';
    document.getElementById('level-form').reset();
    document.getElementById('level-modal').classList.add('active');
}

// 설정 초기화
function initSettings() {
    setupSettingsTabs();
}

// 설정 탭 설정
function setupSettingsTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 모든 탭 버튼과 콘텐츠 비활성화
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // 현재 탭 활성화
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 모달 이벤트 설정
function setupModalEvents() {
    // 모달 닫기
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // 모달 외부 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if(e.target === this) {
                closeAllModals();
            }
        });
    });
}

// 모든 모달 닫기
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// 폼 제출 이벤트 설정
function setupFormEvents() {
    // 레벨 폼
    document.getElementById('level-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // 실제 구현 시 서버에 레벨 저장
        alert('레벨이 저장되었습니다.');
        closeAllModals();
        loadLevels();
    });
    
    // 일반 설정 폼
    document.getElementById('general-settings').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('설정이 저장되었습니다.');
    });
    
    // 알림 설정 폼
    document.getElementById('notification-settings').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('알림 설정이 저장되었습니다.');
    });
    
    // 데이터 백업
    document.getElementById('backup-now').addEventListener('click', function() {
        alert('데이터 백업이 완료되었습니다.');
    });
    
    // 데이터 가져오기
    document.getElementById('import-data').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    if(confirm(`${data.length}개의 데이터를 가져오시겠습니까?`)) {
                        applications = data;
                        refreshApplicationsTable();
                        updateDashboardStats();
                        alert('데이터 가져오기가 완료되었습니다.');
                    }
                } catch(err) {
                    alert('파일 형식이 올바르지 않습니다.');
                }
            };
            reader.readAsText(file);
        }
    });
}
