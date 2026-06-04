
var pageName = "";
(function () {
  'use strict'
	resizeMyPopUp();
	
	var thisUrlInfo = getCurrentUrlInfo();
	pageName = thisUrlInfo.pgnm;
	$(".content_title1").text( getResultPageName(pageName) );
	
	horizontalBarChart(pageName);

})()

function closePopUpWindow(){
	window.close();
}

function horizontalBarChart(pageName){
	
	
	var dataList = null;
	var chartUnitStr = "";
	switch(pageName){
		case "CLRRdTotalBases":{
			dataList=subread_total_bases_bar_chart;
			chartUnitStr = "Total Bases";
		};break;
		case "CLRRdN50":{
			dataList=subread_n50_bar_chart;
			chartUnitStr = "N50";
		};break;
		case "CLRRdLength":{
			dataList=subread_avg_read_length_bar_chart;
			chartUnitStr = "Average Subread Length";
		};break;
		case "HiFiRdTotalBases":{
			dataList=hifi_total_bases_bar_chart;
			chartUnitStr = "Total Bases";
		};break;
		case "HiFiRdN50":{
			dataList=hifi_n50_bar_chart;
			chartUnitStr = "N50";
		};break;
		case "HiFiRdLength":{
			dataList=hifi_avg_read_length_bar_chart;
			chartUnitStr = "Average HiFi Read Length";
		};break;
		case "HiFiRdQuality":{
			dataList=hifi_avg_quality_bar_chart;
			chartUnitStr = "Average HiFi Read Quality";
		};break;
		case "CCSRdTotalBases":{
			dataList=ccs_total_bases_bar_chart;
			chartUnitStr = "Total Bases";
		};break;
		case "CCSRdN50":{
			dataList=ccs_n50_bar_chart;
			chartUnitStr = "N50";
		};break;
		case "CCSRdLength":{
			dataList=ccs_avg_read_length_bar_chart;
			chartUnitStr = "Average CCS Read Length";
		};break;
		case "CCSRdQuality":{
			dataList=ccs_avg_quality_bar_chart;
			chartUnitStr = "Average CCS Read Quality";
		};break;
	}
	
	var dataAllCnt = dataList.data.length;
	var allChartNum = dataAllCnt / 20;
	
	var divIdx = 0;
	var htmlStr = "";
	var divIdStr = "barChartCVS";
	for(var chartNum = 0; chartNum < allChartNum; chartNum++){
		if(chartNum%2==0){
			divIdx = chartNum+1;
			htmlStr = '<div class="w3-row w3-margin-top"><div class="w3-col l6"><div id="'+divIdStr+divIdx+'"></div></div><div class="w3-col l6"><div id="'+divIdStr+(divIdx+1)+'"></div></div></div>';
			$("#popup_chart_area_div").append(htmlStr);
		}
	}
	
	var eachBarHeight = 0;
	var chartSTIdx = 0;
	var chartLTIdx = chartSTIdx+20;
	
	
	var standardType = bytesToSize( Math.min.apply(null, dataList.data) , true).split("_")[1];
	var covtStandardType = standardType;
	if(pageName == "HiFiRdQuality" && standardType == "bp"){
		covtStandardType = "Phred score";
	}
	var standardDataArr = new Array();
		for(var idx in dataList.data){
			standardDataArr.push( convertToSize(dataList.data[idx], false, standardType) );
		}
	var dMxVal = Math.max.apply(null, standardDataArr);
	//var dMxValArr = getChartRange( dMxVal );
	
	$("#chart_unit_span").text( ( chartUnitStr+"("+covtStandardType+")" ) );
	
	var yPaddingVal = 0.5;
	var chartHeight = 0;
	var oneWord = 15;
	var bfLeftMargin = 0;
	var leftMargin = 0;
	
	for(var chartNum = 0; chartNum < allChartNum; chartNum++){
		var readBaseData = new Array();		
		var dataRow = null;

			for(var i = chartSTIdx; i < chartLTIdx; i++){
				dataRow = new Object();
				dataRow.label = dataList.labels[i];
				dataRow.val = convertToSize(dataList.data[i], false, standardType);
				readBaseData.push(dataRow);
				eachBarHeight += 38;
				bfLeftMargin = dataList.labels[i].length * oneWord;
				leftMargin = (leftMargin>bfLeftMargin)?leftMargin:bfLeftMargin;
			}
			
			if(chartLTIdx <= 10){
				chartHeight = eachBarHeight+40+30;
			}else {
				chartHeight = eachBarHeight;
			}
			if(leftMargin <= 20){
				leftMargin = leftMargin + oneWord;
			}
			drawHorizontalBarChart(
					(divIdStr+(chartNum+1)), readBaseData, eachBarHeight, chartHeight, yPaddingVal, dMxVal, leftMargin, chartUnitStr, covtStandardType
			);
		
		chartSTIdx = chartLTIdx;
		if( (dataAllCnt - chartLTIdx) > 20 ){
			chartLTIdx = chartSTIdx + 20;
		}else{
			chartLTIdx = dataAllCnt;
		}
		eachBarHeight = 0;
		readBaseData = null;
		bfLeftMargin = 0;
		leftMargin = 0;
	}
	
}

