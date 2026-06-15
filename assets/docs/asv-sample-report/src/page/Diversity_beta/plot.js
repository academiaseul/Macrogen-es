if (typeof new_name !== 'undefined' && new_name.length > 0) {
    sample_list = new_name;
}

// 기존의 grouped 변수를 사용하던 부분을 group_count로 대체
var useGroup = group_count > 0;

// group_list를 동적으로 생성
var group_list = [];
for (var i = 1; i <= group_count; i++) {
    var currentGroupList = window['group_list' + i];
    if (currentGroupList) {
        group_list.push(...currentGroupList);
    }
}

function set_controls(plotType, distance) {
    // 2D 및 3D 컨트롤을 숨기거나 표시합니다.
    if (plotType === "2D") {
        $("#2D_plot_controls_" + distance).css("display", "flex");
        $("#3D_plot_controls_" + distance).css("display", "none");
    } else if (plotType === "3D") {
        $("#2D_plot_controls_" + distance).css("display", "none");
        $("#3D_plot_controls_" + distance).css("display", "flex");
    }
}

// D2_plot 함수 수정
function D2_plot(data, sample_list, containerId, distance) {
    set_controls('2D', distance);
    var x_name = document.getElementById("getx_" + distance).value;
    var y_name = document.getElementById("gety_" + distance).value;
    var dataArr = [];
    var legendTitle;

    var groupSelector = document.getElementById('groupSelector_' + distance);
    var selectedValue = groupSelector.value;
    var colorPalette = ["#84BD00", "#F5543F", "#2980b9", "#fed439ff", "#9e9e9e", "#f781bf", "#001e62", "#4daf4a", "#ff9432", "#00bfb2", "#a765c2", "#d2af81ff", "#e0ff99", "#f99386", "#99b8ff", "#fee99a", "#cccccc", "#fccfe7", "#c0def2", "#95d293", "#ffca99", "#99fff8", "#d6b6e2", "#e3cfb5"];

    if (selectedValue === 'SampleID') {
        // [추가] "SampleID" 선택 시, 각 샘플을 개별 trace로 처리
        legendTitle = 'Sample';
        sample_list.forEach((sample, sampleIndex) => {
            const x_coord = data[x_name][sampleIndex];
            const y_coord = data[y_name][sampleIndex];

            dataArr.push({
                x: [x_coord],
                y: [y_coord],
                text: [sample],
                name: sample, // 범례에 샘플명 사용
                mode: 'markers',
                type: 'scatter',
                marker: {
                    size: 14,
                    color: colorPalette[sampleIndex % colorPalette.length]
                },
                hovertemplate: `<b>Sample Name :</b> %{text}<br><b>${x_name} :</b> %{x}<br><b>${y_name} :</b> %{y}<extra></extra>`
            });
        });
    } else {
        // [기존] 그룹 기반 플롯 로직
        legendTitle = 'Group';
        let groupList;
        if (selectedValue === 'Custom') {
            if (window.uploadedData) {
                groupList = sample_list.map(id => window.uploadedData[id] || 'Undefined');
            } else {
                document.getElementById(containerId).innerHTML = "<p style='text-align:center; padding:20px;'>Please upload a metadata file for custom grouping.</p>";
                return;
            }
        } else {
            var groupIndex = parseInt(selectedValue);
            groupList = window['group_list' + (groupIndex + 1)];
            legendTitle = group_name[groupIndex] || 'Group';
        }

        var useGroup = Array.isArray(groupList) && groupList.length > 0;
        var uniqueGroups = useGroup ? [...new Set(groupList)] : [];

        uniqueGroups.forEach((group, groupIndex) => {
            const samplesInGroup = sample_list.filter((_, i) => groupList[i] === group);
            const x_coords = samplesInGroup.map(sample => data[x_name][sample_list.indexOf(sample)]);
            const y_coords = samplesInGroup.map(sample => data[y_name][sample_list.indexOf(sample)]);

            dataArr.push({
                x: x_coords,
                y: y_coords,
                text: samplesInGroup,
                name: group,
                mode: 'markers',
                type: 'scatter',
                marker: { size: 14, color: colorPalette[groupIndex % colorPalette.length] },
                hovertemplate: `<b>Sample Name :</b> %{text}<br><b>Group Name :</b> ${group}<br><b>${x_name} :</b> %{x}<br><b>${y_name} :</b> %{y}<extra></extra>`
            });
        });
    }

    var layout = {
        xaxis: { title: { text: x_name + " (" + data[x_name][sample_list.length] + ")", font: { family: 'Arial, sans-serif', size: 25, color: 'black' }, standoff: 20 }, showgrid: false, zeroline: false, showline: true, linecolor: 'black', linewidth: 2, mirror: true, tickfont: { family: 'Arial, sans-serif', size: 20, color: 'black' }, autorange: true },
        yaxis: { title: { text: y_name + " (" + data[y_name][sample_list.length] + ")", font: { family: 'Arial, sans-serif', size: 25, color: 'black' }, standoff: 5 }, showgrid: false, zeroline: false, showline: true, linecolor: 'black', linewidth: 2, mirror: true, tickfont: { family: 'Arial, sans-serif', size: 20, color: 'black' }, autorange: true },
        legend: { font: { family: 'Arial, sans-serif', size: 20, color: 'black' }, title: { text: legendTitle, font: {size: 18, color: 'black'}}},
        width: document.getElementById(containerId).offsetWidth, height: 600, margin: { l: 160, r: 200, t: 50, b: 85 }
    };
    var config = { displaylogo: false, modeBarButtonsToRemove: ['toImage', 'plotly-logo'] };
    Plotly.newPlot(containerId, dataArr, layout, config);
}


