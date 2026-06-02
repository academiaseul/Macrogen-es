function getTextWidth(text, fontSize, fontName) {
	c = document.createElement("canvas");
	ctx = c.getContext("2d");
	ctx.font = fontSize + ' ' + fontName;
	return ctx.measureText(text).width;
}

//data 불러오기
var array;

var data = array.stats;
var nums = data.map((x) => x.num);
var names = data.map((x) => x.name);
 
const barwidth = 30;
const rad = 8;
var padding = 6;
var vpadding = 4;

// width 1100, height 500
var margin = {
		top: 0,
		right: 80,
		bottom: (rad * 2 + 30) * array.samples.length,
		left: 100
	};

var minwidth = 1100;
var minheight = 400 + margin.bottom;
if (data.length * (barwidth * 2) > 1100) {
	minwidth = data.length * (barwidth * 2);
}

var width = minwidth - margin.left - margin.right;
var height = minheight - margin.top - margin.bottom;


var svg = d3.select("#chart_pg")
	.attr("width", minwidth)
	.attr("height", minheight);

var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
	textWidthHolder = 0;

//그래프 영역 지정
svg.append("defs").append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", width)
	.attr("height", +svg.attr("height"))
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var upsetCircles = svg.append('g')
	.attr('id', 'upsetCircles')
	.attr('transform', "translate(" + (margin.left + 24) + "," + (height + 40) + ')');

array.samples.forEach((x, i) => {
	upsetCircles.append("text")
		.attr("dx", -30)
		.attr("dy", 5 + i * (rad * vpadding))
		.attr("text-anchor", "end")
		.text(x);
});

var upsetBars = svg.append("g")
	.attr("id", "upsetBars");

//x축 그룹(샘플명)값 간격 설정
var x = d3.scaleLinear()
	.domain([0, data.length])
	.range([0, width]);

//y축 값 간격 설정
var y = d3.scaleLinear()
	.domain([0, d3.max(nums)])
	.range([ height, 0 ]);

//축 설정
var xAxis = d3.axisBottom(x)
	.tickPadding(2)
	.tickFormat((d, i) => data[i].name)
	.tickValues(d3.range(data.length));

var yAxis = d3.axisLeft(y).ticks(7);

x.domain(names);

upsetBars.append("g")
	.style('clip-path', 'url(#clip)')
	.append("g")
	.attr("class", "x_axis")
	.attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
//	.attr("fill", "none")
	.call(xAxis)
	.selectAll(".tick")
	.remove();
	
upsetBars.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.attr("class", "y_axis")
	.call(yAxis);

//축 텍스트 폰트 크기 설정
upsetBars.select(".x_axis")
	.selectAll("text")
	.style("font-size", "12px");
upsetBars.select(".y_axis")
	.selectAll("text")
	.style("font-size", "12px");

// tooltip
var tooltip = d3.select("#div_tooltip")
	.style("opacity", 0)
	.attr("class", "tooltip_chart")
	.style("position", "absolute")
	.style("background-color", "white")
	.style("border", "solid")
	.style("border-width", "2px")
	.style("border-radius", "5px")
	.style("padding", "5px");

function getNodePos(el) {
	var div = d3.select("#div_chart_pg").node();
	for (var lx = 0, ly = 0; el != null && el != div; lx += (el.offsetLeft || el.clientLeft), ly += (el.offsetTop || el.clientTop), el = (el.offsetParent || el.parentNode));

	return {x: lx, y: ly};
}

var root = d3.select("#chart_pg");
var scr = { x: window.scrollX, y : window.scrollY, w: window.innerWidth, h:window.innerHeight };
var body_sel = d3.select("#div_chart_pg");
var body = {w:body_sel.node().offsetWidth, h:body_sel.node().offsetHeight};
var doc = {w:document.width, h: document.height};
var svgpos = getNodePos(root.node());
var dist = {x : 30, y : 80};

//bar 그래프
var chart = upsetBars.append("g")
	.style('clip-path', 'url(#clip)')
	.attr("transform", "translate(1,0)")
	.attr("id", "bars");

var bars = chart.selectAll('.bar')
	.data(data)
	.enter()
	.append("rect")
	.attr("class", "bar")
	.attr("width", barwidth)
	.attr("x", (d, i) => 9 + i * (rad * padding) + margin.left)
	.attr("y", (d) => y(d.num))
	.style("fill", "#5F79A9")
	.attr("height", (d) => height - y(d.num))
	.on("mousemove", function(d) {
		d3.select(this).style("fill", d3.rgb("#5F79A9").darker(2));
		var m = d3.mouse(root.node());
		scr.x = window.scrollX;
		scr.y = window.scrollY;
		m[0] += svgpos.x;
		m[1] += svgpos.y;
		tooltip.style("right", "");
		tooltip.style("left", "");
		tooltip.style("bottom", "");
		tooltip.style("top", "");

		if (m[0] > scr.x + scr.w / 2) {
			tooltip.style("right", (body.w - m[0] + dist.x) + "px");
		}
		else {
			tooltip.style("left", (m[0] + dist.x) + "px");
		}
		if (m[1] > scr.y + scr.h / 2) {
			tooltip.style("bottom", (body.h - m[1] + dist.y) + "px");
		}
		else {
			tooltip.style("top", (m[1] + dist.y) + "px");
		}
		tooltip
			.style("opacity", 1)
			.html("<strong>" + d.name + ": " + "</strong/>" + d.num);
		
		
	})
	.on("mouseout", function(d) {
		d3.select(this).style("fill", "#5F79A9");
		tooltip.style("opacity", 0);
	});

// circle 그래프

data.forEach((x, i) => {
	array.samples.forEach((y, j) => {
		upsetCircles.append('circle')
			.attr('cx', i * (rad * padding))
			.attr('cy', j * (rad * vpadding))
			.attr('r', rad)
			.attr('class', `set-${i}`)
			.style('opacity', 1)
			.attr('fill', () => {
				if (x.sets.indexOf(y) !== -1) {
					return '#5F79A9';
				}
				return 'silver';
			});
	});

	upsetCircles.append('line')
		.attr('id', `setline${i}`)
		.attr('x1', i * (rad * padding))
		.attr('y1', array.samples.indexOf(x.sets[0]) * (rad * vpadding))
		.attr('x2', i * (rad * padding))
		.attr('y2', array.samples.indexOf(x.sets[x.sets.length - 1]) * (rad * vpadding))
		.style('stroke', '#5F79A9')
		.attr('stroke-width', 4);
});

//텍스트 줄바꿈
function wrap(text, width) {
	text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1, //ems
			y = text.attr("y"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber * lineHeight + dy) + "em").text(word);
			}
		}
	});
}

function AddComma(data_value) {
	return Number(data_value).toLocaleString('en');
}
