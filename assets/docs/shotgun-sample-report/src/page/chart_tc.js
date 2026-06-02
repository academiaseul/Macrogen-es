function plot_tc(arr_tc, samples) {//class1, class2, count, ec
	var categories = arr_tc.categories;

	var plotwidth = 1100,
		plotheight = 500;
	
	var legendheight = (25 * categories.length);
	var margin = {top: 0, right: 80, bottom: 80, left: 45},
		width = plotwidth - margin.left - margin.right,
		height = plotheight - margin.top - margin.bottom;

	var svg = d3.select("#chart_tc")
			.attr("width", plotwidth)
			.attr("height", plotheight + legendheight);

	g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
	
	//그래프 영역 지정
	svg.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", width)
		.attr("height", +svg.attr("height"))
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//data 불러오기

	var data = [];
	for (var i = 0, sample; sample = samples[i]; i++) {
		var temp = {"Samples" : sample};
		for (var j = 0, ca; ca = categories[j]; j++) {
			temp[ca] = arr_tc[sample][ca];
		}
		data.push(temp);
	}

	data.forEach(function (d) {
		var y0 = 0;
		d.responses = categories.map(function(response) {
			var temp = {"response" : response, "y0": y0, "yp0": y0};
			y0 += +d[response];
			temp.y1 = y0;
			temp.yp1 = y0;
			temp.ratio = d[response];

			return temp;
		});
		d.responses.forEach(function(r) {
			r.yp0 /= y0; r.yp1 /= y0;
		});
		d.totalresponses = d.responses[d.responses.length - 1].y1;
	});

	var colors = ["#94e8b4", "#72bda3", "#5e8c61", "#4e6151", "#3b322c", "#d5573b", "#885053", "#777da7", "#e8e1ef", "#d9fff8", "#e4572e", "#17bebb", "#ffc914", "#2e282a", "#76b041", "#ece4b7", "#d9dd92", "#eabe7c", "#311e10", "#efa8b8", "#820263", "#d90368", "#eadeda", "#2e294e", "#BBDEFB"];


	//zoom 비율 설정
	if (samples.length < 7) {
		zoom_rat = 1;
	} else {
		zoom_rat = 1 * samples.length / 7;
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

	var xAxis = d3.axisBottom(x);
	var yAxis = d3.axisLeft(y).ticks(7);

	x.domain(samples);
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

	g.select(".x_axis")
		.selectAll("text")
		.style("font-size", "12px");
	g.select(".y_axis")
		.selectAll("text")
		.style("font-size", "12px");

	//tooltip
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
		var div = d3.select("#div_chart_tc").node();
		for (var lx = 0, ly = 0; el != null && el != div; lx += (el.offsetLeft || el.clientLeft), ly += (el.offsetTop || el.clientTop), el = (el.offsetParent || el.parentNode));

		return {x: lx, y: ly};
	}

	var root = d3.select("#chart_tc");
	var scr = { x: window.scrollX, y : window.scrollY, w: window.innerWidth, h:window.innerHeight };
	var body_sel = d3.select("#div_chart_tc");
	var body = {w:body_sel.node().offsetWidth, h:body_sel.node().offsetHeight};
	var doc = {w:document.width, h: document.height};
	var svgpos = getNodePos(root.node());
	var dist = {x : 30, y : 80};

	//bar graph
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
		.attr("class", function(d) { return "myrect category-" + categories.indexOf(d.response); })
		.attr("width", x.bandwidth())
		.attr("y", function(d) { return y(d.yp1); })
		.attr("height", function(d) { return y(d.yp0) - y(d.yp1); })
		.style("fill", function(d) { return colors[categories.indexOf(d.response) % categories.length]; })
		.on("mousemove", function(d) {
			var subgroupName = d3.select(this).attr("class").replace("myrect ", "")
			d3.selectAll(".myrect").style("opacity", 0.2);
			d3.selectAll("." + subgroupName).style("opacity", 1);
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
//fixed in 21.02.02 for changing mouseover
			var mouseoverbox=''
			var indent = '<br>&nbsp;&nbsp;'
			for ( var taxon in d.response.split(';') ){
				mouseoverbox+=d.response.split(';')[taxon]
				mouseoverbox+=indent
				indent += '&nbsp;&nbsp;'
			}
			tooltip.style("opacity", 1)
//				.html("<strong>" + d.response + ": " + d.ratio + "%");
				.html("<strong>" + mouseoverbox + ": " + d.ratio + "%");
		})
		.on("mouseout", function(d) {
			d3.selectAll(".myrect").style("opacity", 1);
			tooltip.style("opacity", 0);
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
		g.selectAll(".myrect").attr("width", x.bandwidth());

		g.select(".x_axis").call(xAxis);
	}

	//reset
	d3.select("#reset_tc")
		.on("click", function() {
			resetted();
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
		.each(function(d, i) {
			//legend 사각형
			d3.select(this).append("rect")
				.attr("width", 18)
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", 18)
				.style("fill", function(b) {
					return colors[i % categories.length];
				});

			//legend 텍스트
			d3.select(this).append("text")
				.attr("x", 23)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "start")
				.text(d);

			//legend 위치
			d3.select(this).attr("transform", function (b) {
				return "translate(" + margin.left + "," + ((height + margin.bottom / 2) + (i * 25)) + ")";
			});
	});
}

