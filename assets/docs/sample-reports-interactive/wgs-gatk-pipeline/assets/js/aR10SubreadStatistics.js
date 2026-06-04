var htmlLineArr = [
'<div class="w3-row"><div class="w3-col l7"><canvas id="',
'" style="width: 633px; height: 412px;"></canvas></div><div class="w3-col l5"><div class="w3-row" style="margin-top: 49px;">',
'<div class="w3-col l12" style="height: 70px;"><div class="w3-panel w3-round-large w3-center" style="position: absolute; width: auto; height: 60px; padding-top: 18px; background-color: #e5f0fe;">',
'<span style="font-size: 20px; color: #223a9d; white-space: pre;">',
'</span></div></div></div><div class="w3-row" style="margin-top: 40px;"><div class="w3-col l12"><span style="font-size: 12px; color: #9e9e9e;">Subread Bases</span><br>',
'<span style="font-size: 42px; color: #00a8a6;">',
'</span></div></div><div class="w3-row" style="margin-top: 20px;"><div class="w3-col l12"><div class="w3-row"><div class="w3-col l4"><span style="font-size: 12px; color: #9e9e9e;">Subreads</span><br>',
'<span style="font-size: 20px; color: #616161;">',
'</span></div><div class="w3-col l4"><span style="font-size: 12px; color: #9e9e9e;">Subread N50</span><br>',
'<span style="font-size: 20px; color: #616161;">',
'</span></div><div class="w3-col l4"><span style="font-size: 12px; color: #9e9e9e;">Average Read Length</span><br>',
'<span style="font-size: 20px; color: #616161;">',
'</span></div></div></div></div></div></div>',
'<div class="w3-row" style="margin: 70px 0px;"><div class="w3-col l12" style="height: 1px; border-bottom: 1px dotted #4e64c0;">&nbsp;</div></div>'
];
var canvasIDNum = 0;


(function () {
  'use strict'
	
	//var thisUrlInfo = getCurrentUrlInfo();
	//var pageName = thisUrlInfo.pgnm;
	//var pageTitle = getResultPageName(pageName);
	
	var resultPages = getResultPage("submain");
	var tagStr = "";
	for(var pageIdx in resultPages){ tagStr += resultPages[pageIdx]; }
	$('#raw_data_result_pages_ul').html(tagStr);
	$('#quick_menu_pages_ul').html(tagStr);
	$('#quick_menu_pages_ul').find("a[href*=aR10SubreadStatistics]").css("font-weight", "bold");
	
	
	var statisticsDataAll = new Array();
	var statisticsDataRow;
	for(var idx in subread_statistics.data){
		statisticsDataAll.push({
			"sdata":subread_statistics.data[idx],
			"schart":subread_length_distribution_chart_list[idx]
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
			getCommaNumber( statisticsDataAll[idx].sdata[4] )
		]).draw( false );
	}
	
	var chartHtmlAll = "";
	var canvasIDStr = "";
	for(var idx in statisticsDataAll){
		
		canvasIDStr = "lineChartCanvas"+canvasIDNum;
		canvasIDNum++;
		
		chartHtmlAll += getChartSummary(
				canvasIDStr, 
				statisticsDataAll[idx].sdata[0],
				getCommaNumber( statisticsDataAll[idx].sdata[1] ),
				getCommaNumber( statisticsDataAll[idx].sdata[2] ),
				getCommaNumber( statisticsDataAll[idx].sdata[3] ),
				getCommaNumber( statisticsDataAll[idx].sdata[4] )
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
				if(data2Label.includes("Accumulated")){
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


	
	$("#tbl_tooltip_btn").hover(function() {
		$("#table_cols_info_svg").toggle();
		
	});

	
})()




function getChartSummary(canvasID, sampleId, subreadBases, subreads, subreadN50, avgReadLen ){
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
	result += htmlLineArr[13];
	return result;
}



function subreadLengthChart(canvasID, labelArr, data1Label, data2Label, data1Arr, data2Arr){
	
	var labelArrMaxVal = Math.max.apply(null,labelArr);
	var data1ArrMaxVal = Math.max.apply(null,data1Arr);
	var data2ArrMaxVal = Math.max.apply(null,data2Arr);
	
	var ctx = document.getElementById(canvasID).getContext("2d");
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels:labelArr,
	        datasets: [
	        	{
		            label: data1Label,
		            backgroundColor : 'rgba(79,203,205,0.3)',
		            borderColor: '#008e8c', borderWidth: 1.5,
		            data: data1Arr,
		            yAxisID: 'y',
		            fill: true
	        	},
	        	{
		            label: data2Label,
		            borderColor: '#e5005a', borderWidth: 1.5,
		            data: data2Arr,
		            yAxisID: 'y1'
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
	    			grid:{ display:true, color: 'rgba(255,255,255,0)', tickColor: '#9e9e9e' }, // tickLength: 5 drawTicks: true, 
	    			title:{display:true, text:data1Label, color: '#9e9e9e'}
	    			
    			},
    			y1:{ 
    				type:'linear', 
    				display: true, 
    				position: 'right', 
    				ticks:{ color : '#9e9e9e' }, 
    				grid:{ display:true, color: 'rgba(255,255,255,0)', tickColor: '#9e9e9e' }, // tickLength: 5 drawTicks: true, 
    				title:{ display:true, text:data2Label, color: '#9e9e9e'  } // autoSkip: false, rotate: true, maxRotation: 90, minRotation: 90
    				
				},
    			x:{ 
    				
    				ticks:{ 
    					callback: function(val, index) {
    						return ((index % 2) === 0)?this.getLabelForValue(val):"";
    					},
    					color : '#9e9e9e'
					}, // min:0, max:labelArrMaxVal, stepSize: 500
    				grid:{ display: true, color: 'rgba(255,255,255,0)', tickColor: '#9e9e9e' }, // tickLength: 5 drawTicks: true,
    				title:{ display:true, text:'Subread Length', color: '#9e9e9e' }
				}
	        },
	        elements:{
	        	point:{ radius:0 },
	        	line: { tension: 0.5 }
	        },
	        plugins: {
	        	legend: {
	        		display: true,
//	        		align : 'start',
	        		labels: {
	        			boxWidth: 15,
	        			boxHeight: 2,
	        			font:{
	        				size: 14,
	        				weight: 700,
	        				lineHeight: 1.88,
	        				color: '#757575'
	        			},
	        			padding: 20
	        		}
	        		
        		},
        		tooltip:{enabled:false}
	        }
	        
	    }
	});
	
	
}



