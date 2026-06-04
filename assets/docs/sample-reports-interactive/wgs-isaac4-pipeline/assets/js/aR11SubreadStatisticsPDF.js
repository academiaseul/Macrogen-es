var htmlLineArr = [
'<table style="width: 2080px; margin: 0px; padding: 0px;"><tr><td style="width: 1200px; margin: 0px; padding: 0px;"><canvas id="',
'" style="width: 1100px; height: 650px;"></canvas></td><td style="width: 880px; margin: 0px; padding: 0px;"><div class="w3-row" style="margin-top: 50px;">',
'<div class="w3-col l12" style="height: 70px;"><div class="w3-panel w3-round-large w3-center" style="position: absolute; width: auto; height: 80px; padding-top: 18px; background-color: #e5f0fe;">',
'<span style="font-size: 40px; color: #223a9d; white-space: pre;">',
'</span></div></div></div><div class="w3-row" style="margin-top: 100px;"><div class="w3-col l12"><span style="font-size: 28px; color: #9e9e9e;">Subread Bases</span><br>',
'<span style="font-size: 62px; color: #00a8a6;">',

'</span></div></div><div class="w3-row" style="margin-top: 80px;"><div class="w3-col l12">  <table style="width: 100%;"><tr><td> <span style="font-size: 28px; color: #9e9e9e;">Subreads</span><br>',
'<span style="font-size: 40px; color: #616161;">',
'</span> </td><td> <span style="font-size: 28px; color: #9e9e9e;">Subread N50</span><br>',
'<span style="font-size: 40px; color: #616161;">',
'</span> </td><td> <span style="font-size: 28px; color: #9e9e9e;">Average Read Length</span><br>',
'<span style="font-size: 40px; color: #616161;">',
'</span> </td></tr></table>  </div></div></td></tr></table>',

'<div class="w3-row" style="margin: 160px 0px;"><div class="w3-col l12" style="height: 1px; border-bottom: 1px dotted #4e64c0;">&nbsp;</div></div>'
];

//var htmlLineArr = [
//'<table style="width: 2080px; margin: 0px; padding: 0px;"><tr><td style="width: 1200px; margin: 0px; padding: 0px;"><canvas id="',
//'" style="width: 1100px; height: 650px;"></canvas></td><td style="width: 880px; margin: 0px; padding: 0px;"><div class="w3-row" style="margin-top: 50px;">',
//'<div class="w3-col l12" style="height: 70px;"><div class="w3-panel w3-round-large w3-center" style="position: absolute; width: auto; height: 80px; padding-top: 18px; background-color: #e5f0fe;">',
//'<span style="font-size: 40px; color: #223a9d; white-space: pre;">',
//'</span></div></div></div><div class="w3-row" style="margin-top: 100px;"><div class="w3-col l12"><span style="font-size: 28px; color: #9e9e9e;">Subread Bases</span><br>',
//'<span style="font-size: 62px; color: #00a8a6;">',
//'</span></div></div><div class="w3-row" style="margin-top: 80px;"><div class="w3-col l12"><div class="w3-row"><div class="w3-col l4"><span style="font-size: 28px; color: #9e9e9e;">Subreads</span><br>',
//'<span style="font-size: 40px; color: #616161;">',
//'</span></div><div class="w3-col l4"><span style="font-size: 28px; color: #9e9e9e;">Subread N50</span><br>',
//'<span style="font-size: 40px; color: #616161;">',
//'</span></div><div class="w3-col l4"><span style="font-size: 28px; color: #9e9e9e;">Average Read Length</span><br>',
//'<span style="font-size: 40px; color: #616161;">',
//'</span></div></div></div></div></td></tr></table>',
//'<div class="w3-row" style="margin: 160px 0px;"><div class="w3-col l12" style="height: 1px; border-bottom: 1px dotted #4e64c0;">&nbsp;</div></div>'
//];


var canvasIDNum = 0;

(function () {
  'use strict'
	var thisUrlInfo = getCurrentUrlInfo();
	var inputIdxArr = thisUrlInfo.dLen.split("_");
	drawPage(inputIdxArr);
})()


function getChartSummary(canvasID, sampleId, subreadBases, subreads, subreadN50, avgReadLen , tailLine){
	var result = "";
	result += htmlLineArr[0]+canvasID;
	result += htmlLineArr[1];
	result += htmlLineArr[2];
	result += htmlLineArr[3]+sampleId;
	result += htmlLineArr[4];
	result += htmlLineArr[5]+subreadBases;
	result += htmlLineArr[6];
	result += htmlLineArr[7]+subreads;
	result += htmlLineArr[8];
	result += htmlLineArr[9]+subreadN50;
	result += htmlLineArr[10];
	result += htmlLineArr[11]+avgReadLen;
	result += htmlLineArr[12];
	if(tailLine){
		result += htmlLineArr[13];
	}
	return result;
}


