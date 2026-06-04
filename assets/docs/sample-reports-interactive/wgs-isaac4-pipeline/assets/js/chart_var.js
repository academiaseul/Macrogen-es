// 1. 描画用のデータ準備
function plot() {

	function getTextWidth(text, fontSize, fontName) {
		c = document.createElement("canvas");
		ctx = c.getContext("2d");
		ctx.font = fontSize + ' ' + fontName;
		return ctx.measureText(text).width;
	}

	function AddComma(data_value) {
		return Number(data_value).toLocaleString('en');
	}

	var data = json_var;

	// 2. svg_var表示用要素の設定
	var svg_var = d3.select("#chart_var");
	var width_var = svg_var.attr("width");
	var height_var = svg_var.attr("height") - 30;
	var radius = Math.min(width_var, height_var) / 2;
	var centerRadius = 0.01 * radius;
	var backCircleRadius = 0.1 * radius;
	g_var = svg_var.append("g").attr("transform", "translate(" + width_var / 2 + "," + (30 + height_var / 2) + ")");

	// 3. 描画用スケールの設定
	var xScale = d3.scaleLinear().range([0, 2 * Math.PI]);
	var rScale = d3.scaleLinear().range([0.01 * radius, radius]);
	var color = function(d) {

		// This function builds the total
		// color palette incrementally so
		// we don't have to iterate through
		// the entire data structure.

		// We're going to need a color scale.
		// Normally we'll distribute the colors
		// in the scale to child nodes.
		var colors;

		// The root node is special since
		// we have to seed it with our
		// desired palette.
		if (!d.parent) {

			// Create a categorical color
			// scale to use both for the
			// root node's immediate
			// children. We're using the
			// 10-color predefined scale,
			// so set the domain to be
			// [0, ... 9] to ensure that
			// we can predictably generate
			// correct individual colors.
			colors = d3.scaleOrdinal().range(["#70B9C8", "#aabee3", "#5F79A9"]);

			// White for the root node
			// itself.
			d.color = "#FFF";

		} else if (d.children) {

			// Since this isn't the root node,
			// we construct the scale from the
			// node's assigned color. Our scale
			// will range from darker than the
			// node's color to brigher than the
			// node's color.
			var startColor = d3.hcl(d.color)
				.darker(),
				endColor = d3.hcl(d.color)
				.brighter();

			// Create the scale
			colors = d3.scaleLinear()
				.interpolate(d3.interpolateHcl)
				.range([
					startColor.toString(),
					endColor.toString()
				])
				.domain([0, d.children.length + 1]);

		}

		if (d.children) {

			// Now distribute those colors to
			// the child nodes. We want to do
			// it in sorted order, so we'll
			// have to calculate that. Because
			// JavaScript sorts arrays in place,
			// we use a mapped version.
			d.children.map(function(child, i) {
				return {
					value: child.value,
					idx: i
				};
			}).sort(function(a, b) {
				return b.value - a.value;
			}).forEach(function(child, i) {
				d.children[child.idx].color = colors(i);
			});
		}

		return d.color;
	};

	// 4. 描画用のデータ変換
	root = d3.hierarchy(data);
	root.sum(function(d) {
		if (d.value >= 1000) {
			return d.value / 10;
		}
		return d.value;
	});
	var partition = d3.partition();
	partition(root);

	// 5. svg_var要素の設定
	var arc = d3.arc()
		.startAngle(function(d) {
			return Math.max(0, Math.min(2 * Math.PI, xScale(d.x0)));
		})
		.endAngle(function(d) {
			return Math.max(0, Math.min(2 * Math.PI, xScale(d.x1)));
		})
		.innerRadius(function(d) {
			return Math.max(0, rScale(d.y0));
		})
		.outerRadius(function(d) {
			return Math.max(0, rScale(d.y1));
		});

	g_var.selectAll("path")
		.data(root.descendants())
		.enter()
		.append("path")
		.attr("d", arc)
		.attr('stroke', '#fff')
		.attr("fill", color)
		.attr("opacity", 0.8)
		.on("click", click)
		.append("title")
		.text(function(d) {
			if (d.depth < 2) {
				return d.data.name;
			}
			return d.data.name + "\n" + AddComma(d.data.value);
		});

	g_var.selectAll("text")
		.data(root.descendants())
		.enter()
		.append("text")
		.attr('fill', "black")
		.attr("transform", function(d) {
			if (d.depth == 0) {
				arc_center = arc.centroid(d);
				arc_center[1] -= 75;
				return "translate(" + arc_center + ")";
			} else if (d.depth < 2) {
				return "translate(" + arc.centroid(d) + ")";
			} else {
				arc_center = arc.centroid(d);
				arc_center[1] -= 10;
				return "translate(" + arc_center + ")";
			}
		})
		.attr("dy", "0")
		.attr("font", "10px")
		.style("font-weight", function(d) {
			if (d.depth < 2) {
				return "bold";
			} else {
				return "";
			}
		})
		.attr("text-anchor", "middle")
		.on("click", click)
		.text(function(d) {
			if (d.depth < 2) {
				return d.data.name;
			}
			return d.data.name + " " + AddComma(d.data.value);
		}).call(wrap, 10);

	function computeTextRotation(d) {
		var angle = xScale(d.x0 + d.x1 / 2) - Math.PI / 2;
		return angle / Math.PI * 180;
	}

	//6. クリック時のイベント関数
	function click(d) {
		var tween = g_var.transition()
			.duration(500)
			.tween("scale", function() {
				var xdomain = d3.interpolate(xScale.domain(), [d.x0, d.x1]);
				var ydomain = d3.interpolate(rScale.domain(), [d.y0, 1]);
				var yrange = d3.interpolate(rScale.range(), [d.y0 ? backCircleRadius : centerRadius, radius]);
				return function(t) {
					xScale.domain(xdomain(t));
					rScale.domain(ydomain(t)).range(yrange(t));
				};
			});

		tween.selectAll("path")
			.attrTween("d", function(d) {
				return function() {
					return arc(d);
				};
			});

		tween.selectAll("text")
			.attrTween("transform", function(d) {
				return function() {
					if (d.depth == 0) {
						arc_center = arc.centroid(d);
						arc_center[1] -= 75;
						return "translate(" + arc_center + ")";
					} else if (d.depth < 2) {
						return "translate(" + arc.centroid(d) + ")";
					} else {
						arc_center = arc.centroid(d);
						arc_center[1] -= 10;
						return "translate(" + arc_center + ")";
					}
				};
			})
			.attrTween("opacity", function(d) {
				return function() {
					return (xScale(d.x0) < 2 * Math.PI - 0.01) && (xScale(d.x1) > 0.4) && (rScale(d.y1) > 0.1) ? 1.0 : 0;
				};
			})
			.attrTween("font", function(d) {
				return function() {
					return (xScale(d.x0) < 2 * Math.PI - 0.01) && (xScale(d.x1) > 0.4) && (rScale(d.y1) > 0.1) ? "10px" : 1e-6;
				};
			});
	}
	//텍스트 줄바꿈
	function wrap(text, width) {
		text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 0.5, //ems
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
}
