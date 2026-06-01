function getTextWidth(text, fontSize, fontName) {
    c = document.createElement("canvas");
    ctx = c.getContext("2d");
    ctx.font = fontSize + ' ' + fontName;
    return ctx.measureText(text).width;
}

var margin_yield = {
        top: 0,
        right: 80,
        bottom: 80,
        left: 45
    },
    svg_yield = d3.select("#chart_yield"),
    width_yield = svg_yield.attr("width") - margin_yield.left - margin_yield.right,
    height_yield = svg_yield.attr("height") - margin_yield.top - margin_yield.bottom,
    g = svg_yield.append("g").attr("transform", "translate(" + margin_yield.left + "," + margin_yield.top + ")"),
    textWidthHolder_yield = 0;

// 그래프 영역 지정
svg_yield.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width_yield)
    .attr("height", +svg_yield.attr("height"))
    .attr("transform", "translate(" + margin_yield.left + "," + margin_yield.top + ")");

// 카테고리 첫번째 항목에 bar 항목 추가
var Categories_yield = [];

// 데이터 불러오기
var array_yield = stat.map(function(sample) {
    var lastKey = Object.keys(sample).slice(-1)[0]; // 마지막 키를 가져옵니다.
    return {
        Sample: sample['Sample Name'],
        Categories: [
            { Name: 'Raw data', Value: +sample['Raw data'], Type: 'bar' },
            { Name: 'QC Remain', Value: +sample['Quality Filter'], Type: 'bar' },
            { Name: 'ASV Remain', Value: +sample[lastKey], Type: 'bar' }
        ]
    };
});

array_yield[0].Categories.forEach(function(b) {
    b.Type = "bar";
    Categories_yield.push(b);
});

// zoom 비율 설정
var zoom_rat = array_yield.length < 10 ? 1 : 1 * array_yield.length / 10;

// x축 그룹(샘플명)값 간격 설정
var x0_yield = d3.scaleBand()
    .rangeRound([margin_yield.left, width_yield])
    .paddingInner(0.1)
    .paddingOuter(0.1);

// x축 그룹 내 요소간(Q20/30) 간격 설정
var x1_yield = d3.scaleBand()
    .paddingOuter(0.25)
    .paddingInner(0.15);

// y축 값 간격 설정
var nums = array_yield.map(function(d) {
    return d.Categories[0].Value;
});

var y_yield = d3.scaleLinear()
    .domain([0, d3.max(nums)])
    .range([height_yield, margin_yield.bottom])
    .nice();

// 그래프 색 지정
var color = d3.scaleOrdinal().range(["#d9d9d9", "#a9a9a9", "#0b2455"]);

// 그래프 상단 텍스트 색 지정
var color_text = d3.scaleOrdinal()
    .range(["#949494", "#969696", "#0f1e62"]);

// 축 설정
var xAxis_yield = d3.axisBottom(x0_yield);
var yAxis_yield = d3.axisLeft(y_yield).ticks(5).tickFormat(d3.format(",.0s"));

x0_yield.domain(array_yield.map(function(d) {
    return d.Sample;
}));
x1_yield.domain(Categories_yield.filter(function(d) {
    return d.Type == "bar";
}).map(function(d) {
    return d.Name;
})).rangeRound([0, x0_yield.bandwidth()]);

g.append("g")
    .style('clip-path', 'url(#clip)')
    .append("g")
    .attr("class", "x_axis_yield")
    .attr("transform", "translate(" + margin_yield.left + "," + height_yield + ")")
    .call(xAxis_yield).selectAll(".tick text")
    .call(wrap, x0_yield.bandwidth());

g.append("g")
    .attr("transform", "translate(" + margin_yield.left + ",0)")
    .attr("class", "y_axis_yield")
    .call(yAxis_yield)
    .append("text")
    .attr("transform", "rotate(0)")
    .attr("x", margin_yield.left - 30)
    .attr("y", margin_yield.top + 60)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#000")
    .text("Total reads");

// 축 텍스트 폰트 크기 설정
g.select(".x_axis_yield")
    .selectAll("text")
    .style("font-size", "12px");
g.select(".y_axis_yield")
    .selectAll("text")
    .style("font-size", "12px");

// bar 그래프
var x2_yield = d3.scaleBand()
    .paddingOuter(0.25)
    .paddingInner(50);

x2_yield.domain(Categories_yield.filter(function(d) {
    return d.Type == "bar";
}).map(function(d) {
    return d.Name;
})).rangeRound([0, x0_yield.bandwidth()]);

var y_yield2 = d3.scaleLinear()
    .domain([0, d3.max(nums)])
    .range([height_yield - 20, margin_yield.bottom])
    .nice();