function drawPage(inputIdxArr){
	var statisticsDataAll = new Array();
	var statisticsDataRow;
	for(var idx in inputIdxArr){
		statisticsDataAll.push(
			{
				"sdata": subread_statistics.data[ inputIdxArr[idx] ],
				"schart": subread_length_distribution_chart_list[ inputIdxArr[idx] ]
			}
		);
	}
	
	var chartHtmlAll = "";
	var canvasIDStr = "";
	var tailLine = true;
	for(var idx in statisticsDataAll){
		
		canvasIDStr = "lineChartCanvas"+canvasIDNum;
		canvasIDNum++;
		
		if(idx==(statisticsDataAll.length-1)){
			tailLine = false;
		}
		
		chartHtmlAll += getChartSummary(
				canvasIDStr, 
				statisticsDataAll[idx].sdata[0],
				getCommaNumber( statisticsDataAll[idx].sdata[1] ),
				getCommaNumber( statisticsDataAll[idx].sdata[2] ),
				getCommaNumber( statisticsDataAll[idx].sdata[3] ),
				getCommaNumber( statisticsDataAll[idx].sdata[4] ), tailLine
		);
		
		canvasIDStr = "";
	}
	$("#subread_length_chart_div").html(chartHtmlAll);
	
	
	canvasIDNum = 0;
	var data1Arr = null;
	var data2Arr = null;
	var data1Label = null;
	var data2Label = null;
	for(var idx in statisticsDataAll){
		canvasIDStr = "lineChartCanvas"+canvasIDNum;
		
			for(var subidx in statisticsDataAll[idx].schart.data){
				data2Label = statisticsDataAll[idx].schart.data[subidx].label;
				if( data2Label.indexOf("Accumulated") != -1 ){
					data2Arr = statisticsDataAll[idx].schart.data[subidx].data;
				}else {
					data1Label = data2Label;
					data1Arr = statisticsDataAll[idx].schart.data[subidx].data;
				}
			}
		
		subreadLengthChart(
				canvasIDStr, 
				statisticsDataAll[idx].schart.labels,
				data1Label,
				data2Label,
				data1Arr,
				data2Arr
		);
		canvasIDNum++;
	}
}


function subreadLengthChart(canvasID, labelArr, data1Label, data2Label, data1Arr, data2Arr){
	
	var data1ArrMaxVal = Math.max.apply(null,data1Arr);
	var data2ArrMaxVal = Math.max.apply(null,data2Arr);
	var data1ArrMinVal = Math.min.apply(null,data1Arr);
	var data2ArrMinVal = Math.min.apply(null,data2Arr);
	
	Chart.Legend.prototype.afterFit = function() {
	    this.height = this.height + 50;
	};
	
	var ctx = document.getElementById(canvasID).getContext("2d");
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels:labelArr,
	        datasets: [
	        	{
		            label: data1Label,
		            backgroundColor : 'rgba(79,203,205,0.3)',
		            borderColor: '#008e8c', borderWidth: 4,
		            data: data1Arr,
		            yAxisID: 'y',
		            fill: true
	        	},
	        	{
		            label: data2Label,
		            borderColor: '#e5005a', borderWidth: 4,
		            data: data2Arr,
		            yAxisID: 'y1',
		            fill: false
	        	}
	        ]
	    },
	    options: {
	    	responsive: false,
	    	maintainAspectRatio: false,
	    	scales: {
	    		yAxes:[
	    			{ 
	    				id: 'y',
	    				type:'linear', 
	    				display: true, 
	    				position: 'left', 
	    				ticks:{ 
	    					color : '#9e9e9e', 
	    					fontSize: 28, 
    					}, 
    					gridLines:{ 
    						display:true,
    						drawOnChartArea : false
						},
						scaleLabel:{
							display:true,
							fontSize: 24, 
							labelString: data1Label
						}
						
					},
	    			{ 
						id: 'y1',
						type:'linear', 
						display: true, 
						position: 'right', 
						ticks:{ 
							color : '#9e9e9e', 
							fontSize: 24, 
						}, 
						gridLines:{ 
							display:true,
    						drawOnChartArea : false
						},
						scaleLabel:{
							display:true,
							fontSize: 24, 
							labelString: data2Label
						}
						
					}
	    		],
    			
    			xAxes:[
    				{ 
    					ticks:{
    						color : '#9e9e9e',
    						fontSize: 28
    					},
    					afterBuildTicks: function(xAxesObj) {
    						var newTicks = xAxesObj.ticks;
    						for(var idx in newTicks){
    							if((idx % 2) != 0){ newTicks[idx] = ""; }
    						}
    						return newTicks;
						},
    					gridLines:{ display: true, drawOnChartArea : false },
						scaleLabel:{
							display:true,
							fontSize: 28, 
							labelString: 'Subread Length'
						}
    				
    				}
    			]
	        },
	        legend:{
	        	display: true,
        		labels: {
        			//boxWidth: 35,
        			//boxHeight: 80,
        			//lineWidth: 40,
        			fontSize: 26,
        			fontStyle: 'bold',
        			fontColor: '#757575',
        			padding: 20
        		}
	        },
	        elements:{
	        	point:{ radius:0 },
	        	line: { tension: 0.5 }
	        },
	        plugins: {
	        	paddingBelowLegends: true,
	        	tooltip:{enabled:false}
	        },
	        animation : {
	        	duration: 0,
	        	onComplete: function () {
	        		window.JSREPORT_READY_TO_START = true
	        	}
        	}
	        
	    }
	});
	
}