function drawHorizontalBarChart(divIdStr , readBaseData, eachBarHeight, chartHeight, yPaddingVal, dataMaxVal, leftMargin, chartUnitStr, standardType){
	
	var margin = {top: 40, right: 80, bottom: 30, left: leftMargin };
	if(dataMaxVal > 100000){
		margin.top = 80;
	}
    var width = 650 - margin.left - margin.right;
    var height = chartHeight - margin.top - margin.bottom;

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
	  	  
	  svg.selectAll(".d3ChartBar")
      .data(readBaseData)
      .enter().append("path")
      .attr("class", "d3ChartBar")
      .attr("d", function(d){
    	  var pathDataValue = generatePathData( x(0) , y(d.label) , x(d.val) , y.bandwidth() , 8, 8, 0, 0);
    	  return pathDataValue;
      })
      .on("mouseover", function(d) {
    	  d3ChartToolTip.style("display", null);
    	  d3ChartToolTip.style("left", (d3.event.pageX - 175) + "px");
    	  d3ChartToolTip.style("top", (d3.event.pageY - 125) + "px");
    	  
    	  var ttHeaderX = 20;
    	  var ttHeaderY = 35;
    	  var ttNmX = 20;
    	  var ttNmY = 65;
    	  var ttUnitX = 20;
    	  var ttUnitY = 65;
    	  var ttValX = 165;
    	  var ttValY = 65;
    	  var dataValue = getCommaNumber(d.val);
    	  var ttNmFontSize = "18px";
	          
    	  var standardTypeStr = "("+standardType+") : ";
    	  var chartUnitStrAll = chartUnitStr + standardTypeStr;
    	  var dataValueAll = dataValue;
    	  
    	  if(chartUnitStrAll.length > 22){
    		  ttNmX = 15;
    		  ttUnitX = 15;
			  ttUnitY = 95;
    		  ttValX = 15+(standardTypeStr.length * 8);
    		  ttValY = 95;
    		  chartUnitStrAll = chartUnitStr;
    		  standardTypeStr = "("+standardType+") : ";
    	  }else{
    		  chartUnitStrAll = chartUnitStr + standardTypeStr + dataValue;
    		  if(chartUnitStrAll.length > 22){
    			  ttValX = 20;
        		  ttValY = 95;
        		  chartUnitStrAll = chartUnitStr + standardTypeStr;
    		  }else{
    			  chartUnitStrAll = chartUnitStr + standardTypeStr;
    			  ttValX = 20+(chartUnitStrAll.length * 8);
    		  }
    		  standardTypeStr = "";
    	  }
    	  
	    	  d3ChartToolTip.select(".d3ChartToolTipHeader").attr("x", ttHeaderX);
	          d3ChartToolTip.select(".d3ChartToolTipHeader").attr("y", ttHeaderY);
	          d3ChartToolTip.select(".d3ChartToolTipName").attr("x", ttNmX);
	          d3ChartToolTip.select(".d3ChartToolTipName").attr("y", ttNmY);
	          //d3ChartToolTip.select(".d3ChartToolTipName").attr("font-size", ttNmFontSize);
	          d3ChartToolTip.select(".d3ChartToolTipUnit").attr("x", ttUnitX);
	          d3ChartToolTip.select(".d3ChartToolTipUnit").attr("y", ttUnitY);
	          d3ChartToolTip.select(".d3ChartToolTipValue").attr("x", ttValX);
	          d3ChartToolTip.select(".d3ChartToolTipValue").attr("y", ttValY);
	          
	      d3ChartToolTip.select(".d3ChartToolTipHeader").text(d.label);
		  d3ChartToolTip.select(".d3ChartToolTipName").text( chartUnitStrAll );
		  d3ChartToolTip.select(".d3ChartToolTipUnit").text( standardTypeStr );
	      d3ChartToolTip.select(".d3ChartToolTipValue").text( dataValueAll );
      })
      .on("mouseout",  function() { d3ChartToolTip.style("display", "none"); });
	  	  
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
	      .attr("transform", "translate(0,0)")
	      .call(d3.axisTop(x).ticks(7) );
	  
	  
	  svg.append("g")
	      .attr("class", "d3LeftAxis")
	      .call(d3.axisLeft(y));
	  d3.select(("#"+divIdStr)).select(".d3TopAxis").selectAll(".domain").remove();
	  d3.select(("#"+divIdStr)).select(".d3ChartYGridline").selectAll(".domain").remove();
	  d3.select(("#"+divIdStr)).select(".d3TopAxis").selectAll(".tick").selectAll("line").attr("transform", "translate(0,0)");
	  if(dataMaxVal > 100000){
		  d3.select(("#"+divIdStr)).select(".d3TopAxis").selectAll(".tick").selectAll("text").attr("transform", "translate(-10,-15) rotate(-45)").style("text-anchor", "start");
	  }else{
		  d3.select(("#"+divIdStr)).select(".d3TopAxis").selectAll(".tick").selectAll("text").attr("transform", "translate(0,-20)");
	  }
	  d3.select(("#"+divIdStr)).select(".d3LeftAxis").selectAll(".domain").remove();
	  d3.select(("#"+divIdStr)).select(".d3LeftAxis").selectAll(".tick").selectAll("line").remove();
	
}


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
