if (typeof new_name !== 'undefined' && new_name.length > 0) {
    sample_list = new_name;
}

// 전역 변수로 현재 히트맵의 원본 데이터, 선택된 그룹 리스트, 고유 그룹 이름을 저장합니다.
var currentRawHeatmapData = null;
var currentSelectedGroupList = null;
var currentUniqueGroupNames = null;

function load_json(src, dataKey) {
    var head = document.getElementsByTagName('head')[0];
    var element = head.getElementsByClassName("json")[0];

    try {
        element.parentNode.removeChild(element);
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
    value.textContent = "Taxonomy Heatmap plot (" + dataKey + ")";

    script.onload = function () {
        let heatmapData;
        switch (dataKey) {
            case 'Phylum': heatmapData = L2_Heatmap; break;
            case 'Class': heatmapData = L3_Heatmap; break;
            case 'Order': heatmapData = L4_Heatmap; break;
            case 'Family': heatmapData = L5_Heatmap; break;
            case 'Genus': heatmapData = L6_Heatmap; break;
            case 'Species': heatmapData = L7_Heatmap; break;
            default: console.error("Unknown dataKey: " + dataKey); return;
        }
        
        // ==================== [수정된 부분 START] ====================
        // 그룹핑 로직: 커스텀 그룹과 사전 정의된 그룹을 분기하여 처리합니다.
        
        const groupSelector = document.getElementById('groupSelector');
        let selectedGroupList;
        let isCustomGroup = (groupSelector && groupSelector.value === 'Custom');

        if (isCustomGroup && window.uploadedData && Object.keys(window.uploadedData).length > 0) {
            // 1. 커스텀 그룹이 선택되고, 업로드된 데이터가 있을 경우
            console.log("Using custom group data.");
            const customGroupMap = window.uploadedData;
            // main.js에 정의된 전체 샘플 리스트(sample_list)를 기준으로 새로운 그룹 리스트를 생성합니다.
            selectedGroupList = window.sample_list.map(sampleId => customGroupMap[sampleId] || 'Undefined');
            
            if (selectedGroupList.includes('Undefined')) {
                console.warn("Some samples in `sample_list` were not found in the uploaded metadata. They will be grouped as 'Undefined'.");
            }
        }else if(isCustomGroup && ! window.uploadedData ) {
            document.getElementById('inchlib').innerHTML = "<p style='text-align:center; padding:20px;'>Please upload a metadata file for custom grouping.</p>";
             if (typeof highlightFloatingButton === 'function') {
                                 highlightFloatingButton(4000); // 4초 동안 강조
             }
             return 1
        }  else {
            // 2. 사전 정의된 그룹을 선택한 경우 (기존 로직)
            console.log("Using predefined group data.");
            if (groupSelector && groupSelector.options.length > 0 && groupSelector.selectedIndex >= 0) {
                const groupIndex = groupSelector.selectedIndex;
                // main.js의 group_list1, group_list2 등을 참조
                selectedGroupList = window[`group_list${groupIndex + 1}`] || window.sample_list || [];
            } else {
                selectedGroupList = window.sample_list || [];
            }
        }
        // ==================== [수정된 부분 END] ======================

        const uniqueGroupNames = [...new Set(selectedGroupList)].filter(groupName => groupName !== undefined && groupName !== null);

        // 전역 변수 업데이트
        currentRawHeatmapData = heatmapData;
        currentSelectedGroupList = selectedGroupList;
        currentUniqueGroupNames = uniqueGroupNames;

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
    return input ? Number(input.value) : 20; // Default to 20 if slider not found
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
