if (typeof new_name !== 'undefined' && new_name.length > 0) {
    sample_list = new_name;
}

// 현재 로드된 히트맵 데이터를 저장하기 위한 전역 변수
var currentLoadedHeatmapData = null;

function load_json(src, dataKey) {
    var head = document.getElementsByTagName('head')[0];
    var element = head.getElementsByClassName("json")[0];

    try {
        if (element) { // 요소가 존재할 경우에만 제거 시도
            element.parentNode.removeChild(element);
        }
    } catch (e) {
        // Do nothing
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.className = "json";
    script.async = false;
    head.appendChild(script);
    const value = document.querySelector("#current_page");
    if (value) { // value 요소가 존재하는지 확인
        value.textContent = "Taxonomy Heatmap plot (" + dataKey + ")";
    }

    script.onload = function () {
        let heatmapData;
        switch (dataKey) {
            case 'Phylum':
                heatmapData = typeof L2_Heatmap !== 'undefined' ? L2_Heatmap : null;
                break;
            case 'Class':
                heatmapData = typeof L3_Heatmap !== 'undefined' ? L3_Heatmap : null;
                break;
            case 'Order':
                heatmapData = typeof L4_Heatmap !== 'undefined' ? L4_Heatmap : null;
                break;
            case 'Family':
                heatmapData = typeof L5_Heatmap !== 'undefined' ? L5_Heatmap : null;
                break;
            case 'Genus':
                heatmapData = typeof L6_Heatmap !== 'undefined' ? L6_Heatmap : null;
                break;
            case 'Species':
                heatmapData = typeof L7_Heatmap !== 'undefined' ? L7_Heatmap : null;
                break;
            default:
                console.error("Unknown dataKey: " + dataKey);
                return;
        }

        if (!heatmapData) {
            console.error("Heatmap data for " + dataKey + " is not loaded or undefined.");
            return;
        }

        // Heatmap 데이터에 feature_names가 없는 경우, main.js의 sample_list로 설정
        if (heatmapData.data && !heatmapData.data.feature_names && window.sample_list) {
            // InCHlib이 feature_names를 내부적으로 사용할 수 있으므로,
            // 데이터 파일에 없다면 sample_list로 채워줍니다.
            // sample_list의 각 항목이 features 배열의 각 요소와 순서대로 매칭된다고 가정합니다.
            // 또한, node.features 배열의 길이가 sample_list의 길이와 같아야 합니다.
            if (heatmapData.data.nodes) {
                const firstNodeKey = Object.keys(heatmapData.data.nodes)[0];
                if (firstNodeKey && heatmapData.data.nodes[firstNodeKey].features &&
                    heatmapData.data.nodes[firstNodeKey].features.length === window.sample_list.length) {
                    heatmapData.data.feature_names = [...window.sample_list]; // 복사본 사용
                } else {
                    console.warn(`Length of features array in the first node does not match sample_list length for ${dataKey}. feature_names might be incorrect or InCHlib might fail.`);
                    // sample_list 길이가 더 길거나 짧을 때의 처리 (예: 에러 발생 또는 일부만 사용)
                    // 여기서는 일단 sample_list를 할당 시도. InCHlib이 어떻게 처리할지는 라이브러리 스펙에 따름.
                    heatmapData.data.feature_names = [...window.sample_list];
                }
            } else {
                 heatmapData.data.feature_names = [...window.sample_list];
            }
        } else if (heatmapData.data && heatmapData.data.feature_names && window.sample_list &&
                   heatmapData.data.feature_names.length !== window.sample_list.length) {
            console.warn(`Length of feature_names in data file (${heatmapData.data.feature_names.length}) does not match sample_list length (${window.sample_list.length}) for ${dataKey}. Using feature_names from data file.`);
            // 이 경우, 데이터 파일의 feature_names를 우선적으로 사용하고, sample_list는 runinchlib의 heatmap_header에서만 사용될 것입니다.
            // InCHlib이 두 정보가 다를 때 어떻게 동작하는지 확인 필요. 일반적으로 일치해야 함.
        }


        // 현재 로드된 데이터를 전역 변수에 저장 (슬라이더용)
        currentLoadedHeatmapData = heatmapData;

        setwidth(); // 너비 설정은 sample_list 기준이므로 heatmapData 전달 불필요
        runinchlib(heatmapData); // 그룹 평균 계산 없이 원본 데이터 직접 사용
    };

    script.onerror = function() {
        console.error("Failed to load script: " + src);
        // 필요한 경우 사용자에게 알림 추가
    };
}

function setwidth() {
    var default_set = 1150; // 히트맵 영역의 기본 너비
    const input = document.querySelector("#bandwitdh");

    // window.sample_list가 정의되어 있고 배열인지, 비어있지 않은지 확인
    if (window.sample_list && Array.isArray(window.sample_list) && window.sample_list.length > 0) {
        const sampleList = window.sample_list;
        let default_value = default_set / sampleList.length;
        if (default_value < 20) { // 최소 셀 너비
            default_value = 20;
        }
        if (default_value > 150) { // 최대 셀 너비 (슬라이더의 max 값과 일치시키는 것이 좋음)
            default_value = 150;
        }
        if (input) { // input 요소가 존재하는지 확인
            input.value = default_value;
        }
    } else {
        console.warn("sample_list is not available or empty. Cannot set default cell width.");
        if (input) {
            input.value = 20; // sample_list가 없을 경우 기본값 설정
        }
    }
}

// 아래 두 개의 calculateGroupAverages 함수는 이 파일(개별 샘플 히트맵용)에서는
// 직접적으로 호출되지 않는 것으로 보입니다. 그룹 히트맵(Taxonomy_heatmap_tool_db_Group.html)에서
// 사용하는 plot_group.js의 함수와 혼동될 수 있으므로, 필요 없다면 제거하거나 주석 처리하는 것이 좋습니다.
// 여기서는 원본 스크립트 구조를 최대한 유지하기 위해 그대로 둡니다.

function calculateGroupAverages_v1(data, sampleList) { // 이름 변경하여 구분
    const groupAverages = {};

    sampleList.forEach(group => {
        if (!groupAverages[group]) {
            // 이 로직은 sampleList가 그룹 이름 리스트일 때 의미가 있습니다.
            // 현재 개별 히트맵에서는 sampleList는 샘플 이름 리스트입니다.
            groupAverages[group] = { features: Array(sampleList.length).fill(0), count: 0 };
        }
    });

    Object.entries(data.data.nodes).forEach(([key, value]) => {
        value.features.forEach((feature, index) => {
            const group = sampleList[index]; // sampleList[index]는 샘플 이름이지 그룹 이름이 아님
            if (group !== undefined) {
                // groupAverages[group] (샘플 이름 키)에 대한 로직 수정 필요
                // 이 함수는 현재 개별 히트맵 컨텍스트에서는 올바르게 동작하지 않을 가능성이 높습니다.
                if (groupAverages[group]) { // groupAverages에 해당 샘플 이름 키가 있는지 확인
                    groupAverages[group].features[index] += feature; // 이 부분도 로직 재검토 필요
                    groupAverages[group].count += 1;
                }
            }
        });
    });

    Object.keys(groupAverages).forEach(group => {
        if (groupAverages[group].count > 0) { // count로 나누기 전에 0인지 확인
            groupAverages[group].features = groupAverages[group].features.map(value => value / groupAverages[group].count);
        }
    });

    const newNodes = {};
    let nodeId = 0;
    Object.entries(groupAverages).forEach(([group, dataValue]) => { // data -> dataValue로 변경 (파라미터 data와 혼동 방지)
        newNodes[nodeId] = { count: 1, objects: [group.toString()], features: dataValue.features };
        nodeId++;
    });

    return {
        data: {
            nodes: newNodes,
            feature_names: sampleList
        }
    };
}


function calculateGroupAverages_v2(data, groupList) { // 이름 변경하여 구분
    const groupAverages = {};
    const featureLength = (data.data.feature_names || window.sample_list || []).length;


    groupList.forEach(group => {
        if (group === undefined || group === null) return; // 그룹 이름이 유효하지 않으면 건너뜀
        if (!groupAverages[group]) {
            groupAverages[group] = { sum_features: Array(featureLength).fill(0), counts_per_feature: Array(featureLength).fill(0), total_samples_in_group: 0 };
        }
    });


    // 이 함수는 그룹 평균 히트맵에서 사용될 로직과 유사합니다.
    // data.data.nodes의 각 taxon에 대해, groupList에 따라 feature들의 평균을 계산해야 합니다.
    // 현재 제공된 함수는 로직이 불완전하거나, 개별 히트맵의 컨텍스트와 맞지 않아 보입니다.
    // 그룹핑 로직은 plot_group.js에서 더 정교하게 다루었습니다.
    // 여기서는 이 함수를 호출하지 않으므로, 상세 수정은 생략합니다.

    // 임시 반환 (원래 로직이 불완전하여 단순화)
    const tempNodes = {};
    let tempNodeId = 0;
    Object.keys(groupAverages).forEach(group => {
        tempNodes[tempNodeId++] = {
            count: 1,
            objects: [group.toString()],
            features: groupAverages[group].sum_features // 실제 평균 계산 로직 필요
        };
    });


    return {
        data: {
            nodes: tempNodes,
            feature_names: Object.keys(groupAverages).map(name => name.toString()).filter(name => name !== undefined)
        }
    };
}


function find_max_word(data) {
    let max_word = 0; // 변수 선언 시 let 또는 const 사용 권장
    if (data && data.data && data.data.nodes) {
        for (const [key, value] of Object.entries(data.data.nodes)) {
            if (value.objects && value.objects[0] && value.objects[0].length > max_word) {
                max_word = value.objects[0].length;
            }
        }
    }
    return max_word * 8 + 150; // 글자당 너비와 여백은 경험적으로 조절
}

function runinchlib(file, color_ = ["WhYlRdBk", "BuPu"], new_draw = true) {
    var readJson = file;
    var max_cell_width = getwidth(); // 셀의 최대 너비
    var taxon_label_width = find_max_word(readJson); // 분류군 이름 표시에 필요한 너비

    // window.sample_list가 유효한지 확인
    const sampleList = (window.sample_list && Array.isArray(window.sample_list)) ? window.sample_list : [];
    
    // 컬럼(샘플) 수: 데이터 파일의 feature_names 길이를 우선 사용, 없으면 sample_list 길이 사용
    // 또는, 첫 번째 노드의 features 배열 길이로도 추정 가능
    let numberOfColumns = 0;
    if (readJson.data && readJson.data.feature_names && Array.isArray(readJson.data.feature_names)) {
        numberOfColumns = readJson.data.feature_names.length;
    } else if (sampleList.length > 0) {
        numberOfColumns = sampleList.length;
    } else if (readJson.data && readJson.data.nodes) {
        const firstNodeKey = Object.keys(readJson.data.nodes)[0];
        if (firstNodeKey && readJson.data.nodes[firstNodeKey].features) {
            numberOfColumns = readJson.data.nodes[firstNodeKey].features.length;
        }
    }

    if (numberOfColumns === 0) {
        console.warn("Number of columns for heatmap is zero. Width calculation might be incorrect.");
        // InCHlib에서 오류 발생 가능성 있음
    }

    var width = (numberOfColumns * max_cell_width) + taxon_label_width;
    var meta_data = readJson.hasOwnProperty('column_metadata'); // 열 메타데이터 사용 여부

    if (new_draw) {
        $(document).ready(function () {
            $("#inchlib").empty(); // 이전 인스턴스 제거
            window.inchlib = new InCHlib({
                target: "inchlib",
                column_metadata: meta_data,
                max_column_width: max_cell_width,
                width: width,
                heatmap_colors: color_[0],
                column_metadata_colors: color_[1], // column_metadata가 true일 때 사용
                metadata_colors: "Reds",           // row metadata 색상 (사용한다면)
                heatmap_header: sampleList         // X축 레이블은 항상 main.js의 sample_list 사용
            });

            inchlib.read_data(readJson); // read_data_from_file 대신 read_data 사용 가능 (JSON 객체 직접 전달)
            inchlib.draw();
        });
    } else { // 기존 히트맵 업데이트 (예: 셀 너비 변경)
        if (window.inchlib) { // inchlib 인스턴스가 존재하는지 확인
            inchlib.settings.max_column_width = max_cell_width;
            inchlib.settings.width = width;
            inchlib.settings.heatmap_colors = color_[0];
            if (meta_data) { // column_metadata가 있는 경우에만 설정
                 inchlib.settings.column_metadata_colors = color_[1];
            }
            inchlib.settings.heatmap_header = sampleList; // 헤더도 업데이트

            // InCHlib에서 너비 변경 후 다시 그리는 가장 확실한 방법은 read_data 후 draw 하는 것일 수 있음
            // 또는 라이브러리가 제공하는 특정 redraw 메소드가 있다면 사용
            inchlib.read_data(readJson); // 현재 데이터(file)로 다시 로드
            inchlib.draw(); // 다시 그리기
        }
    }
    // return readJson; // 이 값은 load_json에서 사용되지 않음
}

function getcolor() {
    if (window.inchlib && window.inchlib.settings) {
        return [window.inchlib.settings.heatmap_colors, window.inchlib.settings.column_metadata_colors];
    }
    return ["WhYlRdBk", "BuPu"]; // 기본값
}

function getwidth() {
    const input = document.querySelector("#bandwitdh");
    return input ? Number(input.value) : 20; // input 없으면 기본 너비 반환
}

function downloadimg() { // 파라미터 type은 현재 사용되지 않음 (InCHlib 기본 저장 방식 따름)
    if (window.inchlib) {
        inchlib._export_icon_click(); // InCHlib의 내장 저장 기능 호출
    }
}

function click_color() {
    if (window.inchlib) {
        inchlib._color_scale_click(); // InCHlib의 색상 스케일 변경 기능 호출
    }
}

function click_filter() {
    if (window.inchlib) {
        inchlib._filter_icon_click(); // InCHlib의 필터 기능 호출
    }
}

var buttonClicked = null;
function highlight(element) {
    if (buttonClicked != null) {
        buttonClicked.style.background = "#ffffff";
        buttonClicked.style.color = "#bbbbbb";
        // buttonClicked.classList.remove('highlighted'); // CSS 클래스 방식 사용 시
    }
    buttonClicked = element;
    buttonClicked.style.background = "linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%)";
    buttonClicked.style.color = "#333333";
    // buttonClicked.classList.add('highlighted'); // CSS 클래스 방식 사용 시
}

// 슬라이더 이벤트 리스너
const bandwidthSlider = document.querySelector("#bandwitdh"); // 변수명 변경 (input -> bandwidthSlider)
if (bandwidthSlider) { // 슬라이더가 존재하는지 확인
    bandwidthSlider.addEventListener("input", (event) => {
        if (currentLoadedHeatmapData && window.inchlib) { // 현재 로드된 데이터와 inchlib 인스턴스가 모두 있어야 함
            // runinchlib를 호출하여 현재 데이터를 기준으로 히트맵을 다시 그림 (new_draw = false)
            // getcolor()는 현재 inchlib 인스턴스의 색상 설정을 가져옴
            runinchlib(currentLoadedHeatmapData, getcolor(), false);
        } else {
            // console.warn("Slider changed, but no current heatmap data or InCHlib instance to redraw.");
            // 이 경우, 기본 데이터로 다시 그리거나 아무 작업도 안 할 수 있음
            // 예: L2_Heatmap이 항상 사용 가능하다고 가정하고 다시 그리기 (이전 로직)
            // if (typeof L2_Heatmap !== 'undefined') {
            //    runinchlib(L2_Heatmap, getcolor(), false);
            // }
        }
    });
}
