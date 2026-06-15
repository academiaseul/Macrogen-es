var data; // 전역 변수로 설정하여 모든 함수에서 접근 가능

if (typeof new_name !== 'undefined' && new_name.length > 0) {
    sample_list = new_name;
}

document.addEventListener("DOMContentLoaded", function () {
    const sortkey_input = document.querySelector("#sortkey");
    sortkey_input.addEventListener("input", (event) => {
        set_sortopt();
        barplot(data);
    });

    const sortopt_input = document.querySelector("#sortopt");
    sortopt_input.addEventListener("input", (event) => {
        barplot(data);
    });

    const input = document.querySelector("#bandwidth");
    input.addEventListener("input", (event) => {
        barplot(data);
    });

    const top20_check = document.querySelector("#top20_check");
    top20_check.addEventListener("input", (event) => {
        const value = document.querySelector("#current_page");
        var script_src = document.getElementById("json_data");
        var s_path = script_src.src;
        var text_name = value.value.split('(')[1].split(')')[0];
        load_json(s_path, text_name);
    });
});

var hovertemplates = "<b>Sample      :</b>  %{x}<br>" +
    "<b>Taxonomy :</b>  %{data.name}<br>" +
    "<b>Percent     :</b>  %{y}<br><br>" +
    "<b>Detail</b><br>" +
    "%{customdata}<extra></extra>";

var types = 'bar';

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
    script.id = "json_data";
    script.className = "json";
    script.async = false;
    head.appendChild(script);

    var select = document.getElementById("loading-message");
    var select_2 = document.getElementById("taxonomy_bar");

    select.style.display = "block";
    select_2.innerHTML = "";
    const value = document.querySelector("#current_page");
    value.textContent = "Taxonomy Bar plot (" + dataKey + ")";

    script.onload = function () {
        switch (dataKey) {
            case 'Phylum':
                data = L2_data;
                break;
            case 'Class':
                data = L3_data;
                break;
            case 'Order':
                data = L4_data;
                break;
            case 'Family':
                data = L5_data;
                break;
            case 'Genus':
                data = L6_data;
                break;
            case 'Species':
                data = L7_data;
                break;
            default:
                console.error("Unknown dataKey: " + dataKey);
                return;
        }

        if ($('#top20_check').is(':checked')) {
            data = cut_count(data);
        }

        set_sortkey(data); // 데이터를 로드한 후에 sortkey 설정
        set_sortopt();
        barplot(data);
    };
}

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
        hovertemplate:
           "<b>Sample :</b> %{x}<br>" +
           "<b>Taxonomy :</b> Others<br>" +
           "<b>Percent :</b> %{y}<extra></extra>",
        customdata   : undefined,
        marker: { color: colors[20] }
    };
    data.push(trace4);
    return data;
}

function set_sortkey(data) {
    var select = document.getElementById("sortkey");
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
    var value = select.value;
    if (value == "default") {
        $("#sortopt").attr("disabled", true);
    } else {
        $("#sortopt").removeAttr("disabled");
    }
}

function get_sortkey() {
    var select = document.getElementById("sortkey");
    var value = select.value;
    return value;
}

function get_sortopt() {
    var select = document.getElementById("sortopt");
    var value = select.value;
    return value;
}

