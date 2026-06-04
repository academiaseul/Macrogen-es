function underTitleDescObjectStyle(obj, childrenObj){
	var html="";
	html+="<li class='text-type1 c-blue "+obj.style+"'>"+childrenObj.value+"</li>";
	return html;
}

function contentsDescObjectStyle2(obj){
	var html="";
	if(obj.title != undefined || obj.title != ""){
		html+='<h2 class="title-type3">'+obj.title+'</h2>';
	}
	if(obj.children != undefined){
		obj.children.forEach((child) => html+="<li class='text-type1 "+obj.style+"'>"+child.value+"</li>");
	}
	// html+='<h2 class="title-type3">'+obj.title+'</h2>';
	// for(var descchildren in obj.children){
	// 	html+="<li class='text-type1 "+obj.style+"'>"+obj.children[descchildren].value+"</li>";
	// }
	return html;
}
function contentsDescObjectStyle1(obj){
	var html="";
	if(obj.title != undefined || obj.title != ""){
		html+='<h2 class="title-type3">'+obj.title+'</h2>';
	}
	if(obj.children != undefined){
		obj.children.forEach((child) => html+="<li class= '"+obj.style+" text-type1'>"+child.value+"</li>");
	}
	// html+='<h2 class="title-type3">'+obj.title+'</h2>';
	// for(var descchildren in obj.children){
	// 	//2022.02.07 style add text-type1
	// 	/*html+="<li class='"+obj.style+"'>"+obj.children[descchildren].value+"</li>";*/
	// 	html+="<li class= '"+obj.style+" text-type1'>"+obj.children[descchildren].value+"</li>";
	// }
	return html;	
}

function imgObjectStyle1(obj){
	var html="";
	html+='<div class="data-img-box img-type">';
	html+='<img src="../files/'+obj.path+'">';
	html+='</div>';
	return html;
}

function tabsObject(obj,tabsObj ){
	var html="";
	for(var tabscnt in tabsObj){
		switch(tabscnt){
			case "0" :html+='<li class="on"><a href="#'+tabsObj[tabscnt]+'">'+obj[tabsObj[tabscnt]].tabName+'</a></li>';
			break;
			
			default : html+='<li><a href="#'+tabsObj[tabscnt]+'">'+obj[tabsObj[tabscnt]].tabName+'</a></li>';
			break;
		}
		}
	return html;
	
}