// D3_plot 함수 수정
function D3_plot(data, sample_list, containerId, distance) {
    set_controls('3D', distance);
    var x_name = document.getElementById("get3x_" + distance).value;
    var y_name = document.getElementById("get3y_" + distance).value;
    var z_name = document.getElementById("get3z_" + distance).value;
    var dataArr = [];
    var legendTitle;

    var groupSelector = document.getElementById('groupSelector_' + distance);
    var selectedValue = groupSelector.value;
    var colorPalette = ["#84BD00", "#F5543F", "#2980b9", "#fed439ff", "#9e9e9e", "#f781bf", "#001e62", "#4daf4a", "#ff9432", "#00bfb2", "#a765c2", "#d2af81ff", "#e0ff99", "#f99386", "#99b8ff", "#fee99a", "#cccccc", "#fccfe7", "#c0def2", "#95d293", "#ffca99", "#99fff8", "#d6b6e2", "#e3cfb5"];

    if (selectedValue === 'SampleID') {
        // [추가] "SampleID" 선택 시, 각 샘플을 개별 trace로 처리
        legendTitle = 'Sample';
        sample_list.forEach((sample, sampleIndex) => {
            const x_coord = data[x_name][sampleIndex];
            const y_coord = data[y_name][sampleIndex];
            const z_coord = data[z_name][sampleIndex];
            
            dataArr.push({
                x: [x_coord],
                y: [y_coord],
                z: [z_coord],
                text: [sample],
                name: sample,
                mode: 'markers',
                type: 'scatter3d',
                marker: { size: 3.5, color: colorPalette[sampleIndex % colorPalette.length] },
                hovertemplate: `<b>Sample Name :</b> %{text}<br><b>${x_name} :</b> %{x}<br><b>${y_name} :</b> %{y}<br><b>${z_name} :</b> %{z}<extra></extra>`
            });
        });

    } else {
        // [기존] 그룹 기반 플롯 로직
        legendTitle = 'Group';
        let groupList;
        if (selectedValue === 'Custom') {
            if (window.uploadedData) {
                groupList = sample_list.map(id => window.uploadedData[id] || 'Undefined');
            } else {
                document.getElementById(containerId).innerHTML = "<p style='text-align:center; padding:20px;'>Please upload a metadata file for custom grouping.</p>";
                return;
            }
        } else {
            var groupIndex = parseInt(selectedValue);
            groupList = window['group_list' + (groupIndex + 1)];
            legendTitle = group_name[groupIndex] || 'Group';
        }

        var useGroup = Array.isArray(groupList) && groupList.length > 0;
        var uniqueGroups = useGroup ? [...new Set(groupList)] : [];

        uniqueGroups.forEach((group, groupIndex) => {
            const samplesInGroup = sample_list.filter((_, i) => groupList[i] === group);
            const x_coords = samplesInGroup.map(sample => data[x_name][sample_list.indexOf(sample)]);
            const y_coords = samplesInGroup.map(sample => data[y_name][sample_list.indexOf(sample)]);
            const z_coords = samplesInGroup.map(sample => data[z_name][sample_list.indexOf(sample)]);

            dataArr.push({
                x: x_coords,
                y: y_coords,
                z: z_coords,
                text: samplesInGroup,
                name: group,
                mode: 'markers',
                type: 'scatter3d',
                marker: { size: 3.5, color: colorPalette[groupIndex % colorPalette.length] },
                hovertemplate: `<b>Sample Name :</b> %{text}<br><b>Group Name :</b> ${group}<br><b>${x_name} :</b> %{x}<br><b>${y_name} :</b> %{y}<br><b>${z_name} :</b> %{z}<extra></extra>`
            });
        });
    }

    var layout = {
        showlegend: true,
        legend: { font: { family: 'Arial, sans-serif', size: 20, color: 'black' }, title: { text: legendTitle, font: {size: 18, color: 'black'}}, itemsizing: 'constant', itemwidth: 30 },
        scene: {
            xaxis: { title: { text: x_name + " (" + data[x_name][sample_list.length] + ")", font: { family: 'Arial, sans-serif', size: 20, color: 'black' } }, showline: true, linecolor: 'black', linewidth: 2, zeroline: false, tickfont: { family: 'Arial, sans-serif', size: 15, color: 'black' } },
            yaxis: { title: { text: y_name + " (" + data[y_name][sample_list.length] + ")", font: { family: 'Arial, sans-serif', size: 20, color: 'black' } }, showline: true, linecolor: 'black', linewidth: 2, zeroline: false, tickfont: { family: 'Arial, sans-serif', size: 15, color: 'black' } },
            zaxis: { title: { text: z_name + " (" + data[z_name][sample_list.length] + ")", font: { family: 'Arial, sans-serif', size: 20, color: 'black' } }, showline: true, linecolor: 'black', linewidth: 2, zeroline: false, tickfont: { family: 'Arial, sans-serif', size: 15, color: 'black' } },
            camera: { eye: { x: 1.4, y: 1.4, z: 0.05 } }, dragmode: 'turntable'
        },
        margin: { l: 160, r: 200, t: 50, b: 85, pad: 0 }, paper_bgcolor: 'white', plot_bgcolor: 'white'
    };

    var config = { displaylogo: false, modeBarButtonsToRemove: ['toImage', 'plotly-logo'] };
    Plotly.newPlot(containerId, dataArr, layout, config);
}

