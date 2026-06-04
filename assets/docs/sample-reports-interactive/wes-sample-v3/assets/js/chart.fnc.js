
  
  function subreadLengthChart(opt){

	var labelArr = obj.contents[contentsLen].data.labels

	var data1Arr = obj.contents[contentsLen].data.datasets[0].data
	var data2Arr = obj.contents[contentsLen].data.datasets[1].data

	var ctx = document.getElementById(opt.id);
	var colorType1 = {
        backgroundColor : 'rgba(79,203,205,0.3)', 
        borderColor: '#008e8c',		
 
      }
      var colorType2 = {
        backgroundColor : 'rgba(78,100,192,0.3)', 
        borderColor: '#4e64c0',
      }

	  
	var colorType = opt.colorType === undefined || opt.colorType == 'type1' ? colorType1 : colorType2;

	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels:labelArr,
	        datasets: [
	        	{
		            label : opt.dataset[0].label,
		            ...colorType,
					borderWidth : 1.5,
		            data : data1Arr,
		            yAxisID : 'y',
		            fill : true
	        	},
	        	{
		            label: opt.dataset[1].label,
		            borderColor: '#e5005a', borderWidth: 1.5,
		            data: data2Arr,
		            yAxisID: 'y1'
	        	}
	        ]
	    },
	    options:$.extend(true, {
			responsive: true,
			maintainAspectRatio: false,
            rightBorder:'rgba(221, 224, 227, 1)',      
            makingTicks: true,      
	    	scales: {
	    		y:{ 
	    			type:'linear', 
	    			display: true, 
	    			position: 'left', 
	    			ticks:{ color : '#9e9e9e' }, 
	    			title:{display:true, text:opt.dataset[0].label,color: '#616161', align:'end'  },
	    			grid:{ display:true, color: 'rgba(255,255,255,0)', drawTicks: true, tickColor: '#dde0e3', tickLength: 5 }, 
    			},
    			y1:{ 
    				type:'linear', 
    				display: true, 
    				position: 'right', 
    				ticks:{color : '#9e9e9e', font:{size:12}}, 
    				title:{ display:true, text:opt.dataset[1].label, color: '#616161', align:'end'   },
                    grid: {
                        // drawBorder: false,
                        tickLength:5,
                        tickColor:'#dde0e3',
                        color: function(context) {
                          if (context.tick.value > 0) {
                            return 'rgba(0,0,0,0)';
                          }
                          return '#dde0e3';
                        },
                      }, 
				},
    			x:{ 
    				ticks:{ color : '#9e9e9e', autoSkip: true, maxRotation: 0, minRotation: 0}, 
    				grid:{ display: true, color: 'rgba(255,255,255,0)', drawTicks: true, tickColor: '#9e9e9e', tickLength: 5 },
    				title:{display:true, text:opt.xLabel, color: '#616161', align:'end'  },
                    grid: {
                        // drawBorder: false,
                        // tickLength:5,
                        // tickColor:'#dde0e3',
                        color: function(context) {
                          if (context.tick.value > 0) {
                            return 'rgba(0,0,0,0)';
                          }
                          return '#dde0e3';
                        },
                      },                     
                         
				}
	        },
	        elements:{
	        	point:{ radius:0 },
	        	line: { tension: 0.5 }
	        },
            
	        plugins: {
	        	legend: {
	        		display: false
        		},
        		tooltip:{enabled:false}
	        }
	        
	    }, opt.option)
	});
	
}


  
  function readLengthChart(opt){
      
      var ctx = document.getElementById(opt.id);
      var colorType1 = {
        backgroundColor : 'rgba(78,100,192,0.3)', 
        borderColor: '#4e64c0', 
      }
      var colorType2 = {
        backgroundColor : 'rgba(79,203,205,0.3)', 
        borderColor: '#008e8c',
      }

      var colorType = opt.colorType == 'type1' ? colorType1 : colorType2;
      var myChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: opt.labelArr ,
              datasets: [	        	
                  {
                      label: 'HiFi Read Length Distribution', 
                      ...colorType,
                      borderWidth: 1.5,
                      data: opt.data1Arr ,
                      fill: true,
                  }
              ]
          },
          options: $.extend(true, {
			responsive: true,
			maintainAspectRatio: false,
              makingTicks: true,
              scales: {
                  y:{ 
                      type:'linear', 
                      display: true, 
                      position: 'left', 
                      ticks:{ color : '#9e9e9e', stepSize: 20000, font:{size:12}}, 
                      min:0,
                      //max:200000,
                      grid:{ display: true, color: 'rgba(255,255,255,0)', drawTicks: true, tickColor: '#9e9e9e', tickLength: 5 },			  
						grid:{ borderColor: 'rgba(246,249,253,0)' },
                      title:{ display:true, text:"", color: '#616161', align:'end'  },

                  },
                  x:{ 
                      ticks:{ color : '#9e9e9e', stepSize: 10000, font:{size:12}, maxRotation: 0, minRotation: 0}, 
                      grid:{ display: false, color:'rgba(0,0,0,0)'},
                      title:{ display:true, text:"", color: '#616161', align:'end'  },
					//   grid: {
                    //     color: function(context) {
                    //       if (context.tick.value > 0) {
                    //         return 'rgba(0,0,0,0)';
                    //       }
                    //       return '#dde0e3';
                    //     },
                    //   },      
                                            
                  },
				  

              },
              elements:{ point:{ radius:0 }, line: { tension: 0.5 } },
              plugins: { 
                  legend: {
                      display: false
                  },
                  tooltip:{enabled:false},
                  
              }
          }, opt.options)
      });

  }
  