function tabPanelObj(tabCnt, tabObj, obj){
	var html="";
	if(tabCnt==0){
    	html+="<div class='tab-panel' data-id='"+tabObj[tabCnt]+"'>";
    }else{
    	html+="<div class='tab-panel' data-id='"+tabObj[tabCnt]+"' style='display: none;'>";
    		
    }
	html+="<h2 class='title-type2'>"+obj[tabObj[tabCnt]].title+"</h2>";

		for(var contentsLen in obj[tabObj[tabCnt]].contents){			
			switch(obj[tabObj[tabCnt]].contents[contentsLen].type){
			case "img":
				html+='<h2 class="title-type3">'+obj[tabObj[tabCnt]].contents[contentsLen].title+'</h2>';
				html+=imgObjectStyle1(obj[tabObj[tabCnt]].contents[contentsLen]);
				break;
			
			case "link":
				//link재정리확인필요
				html+='<div class="refer-path">';
		     		html+='<strong>'+obj[tabObj[tabCnt]].contents[contentsLen].title+'</strong>';
		     		
		     		 if(obj[tabObj[tabCnt]].contents[contentsLen].linkActivation){
						 html+='<span class="path" target="_black">';
				     	 html+='<a href="'+obj[tabObj[tabCnt]].contents[contentsLen].path+'" target="_blank" class="link-txt">'+obj[tabObj[tabCnt]].contents[contentsLen].path+'</a>';
					 }else{
						 html+='<span class="path">';
					     html+='<a href="#" class="link-txt">'+obj[tabObj[tabCnt]].contents[contentsLen].path+'</a>';
					 }
		     		 
		     		html+='<div class="right">';
			     	switch(obj[tabObj[tabCnt]].contents[contentsLen].icon){
			     	case "newopen":
				     	html+='<span class="btn-newopen"><i class="ico i-'+obj[tabObj[tabCnt]].contents[contentsLen].icon+'"></i></span>';
					/*html+='</div>';*/
					    
					break;
					
			     	default:
			     		html+='<i class="ico i-'+obj[tabObj[tabCnt]].contents[contentsLen].icon+'"></i>&nbsp;'+obj[tabObj[tabCnt]].contents[contentsLen].friendlyName;
			     		break;
			     	
			     	}
			     	
			     	html+='</div>';
		     		 
		     		 
		     		html+='</span>';
		     		 
		     	html+='</div>';
				
				break;
				
			case "table":
				
				var tbId="tb_"+tabCnt+"_"+contentsLen;
				let headerTitleStr = obj[tabObj[tabCnt]].contents[contentsLen].title;
				let lowerHeaderTitle = headerTitleStr.replace(/ /g,"").toLowerCase();
				
				html+='<div class="dataset-table2">';
				html+='<h2 class="title-type3">'+headerTitleStr+'</h2>';
				
				//desc추가
				let descKeyStr = "";
				let descValStr = "";
				for(var descLen in obj[tabObj[tabCnt]].contents[contentsLen].desc){
					if(obj[tabObj[tabCnt]].contents[contentsLen].desc[descLen].type =="desc"){
						
						html+=	'<p class="text-type1">';
						for(var ch in obj[tabObj[tabCnt]].contents[contentsLen].desc[descLen].children){
							descKeyStr = obj[tabObj[tabCnt]].contents[contentsLen].desc[descLen].children[ch].key;
							descValStr = obj[tabObj[tabCnt]].contents[contentsLen].desc[descLen].children[ch].value;
							//if(descKeyStr){
								//html+='<h2 class="title-type3">'+descKeyStr+'</h2>';
							//}
							if(descValStr){
								if(descKeyStr){
									html+=	descKeyStr+' : '+descValStr+'<br>';
								}else{
									html+=	descValStr+'<br>';
								}
							}
							
						}
						html+= '</p>';
						
					}
					
				}
				html+= '<br>';
				
				
				
				html+='<table id="tb_'+tabCnt+"_"+contentsLen+'">';  
				html+='<thead>';
					html+='<tr>';
						
						
						
						for(var headerCnt in obj[tabObj[tabCnt]].contents[contentsLen].header){
							
							if( Number(headerCnt) === 0 ){
								html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>';
							}else {
								html+='<th style="width: auto;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; 
							}

							
//							switch( lowerHeaderTitle ){
//								
//								case "phredscores":{
//									switch( Number(headerCnt) ){
//										case 0: { html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//										default:{ html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//									}
//								}; break;
//								case "q-scorebinning":{
//									switch( Number(headerCnt) ){
//										case 0: { html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//										default:{ html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//									}
//								}; break;
//							
//								case "headerline":{
//									switch( Number(headerCnt) ){
//										case 0: { 
//											html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; 
//										}; break;
//										case 1: { 
//											html+='<th style="width: auto;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; 
//										}; break;
//									}
//								}; break;
//								case "samfile:alignmentssectionmandatoryfields":{
//									switch( Number(headerCnt) ){
//										case 0: { html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//										default:{ html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//									}
//								}; break;
//								
//								case "filtertag":{
//									switch( Number(headerCnt) ){
//										case 0: { html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//										case 1: { html+='<th style="width: auto;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//									}
//								}; break;
//								case "infotag":{
//									switch( Number(headerCnt) ){
//										case 0: { html+='<th style="width: 20%;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//										case 1: { html+='<th style="width: auto;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>'; }; break;
//									}
//								}; break;
//
//								default:{
//									html+='<th style="width: auto;">'+obj[tabObj[tabCnt]].contents[contentsLen].header[headerCnt]+'</th>';
//								}; break;
//							}
							
							

						}
						
				    html+='</tr>';
				html+='</thead>';
				html+='<tbody>';
				for(var dataCnt in obj[tabObj[tabCnt]].contents[contentsLen].data){
					html+='<tr>';
						for(var cnt in obj[tabObj[tabCnt]].contents[contentsLen].data[dataCnt]){
							if(cnt == 0){
								html+='<td class="tit c-blue" style="word-break: keep-all;">'+obj[tabObj[tabCnt]].contents[contentsLen].data[dataCnt][cnt]+'</td>';
							}else{
								html+='<td>'+obj[tabObj[tabCnt]].contents[contentsLen].data[dataCnt][cnt]+'</td>';
							}
						}
						
					html+='</tr>';
				}
			    html+='</tbody>';
			    html+='</table>';
			    html+='</div>';
			    
			    for(var legendLen in obj[tabObj[tabCnt]].contents[contentsLen].legend){
			    	if(obj[tabObj[tabCnt]].contents[contentsLen].legend[legendLen].type == "desc"){
			    		for(var ch in obj[tabObj[tabCnt]].contents[contentsLen].legend[legendLen].children){
			    			 html+='<p class="text-star"><spna class="star">*</spna>'; 
			 			    html+='<span class="c-blue">'+obj[tabObj[tabCnt]].contents[contentsLen].legend[legendLen].children[ch].key+'</span> '+obj[tabObj[tabCnt]].contents[contentsLen].legend[legendLen].children[ch].value+'<br></p>';
			 	            
			    		}
			    	}
			    }
		        $("#tb_"+tabCnt+"_"+contentsLen).DataTable({
			            "info":false,"ordering": false,"searching": false,"lengthChange": false, "paging":   false,
			        });

				
				break;
			case "table-custom":
				tableCustomObjDatatables(obj[tabObj[tabCnt]], contentsLen, contentsLen);
				break;
			case "desc":
				html+=contentsDescObjectStyle1(obj[tabObj[tabCnt]].contents[contentsLen]);
				break;
			
			
			}
		}
		html+="</div>";
	document.write(html);
	
}



