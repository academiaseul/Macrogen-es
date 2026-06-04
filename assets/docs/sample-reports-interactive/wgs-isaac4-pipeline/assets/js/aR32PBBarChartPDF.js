
(function () {
  'use strict'
	
	var thisUrlInfo = getCurrentUrlInfo();
	
	
	if(thisUrlInfo.dType){
		horizontalBarChart( thisUrlInfo.dType, thisUrlInfo.dLen );
	}
	
})()

function arcParameter(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    return [rx, ',', ry, ' ', xAxisRotation, ' ', largeArcFlag, ',', sweepFlag, ' ', x, ',', y ].join('');
};

function generatePathData( x, y, width, height, tr, br, bl, tl ) {
    var data = [];
    data.push('M' + (x + width / 2) + ',' + y);
    data.push('H' + (x + width - tr));
    if (tr > 0) { data.push('A' + arcParameter(tr, tr, 0, 0, 1, (x + width), (y + tr))); }
    data.push('V' + (y + height - br));
    if (br > 0) { data.push('A' + arcParameter(br, br, 0, 0, 1, (x + width - br), (y + height))); }
    data.push('H' + (x + bl));
    if (bl > 0) { data.push('A' + arcParameter(bl, bl, 0, 0, 1, (x + 0), (y + height - bl))); }
    data.push('V' + (y + tl));
    if (tl > 0) { data.push('A' + arcParameter(tl, tl, 0, 0, 1, (x + tl), (y + 0))); }
    data.push('Z');
    return data.join(' ');
};

function horizontalBarChart(pageName, dLen){

	var dataList = null;
	var chartUnitStr = "";
	switch(pageName){
		case "CLRRdTotalBases":{
			dataList=subread_total_bases_bar_chart;
			chartUnitStr = "Total Bases(";
		};break;
		case "CLRRdN50":{
			dataList=subread_n50_bar_chart;
			chartUnitStr = "N50(";
		};break;
		case "CLRRdLength":{
			dataList=subread_avg_read_length_bar_chart;
			chartUnitStr = "Average Subread Length(";
		};break;
		case "HiFiRdTotalBases":{
			dataList=hifi_total_bases_bar_chart;
			chartUnitStr = "Total Bases(";
		};break;
		case "HiFiRdN50":{
			dataList=hifi_n50_bar_chart;
			chartUnitStr = "N50(";
		};break;
		case "HiFiRdLength":{
			dataList=hifi_avg_read_length_bar_chart;
			chartUnitStr = "Average HiFi Read Length(";
		};break;
		case "HiFiRdQuality":{
			dataList=hifi_avg_quality_bar_chart;
			chartUnitStr = "Average HiFi Read Quality(";
		};break;
		case "CCSRdTotalBases":{
			dataList=ccs_total_bases_bar_chart;
			chartUnitStr = "Total Bases(";
		};break;
		case "CCSRdN50":{
			dataList=ccs_n50_bar_chart;
			chartUnitStr = "N50(";
		};break;
		case "CCSRdLength":{
			dataList=ccs_avg_read_length_bar_chart;
			chartUnitStr = "Average CCS Read Length(";
		};break;
		case "CCSRdQuality":{
			dataList=ccs_avg_quality_bar_chart;
			chartUnitStr = "Average CCS Read Quality(";
		};break;
	}
	
	var stIdxNum = Number(dLen.split("btw")[0]);
	var edIdxNum = Number(dLen.split("btw")[1]);
	var btwNum =  edIdxNum - stIdxNum;
	
	var standardType = bytesToSize( Math.min.apply(null, dataList.data) , true).split("_")[1];
	var covtStandardType = standardType;
	if(pageName == "HiFiRdQuality" && standardType == "B"){
		covtStandardType = "Phred score";
	}
	var standardDataArr = new Array();
		for(var idx in dataList.data){
			standardDataArr.push( convertToSize(dataList.data[idx], false, standardType) );
		}
	var dMxVal = Math.max.apply(null, standardDataArr) * 1.2;
	//var dMxValArr = getChartRange( dMxVal );
	
	
	$("#chart_unit_span").text( chartUnitStr+covtStandardType+")");
	
	var eachBarHeight = 0;
	var oneWord = 40;
	var bfLeftMargin = 0;
	var leftMargin = 0;
	var readBaseData = new Array();
	var dataRow = null;
	
	for(var i = stIdxNum; i < edIdxNum; i++){
		dataRow = new Object();
		dataRow.label = dataList.labels[i];
		dataRow.val = convertToSize(dataList.data[i], false, standardType);
		readBaseData.push(dataRow);
		eachBarHeight += 76;
		bfLeftMargin = dataList.labels[i].length * oneWord;
		leftMargin = (leftMargin>bfLeftMargin)?leftMargin:bfLeftMargin;
	}
	
	var yPaddingVal = 0.5;
	var chartHeight = 0;
		if(btwNum <= 10){
			chartHeight = eachBarHeight+30+10;
		}else {
			chartHeight = eachBarHeight;
		}
		if(leftMargin <= 44){
			leftMargin = leftMargin + oneWord;
		}
	drawHorizontalBarChart( "barChartCVS", readBaseData, eachBarHeight, chartHeight, yPaddingVal, dMxVal, leftMargin );

}