var state_yield = g.append("g")
    .style('clip-path', 'url(#clip)')
    .selectAll(".state_yield")
    .data(array_yield)
    .enter().append("g")
    .attr("class", "state_yield")
    .attr("transform", function(d) {
        return "translate(" + margin_yield.left + x0_yield(d.Sample) + ",0)";
    })
    .on('mouseover', function(d) {
        console.log(d);
        d3.select(this).transition()
            .attr('opacity', '1');
        d3.select(this).selectAll("text")
            .data(function(d) {
                return d.Categories;
            })
            .enter().append("text")
            .attr("transform", function(d) {
                return 'translate(' + x2_yield(d.Name) + ',' + y_yield2(d.Value) + '),rotate(-50)';
            })
            .style('fill', function(d) {
                return color_text(d.Name);
            })
            .style('font-size', '0.9em')
            .text(function(d) {
                return d3.format(",.3s")(d.Value);
            });
    })
    .on('mouseout', function(d) {
        d3.select(this).transition()
            .attr('opacity', '1');
        d3.select(this).selectAll("text").remove();
    });

state_yield.selectAll("rect")
    .data(function(d) {
        return d.Categories;
    })
    .enter().append("rect")
    .attr("class", "bar")
    .attr("width", x1_yield.bandwidth())
    .attr("x", function(d) {
        return x1_yield(d.Name);
    })
    .attr("y", function(d) {
        return y_yield(d.Value);
    })
    .style("fill", function(d) {
        return color(d.Name);
    })
    .attr("height", function(d) {
        return height_yield - y_yield(d.Value);
    });

// zoom in/out
var zoom_yield = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([
        [0, 0],
        [width_yield, height_yield]
    ])
    .extent([
        [0, 0],
        [width_yield, height_yield]
    ])
    .on("zoom", function() {
        return zoomed_yield();
    });

svg_yield.call(zoom_yield)
    .call(zoom_yield.transform, d3.zoomIdentity.translate(0, 50).scale(zoom_rat));

function zoomed_yield() {
    x0_yield.range([0, width_yield].map(function(d) {
        return d3.event.transform.applyX(d);
    }));
    x1_yield.rangeRound([0, x0_yield.bandwidth()]);
    x2_yield.rangeRound([45, x0_yield.bandwidth() + 40]);
    svg_yield.selectAll(".state_yield").attr("transform", function(d) {
        return "translate(" + x0_yield(d.Sample) + ",0)";
    });
    state_yield.selectAll(".bar").attr("x", function(d) {
        return margin_yield.left + x1_yield(d.Name);
    }).attr("width", x1_yield.bandwidth());
    state_yield.selectAll("text").attr("x", function(d) {
        return margin_yield.left + x1_yield(d.Name);
    }).attr("width", x1_yield.bandwidth());
    svg_yield.select(".x_axis_yield").call(xAxis_yield);
}

// reset
d3.select("#reset_yield")
    .on("click", resetted_yield);

function resetted_yield() {
    svg_yield.transition()
        .call(zoom_yield.transform, d3.zoomIdentity.translate(0, 50).scale(zoom_rat));
}

// legend
var LegendHolder = g.append("g").attr("class", "legendHolder_yield");
var legend = LegendHolder.selectAll(".legend_yield")
    .data(Categories_yield.map(function(d) {
        return {
            "Name": d.Name,
            "Type": d.Type
        };
    }))
    .enter().append("g")
    .attr("class", "legend_yield")
    .attr("transform", function(d, i) {
        return "translate(0," + (height_yield + margin_yield.bottom / 2) + ")";
    })
    .each(function(d, i) {
        // legend 사각형
        d3.select(this).append("rect")
            .attr("width", function() {
                return 18;
            })
            .attr("x", function(b) {
                left = (i + 1) * 15 + i * 18 + i * 5 + textWidthHolder_yield;
                return left;
            })
            .attr("y", function(b) {
                return b.Type == 'bar' ? 0 : 7;
            })
            .attr("height", function(b) {
                return b.Type == 'bar' ? 18 : 5;
            })
            .style("fill", function(b) {
                return b.Type == 'bar' ? color(d.Name) : LineColor(d.Name);
            });

        // legend 텍스트
        d3.select(this).append("text")
            .attr("x", function(b) {
                left = (i + 1) * 15 + (i + 1) * 18 + (i + 1) * 5 + textWidthHolder_yield;
                return left;
            })
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d.Name);
        textWidthHolder_yield += getTextWidth(d.Name, "20px", "calibri");
    });

// legend 위치
d3.select(".legendHolder_yield").attr("transform", function(d) {
    thisWidth = d3.select(this).node().getBBox().width;
    return "translate(" + ((width_yield) / 2 - thisWidth / 2) + ",0)";
});

// 텍스트 줄바꿈
function wrap(text, width_yield) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width_yield) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber * lineHeight + dy) + "em").text(word);
            }
        }
    });
}