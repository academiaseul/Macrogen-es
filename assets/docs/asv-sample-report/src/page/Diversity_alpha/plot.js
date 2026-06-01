if (typeof new_name !== 'undefined' && new_name.length > 0) {
    sample_list = new_name;
}

// group_count에 따라 group_list를 동적으로 설정
var group_list = [];
for (var i = 1; i <= group_count; i++) {
    var currentGroupList = window['group_list' + i];
    if (currentGroupList) {
        group_list = group_list.concat(currentGroupList);
    }
}


var group_info = {};
group_list.forEach((group, index) => {
    if (!group_info[group]) {
        group_info[group] = [];
    }
    group_info[group].push(index);
});

function set_controls(plotype, id) {
    var D2id = "2D_plot_controls_" + id;
    var Boxid = "Box_controls_" + id;
    var D2div = document.getElementById(D2id);
    var Boxdiv = document.getElementById(Boxid);

    if (D2div) D2div.style.display = "none";
    if (Boxdiv) Boxdiv.style.display = "none";

    if (plotype == "2D" && D2div) {
        D2div.style.display = "flex";
    } else if (plotype == "Box" && Boxdiv) {
        Boxdiv.style.display = "flex";
    }
}

var buttonClicked = null;
function highlight(element) {
    if (buttonClicked != null) {
        buttonClicked.style.background = "#ffffff";
        buttonClicked.style.color = "#bbbbbb";
    }
    buttonClicked = element;
    buttonClicked.style.background = "linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%)";
    buttonClicked.style.color = "#333333";
}

// Lineplot 관련 코드는 주석 처리

function D2_plot(data0, sample_list, id) {
    set_controls('2D', id);
    var x_name = id;

    hovertemplates = "<b>Sample Name    :</b>  %{x}<br>" +
        "<b>" + x_name + " :</b>  %{y}<br>" +
        "<extra></extra>";
    var data = [];
    var trace = {
        x: sample_list,
        y: data0[x_name],
        mode: 'lines+markers',
        type: 'scatter',
        hovertemplate: hovertemplates,
        marker: {
            color: "#679ECD",
            size: 8,
            line: {
                color: '#4f7497',
                width: 2
            }
        },
        line: {
            color: '#679ECD',
            width: 3
        }
    };

    var layout = {
        xaxis: {
            type: 'category',
            tickfont: {
                family: 'Arial, sans-serif',
                size: 18,
                color: 'black'
            },
            showgrid: false,
            zeroline: false,
            mirror: true,
            linecolor: 'black',
            linewidth: 2
        },
        yaxis: {
            title: {
                text: x_name,
                font: {
                    family: 'Arial, sans-serif',
                    size: 24,
                    color: 'black'
                }
            },
            tickfont: {
                family: 'Arial, sans-serif',
                size: 20,
                color: 'black'
            },
            showgrid: false,
            zeroline: false,
            mirror: true,
            linecolor: 'black',
            linewidth: 2
        },
        showlegend: false,
        height: 600,
        margin: {
            r: 130,
            b: 200,
            t: 50
        }
    };

    var data = [trace];
    var config = { displaylogo: false, modeBarButtonsToRemove: ['plotly-logo'] }
    Plotly.newPlot(id, data, layout, config);
}

