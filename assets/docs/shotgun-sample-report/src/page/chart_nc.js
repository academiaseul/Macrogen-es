function getTextWidth(text, fontSize, fontName) {
	c = document.createElement("canvas");
	ctx = c.getContext("2d");
	ctx.font = fontSize + ' ' + fontName;
	return ctx.measureText(text).width;
}

var margin_q = {
		top: 0,
		right: 80,
		bottom: 80,
		left: 45
	},
	svg_q = d3.select("#chart_nc"),
	width = svg_q.attr("width") - margin_q.left - margin_q.right,
	height = svg_q.attr("height") - margin_q.top - margin_q.bottom,
	g = svg_q.append("g").attr("transform", "translate(" + margin_q.left + "," + margin_q.top + ")"),
	textWidthHolder = 0;

//그래프 영역 지정
svg_q.append("defs").append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", width)
	.attr("height", +svg_q.attr("height"))
	.attr("transform", "translate(" + margin_q.left + "," + margin_q.top + ")");

//카테고리 첫번째 항목에 bar 항목 추가
var Categories = [];

Categories.pro;

array_q[0].Categories.forEach(function(b) {
	b.Type = "bar";
	Categories.push(b)
});

//data 불러오기
var array_q;

//zoom 비율 설정
if (array_q.length < 7) {
	zoom_rat = 1;
} else {
	zoom_rat = 1 * array_q.length / 7;
}

//x축 그룹(샘플명)값 간격 설정
var x0 = d3.scaleBand()
	.rangeRound([margin_q.left, width])
	.paddingInner(0.1)
	.paddingOuter(0.1);

//x축 그룹 내 요소간(Q20/30) 간격 설정
var x1 = d3.scaleBand()
	.paddingOuter(0.25)
	.paddingInner(0.15);

//y축 값 간격 설정
var Values = [];
for (var i = 0; i < array_q.length; i++) {
	Values.push(array_q[i].Categories[0].Value);
}

var y = d3.scaleLinear()
	.domain([0, d3.max(Values)]) 
	.range([height, margin_q.bottom]);

//그래프 색 지정
var color = d3.scaleOrdinal()
	.range(["#5F79A9", "#70B9C8"]);

//그래프 상단 텍스트 색 지정
var color_text = d3.scaleOrdinal()
	.range(["#5F79A9", "#70B9C8"]);

//축 설정
var xAxis = d3.axisBottom(x0);
var yAxis = d3.axisLeft(y).ticks(5);

x0.domain(array_q.map(function(d) {
	return d.Sample;
}));
x1.domain(Categories.filter(function(d) {
	return d.Type == "bar"
}).map(function(d) {
	return d.Name
})).rangeRound([0, x0.bandwidth()]);

g.append("g")
	.style('clip-path', 'url(#clip)')
	.append("g")
	.attr("class", "x_axis")
	.attr("transform", "translate(" + margin_q.left + "," + height + ")")
	.call(xAxis).selectAll(".tick text")
	.call(wrap, x0.bandwidth());

g.append("g")
	.attr("transform", "translate(" + margin_q.left + ",0)")
	.attr("class", "y_axis")
	.call(yAxis)
	.append("text")
	.attr("transform", "rotate(0)")
	.attr("x", margin_q.left - 30)
	.attr("y", margin_q.top + 60)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#000")
	.text("Contig Count");

//축 텍스트 폰트 크기 설정
g.select(".x_axis")
	.selectAll("text")
	.style("font-size", "12px");
g.select(".y_axis")
	.selectAll("text")
	.style("font-size", "12px");

//bar 그래프
var state_q = g.append("g")
	.style('clip-path', 'url(#clip)')
	.selectAll(".state_q")
	.data(array_q)
	.enter().append("g")
	.attr("class", "state_q")
	.attr("transform", function(d) {
		return "translate(" + margin_q.left + x0(d.Sample) + ",0)";
	});

state_q.selectAll("rect")
	.data(function(d) {
		return d.Categories;
	})
	.enter().append("rect")
	.attr("class", "bar")
	.attr("width", x1.bandwidth())
	.attr("x", function(d) {
		return x1(d.Name);
	})
	.attr("y", function(d) {
		return y(d.Value);
	})
	.style("fill", function(d) {
		return color(d.Name);
	})
	.transition().attrTween("height", function(d) {
		var i = d3.interpolate(0, height - y(d.Value));
		return function(t) {
			return i(t);
		}
	});

//그래프 상단 텍스트
state_q.selectAll("text")
	.data(function(d) {
		return d.Categories;
	})
	.enter().append("text")
	.attr("x", function(d) {
		return x1(d.Name);
	})
	.attr("y", function(d) {
		return y(d.Value) -2;
	})
	.style('fill', function(d) {
		return color_text(d.Name);
	})
	.style('font-size', '1.1em')
	.text(function(d) {
		return AddComma(d.Value);
	});

//zoom in/out
var zoom_q = d3.zoom()
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
		return zoomed_q();
	});

svg_q.call(zoom_q)
	.call(zoom_q.transform, d3.zoomIdentity.translate(0, 50).scale(zoom_rat))

function zoomed_q() {
	x0.range([0, width].map(function(d) {
		return d3.event.transform.applyX(d);
	}));
	x1.rangeRound([0, x0.bandwidth()]);

	svg_q.selectAll(".state_q").attr("transform", function(d) {
		return "translate(" + x0(d.Sample) + ",0)";
	});
	state_q.selectAll(".bar").attr("x", function(d) {
		return margin_q.left + x1(d.Name);
	}).attr("width", x1.bandwidth());
	state_q.selectAll("text").attr("x", function(d) {
		return margin_q.left + x1(d.Name);
	}).attr("width", x1.bandwidth());
	svg_q.select(".x_axis").call(xAxis);
}

//reset
d3.select("#reset_nc")
	.on("click", resetted);

function resetted() {
	svg_q.transition()
		.call(zoom_q.transform, d3.zoomIdentity.translate(0, 50).scale(zoom_rat));
}

//legend
var LegendHolder = g.append("g").attr("class", "legendHolder");
var legend = LegendHolder.selectAll(".legend")
	.data(Categories.map(function(d) {
		return {
			"Name": d.Name,
			"Type": d.Type
		}
	}))
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) {
		return "translate(0," + (height + margin_q.bottom / 2) + ")";
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
			.attr("y", function(b) {
				return b.Type == 'bar' ? 0 : 7
			})
			.attr("height", function(b) {
				return b.Type == 'bar' ? 18 : 5
			})
			.style("fill", function(b) {
				return b.Type == 'bar' ? color(d.Name) : LineColor(d.Name)
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
			.text(d.Name);
		textWidthHolder += getTextWidth(d.Name, "10px", "calibri");
	});

//legend 위치
d3.select(".legendHolder").attr("transform", function(d) {
	thisWidth = d3.select(this).node().getBBox().width;
	return "translate(" + ((width) / 2 - thisWidth / 2) + ",0)";
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
