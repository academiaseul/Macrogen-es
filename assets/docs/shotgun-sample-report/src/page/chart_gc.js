function getTextWidth(text, fontSize, fontName) {
	c = document.createElement("canvas");
	ctx = c.getContext("2d");
	ctx.font = fontSize + ' ' + fontName;
	return ctx.measureText(text).width;
}

var margin_gc = {
		top: 0,
		right: 80,
		bottom: 80,
		left: 45
	},
	svg_gc = d3.select("#chart_gc"),
	width_gc = svg_gc.attr("width") - margin_gc.left - margin_gc.right,
	height_gc = svg_gc.attr("height") - margin_gc.top - margin_gc.bottom,
	g = svg_gc.append("g").attr("transform", "translate(" + margin_gc.left + "," + margin_gc.top + ")"),
	textWidthHolder = 0;

//그래프 영역 지정
svg_gc.append("defs").append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", width_gc)
	.attr("height", +svg_gc.attr("height"))
	.attr("transform", "translate(" + margin_gc.left + "," + margin_gc.top + ")");

//카테고리 첫번째 항목에 bar 항목 추가
var Categories_gc = [];

Categories_gc.pro;

array_gc[0].Categories_gc.forEach(function(b) {
	b.Type = "bar";
	Categories_gc.push(b)
});

//data 불러오기
var array_gc;

//zoom 비율 설정
if (array_gc.length < 7) {
	zoom_rat = 1;
} else {
	zoom_rat = 1 * array_gc.length / 7;
}

//x축 그룹(샘플명)값 간격 설정
var x0_gc = d3.scaleBand()
	.rangeRound([margin_gc.left, width_gc])
	.paddingInner(0.1)
	.paddingOuter(0.1);

//x축 그룹 내 요소간(GC/AT) 간격 설정
var x1_gc = d3.scaleBand()
	.paddingOuter(0.25)
	.paddingInner(0.15);

	//y축 값 간격 설정
var y_gc = d3.scaleLinear()
	.domain([0, 100])
	.range([height_gc, margin_gc.bottom]);

	//그래프 색 지정
var color = d3.scaleOrdinal()
	.range(["#5F79A9", "#70B9C8"]);

	//그래프 상단 텍스트 색 지정
var color_text = d3.scaleOrdinal()
	.range(["#5F79A9", "#70B9C8"]);

	//축 설정
var xAxis_gc = d3.axisBottom(x0_gc);
var yAxis_gc = d3.axisLeft(y_gc).ticks(7);

x0_gc.domain(array_gc.map(function(d) {
	return d.Sample;
}));
x1_gc.domain(Categories_gc.filter(function(d) {
	return d.Type == "bar"
}).map(function(d) {
	return d.Name
})).rangeRound([0, x0_gc.bandwidth()]);

g.append("g")
	.style('clip-path', 'url(#clip)')
	.append("g")
	.attr("class", "x_axis_gc")
	.attr("transform", "translate(" + margin_gc.left + "," + height_gc + ")")
	.call(xAxis_gc).selectAll(".tick text")
	.call(wrap, x0_gc.bandwidth());

g.append("g")
	.attr("transform", "translate(" + margin_gc.left + ",0)")
	.attr("class", "y_axis_gc")
	.call(yAxis_gc)
	.append("text")
	.attr("transform", "rotate(0)")
	.attr("x", margin_gc.left - 30)
	.attr("y", margin_gc.top + 60)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#000")
	.text("Percentage");

	//축 텍스트 폰트 크기 설정
g.select(".x_axis_gc")
	.selectAll("text")
	.style("font-size", "12px");
g.select(".y_axis_gc")
	.selectAll("text")
	.style("font-size", "12px");

	//bar 그래프
var state_gc = g.append("g")
	.style('clip-path', 'url(#clip)')
	.selectAll(".state_gc")
	.data(array_gc)
	.enter().append("g")
	.attr("class", "state_gc")
	.attr("transform", function(d) {
		return "translate(" + margin_gc.left + x0_gc(d.Sample) + ",0)";
	});

state_gc.selectAll("rect")
	.data(function(d) {
		return d.Categories_gc;
	})
	.enter().append("rect")
	.attr("class", "bar")
	.attr("width", x1_gc.bandwidth())
	.attr("x", function(d) {
		return x1_gc(d.Name);
	})
	.attr("y", function(d) {
		return y_gc(d.Value);
	})
	.style("fill", function(d) {
		return color(d.Name);
	})
	.transition().attrTween("height", function(d) {
		var i = d3.interpolate(0, height_gc - y_gc(d.Value));
		return function(t) {
			return i(t);
		}
	});

	//그래프 상단 텍스트
state_gc.selectAll("text")
	.data(function(d) {
		return d.Categories_gc;
	})
	.enter().append("text")
	.attr("x", function(d) {
		return x1_gc(d.Name);
	})
	.attr("y", function(d) {
		return y_gc(d.Value) - 2;
	})
	.style('fill', function(d) {
		return color_text(d.Name);
	})
	.style('font-size', '1.1em')
	.text(function(d) {
		return parseFloat(d.Value).toFixed(1);
	});

	//zoom in/out
var zoom_gc = d3.zoom()
	.scaleExtent([1, Infinity])
	.translateExtent([
		[0, 0],
		[width_gc, height_gc]
	])
	.extent([
		[0, 0],
		[width_gc, height_gc]
	])
	.on("zoom", function() {
		return zoomed_gc();
	});

svg_gc.call(zoom_gc)
	.call(zoom_gc.transform, d3.zoomIdentity.translate(0, 50).scale(zoom_rat))

function zoomed_gc() {
	x0_gc.range([0, width_gc].map(function(d) {
		return d3.event.transform.applyX(d);
	}));
	x1_gc.rangeRound([0, x0_gc.bandwidth()]);

	svg_gc.selectAll(".state_gc").attr("transform", function(d) {
		return "translate(" + x0_gc(d.Sample) + ",0)";
	});
	state_gc.selectAll(".bar").attr("x", function(d) {
		return margin_gc.left + x1_gc(d.Name);
	}).attr("width", x1_gc.bandwidth());
	state_gc.selectAll("text").attr("x", function(d) {
		return margin_gc.left + x1_gc(d.Name);
	}).attr("width", x1_gc.bandwidth());

	svg_gc.select(".x_axis_gc").call(xAxis_gc);
}

//reset
d3.select("#reset_gc")
	.on("click", resetted);

function resetted() {
	svg_gc.transition()
		.call(zoom_gc.transform, d3.zoomIdentity.translate(0, 50).scale(zoom_rat));
}

//legend
var LegendHolder_gc = g.append("g").attr("class", "legendHolder_gc");
var legend_gc = LegendHolder_gc.selectAll(".legend_gc")
	.data(Categories_gc.map(function(d) {
		return {
			"Name": d.Name,
			"Type": d.Type
		}
	}))
	.enter().append("g")
	.attr("class", "legend_gc")
	.attr("transform", function(d, i) {
		return "translate(0," + (height_gc + margin_gc.bottom / 2) + ")";
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
d3.select(".legendHolder_gc").attr("transform", function(d) {
	thisWidth = d3.select(this).node().getBBox().width;
	return "translate(" + ((width_gc) / 2 - thisWidth / 2) + ",0)";
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
			if (tspan.node().getComputedTextLength() > width * zoom_rat) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber * lineHeight + dy) + "em").text(word);
			}
		}
	});
}
