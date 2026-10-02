/*!
 * chartjs-plugin-style v0.5.0
 * https://nagix.github.io/chartjs-plugin-style
 * (c) 2019 Akihiko Kusanagi
 * Released under the MIT license
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js')) :
    typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
    (global = global || self, global.ChartStyle = factory(global.Chart));
    }(this, function (Chart) { 'use strict';
    
    Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;
    Chart.register({
        id: 'chart',	
        beforeDraw: function(chart) {
			const chartContext = chart.ctx;
			if(chart.config._config.options.makingTicks){
				const hoursAxis = chart.scales['x'];
				if (hoursAxis !== undefined) {
					const bottomY = chart.scales['x'].bottom;
		
					// hoursAxis.options.gridLines.display = false;
					hoursAxis.ticks.forEach(function (label, index) {
						const xPosition = hoursAxis.getPixelForTick(index);
						chartContext.save();
						chartContext.beginPath();
						if (label.label !== '') {
							chartContext.moveTo(xPosition, chart.chartArea.bottom);
							chartContext.lineTo(xPosition, chart.chartArea.bottom + 5);
							chartContext.strokeStyle = 'rgba(02, 42, 83, 0.5)';
						}
		
						chartContext.lineWidth = 1;
						chartContext.stroke();
						chartContext.restore();
					});
				}
			}

            if(chart.config._config.options.rightBorder){
                var chartArea = chart.chartArea;
    
                chartContext.beginPath();
                chartContext.moveTo(chartArea.right, chartArea.bottom);
                chartContext.lineTo(chartArea.right, chartArea.top);
                chartContext.strokeStyle = chart.config._config.options.rightBorder;
    
                chartContext.lineWidth = 1;
                chartContext.stroke();
                chartContext.restore();
            }
          },
    });
}));
    