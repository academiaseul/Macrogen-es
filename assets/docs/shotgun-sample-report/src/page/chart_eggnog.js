function getTextWidth(text, fontSize, fontName) {
	c = document.createElement("canvas");
	ctx = c.getContext("2d");
	ctx.font = fontSize + ' ' + fontName;
	return ctx.measureText(text).width;
}

var margin = {
		top: 0,
		right: 80,
		bottom: 80,
		left: 45
	},
	svg = d3.select("#chart_eggnog"),
	width = svg.attr("width") - margin.left - margin.right,
	height = svg.attr("height") - margin.top - margin.bottom,
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
	textWidthHolder = 0;

//그래프 영역 지정
svg.append("defs").append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", width)
	.attr("height", +svg.attr("height"))
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//data 불러오기
var array;
var categories;
var descriptions = {};

var data = [];
for (var i = 0, sample; sample = array.samples[i]; i++) {
	var temp = {"Samples" : sample};
	for (var j = 0, ca; ca = categories[j]; j++) {
		temp[ca] = array.stats[sample][ca];
	}
	data.push(temp);
}

data.forEach(function (d) {
	var y0 = 0;
	d.responses = categories.map(function(response) {
		var temp = {"response" : response, "y0": y0, "yp0": y0};
		y0 += +d[response].Count;
		temp.y1 = y0;
		temp.yp1 = y0;
		temp.count = d[response].Count;
		temp.ratio = d[response].Ratio;

		return temp;
	});
	d.responses.forEach(function(r) { 
		r.yp0 /= y0; r.yp1 /= y0; 
	});
	d.totalresponses = d.responses[d.responses.length - 1].y1;
});

categories.map(function(c) {
	descriptions[c] = array.stats[array.samples[0]][c].Description;
});

//zoom 비율 설정
if (array.samples.length < 7) {
	zoom_rat = 1;
} else {
	zoom_rat = 1 * array.samples.length / 7;
}

//x축 그룹(샘플명)값 간격 설정
var x = d3.scaleBand()
	.rangeRound([0, width])
	.paddingInner(0.25)
	.paddingOuter(0.25);

//y축 값 간격 설정
var y = d3.scaleLinear()
	.domain([0, 1])
	.range([ height, margin.bottom ]);

//94e8b4-72bda3-5e8c61-4e6151-3b322c-d5573b-885053-777da7-e8e1ef-d9fff8
//e4572e-17bebb-ffc914-2e282a-76b041-ece4b7-d9dd92-eabe7c-311e10-efa8b8
//820263-d90368-eadeda-2e294e-ffd400
//de4d44
//9e3744
//ff842a 
//fc766a 
//c83e74 
//8d9440
//fed65e 
//2e5d9f 
//755841 
//daa03d 
//616247 
//e7b7cf 
//d7c49e 
//3b3a50 
//f2edd7 
//615550 
//
//1de9b6
//BBDEFB
//E1BEE7
//
//BDBDBD
//

//그래프 색 지정

var colors = d3.scaleOrdinal()
	.range(["#94e8b4", "#72bda3", "#5e8c61", "#4e6151", "#3b322c", "#d5573b", "#885053", "#777da7", "#e8e1ef", "#d9fff8", "#e4572e", "#17bebb", "#ffc914", "#2e282a", "#76b041", "#ece4b7", "#d9dd92", 
		"#eabe7c", "#311e10", "#efa8b8", "#820263", "#d90368", "#eadeda", "#2e294e", "#BBDEFB"])
	.domain(categories);

/*
var colors = d3.scaleOrdinal()
	.range(["#de4d44", "#9e3744", "#ff842a", "#fc766a", "#c83e74", "#8d9440", "#fed65e", "#2e5d9f", "#755841", "#daa03d", "#616247", "#e7b7cf", "#d7c49e", "#3b3a50", "#f2edd7", "#615550", "#1de9b6", 
		"#BBDEFB", "#E1BEE7", "#BDBDBD", "#820263", "#d90368", "#eadeda", "#2e294e", "#ffd400"])
	.domain(categories);
*/
//축 설정
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y).ticks(7);

