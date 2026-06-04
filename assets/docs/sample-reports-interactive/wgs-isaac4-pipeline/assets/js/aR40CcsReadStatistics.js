
//var htmlLineArr = [
//	'<div class="w3-row"><div class="w3-col l6"><div class="w3-row"><div class="w3-col l5">',
//	'<div class="w3-panel w3-round-large w3-center" style="margin: 0px; width: 200px; height: 60px; padding-top: 18px; background-color: #e5f0fe;">',
//	'<span style="font-size: 20px; color: #223a9d;">',
//	'</span></div></div><div class="w3-col l7"><span style="font-size: 12px; color: #9e9e9e;">CCS Read Bases</span><br>',
//	'<span style="font-size: 34px; color: #00a8a6;">',
//	'</span></div></div></div><div class="w3-col l6"><div class="w3-row"><div class="w3-col l3"><span style="font-size: 12px; color: #9e9e9e;">CCS Reads</span><br>',
//	'<span style="font-size: 20px; color: #616161;">',
//	'</span></div><div class="w3-col l3"><span style="font-size: 12px; color: #9e9e9e;">Average Read Length</span><br>',
//	'<span style="font-size: 20px; color: #616161;">',
//	'</span></div><div class="w3-col l3"><span style="font-size: 12px; color: #9e9e9e;">Average Read Quality</span><br>',
//	'<span style="font-size: 20px; color: #616161;">',
//	'</span></div><div class="w3-col l3"></div></div></div></div>',
//
//	'<div class="w3-row" style="margin-top: 40px;"><div class="w3-col l6">',
//	'<table><tr><td><div style="width: 20px; height: 4px; background-color: #008e8c;">&nbsp;</div></td>',
//	'<td><span style="font-size: 16px; font-weight: bold; line-height: 1.88; color: #757575;">&nbsp;&nbsp;CCS Read Length Distribution</span></td>',
//	'</tr></table><canvas id="',
//	'" style="margin-top: 35px; width: 513px; height: 412px;"></canvas></div>',
//	'<div class="w3-col l6"><table><tr><td><div style="width: 20px; height: 4px; background-color: #4e64c0;">&nbsp;</div></td>',
//	'<td><span style="font-size: 16px; font-weight: bold; line-height: 1.88; color: #757575;">CCS Read Quality Distribution</span></td>',
//	'</tr></table><canvas id="',
//	'" style="margin-top: 35px; width: 513px; height: 412px;"></canvas></div></div>',
//	'<div class="w3-row" style="margin: 70px 0px;"><div class="w3-col l12" style="height: 1px; border-bottom: 1px dotted #4e64c0;">&nbsp;</div></div>'
//];
var htmlLineArr = [
	'<div class="w3-row"><div class="w3-col l6"><div class="w3-row"><div class="w3-col l5">',
	'<div class="w3-panel w3-round-large w3-center" style="margin: 0px; position: absolute; width: auto; height: 60px; padding-top: 18px; background-color: #e5f0fe;">',
	'<span style="font-size: 20px; color: #223a9d; white-space: pre;">',
	'</span></div>&nbsp;</div><div class="w3-col l7"><span style="font-size: 12px; color: #9e9e9e;">CCS Read Bases</span><br>',
	'<span style="font-size: 34px; color: #00a8a6;">',
	'</span></div></div></div><div class="w3-col l6"><div class="w3-row"><div class="w3-col l3"><span style="font-size: 12px; color: #9e9e9e;">CCS Reads</span><br>',
	'<span style="font-size: 20px; color: #616161;">',
	'</span></div><div class="w3-col l3"><span style="font-size: 12px; color: #9e9e9e;">Average Read Length</span><br>',
	'<span style="font-size: 20px; color: #616161;">',
	'</span></div><div class="w3-col l3"><span style="font-size: 12px; color: #9e9e9e;">Average Read Quality</span><br>',
	'<span style="font-size: 20px; color: #616161;">',
	'</span></div><div class="w3-col l3"></div></div></div></div>',

	'<div class="w3-row" style="margin-top: 40px;"><div class="w3-col l6">',
	'',
	'',
	'<canvas id="',
	'" style="margin-top: 35px; width: 513px; height: 412px;"></canvas></div>',
	'<div class="w3-col l6">',
	'',
	'<canvas id="',
	'" style="margin-top: 35px; width: 513px; height: 412px;"></canvas></div></div>',
	'<div class="w3-row" style="margin: 70px 0px;"><div class="w3-col l12" style="height: 1px; border-bottom: 1px dotted #4e64c0;">&nbsp;</div></div>'
];
var canvasIDNum = 0;