function D2_dual_plot(data0, sample_list, y1_key, y2_key) {
    set_controls('2D', y1_key + '_' + y2_key);

    var trace1 = {
        x: sample_list,
        y: data0[y1_key],
        mode: 'lines+markers',
        name: "Shannon",
        type: 'scatter',
        yaxis: 'y1',
        hovertemplate: "<b>Sample Name:</b> %{x}<br><b>Shannon:</b> %{y}<extra></extra>",
        marker: {
            color: "#33518a",
            size: 8,
            line: {
                color: '#4f7497',
                width: 2
            }
        },
        line: {
            color: '#33518a',
            width: 3
        }
    };

    var trace2 = {
        x: sample_list,
        y: data0[y2_key],
        mode: 'lines+markers',
        name: "Gini-Simpson",
        type: 'scatter',
        yaxis: 'y2',
        hovertemplate: "<b>Sample Name:</b> %{x}<br><b>Gini-Simpson:</b> %{y}<extra></extra>",
        marker: {
            color: "#d2422e",
            size: 8,
            line: {
                color: '#C70039',
                width: 2
            }
        },
        line: {
            color: '#d2422e',
            width: 3
        }
    };

    var layout = {
        xaxis: {
            type: 'category',
            tickfont: {
                family: 'Arial, sans-serif',
                size: 18,
                color: 'black'
            },
            showgrid: false,
            zeroline: false,
            mirror: true,
            linecolor: 'black',
            linewidth: 2
        },
        yaxis: {
            title: {
                text: "Shannon",
                font: {
                    family: 'Arial, sans-serif',
                    size: 24,
                    color: '#33518a',
                    weight: 'bold'
                }
            },
            tickfont: {
                family: 'Arial, sans-serif',
                size: 20,
                color: 'black'
            },
            range: [0, Math.max(...data0[y1_key]) * 1.1], // 0부터 시작, max의 10% 여백
            showgrid: false,
            zeroline: false,
            mirror: true,
            linecolor: 'black',
            linewidth: 2
        },
        yaxis2: {
            title: {
                text: "Gini-Simpson",
                font: {
                    family: 'Arial, sans-serif',
                    size: 24,
                    color: '#d2422e',
                    weight: 'bold'
                }
            },
            tickfont: {
                family: 'Arial, sans-serif',
                size: 20,
                color: 'black'
            },
            overlaying: 'y',
            side: 'right',
            range: [0, Math.max(...data0[y2_key]) * 1.1], // 0부터 시작, max의 10% 여백
            showgrid: false,
            zeroline: false,
            mirror: true,
            linecolor: 'black',
            linewidth: 2
        },
        showlegend: true,
        legend: {
            orientation: 'h', // 수평 정렬
            x: 0.5, // 가운데 정렬
            xanchor: 'center',
            y: 1.1 // 상단에 위치
        },
        height: 500, // 높이 조정
        margin: {
            r: 130,
            b: 100, // 하단 여백 줄임
            t: 50
        }
    };

    var data = [trace1, trace2];
    var config = { displaylogo: false, modeBarButtonsToRemove: ['plotly-logo'] }
    Plotly.newPlot(y1_key + '_' + y2_key, data, layout, config);
}




function downloadimg(type, name, id) {
    var x_name = id;
    new_name = name + "(" + x_name + ")";
    var graphDiv = document.getElementById(id);
    Plotly.downloadImage(graphDiv, { format: type, filename: new_name });
}

// 그룹별 컬러 배열
var colors = [
    "#84BD00", "#F5543F", "#2980b9", "#fed439", "#9e9e9e", "#f781bf",
    "#001e62", "#4daf4a", "#ff9432", "#00bfb2", "#a765c2", "#d2af81",
    "#e0ff99", "#f99386", "#99b8ff", "#fee99a", "#cccccc", "#fccfe7",
    "#c0def2", "#95d293", "#ffca99", "#99fff8", "#d6b6e2", "#e3cfb5"
];

function getPercentile(data, percentile) {
    data.sort((a, b) => a - b);
    const index = (percentile / 100) * (data.length - 1);
    const lower = Math.floor(index);
    const upper = lower + 1;
    const weight = index % 1;

    if (upper >= data.length) return data[lower];
    return data[lower] * (1 - weight) + data[upper] * weight;
}