function barplot(data) {
    if (!data || data.length === 0 || !data[0].x || !data[0].y) {
        console.error("Invalid data structure for plotting.");
        return;
    }

    const [sortedData, indexing_] = sort_data(data);

    const plotData = sortedData.map(trace => ({
        x   : trace.x,
        y   : trace.y,
        name: trace.name,
        type: 'bar',
        hovertemplate: trace.name === 'Others'
            ? "<b>Sample :</b> %{x}<br>" +
              "<b>Taxonomy :</b> Others<br>" +
              "<b>Percent :</b> %{y}<extra></extra>"
            : hovertemplates,
        customdata: trace.name === 'Others'
            ? undefined
            : Array(trace.x.length).fill(trace.customdata),
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
        const select = document.getElementById("loading-message");
        select.style.display = "none";
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
    let indexing_ = 0; 
    let sorted_x_list; 

    if (sortkey === "default") {
        sorted_x_list = [...sample_list];
    } else if (sortkey === "samplename") {
        sorted_x_list = [...data[0].x].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        if (sortopt !== "Ascending") {
            sorted_x_list.reverse();
        }
    } else {
        const sortTraceIndex = data.findIndex(trace => trace.name === sortkey);
        if (sortTraceIndex === -1) {
            console.error("Sort key not found in data:", sortkey);
            return [data, 0]; 
        }
        indexing_ = sortTraceIndex;
        const sortTrace = data[indexing_];

        const samplesToSort = sortTrace.x.map((sample, i) => ({
            sample: sample,
            value: sortTrace.y[i]
        }));

        samplesToSort.sort((a, b) => a.value - b.value); 

        if (sortopt !== "Ascending") {
            samplesToSort.reverse();
        }

        sorted_x_list = samplesToSort.map(item => item.sample);
    }

    if ($('#group_check').is(':checked')) {
        const dummy_y_list = sorted_x_list.map(() => 0);
        const result = group_sort(sorted_x_list, dummy_y_list);
        sorted_x_list = result[0]; 
    }

    data.forEach(trace => {
        const valueMap = new Map(trace.x.map((sample, i) => [sample, trace.y[i]]));
        trace.x = sorted_x_list;
        trace.y = sorted_x_list.map(sample => valueMap.get(sample));
    });

    const selectedTrace = data.splice(indexing_, 1)[0];
    data.unshift(selectedTrace);

    const remainingData = data.slice(1).filter(trace => trace.name !== 'Others');

    remainingData.sort((a, b) => {
        const sumA = a.y.reduce((acc, val) => acc + val, 0);
        const sumB = b.y.reduce((acc, val) => acc + val, 0);
        return sumB - sumA; 
    });

    const othersTrace = data.find(trace => trace.name === 'Others');
    if (othersTrace) {
        remainingData.push(othersTrace);
    }

    data = [selectedTrace, ...remainingData];
    return [data, indexing_];
}

function setwidth(data) {
    for (var i = 0; i < data.length; i++) {
        data[i].width = 0.9;
    }
    return data;
}

function getwidth() {
    const input = document.querySelector("#bandwidth");
    return parseInt(input.value, 10);
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
    "#64489e", "#F1A66A", "#F26157", "#97DECE", "#439A97",
    "#D3D3D3"
];

var currentColorIndex;

function toggleColorPicker() {
    var toggleButton = document.getElementById("toggleButton");
    var colorPickerButtons = document.getElementsByClassName("color-picker-button");
    var colorPickerModal = document.getElementById("colorPickerModal");

    Array.from(colorPickerButtons).forEach(function (button) {
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

    const value = document.querySelector("#current_page");
    var script_src = document.getElementById("json_data");
    var s_path = script_src.src;
    var text_name = value.value.split('(')[1].split(')')[0];
    load_json(s_path, text_name);
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

// =========================================================================
// ▼▼▼ 여기에 추가된 1번째 파트: DOMContentLoaded 시 커스텀 리스트 초기화 ▼▼▼
// =========================================================================
document.addEventListener("DOMContentLoaded", function () {
    // 초기화 시 각 버튼에 색상 적용
    colors.forEach(function (color, index) {
        updateColorPickerButton(index, color);
    });

    // 샘플 순서 커스텀 리스트 초기화 (새로 추가된 부분!)
    if (typeof sample_list !== 'undefined') {
        initCustomOrderList();
    }

    // 기본 버튼 클릭으로 최초 그래프 로드
    document.getElementById("default_button").click();
});

// =========================================================================
// ▼▼▼ 여기에 추가된 2번째 파트: 사용자 지정 샘플 순서 변경 함수들 ▼▼▼
// =========================================================================

// 1. 페이지 로드 시 기존 sample_list를 화면의 리스트 박스에 채워넣기
function initCustomOrderList() {
    const list = document.getElementById("custom_order_list");
    if (!list) return; // HTML에 리스트가 아직 없으면 안전하게 통과
    
    list.innerHTML = "";
    sample_list.forEach(sample => {
        let opt = document.createElement("option");
        opt.value = sample;
        opt.textContent = sample;
        list.appendChild(opt);
    });
}

// 2. 선택한 샘플을 위로 올리기
function moveSampleUp() {
    const list = document.getElementById("custom_order_list");
    if (list.selectedIndex > 0) {
        const selected = list.options[list.selectedIndex];
        list.insertBefore(selected, list.options[list.selectedIndex - 1]);
    }
}

// 3. 선택한 샘플을 아래로 내리기
function moveSampleDown() {
    const list = document.getElementById("custom_order_list");
    if (list.selectedIndex >= 0 && list.selectedIndex < list.options.length - 1) {
        const selected = list.options[list.selectedIndex];
        list.insertBefore(selected, list.options[list.selectedIndex + 2]);
    }
}

// 4. 변경된 순서 적용하기 (Apply 버튼 클릭 시)
function applyCustomOrder() {
    const list = document.getElementById("custom_order_list");
    const newOrder = [];
    
    // UI의 리스트 순서대로 배열 새로 만들기
    for (let i = 0; i < list.options.length; i++) {
        newOrder.push(list.options[i].value);
    }
    
    // 전역 변수 덮어쓰기
    sample_list = newOrder; 
    
    // 강제로 정렬 기준을 'default'로 변경하여 방금 만든 순서를 적용
    document.getElementById("sortkey").value = "default";
    set_sortopt();
    
    // 그래프 다시 그리기
    if (data) {
        barplot(data);
    }
}