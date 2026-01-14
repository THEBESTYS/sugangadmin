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
    
    // 내보내기 버튼 설정 추가
    setupExportButtons();
    
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

// 내보내기 버튼 설정 함수
function setupExportButtons() {
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        // 기존 이벤트 제거하고 새로 등록
        const newExportBtn = exportBtn.cloneNode(true);
        exportBtn.parentNode.replaceChild(newExportBtn, exportBtn);
        
        // 새 이벤트 등록
        document.getElementById('export-btn').addEventListener('click', showExportOptions);
    }
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
        type: 'doughnut',
        data: {
            labels: ['초급 과정', '중급 과정', '고급 과정', '미정'],
            datasets: [{
                data: [
                    levelCounts['beginner'] || 0,
                    levelCounts['intermediate'] || 0,
                    levelCounts['advanced'] || 0,
                    levelCounts['unknown'] || 0
                ],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#9C27B0',
                    '#FF6B35'
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
    
    // 일별 신청 추이 차트 (최근 7일)
    const last7Days = getLast7Days();
    const dailyCounts = {};
    last7Days.forEach(day => dailyCounts[day] = 0);
    
    applications.forEach(app => {
        const appDate = app.appliedAt;
        if (dailyCounts[appDate] !== undefined) {
            dailyCounts[appDate]++;
        }
    });
    
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: '신청 수',
                data: last7Days.map(day => dailyCounts[day]),
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

// 최근 7일 날짜 배열 생성
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// 레벨 그룹 가져오기
function getLevelGroup(level) {
    if (!level) return 'unknown';
    if(level.includes('basic') || level.includes('first-discoveries')) {
        return 'beginner';
    } else if(level.includes('intermediate')) {
        return 'intermediate';
    } else if(level.includes('advanced')) {
        return 'advanced';
    } else if(level === 'test-needed') {
        return 'unknown';
    }
    return 'unknown';
}

// 최근 신청내역 로드
function loadRecentApplications() {
    const tableBody = document.querySelector('#recent-applications-table tbody');
    if (!tableBody) return;
    
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
    const filterStatus = document.getElementById('filter-status');
    const filterLevel = document.getElementById('filter-level');
    const searchName = document.getElementById('search-name');
    const searchBtn = document.getElementById('search-btn');
    
    if (!filterStatus || !filterLevel || !searchName || !searchBtn) return;
    
    filterStatus.addEventListener('change', function() {
        currentFilter = this.value;
        currentPage = 1;
        refreshApplicationsTable();
    });
    
    filterLevel.addEventListener('change', function() {
        currentLevelFilter = this.value;
        currentPage = 1;
        refreshApplicationsTable();
    });
    
    searchName.addEventListener('input', function() {
        currentSearch = this.value;
        currentPage = 1;
        refreshApplicationsTable();
    });
    
    searchBtn.addEventListener('click', function() {
        refreshApplicationsTable();
    });
}

// 액션 설정
function setupApplicationActions() {
    // 전체 선택 체크박스
    const selectAll = document.getElementById('select-all');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#applications-table tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                toggleApplicationSelection(checkbox);
            });
        });
    }
    
    // 일괄 처리
    const applyBatch = document.getElementById('apply-batch');
    if (applyBatch) {
        applyBatch.addEventListener('click', function() {
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
            
            // 로컬 스토리지에 저장
            saveApplicationsToLocalStorage(applications);
            
            // 테이블 새로고침
            refreshApplicationsTable();
            updateDashboardStats();
            document.getElementById('batch-action').value = '';
        });
    }
}