function drawHorizontalBarChart(divIdStr , readBaseData, eachBarHeight, chartHeight, yPaddingVal, dataMaxVal, leftMargin){
	
	//var dMxValIdx = (dMxValArr.length -1);
	var margin = {top: 30, right: 100, bottom: 10, left: leftMargin },
    width = 2080 - margin.left - margin.right,
    height = chartHeight - margin.top - margin.bottom;

	var y = d3.scaleBand().range([0,height]).padding(yPaddingVal);
	var x = d3.scaleLinear().range([0, width]);
	var d3ChartToolTip = d3.select(".d3ChartToolTip");
	
	
	var svg = d3.select(("#"+divIdStr)).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	  x.domain( [0, dataMaxVal ] )
	  y.domain( readBaseData.map( function(d) { return d.label; } ) );
	  
//	  svg.append("g")
//	  .attr("class", "d3ChartYGridline")
//	  .selectAll("line")
//	  .data(dMxValArr)
//	  .enter().append("line")
//	  .attr("x1", function(d) { return x(d); })
//	  .attr("x2", function(d) { return x(d); })
//	  .attr("y1", function(d) { return 0; })
//	  .attr("y2", function(d) { return height; });
	  
	  svg.selectAll(".d3ChartBar")
      .data(readBaseData)
      .enter().append("path")
      .attr("class", "d3ChartBar")
      .attr("d", function(d){
    	  var pathDataValue = generatePathData( x(0) , y(d.label) , x(d.val) , y.bandwidth() , 18, 18, 0, 0);
    	  return pathDataValue;
      });
	  	  
	  svg.append("g")
	  	.attr("class", "d3HighLightG")
	  	.selectAll("text")
	  	.data(readBaseData)
	  	.enter().append("text")
	  	.attr("class", "d3HighLightTxt")
	  	.attr("x", function(d){
	  		//var addMargin = x( (d.val/60) );
	  		//return (x(d.val)+addMargin);
	  		var xvPst = d.val+(d.val*0.02);
	  		return x(xvPst);
	  	})
	  	.attr("y", function(d) {
	  		return (y(d.label)+5+(y.bandwidth()/2));
	  	})
	  	.text(function(d) { return getCommaNumber(d.val); });
	  
	  svg.append("g")
	      .attr("class", "d3ChartYGridline")
	      .attr("transform", "translate(0,"+height+")")
	      .call(d3.axisBottom(x).ticks(7).tickSize(-height).tickFormat("") );
	  
	  svg.append("g")
	      .attr("class", "d3TopAxis")
	      .attr("transform", "translate(0,30)")
	      .call(d3.axisTop(x).ticks(7) );
	  
	  svg.append("g")
	      .attr("class", "d3LeftAxis")
	      .call(d3.axisLeft(y));
	  d3.select(("#"+divIdStr)).select(".d3TopAxis").selectAll(".domain").remove();
	  d3.select(("#"+divIdStr)).select(".d3ChartYGridline").selectAll(".domain").remove();
	  d3.select(("#"+divIdStr)).select(".d3TopAxis").selectAll(".tick").selectAll("line").attr("transform", "translate(0,0)");
	  d3.select(("#"+divIdStr)).select(".d3TopAxis").selectAll(".tick").selectAll("text").attr("transform", "translate(0,-20)");	
	  d3.select(("#"+divIdStr)).select(".d3LeftAxis").selectAll(".domain").remove();
	  d3.select(("#"+divIdStr)).select(".d3LeftAxis").selectAll(".tick").selectAll("line").remove();
	
}