(function () {
  'use strict'
	
	var resultPages = getResultPage("submain");
	var tagStr = "";
	for(var pageIdx in resultPages){ tagStr += resultPages[pageIdx]; }
	$('#raw_data_result_pages_ul').html(tagStr);
	$('#quick_menu_pages_ul').html(tagStr);
	$('#quick_menu_pages_ul').find("a[href*=aR40CcsReadStatistics]").css("font-weight", "bold");
	
	
	var statisticsDataAll = new Array();
	var statisticsDataRow;
	for(var idx in ccs_read_statistics.data){
		statisticsDataAll.push({
			"sdata":ccs_read_statistics.data[idx],
			"lengthChart":ccs_read_length_distribution_chart_list[idx],
			"qualityChart":ccs_read_quality_distribution_chart_list[idx]
		});
	}
	
	
	var statisticsTbl = $("#example_jqdt").DataTable({
		"info":false,"ordering": false,"searching": false,"lengthChange": true,
		"lengthMenu": [[10, 30, 50, -1], [10, 30, 50, "All"]],
		"language": {
		    "paginate": {
		      "previous": "<img src='../images/icon_dt_previous.png'>",
		      "next": "<img src='../images/icon_dt_next.png'>"
		    }
		}
	});
	
	for(var idx in statisticsDataAll){
		statisticsTbl.row.add([
			statisticsDataAll[idx].sdata[0],
			getCommaNumber( statisticsDataAll[idx].sdata[1] ),
			getCommaNumber( statisticsDataAll[idx].sdata[2] ),
			getCommaNumber( statisticsDataAll[idx].sdata[3] ),
			getCommaNumber( statisticsDataAll[idx].sdata[4] ),
			statisticsDataAll[idx].sdata[5],
			statisticsDataAll[idx].sdata[6]
		]).draw( false );
	}
	
	
	var chartHtmlAll = "";
	var canvas1IDStr = "";
	var canvas2IDStr = "";
	for(var idx in statisticsDataAll){
		
		canvas1IDStr = "lineChartCanvas"+canvasIDNum;
		canvasIDNum++;
		canvas2IDStr = "lineChartCanvas"+canvasIDNum;
		canvasIDNum++;
		
		chartHtmlAll += getChartSummary(
				canvas1IDStr,
				canvas2IDStr,
				statisticsDataAll[idx].sdata[0],
				getCommaNumber( statisticsDataAll[idx].sdata[1] ),
				getCommaNumber( statisticsDataAll[idx].sdata[2] ),
				getCommaNumber( statisticsDataAll[idx].sdata[4] ),
				statisticsDataAll[idx].sdata[5]
		);
		
		canvas1IDStr = "";
		canvas2IDStr = "";
	}
	$("#ccs_length_chart_div").html(chartHtmlAll);
	
	
	
	canvasIDNum = 0;
	canvas1IDStr = "";
	canvas2IDStr = "";
	var data1Arr = null;
	var data2Arr = null;
	for(var idx in statisticsDataAll){
		canvas1IDStr = "lineChartCanvas"+canvasIDNum;
		canvasIDNum++;
		canvas2IDStr = "lineChartCanvas"+canvasIDNum;
		canvasIDNum++;
		
		for(var subidx in statisticsDataAll[idx].lengthChart.data){
			if(statisticsDataAll[idx].lengthChart.data[subidx].label.includes("Accumulated")){
				data2Arr = statisticsDataAll[idx].lengthChart.data[subidx].data;
			}else {
				data1Arr = statisticsDataAll[idx].lengthChart.data[subidx].data;
			}
		}
		
		readLengthChart(
				canvas1IDStr, 
				statisticsDataAll[idx].lengthChart.labels,
				data1Arr,
				data2Arr
		);
		readQualityChart(
				canvas2IDStr, 
				statisticsDataAll[idx].qualityChart.labels,
				statisticsDataAll[idx].qualityChart.data[0].data
		);
		
		canvas1IDStr = "";
		canvas2IDStr = "";
	}
	
	
	$("#tbl_tooltip_btn").hover(function() {
		$("#table_cols_info_svg").toggle();
		
	});

	
})()