// CSV 형식으로 내보내기
function exportToCSV() {
    if (applications.length === 0) {
        alert('내보낼 데이터가 없습니다.');
        return;
    }
    
    // 필터링된 데이터 가져오기
    let filteredApps = filterApplications();
    
    // CSV 헤더 정의
    const headers = [
        '번호', '이름', '생년월일', '연락처', '이메일',
        '영어실력', '희망레벨', '희망시간대', '추가옵션',
        '문의사항', '상태', '신청일'
    ];
    
    // CSV 데이터 생성
    let csvContent = headers.join(',') + '\n';
    
    filteredApps.forEach(app => {
        const row = [
            app.id,
            `"${app.name}"`, // 이름에 쉼표가 있을 수 있어서 쿼테이션 추가
            app.birth,
            `"${app.phone}"`,
            `"${app.email}"`,
            getEnglishLevelText(app.englishLevel).replace(/"/g, '""'), // 쿼테이션 이스케이프
            `"${levelInfo[app.courseLevel] || app.courseLevel}"`,
            `"${scheduleInfo[app.schedule] || app.schedule}"`,
            `"${getOptionsText(app.options)}"`,
            app.message ? `"${app.message.replace(/"/g, '""')}"` : '""', // 메시지 내 쿼테이션 처리
            getStatusText(app.status),
            app.appliedAt
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // 파일 다운로드
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `수강신청_내역_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert(`CSV 파일이 다운로드되었습니다. (총 ${filteredApps.length}건)`);
}

// Excel 형식으로 내보내기 (SheetJS 라이브러리 사용)
function exportToExcel() {
    if (applications.length === 0) {
        alert('내보낼 데이터가 없습니다.');
        return;
    }
    
    // SheetJS 라이브러리 로드 확인
    if (typeof XLSX === 'undefined') {
        if (confirm('Excel 내보내기 기능을 사용하려면 SheetJS 라이브러리가 필요합니다. 지금 로드하시겠습니까?')) {
            loadSheetJS();
            return;
        }
        return;
    }
    
    // 필터링된 데이터 가져오기
    let filteredApps = filterApplications();
    
    // 워크시트 데이터 생성
    const worksheetData = [
        // 헤더 행
        [
            '번호', '이름', '생년월일', '연락처', '이메일',
            '영어실력', '희망레벨', '희망시간대', '추가옵션',
            '문의사항', '상태', '신청일'
        ],
        // 데이터 행들
        ...filteredApps.map(app => [
            app.id,
            app.name,
            app.birth,
            app.phone,
            app.email,
            getEnglishLevelText(app.englishLevel),
            levelInfo[app.courseLevel] || app.courseLevel,
            scheduleInfo[app.schedule] || app.schedule,
            getOptionsText(app.options),
            app.message || '',
            getStatusText(app.status),
            app.appliedAt
        ])
    ];
    
    // 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // 열 너비 설정
    const colWidths = [
        { wch: 8 },  // 번호
        { wch: 10 }, // 이름
        { wch: 12 }, // 생년월일
        { wch: 15 }, // 연락처
        { wch: 25 }, // 이메일
        { wch: 15 }, // 영어실력
        { wch: 20 }, // 희망레벨
        { wch: 20 }, // 희망시간대
        { wch: 25 }, // 추가옵션
        { wch: 30 }, // 문의사항
        { wch: 10 }, // 상태
        { wch: 12 }  // 신청일
    ];
    worksheet['!cols'] = colWidths;
    
    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '수강신청내역');
    
    // 파일 다운로드
    XLSX.writeFile(workbook, `수강신청_내역_${new Date().toISOString().slice(0,10)}.xlsx`);
    
    alert(`Excel 파일이 다운로드되었습니다. (총 ${filteredApps.length}건)`);
}

// SheetJS 라이브러리 동적 로드
function loadSheetJS() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = function() {
        alert('SheetJS 라이브러리가 로드되었습니다. 다시 시도해주세요.');
    };
    script.onerror = function() {
        alert('라이브러리 로드에 실패했습니다. CSV로 내보내기를 사용해주세요.');
    };
    document.head.appendChild(script);
}

// 통계 데이터 Excel로 내보내기
function exportStatisticsToExcel() {
    if (applications.length === 0) {
        alert('통계 데이터가 없습니다.');
        return;
    }
    
    // SheetJS 라이브러리 로드 확인
    if (typeof XLSX === 'undefined') {
        if (confirm('Excel 내보내기 기능을 사용하려면 SheetJS 라이브러리가 필요합니다. 지금 로드하시겠습니까?')) {
            loadSheetJS();
            return;
        }
        return;
    }
    
    // 통계 데이터 계산
    const stats = calculateStatistics();
    
    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    
    // 1. 요약 시트
    const summaryData = [
        ['수강신청 통계 요약', '', '', ''],
        ['생성일', new Date().toLocaleDateString('ko-KR'), '', ''],
        ['', '', '', ''],
        ['구분', '건수', '비율', '비고'],
        ['총 신청건수', stats.total, '100%', ''],
        ['대기 중', stats.pending, ((stats.pending / stats.total) * 100).toFixed(1) + '%', ''],
        ['확정', stats.confirmed, ((stats.confirmed / stats.total) * 100).toFixed(1) + '%', ''],
        ['취소', stats.canceled, ((stats.canceled / stats.total) * 100).toFixed(1) + '%', ''],
        ['', '', '', ''],
        ['레벨별 현황', '', '', ''],
        ['초급 과정', stats.levelCounts.beginner || 0, '', ''],
        ['중급 과정', stats.levelCounts.intermediate || 0, '', ''],
        ['고급 과정', stats.levelCounts.advanced || 0, '', ''],
        ['미정', stats.levelCounts.unknown || 0, '', ''],
        ['', '', '', ''],
        ['시간대별 현황', '', '', ''],
        ['오전반', stats.timeCounts.morning || 0, '', ''],
        ['오후반', stats.timeCounts.afternoon || 0, '', ''],
        ['저녁반', stats.timeCounts.evening || 0, '', ''],
        ['주말반', stats.timeCounts.weekend || 0, '', '']
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, '통계요약');
    
    // 2. 상세 내역 시트
    const detailData = [
        ['번호', '이름', '생년월일', '연락처', '이메일', '영어실력', '희망레벨', '희망시간대', '상태', '신청일']
    ];
    
    applications.forEach(app => {
        detailData.push([
            app.id,
            app.name,
            app.birth,
            app.phone,
            app.email,
            getEnglishLevelText(app.englishLevel),
            levelInfo[app.courseLevel] || app.courseLevel,
            scheduleInfo[app.schedule] || app.schedule,
            getStatusText(app.status),
            app.appliedAt
        ]);
    });
    
    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
    detailSheet['!cols'] = [
        { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 15 },
        { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
        { wch: 10 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, detailSheet, '상세내역');
    
    // 3. 레벨별 분석 시트
    const levelAnalysisData = [
        ['레벨', '신청자수', '확정자수', '확정율', '대기자수', '취소자수']
    ];
    
    // 레벨별 통계 계산
    const levelStats = {};
    applications.forEach(app => {
        const level = app.courseLevel || '미정';
        if (!levelStats[level]) {
            levelStats[level] = { total: 0, confirmed: 0, pending: 0, canceled: 0 };
        }
        levelStats[level].total++;
        levelStats[level][app.status]++;
    });
    
    Object.keys(levelStats).forEach(level => {
        const stats = levelStats[level];
        const confirmationRate = stats.total > 0 ? 
            ((stats.confirmed / stats.total) * 100).toFixed(1) + '%' : '0%';
        
        levelAnalysisData.push([
            levelInfo[level] || level,
            stats.total,
            stats.confirmed,
            confirmationRate,
            stats.pending,
            stats.canceled
        ]);
    });
    
    const levelSheet = XLSX.utils.aoa_to_sheet(levelAnalysisData);
    levelSheet['!cols'] = [
        { wch: 25 }, { wch: 12 }, { wch: 12 }, 
        { wch: 12 }, { wch: 12 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, levelSheet, '레벨별분석');
    
    // 파일 다운로드
    XLSX.writeFile(workbook, `수강신청_통계_${new Date().toISOString().slice(0,10)}.xlsx`);
    
    alert('통계 Excel 파일이 다운로드되었습니다. (3개 시트 포함)');
}

// 통계 데이터 계산
function calculateStatistics() {
    const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        confirmed: applications.filter(app => app.status === 'confirmed').length,
        canceled: applications.filter(app => app.status === 'canceled').length,
        levelCounts: {},
        timeCounts: {}
    };
    
    // 레벨별 카운트
    applications.forEach(app => {
        const levelGroup = getLevelGroup(app.courseLevel);
        stats.levelCounts[levelGroup] = (stats.levelCounts[levelGroup] || 0) + 1;
    });
    
    // 시간대별 카운트
    applications.forEach(app => {
        stats.timeCounts[app.schedule] = (stats.timeCounts[app.schedule] || 0) + 1;
    });
    
    return stats;
}

// 내보내기 옵션 모달 표시
function showExportOptions() {
    const modalContent = `
        <div class="modal-header">
            <h3>데이터 내보내기 옵션</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="export-options">
                <div class="export-option" onclick="exportToCSV()">
                    <div class="export-icon">
                        <i class="fas fa-file-csv"></i>
                    </div>
                    <div class="export-info">
                        <h4>CSV 파일로 내보내기</h4>
                        <p>엑셀, 구글시트 등에서 열 수 있는 일반 텍스트 형식</p>
                    </div>
                </div>
                
                <div class="export-option" onclick="exportToExcel()">
                    <div class="export-icon">
                        <i class="fas fa-file-excel"></i>
                    </div>
                    <div class="export-info">
                        <h4>Excel 파일로 내보내기</h4>
                        <p>포맷이 유지되는 MS Excel 형식 (.xlsx)</p>
                    </div>
                </div>
                
                <div class="export-option" onclick="exportStatisticsToExcel()">
                    <div class="export-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="export-info">
                        <h4>통계 보고서 내보내기</h4>
                        <p>요약, 상세내역, 레벨별 분석이 포함된 Excel 파일</p>
                    </div>
                </div>
                
                <div class="export-option" onclick="exportApplications()">
                    <div class="export-icon">
                        <i class="fas fa-file-code"></i>
                    </div>
                    <div class="export-info">
                        <h4>JSON 형식으로 내보내기</h4>
                        <p>원본 데이터 백업 또는 다른 시스템으로 가져오기용</p>
                    </div>
                </div>
            </div>
            
            <div class="export-notice">
                <p><i class="fas fa-info-circle"></i> 현재 필터 적용 상태: 
                    <strong>${filterApplications().length}건</strong>의 데이터가 내보내어집니다.</p>
                <p><i class="fas fa-lightbulb"></i> 전체 데이터를 내보내려면 필터를 '전체 상태', '전체 레벨'로 설정하세요.</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary close-modal">닫기</button>
        </div>
    `;
    
    // 모달 생성
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'export-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            ${modalContent}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 모달 닫기 이벤트
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
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

// 수강신청 테이블 새로고침
function refreshApplicationsTable() {
    const tableBody = document.querySelector('#applications-table tbody');
    if (!tableBody) return;
    
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
        if(currentSearch && !app.name.toLowerCase().includes(currentSearch.toLowerCase())) {
            return false;
        }
        
        return true;
    });
}

// 페이지네이션 업데이트
function updatePagination(totalPages) {
    const pageNumbers = document.querySelector('.page-numbers');
    if (!pageNumbers) return;
    
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
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    
    if (prevPage) {
        prevPage.addEventListener('click', function() {
            if(currentPage > 1) {
                currentPage--;
                refreshApplicationsTable();
            }
        });
    }
    
    if (nextPage) {
        nextPage.addEventListener('click', function() {
            if(currentPage < totalPages) {
                currentPage++;
                refreshApplicationsTable();
            }
        });
    }
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
    if (!modalBody) return;
    
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
            
            ${app.message ? `
            <div class="detail-section">
                <h4>문의사항</h4>
                <div class="detail-message">${app.message}</div>
            </div>
            ` : ''}
        </div>
    `;
    
    // 모달 제어 버튼 이벤트
    const confirmBtn = document.getElementById('confirm-application');
    const cancelBtn = document.getElementById('cancel-application');
    
    if (confirmBtn) {
        confirmBtn.onclick = () => updateApplicationStatus(id, 'confirmed');
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = () => updateApplicationStatus(id, 'canceled');
    }
    
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
        // 로컬 스토리지에 저장
        saveApplicationsToLocalStorage(applications);
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
        // 로컬 스토리지에 저장
        saveApplicationsToLocalStorage(applications);
        refreshApplicationsTable();
        updateDashboardStats();
        alert('삭제되었습니다.');
    }
}

// 통계 초기화
function initStatistics() {
    const statPeriod = document.getElementById('stat-period');
    if (statPeriod) {
        statPeriod.addEventListener('change', updateStatistics);
    }
}

// 통계 업데이트
function updateStatistics() {
    // 실제 구현 시 기간별 데이터 필터링 및 차트 업데이트
    const period = document.getElementById('stat-period').value;
    
    // 차트 생성 (예시)
    createStatisticsCharts(period);
}

// 통계 차트 생성
function createStatisticsCharts(period = 'month') {
    // 전체 신청 추이 차트
    const overviewCtx = document.getElementById('overviewChart');
    if (overviewCtx) {
        const overviewChart = new Chart(overviewCtx.getContext('2d'), {
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
    }
    
    // 레벨 분포 차트
    const levelDistCtx = document.getElementById('levelDistributionChart');
    if (levelDistCtx) {
        const levelDistributionChart = new Chart(levelDistCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['초급', '중급', '고급', '미정'],
                datasets: [{
                    label: '신청자 수',
                    data: [15, 10, 5, 3],
                    backgroundColor: ['#4CAF50', '#2196F3', '#9C27B0', '#FF6B35']
                }]
            },
            options: {
                responsive: true
            }
        });
    }
    
    // 시간대 선호도 차트
    const timePrefCtx = document.getElementById('timePreferenceChart');
    if (timePrefCtx) {
        const timePreferenceChart = new Chart(timePrefCtx.getContext('2d'), {
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
}

// 레벨 관리 초기화
function initLevelManagement() {
    const addLevelBtn = document.getElementById('add-level-btn');
    if (addLevelBtn) {
        addLevelBtn.addEventListener('click', showAddLevelModal);
    }
    loadLevels();
}

// 레벨 목록 로드
function loadLevels() {
    const levelsContainer = document.querySelector('.levels-list');
    if (!levelsContainer) return;
    
    levelsContainer.innerHTML = `
        <div class="level-card">
            <h4>First Discoveries (Pre-A1)</h4>
            <p>영어 입문 과정 - 영어를 처음 배우는 학습자를 위한 기초 과정</p>
            <div class="level-stats">
                <div class="level-stat">
                    <div class="number">${applications.filter(app => app.courseLevel === 'first-discoveries').length}/15</div>
                    <div class="label">신청/정원</div>
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
                    <div class="number">${applications.filter(app => app.courseLevel === 'basic-1').length}/15</div>
                    <div class="label">신청/정원</div>
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
                    <div class="number">${applications.filter(app => app.courseLevel === 'intermediate-2').length}/12</div>
                    <div class="label">신청/정원</div>
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
    const levelForm = document.getElementById('level-form');
    if (levelForm) {
        levelForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // 실제 구현 시 서버에 레벨 저장
            alert('레벨이 저장되었습니다.');
            closeAllModals();
            loadLevels();
        });
    }
    
    // 일반 설정 폼
    const generalSettings = document.getElementById('general-settings');
    if (generalSettings) {
        generalSettings.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('설정이 저장되었습니다.');
        });
    }
    
    // 알림 설정 폼
    const notificationSettings = document.getElementById('notification-settings');
    if (notificationSettings) {
        notificationSettings.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('알림 설정이 저장되었습니다.');
        });
    }
    
    // 데이터 백업
    const backupNow = document.getElementById('backup-now');
    if (backupNow) {
        backupNow.addEventListener('click', function() {
            alert('데이터 백업이 완료되었습니다.');
        });
    }
    
    // 데이터 가져오기
    const importData = document.getElementById('import-data');
    if (importData) {
        importData.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const data = JSON.parse(event.target.result);
                        if(confirm(`${data.length}개의 데이터를 가져오시겠습니까?`)) {
                            applications = data;
                            saveApplicationsToLocalStorage(applications);
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
    
    // 전체 데이터 내보내기
    const exportData = document.getElementById('export-data');
    if (exportData) {
        exportData.addEventListener('click', exportApplications);
    }
}
