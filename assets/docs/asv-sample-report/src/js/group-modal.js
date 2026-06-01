// ==================== MODAL MODULE SCRIPT ====================
// 다른 코드와의 충돌을 방지하고, DOM이 로드된 후 실행되도록 합니다.
document.addEventListener("DOMContentLoaded", function() {

    // --- 1. 모듈에서 사용하는 요소 가져오기 ---
    const floatingButton = document.querySelector('.floating-btn');
    const metadataModal = document.getElementById('metadataModal');
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    // 요소가 없으면 스크립트 실행 중단
    if (!floatingButton || !metadataModal || !fileInput) {
        console.warn("Modal module elements not found. The script will not run.");
        return;
    }

    // --- 2. 이벤트 리스너 설정 ---

    // Floating Button 클릭 시 모달 열기
    floatingButton.addEventListener('click', function() {
        $('#metadataModal').modal('show');
    });

    // 모달의 배경(backdrop) 클릭 시 모달 닫기
    metadataModal.addEventListener('click', function(event) {
        // 클릭된 대상이 모달 배경 자체일 경우에만 닫기
        if (event.target === metadataModal) {
            $('#metadataModal').modal('hide');
        }
    });

    // 파일 업로드 input 변경 시
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        fileNameDisplay.style.display = 'none';

        if (!file) {
            fileNameDisplay.innerHTML = '';
            return;
        }
        
        fileNameDisplay.style.display = 'flex';
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets['Group'];

                if (!sheet) {
                    throw new Error("'Group' sheet not found.");
                }

                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                if (rows.length < 2) {
                    throw new Error("'Group' sheet is empty.");
                }

                const dict = {};
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length < 2) continue;
                    const key = String(row[0] || '').trim();
                    const value = String(row[1] || '').trim();
                    if (key && value) {
                        dict[key] = value;
                    }
                }

                if (Object.keys(dict).length === 0) {
                    throw new Error("No valid data found in the sheet.");
                }

                fileNameDisplay.innerHTML = `<span class="file-icon"><i class="fa fa-check-circle"></i></span> <span class="file-name-text">Successfully loaded: ${file.name}</span>`;
                metadataModal.style.minHeight = '55vh';
                // =================================================================
                // ▼ 중요: 여기서부터 업로드된 데이터를 사용하는 커스텀 로직을 실행합니다. ▼
                // =================================================================
                
                // 1. 메인 페이지의 groupSelector 값을 'Custom'으로 변경
                const groupSelector = document.getElementById('groupSelector');
                if (groupSelector) {
                    groupSelector.value = 'Custom';
                }

                // 2. 메인 페이지의 그래프 업데이트 함수를 호출하여 변경사항 적용
                if (typeof updateGraphWithNewData === 'function') {
                    updateGraphWithNewData(dict);
                } else {
                    console.error('Error: updateGraphWithNewData function is not defined in the main page.');
                    alert('Error: Page update function not found.');
                }
                
                // =================================================================
                // ▲ 중요: 여기까지 커스텀 로직을 추가할 수 있습니다. ▲
                // =================================================================

            } catch (error) {
                fileNameDisplay.innerHTML = `<span class="file-icon" style="color:#c0392b;"><i class="fa fa-times-circle"></i></span> <span class="file-name-text" style="color:#c0392b;">Error: ${error.message}</span>`;
            }
        };

        reader.onerror = function() {
            fileNameDisplay.innerHTML = `<span class="file-icon" style="color:#c0392b;"><i class="fa fa-times-circle"></i></span> <span class="file-name-text" style="color:#c0392b;">Error: Could not read the file.</span>`;
        };

        reader.readAsArrayBuffer(file);
    });

    // ▼▼▼ [추가] 공통 그룹 선택자 감지 및 이벤트 처리 로직 ▼▼▼
    // 'custom-group-selector' 클래스를 가진 모든 드롭다운 메뉴를 선택합니다.
    const customGroupSelectors = document.querySelectorAll('.custom-group-selector');

    customGroupSelectors.forEach(selector => {
        selector.addEventListener('change', function() {
            // 드롭다운의 값이 'Custom'이고,
            // 파일 업로드 데이터(window.uploadedData)가 없을 때만 실행됩니다.
            if (this.value === 'Custom' && !window.uploadedData) {
                // 강조 함수를 호출합니다.
                if (typeof highlightFloatingButton === 'function') {
                    highlightFloatingButton(4000); // 4초 동안 강조
                }
            }
        });
    });
    // ▲▲▲ [추가] 공통 그룹 선택자 감지 및 이벤트 처리 로직 ▲▲▲
    if (group_count === 0 || (typeof group_name !== 'undefined' && Array.isArray(group_name) && group_name.length === 0)) {
        highlightFloatingButton(4000); // 4초 동안 강조
    }
});

/**
 * 플로팅 버튼을 일정 시간 동안 강조하는 함수.
 * @param {number} duration - 애니메이션 지속 시간 (밀리초 단위, 예: 3000ms = 3초).
 */
function highlightFloatingButton(duration = 3000) {
    const floatingButton = document.querySelector('.floating-btn');
    if (floatingButton) {
        // 이미 애니메이션이 실행 중이면 중복 실행 방지
        if (floatingButton.classList.contains('highlight-animation')) {
            return;
        }

        floatingButton.classList.add('highlight-animation');

        // 지정된 시간(duration) 후에 애니메이션 클래스 제거
        setTimeout(() => {
            floatingButton.classList.remove('highlight-animation');
        }, duration);
    }
}