function tableObjDatatables(obj, contentsLen, idx){
	tableObjDatatablesCmm(obj, contentsLen, idx);
}


/*datatables test::: table-custom*/
function tableCustomObjDatatables(obj, contentsLen, idx){

	tableObjDatatablesCmm(obj, contentsLen, idx);
	 for(var cnt in  obj.contents[contentsLen].styleSheet.dataStyles){
     	
     	var index = obj.contents[contentsLen].styleSheet.dataStyles[cnt].index;
		var customStyle = obj.contents[contentsLen].styleSheet.dataStyles[cnt].columnStyle;
		$("#tb_"+idx).find('td:nth-child('+(index+1)+')').attr('style',customStyle);
     }
 
	 
}

function tableObjDatatablesCmm(obj, contentsLen, idx){
	var html="";

	if(obj.contents[contentsLen].header.length >10){
	html+='<div class="dataset-table scroll-x-box scroll-x-style">';
		 html+='<table id="tb_'+idx+'" class="hover row-border" style="width: 1800px;" >';
	}else{
	html+='<div class="dataset-table">';
		 html+='<table id="tb_'+idx+'" class="hover row-border">';
	}
		 
			 html+='<thead>';
			 html+='<tr>';
			 
			 	 for(var headerLen in obj.contents[contentsLen].header){
			 		
			 		if(headerLen != (obj.contents[contentsLen].header.length-1)){
			 			if(obj.contents[contentsLen].header.length>8){
			 				html+='<th style="width: auto;" class="stxt">'+obj.contents[contentsLen].header[headerLen]+'</th>';
			 			}else{
			 				// html+='<th style="width: 10%;">'+obj.contents[contentsLen].header[headerLen]+'</th>';
							if(obj.contents[contentsLen].header[headerLen] == "No."){
								html+='<th style="width: 3%;">'+obj.contents[contentsLen].header[headerLen]+'</th>';
							}
							else{
								html+='<th style="width: 10%;">'+obj.contents[contentsLen].header[headerLen]+'</th>';
							}	
			 			}
			 		}else{
			 			if(obj.contents[contentsLen].header.length>8){
				 			html+='<th style="width: auto;" class="stxt">'+obj.contents[contentsLen].header[headerLen];
			 			}else{
			 				html+='<th style="width: 10%;">'+obj.contents[contentsLen].header[headerLen];
			 			}
			 			
			 				//2022.04.18 tooltip length 조건 추가
			 				if(obj.contents[contentsLen].tooltip.length>0){
				 			html+='<div class="tooltip-wrap">';
							 html+='<button class="tooltip"><i class="ico i-tooltip-more"></i></button>';
								 html+='<div class="tooltip-layer" style="width:540px;">';
									 html+='<ul class="list-type1">';
									 	
									 	for(var tootipLen in obj.contents[contentsLen].tooltip){
									 		for(var ch in obj.contents[contentsLen].tooltip[tootipLen].children){
									 			
									 			if((obj.contents[contentsLen].tooltip[tootipLen]).hasOwnProperty('styleSheet')){
										 			html+='<li class="'+obj.contents[contentsLen].tooltip[tootipLen].style+'"><b class="c-blue" style="'+obj.contents[contentsLen].tooltip[tootipLen].styleSheet.keyStyle+'">'+obj.contents[contentsLen].tooltip[tootipLen].children[ch].key+'</b> : <span style="'+obj.contents[contentsLen].tooltip[tootipLen].styleSheet.valueStyle+'">'+obj.contents[contentsLen].tooltip[tootipLen].children[ch].value+'</span></li>';

									 			}else{
										 			html+='<li class="'+obj.contents[contentsLen].tooltip[tootipLen].style+'"><b class="c-blue">'+obj.contents[contentsLen].tooltip[tootipLen].children[ch].key+'</b> : '+obj.contents[contentsLen].tooltip[tootipLen].children[ch].value+'</li>';

									 			}
									 		}
									 	}
										
									 html+='</ul>';
								 html+='</div>';
							 html+='</div>';
			 				}
							 
					 html+='</th>';
					 
			 					
			 		}
			 		 
			 	 }
			 		 
			 html+='</tr>';
			 html+='</thead>';
		 html+='<tbody>';
		 html+='</tbody>';
		 html+='</table>';
	html+='</div>';

	document.write(html);

	var tbIdSelector="tb_"+idx;
			var statisticsTbl = $("#"+tbIdSelector).DataTable({
				"info":false,"ordering": false,"searching": false,"lengthChange": true,
	           "lengthMenu": [[10, 30, 50, -1], ['10', '30', '50', 'All']],
	           /*"bPaginate": false*/
				//"lengthMenu": [[10, 30, 50, -1], [10, 30, 50, "All"]],
				/*"data": obj.contents[contentsLen].data*/
				"data": obj.contents[contentsLen].data
				
			});
			// ['10 sample per page', '30 sample per page', '50 sample per page', "All Samples"]
			// ['Show 10 entries', 'Show 30 entries', 'Show 50 entries', "All entries"]
			
			
	
			
		
			
	var descHtml ="";
	for(var descLen in obj.contents[contentsLen].desc){
		for(var ch in obj.contents[contentsLen].desc[descLen].children){
			descHtml+='<div class="line-box">';
			descHtml+='<ul class="list-type2">';
				descHtml+='<li class="'+obj.contents[contentsLen].desc[descLen].style+'">';
				descHtml+=obj.contents[contentsLen].desc[descLen].children[ch].value;
				descHtml+='</li>';
	     	descHtml+='</ul>';
			descHtml+='</div>';
		}
		
	}
	document.write(descHtml);
	
}