function getChartSummary(canvas1ID, canvas2ID, sampleId, readBases, reads, avgReadLen, avgReadQuality ){
	var result = "";
	result += htmlLineArr[0];
	result += htmlLineArr[1];
	result += htmlLineArr[2]+sampleId;
	result += htmlLineArr[3];
	result += htmlLineArr[4]+readBases;
	result += htmlLineArr[5];
	result += htmlLineArr[6]+reads;
	result += htmlLineArr[7];
	result += htmlLineArr[8]+avgReadLen;
	result += htmlLineArr[9];
	result += htmlLineArr[10]+avgReadQuality;
	result += htmlLineArr[11];
	result += htmlLineArr[12];
	result += htmlLineArr[13];
	result += htmlLineArr[14];
	result += htmlLineArr[15]+canvas1ID;
	result += htmlLineArr[16];
	result += htmlLineArr[17];
	result += htmlLineArr[18];
	result += htmlLineArr[19]+canvas2ID;
	result += htmlLineArr[20];
	result += htmlLineArr[21];
	return result;
}


function readLengthChart(canvasID, labelArr, data1Arr, data2Arr){
	var ctx = document.getElementById(canvasID);
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: labelArr ,
	        datasets: [	        	
	        	{
		            label: 'CCS Read Length Distribution', backgroundColor : 'rgba(79,203,205,0.3)', borderColor: '#008e8c', borderWidth: 1.5,
		            data: data1Arr ,
		            fill: true
	        	}
	        ]
	    },
	    options: {
	    	responsive: false,
	    	scales: {
	    		y:{ 
	    			type:'linear', 
	    			display: true, 
	    			position: 'left', 
	    			ticks:{ color : '#9e9e9e' }, 
	    			grid:{ borderColor: 'rgba(246,249,253,0)' } },
    			x:{ ticks:{ color : '#9e9e9e' }, grid:{ display: false, borderColor: '#e0e0e0' } }
	        },
	        elements:{ point:{ radius:0 }, line: { tension: 0.5 } },
	        plugins: { 
	        	legend: {
	        		display: true,
	        		labels: {
	        			boxWidth: 15,
	        			boxHeight: 2,
	        			font:{
	        				size: 14,
	        				weight: 700,
	        				lineHeight: 1.88,
	        				color: '#757575'
	        			}
	        		}
	        		
        		}, 
	        	tooltip:{enabled:false} 
        	}
	    }
	});
}

function readQualityChart(canvasID, labelArr, data1Arr){
	var ctx = document.getElementById(canvasID);
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: labelArr ,
	        datasets: [	        	
	        	{
		            label: 'CCS Read Quality Distribution', backgroundColor : 'rgba(78,100,192,0.3)', borderColor: '#4e64c0', borderWidth: 1.5,
		            data: data1Arr ,
		            fill: true
	        	}
	        ]
	    },
	    options: {
	    	responsive: false,
	    	scales: {
	    		y:{ type:'linear', display: true, position: 'left', ticks:{ color : '#9e9e9e' }, grid:{ borderColor: 'rgba(246,249,253,0)' } },
    			x:{ ticks:{ color : '#9e9e9e' }, grid:{ display: false, borderColor: '#e0e0e0' } }
	        },
	        elements:{ point:{ radius:0 }, line: { tension: 0.5 } },
	        plugins: { 
	        	legend: {
	        		display: true,
	        		labels: {
	        			boxWidth: 15,
	        			boxHeight: 2,
	        			font:{
	        				size: 14,
	        				weight: 700,
	        				lineHeight: 1.88,
	        				color: '#757575'
	        			}
	        		}
	        		
        		}, 
	        	tooltip:{enabled:false} 
        	}
	    }
	});
}
