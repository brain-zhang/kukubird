//用于 图片预加载的实现
//memoryboxes@163.com
//2012-04-01

//接受地址列表，预加载图片
(function(){
    //memorybox命名空间
    if(!window.preloadimage){
        window['preloadimage'] = {};
    }
    var urllist_queue = new Array();
    var pre_load_img_num = 0;
    var curr_page_no = -1;
    var b_auto_turn_page = false;
    
    //一次性请求图片上限
    var pre_load_img_num_weight = 1;
    
    //缓冲的图片数目
    var pre_load_img_num_limit = 6;
    
    function preloadInit(){
        urllist_queue = [];
        pre_load_img_num = 0;
        curr_page_no = -1;
        b_auto_turn_page = false;
    };
    window['preloadimage']['preloadInit'] = preloadInit;
    
    //翻下一页
    function onNextPage()
    {
        //先判断是不是到了最后一页
        if(curr_page_no >= urllist_queue.length - 1)
        {
            //alert("已经到达本卷最后一页");
            //$.mobile.fixedToolbars.show();
            return false;
        }
        _pre_load_imgs(++curr_page_no);
        
        $('div #currcomicpage img').eq(0).animate({width:"0"}, {duration:200, complete:function(){$(this).remove();}});
        _clear_extern_imgs();
        imgtext = '<img class="frame" src="' + urllist_queue[curr_page_no].url + '">'
        $('div #currcomicpage').append(imgtext);    
        
        var fnResizeImg = function(){
            var img = new Image();
        	img.src = urllist_queue[curr_page_no].url; 	
	        if(!urllist_queue[curr_page_no].hwratio){
	            urllist_queue[curr_page_no].hwratio = img.height / img.width
	        }
	        preloadimage.resizeImg();
	        img.onload = function(){
	            var hwratio = img.height / img.width;
	            if(hwratio != urllist_queue[curr_page_no].hwratio){
	                urllist_queue[curr_page_no].hwratio = hwratio;
	                preloadimage.resizeImg();
	            }
	        };
	   };
        if(curr_page_no === 0){
        	//第一页，先缓冲
        	setTimeout(fnResizeImg,300);
        }else{
        	fnResizeImg();
        }
    
        //$('#pageslider').attr({'value':curr_page_no.toString()})
        $("#labelpageno").text('第' + (curr_page_no + 1).toString() + '页')
        return true;
    };
    window['preloadimage']['onNextPage'] = onNextPage;
    
    //上一页
    function onPrevPage()
    {
        //先判断是不是到了第一页
        if(curr_page_no <= 0)
        {
            //alert("已经到达第一页");
            return false;
        }
        _pre_load_imgs(--curr_page_no); 
        
        $('div #currcomicpage img').eq(0).slideToggle(200, function(){$(this).remove();});
        _clear_extern_imgs();
        imgtext = '<img class="frame" src="' + urllist_queue[curr_page_no].url + '">'
        $('div #currcomicpage').append(imgtext);
        
        var img = new Image();
        img.src = urllist_queue[curr_page_no].url;
        preloadimage.resizeImg();
        img.onload = function(){
            var hwratio = img.height / img.width;
            if(hwratio != urllist_queue[curr_page_no].hwratio){
                urllist_queue[curr_page_no].hwratio = hwratio;
                preloadimage.resizeImg();
            }            
        };
          
        //$('#pageslider').attr({'value':get_curr_page_no().toString()})
        $("#labelpageno").text('第' + (curr_page_no + 1).toString() + '页')
        return true; 
    };
    window['preloadimage']['onPrevPage'] = onPrevPage;
    
    //指定页数
    function jumpToPage(page)
    {
        $('div #currcomicpage img').eq(0).hide(100, function(){$(this).remove();});
        imgtext = '<img src="' + urllist_queue[page].url + '">"'
        $('div #currcomicpage img').append(imgtext);
        _pre_load_imgs(page);      
    }
    window['preloadimage']['jumpToPage'] = jumpToPage;
    
    //ajax请求
    function ajaxRequest(comic_id, vol_no, capture_no)
    {
        urllist = [];
        need_intro = utils.getParam('need_intro');
        $.getJSON(website + '/getcomicpages?needintro=' + need_intro + '&callback=?',{'comic_id':comic_id, 'vol':vol_no, 'capture':capture_no}, function(data) {
            for (var i = 0, max = data.imglist.length; i < max; i++) {
              urllist_queue.push({'url':data.imglist[i]})
            };
            //显示一下总页数
            $("#labeltotalpageno").text('共' + getTotalPageNo().toString() + '页')
            onNextPage();
            utils.setParam('need_intro', 'False');
        })
    };
    window['preloadimage']['ajaxRequest'] = ajaxRequest;
    
    //根据屏幕重置图片大小
    function resizeImg(){
        var img = $('div #currcomicpage').find('img');
        hwratio = urllist_queue[getCurrPageNo()].hwratio;
    
        if($(window).width() >= $(window).height()){
            img.height($(window).height() - 20);
            img.width($(img).height() / hwratio)
            $('div #currcomicpage img').css('margin-left', ($(window).width() - img.width()) / 2); 
            $('div #currcomicpage img').css('margin-top', 0); 
        }
        else{
            img.height($(window).height());
            img.width($(img).height() / hwratio);
            $('div #currcomicpage img').css('margin-bottom', ($(window).height() - img.height()) / 2);
            $('div #currcomicpage img').css('margin-top', ($(window).height() - img.height()) / 2);
            $('div #currcomicpage img').css('margin-left', 0); 
        }
    };
    window['preloadimage']['resizeImg'] = resizeImg;  
    
    //自动翻页
    function setAutoTurnPage(){
        b_auto_turn_page = !b_auto_turn_page;
        _begin_auto_turn_page();
    };
    window['preloadimage']['setAutoTurnPage'] = setAutoTurnPage; 
    
    //检测是否是自动翻页状态
    function isAutoTurnPage(){
        return b_auto_turn_page;
    };
    window['preloadimage']['isAutoTurnPage'] = isAutoTurnPage; 
    
    //返回当前页码
    function getCurrPageNo(){
        return curr_page_no;
    };
    window['preloadimage']['getCurrPageNo'] = getCurrPageNo; 
    
    //返回总页数
    function getTotalPageNo(){
        return urllist_queue.length
    };
    window['preloadimage']['getTotalPageNo'] = getTotalPageNo; 
    
    //清除多余的图片
    function _clear_extern_imgs(imgs)
    {
        for (var i = 1, max = $('div #currcomicpage img').length; i < max; i++) {
          $('div #currcomicpage img').eq(i).remove();
        }
    };
    
    //预载
    function _pre_load_imgs(curr_page)
    {
        //curr_page=13, 缓冲 ..10,11,12,14,15,15..页
        min = (curr_page - pre_load_img_num_limit) > 0 ? (curr_page - 1) : 0;
        max = (curr_page + pre_load_img_num_limit) > urllist_queue.length ? urllist_queue.length : (curr_page + pre_load_img_num_limit);
        for (var i = min; i  < max; i++) {
            var img = new Image();
            img.src = urllist_queue[i].url;
        }
    };
    
    function _begin_auto_turn_page(){
        if(b_auto_turn_page){
            if(controllers.comicpages.swipeleft()){
                setTimeout('preloadimage._begin_auto_turn_page()', 10000);
            }
        }
    };
    window['preloadimage']['_begin_auto_turn_page'] = _begin_auto_turn_page;
})()
