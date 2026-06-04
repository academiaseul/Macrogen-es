
var htmlLineArr = [
	'<div class="w3-row"><div class="w3-col l6"><div class="w3-row"><div class="w3-col l6">',
	'<div class="w3-panel w3-round-large w3-center" style="margin: 0px; position: absolute; width: auto; height: 100px; padding-top: 25px; background-color: #e5f0fe;">',
	'<span style="font-size: 40px; color: #223a9d; white-space: pre;">',
	'</span></div>&nbsp;</div><div class="w3-col l6"><span style="font-size: 28px; color: #9e9e9e;">HiFi Read Bases</span><br>',
	'<span style="font-size: 62px; color: #00a8a6;">',
	'</span></div></div></div><div class="w3-col l6"><div class="w3-row"><div class="w3-col l4"><span style="font-size: 28px; color: #9e9e9e;">HiFi Reads</span><br>',
	'<span style="font-size: 40px; color: #616161;">',
	'</span></div><div class="w3-col l4"><span style="font-size: 28px; color: #9e9e9e;">Average Read Length</span><br>',
	'<span style="font-size: 40px; color: #616161;">',
	'</span></div><div class="w3-col l4"><span style="font-size: 28px; color: #9e9e9e;">Average Read Quality</span><br>',
	'<span style="font-size: 40px; color: #616161;">',
	'</span></div></div></div></div>',

	'<div class="w3-row" style="margin-top: 40px;"><div class="w3-col l6">',
	'',
	'',
	'<canvas id="',
	'" style="margin-top: 35px; width: 980px; height: 520px;"></canvas></div>',
	'<div class="w3-col l6">',
	'',
	'<canvas id="',
	'" style="margin-top: 35px; width: 980px; height: 520px;"></canvas></div></div>',
	'<div class="w3-row" style="margin: 140px 0px;"><div class="w3-col l12" style="height: 1px; border-bottom: 1px dotted #4e64c0;">&nbsp;</div></div>'
];
var canvasIDNum = 0;

(function () {
  'use strict'
	
	var thisUrlInfo = getCurrentUrlInfo();
	var inputIdxArr = thisUrlInfo.dLen.split("_");
	
	var statisticsDataAll = new Array();
	var statisticsDataRow;
	for(var idx in inputIdxArr){
		statisticsDataAll.push({
			"sdata":hifi_read_statistics.data[ inputIdxArr[idx] ],
			"lengthChart":hifi_read_length_distribution_chart_list[ inputIdxArr[idx] ],
			"qualityChart":hifi_read_quality_distribution_chart_list[ inputIdxArr[idx] ]
		});
	}
	
	
	var chartHtmlAll = "";
	var canvas1IDStr = "";
	var canvas2IDStr = "";
	var tailLine = true;
	for(var idx in statisticsDataAll){
		
		canvas1IDStr = "lineChartCanvas"+canvasIDNum;
		canvasIDNum++;
		canvas2IDStr = "lineChartCanvas"+canvasIDNum;
		canvasIDNum++;
		
		if(idx==(statisticsDataAll.length-1)){
			tailLine = false;
		}
		
		chartHtmlAll += getChartSummary(
				canvas1IDStr,
				canvas2IDStr,
				statisticsDataAll[idx].sdata[0],
				getCommaNumber( statisticsDataAll[idx].sdata[1] ),
				getCommaNumber( statisticsDataAll[idx].sdata[2] ),
				getCommaNumber( statisticsDataAll[idx].sdata[4] ),
				statisticsDataAll[idx].sdata[5], tailLine
		);
		
		canvas1IDStr = "";
		canvas2IDStr = "";
	}
	$("#hifi_length_chart_div").html(chartHtmlAll);
	
	
	Chart.Legend.prototype.afterFit = function() {
	    this.height = this.height + 30;
	};
	
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
			if(statisticsDataAll[idx].lengthChart.data[subidx].label.indexOf("Accumulated") != -1 ){
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

	
})()


function getChartSummary(canvas1ID, canvas2ID, sampleId, readBases, reads, avgReadLen, avgReadQuality, tailLine ){
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
	if(tailLine){
		result += htmlLineArr[21];
	}
	return result;
}


function readLengthChart(canvasID, labelArr, data1Arr, data2Arr){
	
	var ctx = document.getElementById(canvasID).getContext("2d");
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: labelArr ,
	        datasets: [	        	
	        	{
		            label: 'HiFi Read Length Distribution', backgroundColor : 'rgba(79,203,205,0.3)', borderColor: '#008e8c', borderWidth: 1.5,
		            data: data1Arr ,
		            fill: true
	        	}
	        ]
	    },
	    options: {
	    	responsive: false,
	    	maintainAspectRatio: false,
	    	scales: {
	    		yAxes:[ { 
	    			type:'linear', 
	    			display: true, 
	    			position: 'left', 
	    			ticks:{ color : '#9e9e9e', fontSize: 28 }, 
	    			gridLines:{ display:true, borderColor: 'rgba(246,249,253,0)' } 
    			} ],
    			xAxes:[ { 
    				ticks:{ color : '#9e9e9e', fontSize: 28 },
    				afterBuildTicks: function(xAxesObj) {
						var newTicks = xAxesObj.ticks;
						for(var idx in newTicks){
							if((idx % 2) != 0){ newTicks[idx] = ""; }
						}
						return newTicks;
					},
    				gridLines:{ display: false } 
				} ]
	        },
	        legend:{
	        	display: true,
        		labels: {
        			fontSize: 26,
        			fontStyle: 'bold',
        			fontColor: '#757575'
        		}
	        },
	        elements:{ point:{ radius:0 }, line: { tension: 0.5 } },
	        plugins: { legend: { display: false }, tooltip:{enabled:false} }
	    }
	});
}

function readQualityChart(canvasID, labelArr, data1Arr){
	var ctx = document.getElementById(canvasID).getContext("2d");
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: labelArr ,
	        datasets: [	        	
	        	{
		            label: 'HiFi Read Quality Distribution', backgroundColor : 'rgba(78,100,192,0.3)', borderColor: '#4e64c0', borderWidth: 1.5,
		            data: data1Arr ,
		            fill: true
	        	}
	        ]
	    },
	    options: {
	    	responsive: false,
	    	maintainAspectRatio: false,
	    	scales: {
	    		yAxes:[ { 
	    			type:'linear', 
	    			display: true, 
	    			position: 'left', 
	    			ticks:{ color : '#9e9e9e', fontSize: 28 }, 
	    			gridLines:{ display:true, borderColor: 'rgba(246,249,253,0)' } 
    			} ],
    			xAxes:[ { 
    				ticks:{ color : '#9e9e9e', fontSize: 28 }, 
    				gridLines:{ display: false } 
				} ]
	        },
	        legend:{
	        	display: true,
        		labels: {
        			fontSize: 26,
        			fontStyle: 'bold',
        			fontColor: '#757575'
        		}
	        },
	        elements:{ point:{ radius:0 }, line: { tension: 0.5 } },
	        plugins: { tooltip:{enabled:false} }
	    }
	});
}