function Box_plot(data0, sample_list, id, legendTitle = 'Group') {
    set_controls('Box', id);
    var x_name = id;
    var data = [];
    var layoutOptions = {}; // 레이아웃 수정을 위한 옵션 객체

    if (legendTitle === 'Sample') {
        const allSampleData = data0[x_name]; // 해당 지표의 모든 샘플 데이터를 가져옴

        data.push({
            y: allSampleData,
            type: 'box',
            name: '', // 내부적으로 사용할 이름
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: 0,
            marker: { color: '#c2c2c2', size: 8, line: { color: 'black', width: 1 } },
            line: { color: 'black', width: 2 },
            fillcolor: `rgba(${hexToRgb('#c2c2c2')}, 0.5)`,
            hoverinfo: 'text',
            text: allSampleData.map((value, index) => 
                `<b>Sample:</b> ${sample_list[index]}<br>` +
                `<b>Value:</b> ${value}`
            )
        });

        layoutOptions.showlegend = false;
        // layoutOptions.xaxis = { showticklabels: false }; // x축 샘플명 숨김
    } else {
        // 그룹별로 Box plot을 그리는 로직
        var colorIndex = 0;
        var groupData = {};
        sample_list.forEach((group, index) => {
            if (!groupData[group]) {
                groupData[group] = [];
            }
            groupData[group].push({
                value: data0[x_name][index],
                sample: window.sample_list[index] // main.js의 전역 sample_list에서 샘플 ID를 가져옴
            });
            // groupData[group].push(data0[x_name][index]);
        });

        Object.keys(groupData).forEach(group => {
            // 2. 재구성한 데이터로 y값 배열과 hover text 배열을 만듭니다.
            const yValues = groupData[group].map(item => item.value);

            const textValues = groupData[group].map(item =>
                `<b>Sample:</b> ${item.sample}<br>` +
                `<b>${legendTitle}:</b> ${group}<br>` +
                `<b>Value:</b> ${item.value}`
            );

            data.push({
                // y: groupData[group],
                y: yValues,
                text: textValues, // 생성한 hover text 배열을 추가
                hoverinfo: 'text', // hover 정보로 text 속성을 사용하도록 설정
                type: 'box',
                name: group,
                boxpoints: 'all',
                jitter: 0.3,
                pointpos: 0,
                marker: {
                    color: colors[colorIndex % colors.length],
                    size: 8,
                    line: { color: 'black', width: 1 }
                },
                line: { color: 'black', width: 2 },
                fillcolor: `rgba(${hexToRgb(colors[colorIndex % colors.length])}, 0.5)`,
            });
            colorIndex++;
        });

        layoutOptions.showlegend = true;
        layoutOptions.xaxis = { 
            type: 'category',
            tickfont: { family: 'Arial, sans-serif', size: 20, color: 'black' },
            showgrid: false,
            zeroline: false,
            mirror: 'ticks',
            linecolor: 'black',
            linewidth: 2,
            showticklabels: false // 그룹명 표시
        };
    }

    var layout = {
        autosize: true,
        yaxis: {
            title: { text: x_name, font: { family: 'Arial, sans-serif', size: 24, color: 'black' } },
            tickfont: { family: 'Arial, sans-serif', size: 20, color: 'black' },
            showgrid: false,
            zeroline: false,
            mirror: true,
            linecolor: 'black',
            linewidth: 2
        },
        xaxis: {
            type: 'category',
            tickfont: { family: 'Arial, sans-serif', size: 20, color: 'black' },
            showgrid: false,
            zeroline: false,
            mirror: true,
            linecolor: 'black',
            linewidth: 2
        },
        legend: {
            title: { text: '  ' + legendTitle, font: { family: 'Arial, sans-serif', size: 16, color: 'black', weight: 'bold' } }
        },
        margin: { l: 80, r: 80, b: 40, t: 40 },
        ...layoutOptions // 위에서 설정한 레이아웃 옵션을 여기에 적용
    };
    var config = { displaylogo: false, modeBarButtonsToRemove: ['plotly-logo'], responsive: true }

    Plotly.react('boxplot_' + id.replace(/[^a-zA-Z0-9]/g, ''), data, layout, config);
}

function updatePlots() {
    var selectedGroupIndex = groupSelector.value;
    var xAxisData = group_count > 0 ? window['group_list' + (parseInt(selectedGroupIndex) + 1)] : sample_list;

    // alpha_diversity의 각 지수에 대해 Boxplot을 그립니다.
    Object.keys(alpha_diversity).forEach(function(key) {
        Box_plot(alpha_diversity, xAxisData, key);
    });
}