function tableObjNomalDatatables(obj, idx){

	 var html="";
	
	 
	 var contentsLen= idx;
	 if(obj.contents[contentsLen].header.length >10){
	 html+='<div class="dataset-table scroll-x-box scroll-x-style">';
		 html+='<table id="tb_'+idx+'" class="hover row-border" style="width: 1800px;" >';
	 }else{
	html+='<div class="dataset-table">';
		 html+='<table id="tb_'+idx+'" class="hover row-border">';
	 }
		 
			 html+='<thead>';
			 html+='<tr>';
			 
			 //04_Deliverables_02_Analysis_Result.html, rpt40DeliverAnalysisRst로 인해 임시 주석
			 //for(var contentsLen in obj.contents){
			 	 for(var headerLen in obj.contents[contentsLen].header){
			 		if(headerLen != (obj.contents[contentsLen].header.length-1)){
			 			if(obj.contents[contentsLen].header.length>10){
			 			html+='<th style="width: auto;" class="stxt">'+obj.contents[contentsLen].header[headerLen]+'</th>';
			 			}else{
			 			html+='<th style="width: auto;">'+obj.contents[contentsLen].header[headerLen]+'</th>';
			 			}
			 		}else{
			 			if(obj.contents[contentsLen].header.length>10){
				 		html+='<th style="width: 10%;" class="stxt">'+obj.contents[contentsLen].header[headerLen];

			 			}else{
			 			html+='<th style="width: auto;">'+obj.contents[contentsLen].header[headerLen];
			 			}
			 			
			 				//tooltip 유무 체크
			 			 	if((obj.contents[contentsLen].tooltip).length>0){
				 			html+='<div class="tooltip-wrap">';
							 html+='<button class="tooltip"><i class="ico i-tooltip-more"></i></button>';
								 html+='<div class="tooltip-layer" style="width:540px;">';
									 html+='<ul class="list-type1">';
									 	
									 	for(var tootipLen in obj.contents[contentsLen].tooltip){
									 		for(var ch in obj.contents[contentsLen].tooltip[tootipLen].children){
									 			html+='<li class="'+obj.contents[contentsLen].tooltip[tootipLen].style+'"><b class="c-blue">'+obj.contents[contentsLen].tooltip[tootipLen].children[ch].key+'</b> : '+obj.contents[contentsLen].tooltip[tootipLen].children[ch].value+'</li>';
									 		}
									 	}

									 html+='</ul>';
								 html+='</div>';
							 html+='</div>';
			 			 	}							 
					 html+='</th>';
					 
			 					
			 		}
			 		 
			 	 }
			 //}

				
					 
			 html+='</tr>';
			 html+='</thead>';
		 html+='<tbody>';
		             
		 html+='</tbody>';
		 html+='</table>';
	 html+='</div>';
	 
	 document.write(html);
	
	 var test1 = obj.contents[idx].data[0];
	 var tbIdSelector="tb_"+idx;
	 		var statisticsTbl = $("#"+tbIdSelector).DataTable({
				"info":false,"ordering": false,"searching": false,"lengthChange": true,
	            "lengthMenu": [[10, 30, 50, -1], ['10', '30', '50', 'All']],
	            /*"bPaginate": false*/
				//"lengthMenu": [[10, 30, 50, -1], [10, 30, 50, "All"]],
				/*"data": obj.contents[contentsLen].data*/
				"data": obj.contents[idx].data
	 		
	 		});
	 // ['Show 10 entries', 'Show 30 entries', 'Show 50 entries', "All entries"] ['10 sample per page', '30 sample per page', '50 sample per page', "All Samples"]
}
//2022.03.16 after