//   function readQualityChart(){
      
//       var labelArr = [20.0, 21.0, 22.0, 23.0, 24.0, 25.0, 26.0, 27.0, 28.0, 29.0, 30.0, 31.0, 32.0, 33.0, 34.0, 35.0, 36.0, 37.0, 38.0, 39.0, 40.0, 41.0, 42.0, 43.0, 44.0, 45.0, 46.0, 47.0, 48.0, 49.0];
//       var data1Arr = [833.0, 905.0, 905.0, 927.0, 984.0, 1008.0, 1076.0, 1046.0, 1133.0, 1247.0, 1335.0, 1528.0, 1700.0, 1932.0, 1969.0, 1807.0, 1646.0, 1245.0, 1058.0, 812.0, 788.0, 669.0, 582.0, 510.0, 454.0, 379.0, 345.0, 337.0, 313.0, 257.0];
      
//       var ctx = document.getElementById("lineChartCanvas2");
//       var myChart = new Chart(ctx, {
//           type: 'line',
//           data: {
//               labels: labelArr ,
//               datasets: [	        	
//                   {
//                       label: 'HiFi Read Quality Distribution', backgroundColor : 'rgba(79,203,205,0.3)', borderColor: '#008e8c', borderWidth: 1.5,
//                       data: data1Arr ,
//                       fill: true
//                   }
//               ]
//           },
//           options: {
//               responsive: false,
//               makingTicks: true,
//               scales: {
//                   y:{ 
//                       type:'linear', 
//                       display: true, 
//                       position: 'left', 
//                       ticks:{ color : '#9e9e9e' }, 
//                       grid:{ borderColor: 'rgba(246,249,253,0)' },
//                       title:{ display:true, text:"HiFi Read Quality Distribution", color: '#9e9e9e'  }
//                   },
//                   x:{ 
//                       ticks:{ color : '#9e9e9e' }, 
//                       grid:{ display: false, borderColor: '#e0e0e0' },
//                       title:{ display:true, text:"X", color: '#9e9e9e'  }
//                   }
//               },
//               elements:{ point:{ radius:0 }, line: { tension: 0.5 } },
//               plugins: { 
//                   legend: {
//                       display: false
//                   }, 
//                   tooltip:{enabled:false} 
//               }
//           }
//       });
//   }


  
function circleChart(opt){
    var ctx = document.getElementById(opt.id);
    var myChart = new Chart(ctx, {
		type: 'doughnut',
		data: {
			datasets: [{
				data: opt.data,
				backgroundColor: opt.bgColor,
				// hoverOffset: 4,
				// spacing:0,
				// pointRadius: 1,
                // cutout: 80,
			}],
		},
		options: {
			responsive: true,
			cutout: opt.count ? opt.count : 34,
            aspectRatio: 1,
            plugins: { 
                legend: {
                    display: false
                }, 
                tooltip:{enabled:false} 
            }            
		}
	});
}