function plotRarefaction(data, plotId, name) {
    var my_palette = [
        '#f4271c', '#3000fc', '#e9781f', '#1f7f0b', '#8d2b8c', '#fcff2d', '#8ceaf3', '#ee9cc2', '#669f9d', '#684511',
        '#808080', '#80ef4e', '#e29a7f', '#98add5', '#eec891', '#96c79f', '#9d89bb', '#fbf8a6', '#c0c0c0', '#cf3087',
        '#69b4f8', '#b99d72', '#7e7f28', '#8548f5', '#af858d', '#447e7f', '#6f140c', '#31410f', '#934c1c'
    ];

    var traces = Object.keys(data).map(function(sample, index) {
        return {
            x: data[sample].x,
            y: data[sample].y,
            mode: 'lines',
            name: sample,
            line: { color: my_palette[index % my_palette.length], width: 3 },
            hovertemplate: `<b>Sample: ${sample}</b><br><b>Number of reads: %{x:,}</b><br><b>Rarefaction: %{y:.4f}</b><extra></extra>`
        };
    });

    var layout = {
        title: { text: `${name}: SampleID`, font: { size: 20, color: '#000000' } },
        xaxis: {
            title: { text: 'Sequences Per Sample', font: { size: 20, color: '#000000' } },
            showgrid: false,
            tickfont: { size: 17, color: '#000000' },
            tickformat: ',.0f',  // 수정된 부분: 숫자를 그대로 표시
            zeroline: false,  // 수정된 부분: 0선 표시 안 함
            range: [0, Math.max(...[].concat(...Object.values(data).map(d => d.x))) * 1.1],
            showline: true,
            mirror: 'ticks',
            linecolor: '#000000',
            linewidth: 2
        },
        yaxis: {
            title: { text: `Rarefaction Measure: ${name}`, font: { size: 20, color: '#000000' } },
            showgrid: false,
            tickfont: { size: 17, color: '#000000' },
            zeroline: false,  // 수정된 부분: 0선 표시 안 함
            range: [0, Math.max(...[].concat(...Object.values(data).map(d => d.y))) * 1.1],
            showline: true,
            mirror: 'ticks',
            linecolor: '#000000',
            linewidth: 2
        },
        legend: { title: { text: 'Sample', font: { size: 17, color: '#000000' } } },
        margin: { l: 60, r: 30, b: 60, t: 80 },
        hovermode: 'closest'
    };

    Plotly.newPlot(plotId, traces, layout, {
        modeBarButtonsToRemove: [
            "pan", "zoom", "select", "lasso2d", "autoScale", "resetScale", "hoverCompareCartesian", "hoverClosestCartesian"
        ]
    });
}

// /**
//  * [수정됨] 그룹별 평균과 표준편차를 계산하여 그래프를 그리는 함수
//  * @param {object} data - 원본 데이터 (e.g., ASV, shannon)
//  * @param {string} plotId - 그래프가 그려질 div의 ID
//  * @param {string} name - 그래프의 이름 (e.g., 'ASVs')
//  * @param {string[]} groupList - 샘플 순서와 일치하는 그룹 이름 배열
//  * @param {string} legendTitle - 범례에 표시될 제목 (e.g., 'Group1', 'Group')
//  */