/**
 * Distance Matrix를 그리는 함수.
 * 샘플 수 60개를 기준으로 상세 보기와 간략 보기 모드를 전환합니다.
 */
function Distance_plot(containerId, sample_list, zValue) {
    const PLOT_THRESHOLD = 60; // 상세/간략 보기를 전환할 샘플 수 기준

    // --- 공통 데이터 처리 ---
    const xValues = sample_list.map(String);
    const yValues = [...sample_list].reverse().map(String);
    const zValues = [...zValue].reverse().map(row => row.map(value => parseFloat(value.toFixed(2))));

    const colorscaleValue = [
        [0, colors[0]],
        [1, colors[1]]
    ];

    const hovertemplate = "<b>Sample1 :</b>  %{y}<br>" +
                        "<b>Sample2 :</b>  %{x}<br>" +
                        "<b>Distance :</b>  %{z}<br>" +
                        "<extra></extra>";
    
    let data, layout; // if/else 블록에서 채워질 변수

    // --- 샘플 수에 따른 분기 처리 ---
    if (sample_list.length < PLOT_THRESHOLD) {
        // [상세 보기] 샘플이 100개 미만일 경우 (기존 방식)
        
        let set_size = xValues.length > 10 ? 12 : xValues.length * 1.5;
        let font_size = 12;

        data = [{
            x: xValues,
            y: yValues,
            z: zValues,
            type: 'heatmap',
            colorscale: colorscaleValue,
            hoverongaps: false,
            hovertemplate: hovertemplate,
            xgap: 1, // 셀 간격
            ygap: 1
        }];

        layout = {
            width: set_size * 100,
            height: set_size * 100,
            annotations: [],
            xaxis: { type: "category", side: 'top', tickfont: { size: font_size } },
            yaxis: { type: "category", tickfont: { size: font_size } }
        };

        // 각 셀에 숫자(annotation) 추가
        for (let i = 0; i < yValues.length; i++) {
            for (let j = 0; j < xValues.length; j++) {
                const currentValue = zValues[i][j];
                layout.annotations.push({
                    xref: 'x1', yref: 'y1',
                    x: j, y: i,
                    text: currentValue.toFixed(2),
                    showarrow: false,
                    font: {
                        color: currentValue > 0.5 ? 'white' : 'black', // 색상 대비에 따라 글자색 변경
                        size: font_size
                    }
                });
            }
        }

    } else {
        // [간략 보기] 샘플이 100개 이상일 경우 (초경량 모드)
        
        data = [{
            x: xValues,
            y: yValues,
            z: zValues,
            type: 'heatmap',
            colorscale: colorscaleValue,
            hoverongaps: false,
            hovertemplate: hovertemplate,
            showscale: false // 컬러 범례 표시
        }];

        layout = {
            width: 1100,  // 고정 크기
            height: 1100,
            // 축 레이블을 숨겨서 렌더링 부하 감소 및 깔끔한 시각화
            xaxis: { type: "category", side: 'top', showticklabels: false, ticks: "" },
            yaxis: { type: "category", showticklabels: false, ticks: "" }
        };
    }

    const config = { displaylogo: false, modeBarButtonsToRemove: ['toImage', 'plotly-logo'] };
    Plotly.newPlot(containerId, data, layout, config);
}


