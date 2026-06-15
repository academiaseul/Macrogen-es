var data; // 전역 변수로 설정하여 모든 함수에서 접근 가능

if (typeof new_name !== 'undefined' && new_name.length > 0) {
    sample_list = new_name;
}

document.addEventListener("DOMContentLoaded", function () {
    const sortkey_input = document.querySelector("#sortkey");
    if(sortkey_input) { // null 에러 방지
        sortkey_input.addEventListener("input", (event) => {
            set_sortopt();
            barplot(data);
        });
    }

    const sortopt_input = document.querySelector("#sortopt");
    if(sortopt_input) {
        sortopt_input.addEventListener("input", (event) => {
            barplot(data);
        });
    }

    const input = document.querySelector("#bandwidth");
    if(input) {
        input.addEventListener("input", (event) => {
            barplot(data);
        });
    }

    const top20_check = document.querySelector("#top20_check");
    if(top20_check) {
        top20_check.addEventListener("input", (event) => {
            const value = document.querySelector("#current_page");
            var script_src = document.getElementById("json_data");
            if (script_src && value) {
                var s_path = script_src.src;
                var text_name = value.value.split('(')[1].split(')')[0];
                load_json(s_path, text_name);
            }
        });
    }
});

var hovertemplates = "<b>Sample      :</b>  %{x}<br>" +
    "<b>Taxonomy :</b>  %{data.name}<br>" +
    "<b>Percent     :</b>  %{y}<br><br>" +
    "<b>Detail</b><br>" +
    "%{customdata}<extra></extra>";

var types = 'bar';

function calculateGroupAverages(data, groupList) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("Invalid data in calculateGroupAverages");
        return {};
    }
    if (!groupList || !Array.isArray(groupList) || groupList.length === 0) {
        console.error("Invalid groupList in calculateGroupAverages");
        return {};
    }

    const groupAverages = {};

    groupList.forEach(group => {
        if (!groupAverages[group]) {
            groupAverages[group] = { y: Array(data.length).fill(0), count: Array(data.length).fill(0) };
        }
    });

    data.forEach((trace, traceIndex) => {
        trace.x.forEach((sample, sampleIndex) => {
            const group = groupList[sampleIndex];
            if (groupAverages[group]) {
                groupAverages[group].y[traceIndex] += trace.y[sampleIndex];
                groupAverages[group].count[traceIndex] += 1;
            }
        });
    });

    Object.keys(groupAverages).forEach(group => {
        groupAverages[group].y = groupAverages[group].y.map((value, index) =>
            groupAverages[group].count[index] > 0 ? value / groupAverages[group].count[index] : 0
        );
    });

    return groupAverages;
}

function load_json(src, dataKey) {
    if ((typeof group_name === 'undefined' || group_name.length === 0) && 
        (document.getElementById('groupSelector').value !== "Custom" || !uploadedData)) {
        console.log("No group data available. Skipping plot.");
        return;
    }

    var head = document.getElementsByTagName('head')[0];
    var element = head.getElementsByClassName("json")[0];

    try {
        if(element) element.parentNode.removeChild(element);
    } catch (e) {}

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.id = "json_data";
    script.className = "json";
    script.async = false;
    head.appendChild(script);

    var select = document.getElementById("loading-message");
    var select_2 = document.getElementById("taxonomy_bar");

    if(select) select.style.display = "block";
    if(select_2) select_2.innerHTML = "";
    
    const value = document.querySelector("#current_page");
    if(value) value.textContent = "Taxonomy Bar plot (" + dataKey + ")";

    script.onload = function () {
        switch (dataKey) {
            case 'Phylum': data = L2_data; break;
            case 'Class': data = L3_data; break;
            case 'Order': data = L4_data; break;
            case 'Family': data = L5_data; break;
            case 'Genus': data = L6_data; break;
            case 'Species': data = L7_data; break;
            default:
                console.error("Unknown dataKey: " + dataKey);
                return;
        }

        if (document.getElementById('top20_check') && document.getElementById('top20_check').checked) {
            data = cut_count(data);
        }

        // Dropdown 옵션 최신화
        set_sortkey(data);
        set_sortopt();

        // =====================================================================
        // [핵심 해결 로직]
        // 기존의 중복된 낡은 그리기 코드를 모두 삭제하고, 
        // 엑셀 정렬 유지 기능이 탑재된 barplot 함수로 깔끔하게 일원화했습니다!
        // =====================================================================
        barplot(data);
    };
}