function barChart(opt){

	var datasets = opt.data.map(function(chartData, i){
		return {
			// label: chartData.label,
			type:chartData.type,
			yAxisID:chartData.yAxisID,
			xAxisID:chartData.xAxisID,
			backgroundColor:chartData.bgColor,
			fill: false,
			data: chartData.data,
			label:chartData.label,
			borderWidth:0
		}
	});


	var tooltipsSetting={
		callbacks: {
			labelColor: function(tooltipItem, chart) {
				let color = tooltipItem.datasetIndex == 0 ? {
					borderColor:'rgba(0, 0, 0, 0)',
					backgroundColor: 'rgb(34, 58, 157, 1)'
				} : {
					borderColor:'rgba(0, 0, 0, 0)',
					backgroundColor: 'rgb(33, 179, 179, 1)'
				}
				if(tooltipItem.formattedValue == 0){
					color = {
						borderColor:'#fff',
						backgroundColor: '#fff)'
					}
				}
				return color;
			},
			labelTextColor: function(tooltipItem, chart) {
				if(tooltipItem.formattedValue == 0){
					return '#fff';
				}				
				return '#000';
			},
			title: function(tooltipItem, data) {
				return tooltipItem[0].label.replace(/,/gi,"");
			},
			label:function(tooltipItem, data) {
				if(tooltipItem.formattedValue == 0){
					return '';
				}		
				if(tooltipItem.label === 'GC (%)') {
					return tooltipItem.label + ' : ' +  tooltipItem.formattedValue
				}else if(tooltipItem.label === 'Q20/Q30 (%)'){
					let label = '';
					if(tooltipItem.datasetIndex === 0 ) label = 'Q20 (%)' 
					if(tooltipItem.datasetIndex === 1 ) label = 'Q30 (%)' 
					return  label + ' : ' +  tooltipItem.formattedValue
				}
				return tooltipItem.dataset.label +' : '+ tooltipItem.formattedValue
			},
			
		},
		mode: 'index',
		intersect: false,
        padding:18,
		titleMarginBottom:10,
		bodySpacing:5,
		backgroundColor:'#fff',
		borderColor: 'rgba(78,100,192,1)',
		borderWidth: 1,
		// shadowOffsetX: 0,
		// shadowOffsetY: 0,
		// shadowBlur: 15,
		// shadowColor: 'rgba(0, 0, 0, 0.3)',
		titleColor:'#212121',
		titleFont:{style: 'bold', size: 16},
		bodyFontColor:'#212121',
		bodyFont:{size: 14},
        //multiKeyBackground	:'#ff0000'
		
		
	}

	var barChart = new Chart(document.getElementById(opt.id),{
		type: 'bar',
		data: {
			labels:opt.label,
			datasets: datasets,
		},
		options: $.extend(true, {
			responsive: true,
			maintainAspectRatio: false,
			// legend: {
			// 	display:false,
			// 	align:'end',
			// 	position:'top',
			// 	labels:{fontSize:11,boxWidth:20},
			// },
			title: {display: false},
			elements: {
				line: {
					tension: 0
				}
			},
			// layout:{
			// 	padding: {
			// 		top: 0,
			// 		bottom:40
			// 	}
			// },
            borderRadius: 3,
            categoryPercentage: 0.07,
            barPercentage: 1.2,
            maxBarThickness: 12,
            barThickness: 12,
            minBarLength:12,
            // //그래프 y축 value값 표기 추가
            animation: {
				onComplete: function () {
					if(!opt.topvalue) return
					var chartInstance = this,
						ctx = chartInstance.ctx;
						ctx.font = "16px Arial";
						ctx.textAlign = 'center';
						ctx.fillStyle = "rgba(45, 67, 162, 1)";
						ctx.textBaseline = 'bottom';
					//this.options.animation.onComplete = null;
						
						ctx.save();
				        ctx.globalCompositeOperation='destination-over';
						//add bar chart topvalue(02_Result_per_Sample_Full_popup.html, rpt12RstPerSmp) 
						// Loop through each data in the datasets
						this.data.datasets.forEach(function (dataset, i) {
							var meta = barChart.getDatasetMeta(i);
							meta.data.forEach(function (bar, index) {
								var data = dataset.data[index];
								//ctx.fillText(data, bar.x, bar.y - 25);
								switch(i){
								case 0:
									ctx.fillText(data, bar.x -35, bar.y + 30);
									break;
								case 1:
									ctx.fillStyle="#008e8c";
									ctx.fillText(data, bar.x + 35, bar.y + 30);
									break;
									
								}
								
							});
					});
						ctx.restore();
				}
				
			},
			scales: {
                y:{ 
                    type:'linear', 
                    display: true, 
                    position: 'left', 
                    /*ticks:{ color : '#9e9e9e', stepSize: 20, font:{size:12} }, */
                    ticks:{ color : '#9e9e9e', font:{size:12} }, 
					min:0,
					/*max:100,*/
					
                    title:{ display:true, color: '#616161', align:'end'  },
                    grid:{ borderColor: 'rgba(246,249,253,0)', tickColor:'rgba(0,0,0,0)',borderDash: [1, 3], color:function(context) {
                        if (context.tick.value > 0) {
                          return '#b6b6b6';
                        } else if (context.tick.value < 0) {
                          return '#eee';
                        }
                    }},
                    
                },
                x:{ 
                   ticks:{ color : '#9e9e9e', font:{size:12}}, 
                   grid:{ display: false, },
                   title:{ display:true, color: '#616161', align:'end'  },
                  //   grid:{
                  //     tickColor:'#ddd',
                  //     color:'rgba(0,0,0,0)',
                  //     tickLength:8
                  //   }
                },
			},
			
            plugins: { 
                legend: {
                    display: false
                },
            	
                tooltip:opt.tooltips ? opt.tooltips : tooltipsSetting
                
            }
              
		}, opt.options)
	});
}


