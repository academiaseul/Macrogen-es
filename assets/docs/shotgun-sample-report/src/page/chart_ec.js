function plot_ec(data) {//class1, class2, count, ec

	var margin = {top: 70, right: 20, bottom: 30, left: 380},
		width = 1100 - margin.left - margin.right,
		height = 2030 - margin.top - margin.bottom;
	
	var color = ["#ffa600", "#ff764a", "#ef5675", "#bc5090", "#7a5195", "#374c80", "#003f5c"];

	var barPadding = 80;
	
	var rangeBands = [];
	var cummulative = 0;
	data.forEach(function(val, i) {
		val.cummulative = cummulative;
		cummulative += val.values.length;
		val.values.forEach(function(values) {
			values.parentKey = val.class1;
			rangeBands.push(i);
		})
	});

	var y_category = d3.scaleLinear()
		.range([0, height]);

	var y_defect = d3.scaleBand()
		.domain(rangeBands)
		.rangeRound([0, height])
		.padding(0.1);

	var y_category_domain = y_defect.bandwidth() * rangeBands.length;
	y_category.domain([0, y_category_domain]);


	var x = d3.scaleLinear()
		.range([0, width]);

	x.domain([0, d3.max(data, function(cat) {
		return d3.max(cat.values, function(def) {
			return def.count;
		});
	})]);

	var category_axis = d3.axisLeft(y_category);
	
	var xAxis = d3.axisTop(x)
		.tickFormat(d3.format("0"));

	var svg = d3.select("#chart_ec")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
		.attr("class", "x axis")
		.call(xAxis)

	var legPadding = 150;

	var legend = svg.selectAll(".legend")
		.data(data)
		.enter().append("g")

	legend.append("rect")
		.attr("fill", function(d, i) {
			return color[i];
		})
		.attr("width", 20)
		.attr("height", 20)
		.attr("x", function(d, i) {
			return i * legPadding - 340;
		})
		.attr("y", -70);

	legend.append("text")
		.attr("x", function(d, i) {
			return i * legPadding - 310;
		})
		.attr("y", -55)
		.text(function(d) {
			return d.class1;
		});

	var category_g = svg.selectAll(".category")
		.data(data)
		.enter().append("g")
		.attr("class", function(d) {
			return 'category category-' + d.class1;
		})
		.attr("transform", function(d) {
			return "translate(0," + y_category((d.cummulative * y_defect.bandwidth())) + ")";
		})
		.attr("fill", function(d, i) {
			return color[i];
		});


	var defect_g = category_g.selectAll(".defect")
		.data(function(d) {
			return d.values;
		})
		.enter().append("g")
		.attr("class", function(d) {
			return 'defect defect-' + d.class2;
		})
		.attr("transform", function(d, i) {
			return "translate(0," + y_category((i * y_defect.bandwidth())) + ")";
		})
		.style("font-size", "10px");

	var defect_label = defect_g.selectAll(".defect-label")
		.data(function(d) {
			return [d];
		})
		.enter().append("text")
		.attr("class", function(d) {
			return 'defect-label defect-label-' + d.class1;
		})
		.attr("transform", function(d) {
			var x_label = -5//x_category((x_defect.rangeBand() + barPadding) / 2);
			var y_label = y_category((y_defect.bandwidth() + barPadding) / 2) + 3;//height + 10;
			return "translate(" + x_label + "," + y_label + ")";
		})
		.text(function(d) {
			return d.class2;
		})
		.attr('text-anchor', 'end');

	//tooltip
	var tooltip = d3.select("#div_tooltip")
		.style("opacity", 0)
		.attr("class", "tooltip_chart")
		.style("position", "absolute")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")
		.html("Click to filter pathway table by this function")
		.style("padding", "5px");
	
	function getNodePos(el) {
		var div = d3.select("#div_chart_ec").node();

		for (var lx = 0, ly = 0; el != null && el != div; lx += (el.offsetLeft || el.clientLeft), ly += (el.offsetTop || el.clientTop), el = (el.offsetParent || el.parentNode));
		
		return {x: lx, y: ly};
	}

	var root = d3.select("#chart_ec");
	var scr = { x: window.scrollX, y : window.scrollY, w: window.innerWidth, h:window.innerHeight };
	var body_sel = d3.select("#div_chart_ec");
	var body = {w:body_sel.node().offsetWidth, h:body_sel.node().offsetHeight};
	var doc = {w:document.width, h: document.height};
	var svgpos = getNodePos(root.node());
	var dist = {x : 30, y : 30};

	var rects = defect_g.selectAll('.rect')
		.data(function(d) {
			return [d];
		})
		.enter().append("rect")
		.attr("class", "rect")
		.attr("width", function(d) {
			return x(d.count);
		}) //x_category(x_defect.rangeBand() - barPadding))
		.attr("x", 0)
		.attr("y", function(d) {
			return y_category(barPadding)//y(d.value);
		})
		.attr("height", y_category(y_defect.bandwidth() - barPadding))
		.on("mousemove", function(d) {
			d3.select(this).style("fill", d3.rgb(color[d.ec.split('.')[0] - 1]).darker(2));

			var m = d3.mouse(root.node());
			scr.x = window.scrollX;
			scr.y = window.scrollY;
			m[0] += svgpos.x;
			m[1] += svgpos.y;
			tooltip.style("right", "");
			tooltip.style("left", "");
			tooltip.style("bottom", "");
			tooltip.style("top", "");

//			console.log('coordinates: doc/body/scr/svgpos/mouse: ', doc, body, scr, svgpos, m);
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
				.style("opacity", 1);
		})
		.on("mouseout", function(d) {
			d3.select(this).style("fill", color[d.ec.split('.')[0] - 1]);
			tooltip
				.style("opacity", 0);
		})
		.on("click", function(d) {
			var filter_txt = "EC." + d.ec + ".";
			var table = "#table1";
			var filters = ['', '', '', '', filter_txt];
			
			$.tablesorter.setFilters(table, filters, true);
			document.getElementById('tablediv').scrollIntoView({behavior : "smooth"});
		});

	var rects_value = defect_g.selectAll('.rect_label')
		.data(function(d) {
			return [d];
		})
		.enter().append("text")
		.attr("transform", function(d) {
			var x_label = x(d.count) + 2;
			var y_label = y_category((y_defect.bandwidth() + barPadding) / 2) + 3;
			return "translate(" + x_label + "," + y_label + ")";
		})
		.text(function(d) {
			return d.count;
		});

}