document.addEventListener("DOMContentLoaded", function () {
    colors.forEach(function (color, index) {
        updateColorPickerButton(index, color);
    });

    const defaultButton = document.getElementById("default_button");
    if (defaultButton) {
        defaultButton.click();
    } else {
        if (data) {
            barplot(data);
        }
    }
});

function cut_count(data) {
    indexing_ = 20;
    if (data.length <= 20) {
        return data;
    }
    data = data.slice(0, indexing_);
    var total = data[0].y.map((_, i) => data.reduce((sum, trace) => sum + trace.y[i], 0));
    var trace4 = {
        x: data[0].x,
        y: total.map(val => 100 - val),
        name: 'Others',
        type: 'bar',
        hovertemplate: "<b>Sample :</b> %{x}<br><b>Taxonomy :</b> Others<br><b>Percent :</b> %{y}<extra></extra>", 
        customdata: Array(data[0].x.length).fill(""), 
        marker: { color: colors[20] }
    };

    data.push(trace4);
    return data;
}

function set_sortkey(data) {
    var select = document.getElementById("sortkey");
    if(!select) return; 
    
    select.innerHTML = "";
    var el = document.createElement("option");
    el.textContent = "default";
    el.value = "default";
    select.appendChild(el);

    var el = document.createElement("option");
    el.textContent = "samplename";
    el.value = "samplename";
    select.appendChild(el);

    for (var i = 0; i < data.length; i++) {
        var opt = data[i].name;
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
}

function set_sortopt() {
    var select = document.getElementById("sortkey");
    if(!select) return; 
    
    var value = select.value;
    if (value == "default") {
        $("#sortopt").attr("disabled", true);
    } else {
        $("#sortopt").removeAttr("disabled");
    }
}

function get_sortkey() {
    var select = document.getElementById("sortkey");
    return select ? select.value : "default";
}

function get_sortopt() {
    var select = document.getElementById("sortopt");
    return select ? select.value : "Ascending";
}

function barplot(data) {
    if (!data || data.length === 0 || !data[0].x || !data[0].y) {
        console.error("Invalid data structure for plotting.");
        return;
    }

    const [sortedData, indexing_] = sort_data(data);

    const plotData = sortedData.map((trace, traceIndex) => ({
        x: trace.x,
        y: trace.y,
        name: trace.name,
        type: 'bar',
        hovertemplate: trace.name === 'Others'
            ? "<b>Sample :</b> %{x}<br><b>Taxonomy :</b> Others<br><b>Percent :</b> %{y}<extra></extra>"
            : hovertemplates, 
        customdata: trace.name === 'Others'
            ? undefined
            : Array(trace.x.length).fill(Array.isArray(trace.customdata) ? trace.customdata[0] : trace.customdata),
        marker: { color: trace.marker.color }
    }));

    const layout = {
        barmode: 'stack',
        margin: { t: 20 },
        yaxis: {
            title: {
                text: 'Relative abundance (%)',
                font: {
                    family: 'Arial',
                    size: 25,
                    color: '#000000'
                }
            },
            tickfont: {
                family: 'Arial',
                size: 20,
                color: '#323232'
            },
            showgrid: false
        },
        xaxis: {
            type: 'category',
            tickfont: {
                family: 'Arial',
                size: 16,
                color: '#323232'
            },
            automargin: true
        },
        autosize: false,
        width: getwidth(),
        height: 700
    };

    const config = {
        displaylogo: false,
        modeBarButtonsToRemove: ["pan", "zoom", "select", "lasso2d", "autoScale", "resetScale", "hoverCompareCartesian", "hoverClosestCartesian", "plotly-logo"]
    };

    Plotly.newPlot('taxonomy_bar', plotData, layout, config).then(function() {
        var select = document.getElementById("loading-message");
        if(select) select.style.display = "none";
    }).catch(function(error) {
        console.error("Plotly error:", error);
    });
}

function sortWithIndeces(toSort) {
    for (var i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];
    }
    toSort.sort(function (left, right) {
        return left[0] < right[0] ? -1 : 1;
    });
    toSort.sortIndices = [];
    for (var j = 0; j < toSort.length; j++) {
        toSort.sortIndices.push(toSort[j][1]);
        toSort[j] = toSort[j][0];
    }
    return toSort;
}

