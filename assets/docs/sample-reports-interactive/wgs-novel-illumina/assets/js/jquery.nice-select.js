/*  jQuery Nice Select - v1.1.0
    https://github.com/hernansartorio/jquery-nice-select
    Made by Hernán Sartorio  */
var usePrevSelected;

    (function($) {

      $.fn.niceSelect = function(method) {
        
        // Methods
        if (typeof method == 'string') {      
          if (method == 'update') {
            this.each(function() {
              var $select = $(this);
              var $dropdown = $(this).next('.nice-select');
              var open = $dropdown.hasClass('open');
          var $dropdownNum = $dropdown.data('num');
          var $dropdownList= $('.selectList[data-num='+$dropdownNum+']');
        
              
              if ($dropdown.length) {
                $dropdown.remove();
                $dropdownList.remove();
                create_nice_select($select, $dropdownNum.split('_num')[1]);
                
                if (open) {
                  $select.next().trigger('click');
                }
              }
            });
          } else if (method == 'destroy') {
            this.each(function() {
              var $select = $(this);
              var $dropdown = $(this).next('.nice-select');
          var $dropdownNum = $dropdown.data('num');
          var $dropdownList= $('.selectList[data-num='+$dropdownNum+']');
    
              if ($dropdown.length) {
                $dropdown.remove();
                $dropdownList.remove();
                $select.css('display', '');
              }
            });
            if ($('.nice-select').length == 0) {
              $(document).off('.nice_select');
            }
          } else {
            console.log('Method "' + method + '" does not exist.')
          }
          return this;
        }
          
        // Hide native select
        this.hide();
        var lastNum =0;
        if($('.selectList').length > 0) {
          var lastNum = Number($('.selectList').eq($('.selectList').length -1).attr('data-num').split('_num')[1])
        }
        // Create custom markup
        this.each(function(i) {
          var $select = $(this);
          
          if (!$select.next().hasClass('nice-select')) {
            create_nice_select($select, i + lastNum);
          }
        });
        
        function create_nice_select($select, i) {
        var $selectId = $select.attr('id');
        var $selectName = $select.attr('name');
        var $selectClass = $select.attr('class');
        var $selectDisabled = $select.attr('disabled');
        var $isDisplay = String($select.attr('style')).indexOf('display') ? String($select.attr('style')).split('display')[0] : ''; 
    
          $select.after($('<div></div>')
            .addClass('nice-select')
            .attr('data-num', 'select_num'+i)
            .attr('data-id', $selectId ||  '')
            .attr('data-name', $selectName ||  '')
            .addClass($selectClass || '')
            .addClass($selectDisabled ? 'disabled' : '')
        .attr('style', $isDisplay)
            .attr('tabindex', $select.attr('disabled') ? null : '0')
            .html('<span class="current"></span>')
          );
    
        $('body').append($('<ul class="selectList" data-num="select_num'+i+'" style="position:absolute;"></ul>')
            .attr('data-id', $selectId ||  '')
            .attr('data-name', $selectName ||  '')
            .addClass($selectClass || '')
            .addClass($selectDisabled ? 'disabled' : '')
        .attr('style', $isDisplay)
        .css({width:''})
        );
        
          var $dropdown = $select.next();
          var $dropdownList = $('.selectList[data-num="select_num'+i+'"]');
          var $options = $select.find('option');
          var $selected = $select.find('option:selected');
           
        var selectedHtml =function(opt){
          var color = opt.data('circle')  ;
          if(!color) return opt.text()
          else return '<div class="case-circle-wrap"><i class="case-circle '+color+'"></i></div>' + opt.text()
        }
    
        var posTop = $dropdown.offset().top + $dropdown.outerHeight() -1;
        var posLeft = $dropdown.offset().left +1;
    
        $dropdown.find('.current').html($selected.data('display') || selectedHtml($selected));
        if($selected.data('display')) $dropdown.find('.current').addClass('placeholder')
        $dropdownList.css({top:posTop,left:posLeft, 'min-width':$dropdown.outerWidth()-2})
    
    
        $options.each(function(i) {
        var $option = $(this);
        var display = $option.data('display');
    
        $dropdownList.append($('<li></li>')
          .attr('data-value', $option.val())
          //.attr('data-display', (display || null))
          .addClass('option' +
          ($option.is(':selected') ? ' selected' : '') +
          ($option.is(':disabled') ? ' disabled' : ''))
          .html(selectedHtml($option))
        );
        });
    
    
        }
        
        /* Event listeners */
        
        // Unbind existing events in case that the plugin has been initialized before
        $(document).off('.nice_select');
        
        // Open/close
        $(document).on('click.nice_select', '.nice-select', function(event) {
        var $dropdown = $(this);
        var $dropdownNum = $dropdown.data('num');
        var $dropdownList= $('.selectList[data-num='+$dropdownNum+']');

        var posTop = $dropdown.offset().top + $dropdown.outerHeight() -1;
        var posLeft = $dropdown.offset().left +1;
    
          $('.nice-select').not($dropdown).removeClass('open');
          $('.selectList[data-num]').not($dropdownList).removeClass('open');;

            setTimeout(function(){
              $dropdown.toggleClass('open'); 
              $dropdownList.toggleClass('open'); 
              $dropdownList.css({top:posTop,left:posLeft, 'min-width':$dropdown.outerWidth()-2})              
            }, 100)
    
        });

        // Close when clicking outside
        $(document).on('click.nice_select', function(event) {
          if ($(event.target).closest('.nice-select').length === 0) {
            //$('.nice-select').removeClass('open').find('.option');  
            $('.nice-select').removeClass('open');
            $('.selectList[data-num]').removeClass('open');;            
          }
        });
        
        

        // Option click
        $(document).on('click.selectList', '.selectList .option:not(.disabled)', function(event) {
          var $option = $(this);
          var $dropdownList = $(this).parents('.selectList');
          var $dropdownNum=  $dropdownList.data('num');
          var $dropdown=  $('.nice-select[data-num='+$dropdownNum+']');
          
          var t1 = $dropdownList.find('.selected').data('value');
          usePrevSelected = t1;
          $dropdownList.find('.selected').removeClass('selected');
          
          $option.addClass('selected');
          
          
          var text = $option.data('display') || $option.html();
          $dropdown.find('.current').html(text).removeClass('placeholder');
          
          $dropdown.prev('select').val($option.data('value')).trigger('change');
          
          
          //alert("t1:::!@#!@#!"+t1);
        
        });
    
        return this;
    
      };
    
    }(jQuery));
    
    /*
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", function () {
        var select = document.querySelectorAll('select');
        for (var j=0;j<select.length;j++){
          for (var i=0;i<100;i++){
            select[j].insertAdjacentHTML('beforeend', '<option value="">렉스턴</option>');
          }
        }
      }, false);
    }
    */
    
    
    $(function(){
    
      niceSelectHeight();
    
      function niceSelectHeight(){
        function  documentHeight(){
          var body = document.body,
            html = document.documentElement;
          return Math.max(body.scrollHeight, body.offsetHeight, 
                  html.clientHeight, html.scrollHeight, html.offsetHeight );
        }
    
        function offset(el) {
          var rect = el.getBoundingClientRect(),
          scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
          scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
        }
    
        function setHeight(){
        var niceSelect = document.querySelectorAll('.nice-select');
    
          //niceSelect.forEach(function(niceSelect, i) {
            for (var i=0;i<niceSelect.length;i++){
                var dropdownNum = niceSelect[i].getAttribute('data-num');
              //var layerList = document.querySelector('.selectList[data-num='+dropdownNum+']');
              var layerList = $('.selectList[data-num='+dropdownNum+']');
              var posTop  = offset(niceSelect[i]);
              //var docH = documentHeight();
              var docH = window.innerHeight;
              var listH = docH - (posTop.top + 50);
    
              //layerList.style.maxHeight = listH+'px';
              layerList.css('z-index', 60-i);
              layerList.css('max-height', listH+'px');
            }
          //});
        }
    
        setHeight();
    
        window.onresize = function(event) {
           setHeight();
        };
      }
    });