function plotGroupRarefaction(data, plotId, name, groupList, legendTitle) {
    var my_palette = [
        '#f4271c', '#3000fc', '#e9781f', '#1f7f0b', '#8d2b8c', '#fcff2d', '#8ceaf3', '#ee9cc2', '#669f9d', '#684511',
        '#808080', '#80ef4e', '#e29a7f', '#98add5', '#eec891', '#96c79f', '#9d89bb', '#fbf8a6', '#c0c0c0', '#cf3087',
        '#69b4f8', '#b99d72', '#7e7f28', '#8548f5', '#af858d', '#447e7f', '#6f140c', '#31410f', '#934c1c'
    ];

    if (!groupList || !Array.isArray(groupList) || groupList.length === 0) {
        console.error("Invalid or empty groupList provided to plotGroupRarefaction");
        document.getElementById(plotId).innerHTML = "<p style='text-align:center; padding:20px;'></p>";
        return;
    }

    //1. 데이터를 그룹별로 재구성합니다.
    var groupedSamples = {};
    Object.keys(data).forEach(sample => {
        const sampleIndex = sample_list.indexOf(sample);
        if (sampleIndex === -1) return;

        const group = groupList[sampleIndex];
        if (!group || group === 'Undefined') return;

        if (!groupedSamples[group]) {
            groupedSamples[group] = [];
        }
        groupedSamples[group].push(data[sample]);
    });

    //2. 그룹별로 평균과 표준편차를 계산하여 traces를 생성합니다.
    var traces = Object.keys(groupedSamples).sort().map((group, colorIndex) => {
        const samplesInGroup = groupedSamples[group];

        //3. 그룹 내 샘플들의 y배열 중 가장 짧은 길이를 찾습니다.
        const minLength = Math.min(...samplesInGroup.map(s => s.y.length));
        
        if (minLength === Infinity || minLength === 0) {
            return null; 
        }

        //4. 최소 길이를 기준으로 x축 데이터를 자릅니다. (어떤 샘플이든 동일)
        const x_coords = samplesInGroup[0].x.slice(0, minLength);
        
        const y_means = [];
        const y_sds = [];

        //5. 최소 길이(minLength)만큼만 반복하여 평균과 표준편차를 계산합니다.
        for (let i = 0; i < minLength; i++) {
            const pointValues = samplesInGroup.map(s => s.y[i]);
            
            const sum = pointValues.reduce((a, b) => a + b, 0);
            const mean = sum / pointValues.length;
            y_means.push(mean);
            
            if (pointValues.length > 1) {
                const variance = pointValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (pointValues.length - 1);
                y_sds.push(Math.sqrt(variance));
            } else {
                y_sds.push(0);
            }
        }

        return {
            x: x_coords, y: y_means, mode: 'lines', name: group,
            line: { color: my_palette[colorIndex % my_palette.length], width: 3 },
            error_y: { type: 'data', array: y_sds, visible: true, color: my_palette[colorIndex % my_palette.length] },
            hovertemplate: `<b>Group: ${group}</b><br><b>Reads: %{x:,}</b><br><b>Rarefaction: %{y:.4f} ± %{error_y.array:.4f}</b><extra></extra>`
        };
    }).filter(t => t !== null); // null인 trace를 제거합니다.

    var maxY = 0;
    traces.forEach(t => {
        const maxVal = Math.max(...t.y.map((y, i) => y + (t.error_y.array[i] || 0)));
        if (maxVal > maxY) maxY = maxVal;
    });
    
    var layout = {
        title: { text: `${name}: Group Average`, font: { size: 20, color: '#000000' } },
        xaxis: { title: { text: 'Sequences Per Sample', font: { size: 20, color: '#000000' } }, showgrid: false, tickfont: { size: 17, color: '#000000' }, tickformat: ',.0f', zeroline: false, showline: true, mirror: 'ticks', linecolor: '#000000', linewidth: 2 },
        yaxis: { title: { text: `Rarefaction Measure: ${name}`, font: { size: 20, color: '#000000' } }, showgrid: false, tickfont: { size: 17, color: '#000000' }, zeroline: false, range: [0, maxY * 1.15], showline: true, mirror: 'ticks', linecolor: '#000000', linewidth: 2 },
        legend: { 
            title: { 
                text: legendTitle, 
                font: { size: 17, color: '#000000' } 
            } 
        },
        margin: { l: 60, r: 30, b: 60, t: 80 },
        hovermode: 'closest'
    };

    Plotly.newPlot(plotId, traces, layout, {
        modeBarButtonsToRemove: [ "pan", "zoom", "select", "lasso2d", "autoScale", "resetScale", "hoverCompareCartesian", "hoverClosestCartesian" ]
    });
}



// Hex 색상을 RGB로 변환하는 함수
function hexToRgb(hex) {
    var bigint = parseInt(hex.slice(1), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}