function get_index(input) {
    const result = Array.from(input.keys())
        .sort((a, b) => input[a].localeCompare(input[b], undefined, { numeric: true, sensitivity: 'base' }));
    return result;
}

function compareNumeric(a, b) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (numA < numB) {
        return -1;
    } else if (numA > numB) {
        return 1;
    } else {
        return 0;
    }
}

function get_index_numeric(input) {
    const result = Array.from(input.keys())
        .sort((a, b) => compareNumeric(input[a], input[b]));

    return result;
}

function sort_data(data) {
    const sortkey = get_sortkey();
    const sortopt = get_sortopt();
    const sampleList = window['sample_list'];
    let groupList;

    if (document.getElementById('groupSelector') && document.getElementById('groupSelector').value === "Custom") {
        groupList = sampleList.map(sample => dict[sample]);
    } else if (document.getElementById('groupSelector')) {
        const groupIndex = document.getElementById('groupSelector').selectedIndex;
        groupList = window[`group_list${groupIndex + 1}`];
    }

    if (!groupList || !Array.isArray(groupList)) {
        console.error("Invalid groupList in sort_data");
        return [data, 0];
    }

    let indexing_ = 0;
    let plotData = [];

    const groupAverages = calculateGroupAverages(data, groupList);
    const groupKeys = Object.keys(groupAverages);

    let xAxisGroups;

    if (sortkey === "default" && window.custom_x_order && window.custom_x_order.length > 0) {
        xAxisGroups = window.custom_x_order.filter(g => groupKeys.includes(g));
        groupKeys.forEach(g => { if(!xAxisGroups.includes(g)) xAxisGroups.push(g); });
    } 
    else if (sortkey === "default") {
        xAxisGroups = sampleList.map((_, i) => groupList[i]);
        xAxisGroups = [...new Set(xAxisGroups)];
    } else if (sortkey === "samplename") {
        xAxisGroups = [...groupKeys].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        if (sortopt !== "Ascending") xAxisGroups.reverse();
    } else {
        const sortTraceIndex = data.findIndex(trace => trace.name === sortkey);
        if (sortTraceIndex === -1) {
            console.error("Sort key not found in data:", sortkey);
            return [data, 0];
        }

        indexing_ = sortTraceIndex;

        xAxisGroups = [...groupKeys].sort((a, b) => {
            const valA = groupAverages[a].y[sortTraceIndex];
            const valB = groupAverages[b].y[sortTraceIndex];
            return sortopt === "Ascending" ? valA - valB : valB - valA;
        });
    }

    plotData = data.map((trace, traceIndex) => ({
        x: xAxisGroups,
        y: xAxisGroups.map(g => groupAverages[g].y[traceIndex]),
        name: trace.name,
        type: 'bar',
        hovertemplate: trace.name === 'Others'
            ? "<b>Sample :</b> %{x}<br><b>Taxonomy :</b> Others<br><b>Percent :</b> %{y}<extra></extra>"
            : hovertemplates,
        customdata: trace.name === 'Others'
            ? undefined
            : Array(xAxisGroups.length).fill(Array.isArray(trace.customdata) ? trace.customdata[0] : trace.customdata),
        marker: { color: trace.marker.color }
    }));

    let selectedTrace = null;

    if (sortkey !== "default" && sortkey !== "samplename") {
        const idx = plotData.findIndex(trace => trace.name === sortkey);
        if (idx !== -1) {
            selectedTrace = plotData.splice(idx, 1)[0];
        }
    }

    const totalPercentMap = {};
    data.forEach(trace => {
        totalPercentMap[trace.name] = trace.y.reduce((acc, val) => acc + val, 0);
    });

    const othersIndex = plotData.findIndex(trace => trace.name === 'Others');
    const othersTrace = othersIndex !== -1 ? plotData.splice(othersIndex, 1)[0] : null;

    const middleTraces = plotData.filter(trace =>
        trace.name !== (selectedTrace && selectedTrace.name) &&
        trace.name !== 'Others'
    );

    middleTraces.sort((a, b) => {
        const sumA = totalPercentMap[a.name] ?? 0;
        const sumB = totalPercentMap[b.name] ?? 0;
        return sumB - sumA;
    });

    plotData = [];
    if (selectedTrace) plotData.push(selectedTrace);
    plotData = [...plotData, ...middleTraces];
    if (othersTrace) plotData.push(othersTrace);

    return [plotData, indexing_];
}

