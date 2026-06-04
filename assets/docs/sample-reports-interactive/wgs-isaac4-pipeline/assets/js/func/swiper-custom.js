 var swiper = new Swiper(".chart-swiper-tab1", {
                    draggable:false,
                    allowTouchMove:false,
                    /*add*/
                    observer: true,
                    observeParents: true,
                    /*----*/
                    pagination: {
                        el: ".swiper-pagination",                        
                        clickable: true,
                    },
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                });


                function tab2(){
                  setTimeout(function(){
                   var swiper2 = new Swiper(".chart-swiper-tab2", {
                        draggable:false,
                        allowTouchMove:false,
                        /*add*/
                        observer: true,
                        observeParents: true,
                        /*----*/
                        pagination: {
                            el: ".swiper-pagination",
                            clickable: true,
                        },
                        navigation: {
                            nextEl: ".swiper-button-next",
                            prevEl: ".swiper-button-prev",
                        },
                    });
                  },100)
                }