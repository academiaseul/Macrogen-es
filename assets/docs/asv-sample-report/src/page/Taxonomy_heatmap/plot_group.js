var data; // 전역 변수로 설정하여 모든 함수에서 접근 가능

if (typeof new_name !== 'undefined' && new_name.length > 0) {
    sample_list = new_name;
}

// 전역 변수로 현재 히트맵의 원본 데이터 및 그룹 정보 저장
var currentRawHeatmapData = null;
var currentSelectedGroupList = null;
var currentUniqueGroupNames = null;

function load_json(src, dataKey) {
    var head = document.getElementsByTagName('head')[0];
    var element = head.getElementsByClassName("json")[0];

    try {
        if(element) element.parentNode.removeChild(element);
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
    if(value) value.textContent = "Taxonomy Heatmap plot (" + dataKey + ")";

    script.onload = function () {
        let heatmapData;
        // 변수명 에러(L2_data is not defined) 방지를 위해 L2_Heatmap 변수명 사용 및 예외처리 적용
        try {
            switch (dataKey) {
                case 'Phylum': heatmapData = typeof L2_Heatmap !== 'undefined' ? L2_Heatmap : null; break;
                case 'Class': heatmapData = typeof L3_Heatmap !== 'undefined' ? L3_Heatmap : null; break;
                case 'Order': heatmapData = typeof L4_Heatmap !== 'undefined' ? L4_Heatmap : null; break;
                case 'Family': heatmapData = typeof L5_Heatmap !== 'undefined' ? L5_Heatmap : null; break;
                case 'Genus': heatmapData = typeof L6_Heatmap !== 'undefined' ? L6_Heatmap : null; break;
                case 'Species': heatmapData = typeof L7_Heatmap !== 'undefined' ? L7_Heatmap : null; break;
                default: console.error("Unknown dataKey: " + dataKey); return;
            }
        } catch(e) {
            console.error(e);
        }

        if (!heatmapData) {
            console.error("Data variable for " + dataKey + " is missing.");
            return;
        }

        const groupSelector = document.getElementById('groupSelector');
        let selectedGroupList;
        let isCustomGroup = (groupSelector && groupSelector.value === 'Custom');

        // 1. 그룹 매핑 설정
        if (isCustomGroup && window.uploadedData && Object.keys(window.uploadedData).length > 0) {
            const customGroupMap = window.uploadedData;
            selectedGroupList = window.sample_list.map(sampleId => customGroupMap[sampleId] || 'Undefined');
        } else if(isCustomGroup && !window.uploadedData) {
            document.getElementById('inchlib').innerHTML = "<p style='text-align:center; padding:20px;'>Please upload a metadata file for custom grouping.</p>";
            if (typeof highlightFloatingButton === 'function') {
                highlightFloatingButton(4000); 
            }
            return;
        } else {
            if (groupSelector && groupSelector.options.length > 0 && groupSelector.selectedIndex >= 0) {
                const groupIndex = groupSelector.selectedIndex;
                selectedGroupList = window[`group_list${groupIndex + 1}`] || window.sample_list || [];
            } else {
                selectedGroupList = window.sample_list || [];
            }
        }

        // 2. [정렬의 핵심] X축 헤더 순서 결정 (엑셀에서 읽어들인 B->A 순서가 있다면 최우선 적용)
        let uniqueGroupNames = [];
        if (isCustomGroup && window.currentUniqueGroupNames && window.currentUniqueGroupNames.length > 0) {
            uniqueGroupNames = window.currentUniqueGroupNames.slice();
            if (selectedGroupList.includes('Undefined') && !uniqueGroupNames.includes('Undefined')) {
                uniqueGroupNames.push('Undefined');
            }
        } else {
            uniqueGroupNames = [...new Set(selectedGroupList)].filter(groupName => groupName !== undefined && groupName !== null);
        }

        currentRawHeatmapData = heatmapData;
        currentSelectedGroupList = selectedGroupList;
        currentUniqueGroupNames = uniqueGroupNames;

        // 3. 결정된 순서대로 평균 계산 및 렌더링
        const groupedData = calculateGroupAverages(heatmapData, selectedGroupList, uniqueGroupNames);

        setwidth(uniqueGroupNames);
        runinchlib(groupedData, uniqueGroupNames);
    };
}

function calculateGroupAverages(originalData, groupList, uniqueGroupNames) {
    const originalNodes = originalData.data.nodes;
    const newNodes = {};

    if (uniqueGroupNames.length === 0) {
        console.warn("plot_group.js: No unique group names found. Heatmap will be empty.");
        return { data: { nodes: {}, feature_names: [] }};
    }

    Object.entries(originalNodes).forEach(([nodeId, nodeData]) => {
        const taxonName = nodeData.objects[0];
        const groupAggregates = {};
        
        uniqueGroupNames.forEach(groupName => {
            groupAggregates[groupName] = { sum: 0, count: 0 };
        });

        nodeData.features.forEach((featureValue, sampleIndex) => {
            const groupNameForSample = groupList[sampleIndex];
            if (groupNameForSample !== undefined && groupAggregates.hasOwnProperty(groupNameForSample)) {
                groupAggregates[groupNameForSample].sum += featureValue;
                groupAggregates[groupNameForSample].count += 1;
            }
        });

        // uniqueGroupNames(B -> A) 배열 순서대로 평균값을 뽑아 features 배열에 저장
        const averagedFeatures = uniqueGroupNames.map(groupName => {
            const aggregate = groupAggregates[groupName];
            return aggregate.count > 0 ? aggregate.sum / aggregate.count : 0;
        });

        newNodes[nodeId] = {
            count: 1,
            objects: [taxonName],
            features: averagedFeatures
        };
    });

    return {
        data: {
            nodes: newNodes,
            feature_names: uniqueGroupNames
        }
    };
}

function setwidth(groupNames) {
    var default_set = 1150;
    const input = document.querySelector("#bandwitdh");
    if(!input) return;

    const numberOfGroups = groupNames.length > 0 ? groupNames.length : 1;
    let default_value = default_set / numberOfGroups;

    if (default_value < 20) default_value = 20;
    if (default_value > 150) default_value = 150;
    
    input.value = default_value;
}

function find_max_word(data) {
    let max_word = 0;
    if (data && data.data && data.data.nodes) {
        for (const [key, value] of Object.entries(data.data.nodes)) {
            if (value.objects && value.objects[0] && value.objects[0].length > max_word) {
                max_word = value.objects[0].length;
            }
        }
    }
    return max_word * 8 + 150;
}

function runinchlib(file, groupNamesForHeader, color_ = ["WhYlRdBk", "BuPu"], new_draw = true) {
    var readJson = file;
    var max_cell_width = getwidth();
    var taxon_label_width = find_max_word(readJson);

    var numberOfGroups = groupNamesForHeader.length > 0 ? groupNamesForHeader.length : 1;
    var width = (numberOfGroups * max_cell_width) + taxon_label_width;

    var meta_data = readJson.hasOwnProperty('column_metadata');

    if (new_draw) {
        $(document).ready(function () {
            $("#inchlib").empty();
            window.inchlib = new InCHlib({
                target: "inchlib",
                column_metadata: meta_data,
                max_column_width: max_cell_width,
                width: width,
                heatmap_colors: color_[0],
                metadata_colors: "Reds",
                heatmap_header: groupNamesForHeader
            });
            inchlib.read_data(readJson);
            inchlib.draw();
        });
    } else {
        if (window.inchlib) {
            inchlib.settings.max_column_width = max_cell_width;
            inchlib.settings.width = width;
            inchlib.settings.heatmap_colors = color_[0];
            inchlib.settings.heatmap_header = groupNamesForHeader;
            inchlib.read_data(readJson);
            inchlib.draw();
        }
    }
}

function getcolor() {
    if (window.inchlib && window.inchlib.settings) {
        return [inchlib.settings.heatmap_colors, window.inchlib.settings.column_metadata_colors];
    }
    return ["WhYlRdBk", "BuPu"];
}

function getwidth() {
    const input = document.querySelector("#bandwitdh");
    return input ? Number(input.value) : 20; 
}

function downloadimg() { if (window.inchlib) { inchlib._export_icon_click(); } }
function click_color() { if (window.inchlib) { inchlib._color_scale_click(); } }
function click_filter() { if (window.inchlib) { inchlib._filter_icon_click(); } }

var buttonClicked = null;
function highlight(element) {
    $('.myButton.big').removeClass('highlighted');
    if(element) $(element).addClass('highlighted');
}

const inputSlider = document.querySelector("#bandwitdh");
if (inputSlider) {
    inputSlider.addEventListener("input", () => {
        if (window.inchlib && currentRawHeatmapData && currentSelectedGroupList && currentUniqueGroupNames) {
            const groupedData = calculateGroupAverages(currentRawHeatmapData, currentSelectedGroupList, currentUniqueGroupNames);
            runinchlib(groupedData, currentUniqueGroupNames, getcolor(), false);
        }
    });
}