x.domain(array.samples);
yAxis.tickFormat(d3.format(".0%"));

g.append("g")
	.style('clip-path', 'url(#clip)')
	.append("g")
	.attr("class", "x_axis")
	.attr("transform", "translate(" + margin.left + "," + height + ")")
	.call(xAxis).selectAll(".tick text");
	
g.append("g")
	.attr("transform", "translate(" + margin.left + ",0)")
	.attr("class", "y_axis")
	.call(yAxis)
	.append("text")
	.attr("class", "axistext")
	.attr("transform", "rotate(0)")
	.attr("x", margin.left - 30)
	.attr("y", margin.top + 60)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#000")
	.text("Percent");

//축 텍스트 폰트 크기 설정
g.select(".x_axis")
	.selectAll("text")
	.style("font-size", "12px");
g.select(".y_axis")
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
	var div = d3.select("#div_chart").node();
	for (var lx = 0, ly = 0; el != null && el != div; lx += (el.offsetLeft || el.clientLeft), ly += (el.offsetTop || el.clientTop), el = (el.offsetParent || el.parentNode));

	return {x: lx, y: ly};
}

var root = d3.select("#chart_eggnog");
var scr = { x: window.scrollX, y : window.scrollY, w: window.innerWidth, h:window.innerHeight };
var body_sel = d3.select("#div_chart");
var body = {w:body_sel.node().offsetWidth, h:body_sel.node().offsetHeight};
var doc = {w:document.width, h: document.height};
var svgpos = getNodePos(root.node());
var dist = {x : 30, y : 80};

//bar 그래프
var category = g.append("g")
	.style('clip-path', 'url(#clip)')
	.selectAll(".category")
	.data(data)
	.enter().append("g")
	.attr("class", "category")
	.attr("transform", function(d) { return "translate(" + (margin.left + x(d.Samples)) + ",0)"; });

category.selectAll("rect")
	.data(function(d) { return d.responses; })
	.enter().append("rect")
	.attr("class", "rect")
	.attr("width", x.bandwidth())
	.attr("y", function(d) { return y(d.yp1); })
	.attr("height", function(d) { return y(d.yp0) - y(d.yp1); })
	.style("fill", function(d) { return colors(d.response); })
	.on("mousemove", function(d) {
		d3.select(this).style("fill", d3.rgb(colors(d.response)).darker(2));

		var m = d3.mouse(root.node());
		scr.x = window.scrollX;
		scr.y = window.scrollY;
		m[0] += svgpos.x;
		m[1] += svgpos.y;
		tooltip.style("right", "");
		tooltip.style("left", "");
		tooltip.style("bottom", "");
		tooltip.style("top", "");

//		console.log('coordinates: doc/body/scr/svgpos/mouse: ', doc, body, scr, svgpos, m);
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
			.html("<strong>" + d.response + ": " + descriptions[d.response] + "</strong/><br>" + d.count + " (" + d.ratio + "%)");
	})
	.on("mouseout", function(d) {
		d3.select(this).style("fill", colors(d.response));
		tooltip
			.style("opacity", 0);
	});

//zoom in/out

var zoom = d3.zoom()
	.scaleExtent([1, Infinity])
	.translateExtent([
		[0, 0],
		[width, height]
	])
	.extent([
		[0, 0],
		[width, height]
	])
	.on("zoom", function() {
		return zoomed();
	});

svg.call(zoom)
	.call(zoom.transform, d3.zoomIdentity.translate(0, 50).scale(zoom_rat))

function zoomed() {
	x.range([0, width].map(function(d) {
		return d3.event.transform.applyX(d);
	}));

	var y_zoom = d3.event.transform.rescaleY(y)

	g.selectAll(".category").attr("transform", function(d) {
		return "translate(" + (margin.left + x(d.Samples)) + ",0)";
	});
	g.selectAll(".rect").attr("width", x.bandwidth());

	g.select(".x_axis").call(xAxis);
	//g.select(".y_axis").call(yAxis.scale(y_zoom));


}