function tableObjStyleDatatables(obj, idx, tabObj){
	
	
	 var html="";
	 html+='<h2 class="title-type2" id="'+tabObj[idx]+'">'+obj.title+'</h2>';
	 html+='<h3 class="title-type3">'+obj.subTitle+'</h3>';

	 
	 for(var contentsLen in obj.contents){
		 if(obj.contents[contentsLen].type == "table" || obj.contents[contentsLen].type == "table-img"){
			 
		 if(contentsLen!=0){
			 html="";
		 }
		 html+='<h3 class="title-type3">'+obj.contents[contentsLen].title+'</h3>';
		 html+='<div class="dataset-table">';
		 html+='<table id='+tabObj[idx]+'_'+idx+"_"+contentsLen+' class="hover row-border">';
		 
		 html+='<thead>';
		 html+='<tr>';

		 for(var headerLen in obj.contents[contentsLen].header){
			 		
			 		if(headerLen != (obj.contents[contentsLen].header.length-1)){
//			 			if(obj.contents[contentsLen].header.length>10){
//			 				html+='<th style="width: auto;" class="stxt">'+obj.contents[contentsLen].header[headerLen]+'</th>';
//			 			}else{
//			 				html+='<th style="width: auto;">'+obj.contents[contentsLen].header[headerLen]+'</th>';
//			 			}
			 			html+='<th>'+obj.contents[contentsLen].header[headerLen]+'</th>';
			 		}else{
//			 			if(obj.contents[contentsLen].header.length>10){
//			 				html+='<th style="width: auto;" class="stxt">'+obj.contents[contentsLen].header[headerLen];
//
//			 			}else{
//			 				html+='<th style="width: auto;">'+obj.contents[contentsLen].header[headerLen];
//			 			}
			 			html+='<th>'+obj.contents[contentsLen].header[headerLen];
			 			
				 			html+='<div class="tooltip-wrap">';
							 html+='<button class="tooltip"><i class="ico i-tooltip-more"></i></button>';
								 html+='<div class="tooltip-layer" style="width:540px;">';
									 html+='<ul class="list-type1">';
									 	
									 	for(var tootipLen in obj.contents[contentsLen].tooltip){
									 		for(var ch in obj.contents[contentsLen].tooltip[tootipLen].children){
									 			if((obj.contents[contentsLen].tooltip[tootipLen]).hasOwnProperty('styleSheet')){
										 			html+='<li class="'+obj.contents[contentsLen].tooltip[tootipLen].style+'"><b class="c-blue" style="'+obj.contents[contentsLen].tooltip[tootipLen].styleSheet.keyStyle+'">'+obj.contents[contentsLen].tooltip[tootipLen].children[ch].key+'</b> : <span style="'+obj.contents[contentsLen].tooltip[tootipLen].styleSheet.valueStyle+'">'+obj.contents[contentsLen].tooltip[tootipLen].children[ch].value+'</span></li>';

									 			}else{
									 				html+='<li class="'+obj.contents[contentsLen].tooltip[tootipLen].style+'"><b class="c-blue">'+obj.contents[contentsLen].tooltip[tootipLen].children[ch].key+'</b> : '+obj.contents[contentsLen].tooltip[tootipLen].children[ch].value+'</li>';
									 			}
									 		}
									 	}
										
									 html+='</ul>';
								 html+='</div>';
							 html+='</div>';
					 html+='</th>';
					 
			 					
			 		}
			 		 
			 	 }
	 	html+='</tr>';
		html+='</thead>';
		
		
		 html+='<tbody>';
		 	var listTotalData = new Array();
		 	for(var dataLen in obj.contents[contentsLen].data){
		 		var tbHtml="";
		 		var totalData = new Array();
		 		for(var cnt in obj.contents[contentsLen].data[dataLen]){
		 			switch(cnt){
		 			case "0": 
		 				tbHtml+='<td class="align-l c-darkgray"><b>'+obj.contents[contentsLen].data[dataLen][cnt]+'</b></td>';
		 				
		 				totalData.push(obj.contents[contentsLen].data[dataLen][cnt]);
		 				break;
		 				
		 			
		 			default :
		 				if(typeof(obj.contents[contentsLen].data[dataLen][cnt]) !== "object"){
		 					tbHtml+='<td>'+obj.contents[contentsLen].data[dataLen][cnt]+'</td>';
		 					totalData.push(obj.contents[contentsLen].data[dataLen][cnt]);
		 				}else{
		 					tbHtml+='<td>';
		 					var imgPath="";
		 	                for(var columcnt in obj.contents[contentsLen].data[dataLen][cnt]){
		 	                	switch(columcnt){
		 	                	case "0":
		 	                		
		 	                		tbHtml+='<dit class="tag-read blue"><a href="../files/'+obj.contents[contentsLen].data[dataLen][cnt][columcnt]+'" target="_blank"><span class="txt">Read</span><span class="num">1</span></a></dit>';
		 	                		imgPath+='<dit class="tag-read blue"><a href="../files/'+obj.contents[contentsLen].data[dataLen][cnt][columcnt]+'" target="_blank"><span class="txt">Read</span><span class="num">1</span></a></dit>';
		 	                		 	 	                		
		 	                		break;
		 	                	case "1":
		 	                		
		 	                		tbHtml+='<dit class="tag-read green"><a href="../files/'+obj.contents[contentsLen].data[dataLen][cnt][columcnt]+'" target="_blank"><span class="txt">Read</span><span class="num">2</span></a></dit>';
		 	                		imgPath+='<dit class="tag-read green"><a href="../files/'+obj.contents[contentsLen].data[dataLen][cnt][columcnt]+'" target="_blank"><span class="txt">Read</span><span class="num">2</span></a></dit>';
		 	                		 	 	                		
		 	                		break;
		 	                		
		 	                	}
		 	                }
		 	                totalData.push(imgPath);
		 	                tbHtml+='</td>';
		 				}
		 				break;
		 				
		 			}
		 		}
		 		
		 		listTotalData.push(totalData);
		 	}
		
		             
		 html+='</tbody>';
		 html+='</table>';
	html+='</div>';

	document.write(html);
	
	

			var tbIdSelector=tabObj[idx]+"_"+idx+"_"+contentsLen;
			var statisticsTbl = $("#"+tbIdSelector).DataTable({
				"info":false,"ordering": false,"searching": false,"lengthChange": true,
	         "lengthMenu": [[10, 30, 50, -1], ['10', '30', '50', 'All']],
	         /*"bPaginate": false*/
				//"lengthMenu": [[10, 30, 50, -1], [10, 30, 50, "All"]],
				/*"data": obj.contents[contentsLen].data*/
				"data": listTotalData
			});
			
	
			
	 }if(obj.contents[contentsLen].type == "button"){
		 var btn_wrap = ""
		 btn_wrap+='<div class="btn-wrap" style="margin-bottom:300px;">';
		 btn_wrap+='<a href="../files/'+obj.contents[contentsLen].path+'" class="btn-type1 st1"><i class="ico i-down-off"><span class="circle">A</span></i>'+obj.contents[contentsLen].value+'</a>';
		 btn_wrap+='</div>';
		 
		 document.write(btn_wrap);			 
		 
	 }
		
			
			switch(obj.contents[contentsLen].type){
			case "table-custom":
				 for(var cnt in  obj.contents[contentsLen].styleSheet.dataStyles){
				     	
				     	var index = obj.contents[contentsLen].styleSheet.dataStyles[cnt].index;
								var customStyle = obj.contents[contentsLen].styleSheet.dataStyles[cnt].columnStyle;
								$("#"+tbIdSelector).find('td:nth-child('+(index+1)+')').attr('style',customStyle);
				     }
				 
				break;
			}
			
		}
		
	}

//c692eb8cce75a57a8703cf45c4b095d1b80a509a4bb3e454268b8db7cc54903e