function barChart2(opt){

	var datasets = opt.data.map(function(chartData, i){
		return {
			// label: chartData.label,
			type:chartData.type,
			yAxisID:chartData.yAxisID,
			xAxisID:chartData.xAxisID,
			backgroundColor:chartData.bgColor,
			fill: false,
			data: chartData.data,
			label:chartData.label,
			borderWidth:0
		}
	});


	var tooltipsSetting={
		callbacks: {
			labelColor: function(tooltipItem, chart) {
				let color = tooltipItem.datasetIndex == 0 ? {
					borderColor:'rgba(0, 0, 0, 0)',
					backgroundColor: 'rgb(34, 58, 157, 1)'
				} : {
					borderColor:'rgba(0, 0, 0, 0)',
					backgroundColor: 'rgb(33, 179, 179, 1)'
				}
				return color;
			},
			labelTextColor: function(tooltipItem, chart) {
				return '#000';
			},
			title: function(tooltipItem, data) {
				return tooltipItem[0].label.replace(/,/gi,"");
			},
			
		},
		mode: 'index',
		intersect: false,
        padding:18,
		titleMarginBottom:10,
		bodySpacing:5,
		backgroundColor:'#fff',
		borderColor: 'rgba(78,100,192,1)',
		borderWidth: 1,
		// shadowOffsetX: 0,
		// shadowOffsetY: 0,
		// shadowBlur: 15,
		// shadowColor: 'rgba(0, 0, 0, 0.3)',
		titleColor:'#212121',
		titleFont:{style: 'bold', size: 16},
		bodyFontColor:'#212121',
		bodyFont:{size: 14},
        // multiKeyBackground	:'#ff0000'
		
	}

	var barChart = new Chart(document.getElementById(opt.id),{
		type: 'bar',
		data: {
			labels:opt.label,
			datasets: datasets,
		},
		options: $.extend(true, {
			responsive: false,
			maintainAspectRatio: false,
			// legend: {
			// 	display:false,
			// 	align:'end',
			// 	position:'top',
			// 	labels:{fontSize:11,boxWidth:20},
			// },
			title: {display: false},
			elements: {
				line: {
					tension: 0
				}
			},
			
			// layout:{
			// 	padding: {
			// 		top: 0,
			// 		bottom:40
			// 	}
			// },
            categoryPercentage: 1,
            barPercentage: 0.7,
            maxBarThickness: 34,
            minBarLength:34,
            barThickness: 34,   
			animation: {
				onComplete: function () {
					if(!opt.topvalue) return
					var chartInstance = this,
						ctx = chartInstance.ctx;
						ctx.font = "18px Arial";
						ctx.textAlign = 'center';
						ctx.fillStyle = "rgba(45, 67, 162, 1)";
						ctx.textBaseline = 'bottom';
						
						// Loop through each data in the datasets
						this.data.datasets.forEach(function (dataset, i) {
							var meta = barChart.getDatasetMeta(i);
							meta.data.forEach(function (bar, index) {
								var data = dataset.data[index];
								ctx.fillText(data, bar.x, bar.y - 5);
							});
					});
				}
				
			},
			scales: {
                y:{ 
                    type:'linear', 
                    display: true, 
                    position: 'left', 
                    ticks:{ color : '#9e9e9e', font:{size:12} }, 
                    title:{ display:true, color: '#616161', align:'end'  },
                    grid:{ borderColor: 'rgba(246,249,253,0)', tickColor:'rgba(0,0,0,0)',borderDash: [1, 3], color:function(context) {
                        if (context.tick.value > 0) {
                          return '#b6b6b6';
                        } else if (context.tick.value < 0) {
                          return '#eee';
                        }
                    }},
					stacked: true,
                },
                x:{ 
					stacked: true,
                   ticks:{ color : '#9e9e9e', stepSize: 10000, font:{size:12}}, 
                   grid:{ display: false, },
                   title:{ display:true, color: '#616161', align:'end'  },
                  //   grid:{
                  //     tickColor:'#ddd',
                  //     color:'rgba(0,0,0,0)',
                  //     tickLength:8
                  //   }
                },
			},
			/*hover: {mode: null},*/
			
            plugins: { 
                legend: {
                    display: false
                }, 
                // tooltip:opt.tooltips ? opt.tooltips : tooltipsSetting
				tooltip:{
					enabled:false
				},
            }                 
		}, opt.options)
	});
}