function setwidth(data) {
    for (var i = 0; i < data.length; i++) {
        data[i].width = 0.9;
    }
    return data;
}

function getwidth() {
    const input = document.querySelector("#bandwidth");
    return input ? parseInt(input.value, 10) : 1100;
}

function downloadimg(type) {
    var graphDiv = document.getElementById('taxonomy_bar');
    Plotly.downloadImage(graphDiv, { format: type, filename: 'barplot' });
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

var gcolors = [
    "#1D5D9B", "#75C2F6", "#F4D160", "#FBEEAC", "#008B8B",
    "#DAA520", "#E6E6FA", "#8B0000", "#ADD8E6", "#E1BEE7",
    "#D8D8D8", "#FFE4B5", "#FFDAB9", "#00CED1",
];

var colors = [
    "#A54657", "#582630", "#fdf6b9", "#b8aa99", "#CDE990",
    "#4DAA57", "#AFD3E2", "#19A7CE", "#d7accb", "#cb5898",
    "#7B8FA1", "#3465be", "#F4D160", "#F6AE2D", "#aba5cf",
    "#64489e", "#F1A66A", "#F26157", "#97DECE", "#439A97", "#D3D3D3"
];

var currentColorIndex;

function toggleColorPicker() {
    var toggleButton = document.getElementById("toggleButton");
    var colorPickerButtons = document.getElementsByClassName("color-picker-button");
    var colorPickerModal = document.getElementById("colorPickerModal");

    Array.from(colorPickerButtons).forEach(function (button) {
        button.style.display = "inline-block";
    });
    if(colorPickerModal) colorPickerModal.style.display = "flex";
}

function openColorPicker(colorIndex) {
    currentColorIndex = colorIndex;
    var colorPickerModal = document.getElementById("colorPickerModal");
    var colorPickerInput = document.getElementById("colorPickerInput");
    if(colorPickerInput) colorPickerInput.value = colors[currentColorIndex];
    if(colorPickerModal) colorPickerModal.style.display = "flex";
}

function changeColor() {
    var colorPickerModal = document.getElementById("colorPickerModal");
    var colorPickerInput = document.getElementById("colorPickerInput");
    if(!colorPickerInput) return;
    
    var selectedColor = colorPickerInput.value;
    colors[currentColorIndex] = selectedColor;
    updateColorPickerButton(currentColorIndex, selectedColor);

    const value = document.querySelector("#current_page");
    var script_src = document.getElementById("json_data");
    if(script_src && value) {
        var s_path = script_src.src;
        var text_name = value.value.split('(')[1].split(')')[0];
        load_json(s_path, text_name);
    }
}

function closeColor() {
    var colorPickerModal = document.getElementById("colorPickerModal");
    if(colorPickerModal) colorPickerModal.style.display = "none";
}

function updateColorPickerButton(colorIndex, color) {
    var button = document.getElementById("button" + (colorIndex + 1));
    if (button) {
        button.style.backgroundColor = color;
    }
}