var colors = [
    "#FFFFFF",  
    "#224878"
];

var currentColorIndex;

function initializeColorPicker() {
    // Set initial colors for the color picker buttons
    var button1 = document.getElementById("button1");
    var button2 = document.getElementById("button2");

    if (button1) {
        button1.style.backgroundColor = colors[0];
    }
    if (button2) {
        button2.style.backgroundColor = colors[1];
    }
}

function toggleColorPicker() {
    var toggleButton = document.getElementById("toggleButton");
    var colorPickerButtons = document.getElementsByClassName("color-picker-button");
    var colorPickerModal = document.getElementById("colorPickerModal");

    Array.from(colorPickerButtons).forEach(function(button) {
        button.style.display = "inline-block";
    });
    colorPickerModal.style.display = "flex";
}

function openColorPicker(colorIndex) {
    currentColorIndex = colorIndex;
    var colorPickerModal = document.getElementById("colorPickerModal");
    var colorPickerInput = document.getElementById("colorPickerInput");
    colorPickerInput.value = colors[currentColorIndex];
    colorPickerModal.style.display = "flex";
}

function changeColor() {
    var colorPickerModal = document.getElementById("colorPickerModal");
    var colorPickerInput = document.getElementById("colorPickerInput");
    var selectedColor = colorPickerInput.value;
    colors[currentColorIndex] = selectedColor;

    updateColorPickerButton(currentColorIndex, selectedColor);

    // Update the plots with the new color
    Distance_plot('distance_chart_container_bray', sample_list, bray_curtis_matrix);
    Distance_plot('distance_chart_container_weighted', sample_list, weighted_unifrac_matrix);
    Distance_plot('distance_chart_container_unweighted', sample_list, unweighted_unifrac_matrix);
}

function closeColor() {
    var colorPickerModal = document.getElementById("colorPickerModal");
    colorPickerModal.style.display = "none";
}

function updateColorPickerButton(colorIndex, color) {
    var button = document.getElementById("button" + (colorIndex + 1));
    if (button) {
        button.style.backgroundColor = color;
    }
}

// Initialize color picker buttons on page load
document.addEventListener("DOMContentLoaded", function() {
    initializeColorPicker();
});


function downloadimg(format, filename) {
    var containerId;
    if (filename.includes('bray-curtis')) {
        containerId = 'pcoa-plot-container-bray';
    } else if (filename.includes('unweighted-unifrac')) { 
        containerId = 'pcoa-plot-container-unweighted';
    } else if (filename.includes('weighted-unifrac')) {     
        containerId = 'pcoa-plot-container-weighted';
    } else {
         console.error('Cannot determine containerId from filename: ' + filename);
         return;
    }

    var graphDiv = document.getElementById(containerId);
    if (graphDiv) {
        Plotly.toImage(graphDiv, { format: format, width: 800, height: 800 })
            .then(function (url) {
                var a = document.createElement('a');
                a.href = url;
                a.download = filename + '.' + format;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
    } else {
        console.error('Graph container not found for filename:', filename);
    }
}



function downloadimg2(format, filename) {
    var containerId;

    // 전달받은 filename에 포함된 키워드를 확인하여 올바른 containerId를 지정합니다.   
    if (filename.includes('bray-curtis')) {
        containerId = 'distance_chart_container_bray';
    } else if (filename.includes('unweighted-unifrac')) {
        containerId = 'distance_chart_container_unweighted';
    } else if (filename.includes('weighted-unifrac')) {
        containerId = 'distance_chart_container_weighted';
    } else {
        // 만약 키워드가 매칭되지 않을 경우를 대비한 예외 처리 (기본값 설정 또는 에러 로그)    
        console.error('Cannot determine containerId from filename: ' + filename);
        return;
    }

    var graphDiv = document.getElementById(containerId);
    
    if (graphDiv) {
        Plotly.toImage(graphDiv, { format: format, width: 800, height: 800 })
            .then(function (url) {
                var a = document.createElement('a');
                a.href = url;
                a.download = filename + '.' + format;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
    } else {
        console.error('Graph container not found (' + containerId + ') for filename:', filename);
    }
}