//reset
d3.select("#reset_eggnog")
	.on("click", function() {
		transitionPercent();
		document.getElementById("checkform").reset();
	});

function resetted() {
	svg.transition()
		.call(zoom.transform, d3.zoomIdentity.translate(0, 50).scale(zoom_rat));
	
}

//legend

var LegendHolder = g.append("g").attr("class", "legendHolder");
var legend = LegendHolder.selectAll(".legend")
	.data(categories)
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) {
		return "translate(0," + (height + margin.bottom / 2) + ")";
	})
	.each(function(d, i) {
		//legend 사각형
		d3.select(this).append("rect")
			.attr("width", function() {
				return 18
			})
			.attr("x", function(b) {
				left = (i + 1) * 15 + i * 18 + i * 5 + textWidthHolder;
				return left;
			})
			.attr("y", 0)
			.attr("height", 18)
			.style("fill", function(b) {
				return colors(b);
			});

		//legend 텍스트
		d3.select(this).append("text")
			.attr("x", function(b) {
				left = (i + 1) * 15 + (i + 1) * 18 + (i + 1) * 5 + textWidthHolder;
				return left;
			})
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "start")
			.text(d);
		textWidthHolder += getTextWidth(d, "10px", "calibri");
	});

//legend 위치
d3.select(".legendHolder").attr("transform", function(d) {
	thisWidth = d3.select(this).node().getBBox().width;
	return "translate(" + ((width) / 2 - thisWidth / 2) + ",0)";
});

// transition count or percent
d3.selectAll("input").on("change", handleFormClick);

function handleFormClick() {
	if (this.value == "bypercent") {
		transitionPercent();
	}
	else {
		transitionCount();
	}
}

function transitionPercent() {
	y.domain([0, 1]);
	var trans = svg.transition().duration(250);
	
	var categories = trans.selectAll(".category");
	categories.selectAll("rect")
		.attr("y", function(d) { 
			return y(d.yp1);
		})
		.attr("height", function(d) {
			return y(d.yp0) - y(d.yp1);
		});
	
	yAxis.tickFormat(d3.format(".0%"));
	g.select(".y_axis")
		.selectAll(".axistext")
		.remove();

	g.selectAll(".y_axis")
		.call(yAxis)
		.append("text")
		.attr("class", "axistext")
		.attr("transform", "rotate(0)")
		.attr("x", margin.left - 30)
		.attr("y", margin.top + 60)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.attr("fill", "#000")
		.text("Percent");

	g.select(".x_axis")
		.selectAll("text")
		.style("font-size", "12px");
	g.select(".y_axis")
		.selectAll("text")
		.style("font-size", "12px");

	resetted();
}

function transitionCount() {
	y.domain([0, d3.max(data, function(d) { return d.totalresponses; })]);

	var transone = svg.transition()
		.duration(250);

	var categoriesone = transone.selectAll(".category");

	categoriesone.selectAll("rect")
		.attr("y", function(d) { return this.getBBox().y + this.getBBox().height - (y(d.y0) - y(d.y1)) })
		.attr("height", function(d) { return y(d.y0) - y(d.y1); });

	var transtwo = transone.transition()
		.delay(0)
		.duration(350)
		.ease(d3.easeBounce);

	var categoriestwo = transtwo.selectAll(".category");
	categoriestwo.selectAll("rect")
		.attr("y", function(d) { return y(d.y1); });

	yAxis.tickFormat(function(d) { return AddComma(d); })
	g.select(".y_axis")
		.selectAll(".axistext")
		.remove();

	g.selectAll(".y_axis")
		.call(yAxis)
		.append("text")
		.attr("class", "axistext")
		.attr("transform", "rotate(0)")
		.attr("x", margin.left - 30)
		.attr("y", margin.top + 60)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.attr("fill", "#000")
		.text("Count");

	g.select(".x_axis")
		.selectAll("text")
		.style("font-size", "12px");
	g.select(".y_axis")
		.selectAll("text")
		.style("font-size", "12px");

	resetted();
}

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
