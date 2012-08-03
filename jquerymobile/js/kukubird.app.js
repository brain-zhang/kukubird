// 本地化命名空间
var utils = Comicview.utils,
	controllers = Comicview.controllers,
	website = 'http://4.coocomicserver.sinaapp.com'
	//website = 'http://127.0.0.1:8080'
// 模板

//=========第()卷===========
function tplComicVol(i, listid){
	return '<li data-icon="false"><a href="comicpages.html" data-role="button" data-listid="' + listid.toString() +  '" data-vol_no="' + i.toString() + '">' + '第' + i.toString() + '卷' + '</a></li>'
}

//=========第()话===========
function tplComicCapture(i, listid){
    return '<li data-icon="false"><a href="comicpages.html" data-role="button" data-listid="' + listid.toString() + '" data-capture_no="'+ i.toString() + '">' + '第' + i.toString() + '话' + '</a></li>'
}

//=========例:火影忍者...介绍...===========
function tplHotComics(array, items){
	for(var i in items){
		var item = items[i]
		poto = item.first_photo
		summary = "暂无"
		if(item.summary){summary = item.summary}
		var aka_name = item.aka_name==null ? '' : item.aka_name,
			li = '<li  data-icon="false"><a href="comic.html" data-akaname="' + aka_name + '" data-comic_id="'+ item.comic_id +'"><img src="'+ poto +'"/><h3>' + aka_name + '</h3><p>' + summary + '</p></a></li>'
			array.push(li)
	}
}

//=========处理分类列表的生成==============
function tplComicsGroup(array, items){
    for (var i in items) {
        var type = items[i].type;
        var li = '';
        if(items[i].istoggle === false){
            li = '<li data-role="list-divider" data-icon="arrow-r"><a href="#" data-itemid="'+ i.toString() + '" comictype="' + type + '">' + type + '</a><span class="ui-li-count">' + items[i].comics.length.toString() + '</span></li></li>';
        }else{
            li = '<li data-role="list-divider" data-icon="arrow-l"><a href="#" data-itemid="'+ i.toString() + '" comictype="' + type + '">' + type + '</a><span class="ui-li-count">' + items[i].comics.length.toString() + '</span></li></li>';
        }
        if(items[i].istoggle){
            for (comic in items[i].comics) {
                var poto = items[i].comics[comic].first_photo;
                var summary = "暂无";
                if(items[i].comics[comic].summary){summary = items[i].comics[comic].summary}
                var aka_name = items[i].comics[comic].aka_name==null ? '' : items[i].comics[comic].aka_name
                li = li + '<li  data-icon="false" comictype="' + type + '"><a href="comic.html" data-akaname="' + aka_name +'" data-itemid="' + i.toString() + '" data-comic_id="' + items[i].comics[comic].comic_id +'"><img src="'+ poto +'"/><h3>' + aka_name + '</h3><p>' + summary + '</p></a></li>'
            }
        }
        //li = li + '</ul></li>'
        array.push(li)
    };
}

//=========处理登录按钮的显示==============
function showLoginWidget(pageid){
    //$('div:jqmData(role="page")').find('div.headertitle').css({'margin-left':(marginLeft - 50).toString() + 'px', 'margin-top':'5px','float':'left'})
    
    //在当前page标题栏下添加一个 'qq_login_connect_btn'的div
    $('div#' + pageid).find('div.coologinbtn').prepend('<div id="qq_login_connect_btn"></div>')

    QC.Login({
        //btnId：插入按钮的节点id，必选
        btnId : "qq_login_connect_btn",
        //用户需要确认的scope授权项，可选，默认all
        scope : "all",
        //按钮尺寸，可用值[A_XL| A_L| A_M| A_S|  B_M| B_S| C_S]，可选，默认B_S
        size : "A_L"
    }, function(dt, opts) {//登录成功
        //根据返回数据，更换按钮显示状态方法
        var dom = document.getElementById(opts['btnId']), _logoutTemplate = [
        //头像
        '<span><img src="{figureurl}" class="{size_key}"/></span>',
        //昵称
        '<span>{nickname}</span>',
        //退出
        '<span><a href="javascript:QC.Login.signOut();">退出</a></span>'].join("");
        dom && (dom.innerHTML = QC.String.format(_logoutTemplate, {
            nickname : QC.String.escHTML(dt.nickname),
            figureurl : dt.figureurl
        }));       
        
        //下面是存放用户uid及token
        QC.Login.getMe(function(openId, accessToken){
            //先记录qqtoken
            utils.setParam('qqToken', accessToken.toString())
            //再记录cootoken
            utils.setUserToken(dt.nickname, openId.toString())
            })
            //隐藏登录说明
            $('span#userloginintro').hide()
            
            if(!utils.getParam('isFirstLogin')){
                utils.setParam('isFirstLogin','True') 
            }            
         
    }, function(opts) {//注销成功
        utils.removeUserToken()
        utils.removeUserHistory()
        utils.removeParam('qqToken')
        utils.removeParam('isFirstLogin')
        utils.isLogin.prototype.singnal = 'False'
        
        //再刷掉历史记录
        Comicview.controllers.user.pageshow()
        
        //显示登录说明
        $('span#userloginintro').show()
    });
}

// 控制器业务处理中心

//主页面，显示hotcomic
controllers.index = {
    pagebeforecreate : function(event){
        //每次show之前，先看看分页信息
        var index_curr_page_no = 1; 
        if(utils.getParam('index_curr_page_no')){
            index_curr_page_no = parseInt(utils.getParam('index_curr_page_no'));
        }
        else{
            utils.setParam('index_curr_page_no', index_curr_page_no.toString()); 
        }         
        
        if(utils.getParam('index_total_page_num')){
            var index_total_page_num = parseInt(utils.getParam('index_total_page_num'));                           
        }
        else{
        //处理分页
            $.getJSON(website + '/gettotalpagenum?&callback=?',function(data) {
                var index_total_page_num = parseInt(data.total_page);
                utils.setParam('index_total_page_num', index_total_page_num.toString());
                //重新刷新一下页面
                controllers.index.pageshow();
            });
        }
        
        //取得所有漫画列表
        if(!utils.getParam('all_comics')){
            $.getJSON(website + '/getallcomics?&callback=?',function(data) {
                utils.setParam('all_comics', utils.object2String(data.all_comics));
            });
        }
    },
    
    pageshow : function(event){     
          var index_curr_page_no = parseInt(utils.getParam('index_curr_page_no'));
          var index_total_page_num = parseInt(utils.getParam('index_total_page_num'));                    
          $.getJSON(website + '/gethotcomics?currpageno=' + index_curr_page_no.toString() + '&callback=?',function(data) {
                var li_array = ['<li data-role="list-divider">热门漫画</li>']
                tplHotComics(li_array, data.comics)
                var $listview = $('#index').find('ul[data-role="listview"]')
                $listview.html(li_array.join(''))
                $listview.listview('refresh')
                $listview.undelegate();
                $listview.delegate('li a', 'click', function(e) {
                    utils.setParam('comic_id', $(this).data("comic_id"));
                    utils.setParam('akaname', $(this).data("akaname"));
                });                        
            });
                    
            //下面为了避免重新刷新，写的代码很丑
            $('#indexpagebtn').html('')
            if(index_curr_page_no > 1){
                //上一页
                $('#indexpagebtn').append('<a data-inline="true" data-corners="true" data-action_page_no="' + (index_curr_page_no - 1).toString() + 
                                            '" data-role="button" href="#index" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
                                            'data-theme="c" class="ui-btn ui-btn-inline ui-shadow ui-btn-corner-all ui-btn-up-c">' + 
                                            '<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">上一页</span></span></a>');                    
            }
            if(index_curr_page_no < index_total_page_num){
                //下一页
                $('#indexpagebtn').append('<a data-inline="true" data-corners="true" data-action_page_no="' + (index_curr_page_no + 1).toString() + 
                                            '" data-role="button" href="#index" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
                                            'data-theme="c" class="ui-btn ui-btn-inline ui-shadow ui-btn-corner-all ui-btn-up-c">' + 
                                            '<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">下一页</span></span></a>');    
            } 
            
            $('#indexpagebtn').append('&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>页次   ' + index_curr_page_no.toString() + '/' + index_total_page_num.toString() + '<span>');
            
            var $btnview = $('#indexpagebtn');
            //防止重复绑定
            $btnview.undelegate();
            $btnview.delegate('a', 'click', function(e){
                page_no = $(this).data('action_page_no');
                utils.setParam('index_curr_page_no', page_no);
                //$.mobile.changePage('index.html', {reloadPage: true},{ allowSamePageTranstion: true},{ transition: 'none'});
                //局部刷新，提高速度
                controllers.index.pageshow();
            }); 
            
            //最后把搜索框清一下
            $('#SearchByAkaname').val('');
    },
}

//响应整站搜索
controllers.SearchByAkaname = {
    input : function(event, ui){
        var text = $(this).val();
        if(text.length < 1){
            controllers.index.pageshow();
        }else{
            var li_array = ['<li data-role="list-divider">搜索结果</li>'];
            var items = [];
            var all_comics = utils.string2Object(utils.getParam('all_comics'));
            for (var i=0, length = utils.getPropertyCount(all_comics); i < length; i++) {
              if(all_comics[i].aka_name.indexOf(text) != -1){
                  items.push(all_comics[i]);
              } 
            }
            tplHotComics(li_array, items);
            var $listview = $('#index').find('ul[data-role="listview"]')
            $listview.html(li_array.join(''))
            $listview.listview('refresh')
            $listview.undelegate();
            $listview.delegate('li a', 'click', function(e) {
                utils.setParam('comic_id', $(this).data("comic_id"));
                utils.setParam('akaname', $(this).data("akaname"));
            }); 
        }
    }
}

//显示某部完整的漫画卷，话
controllers.comic = {
    pageshow : function(event){
         $.getJSON(website + '/getcomiclength?id='+ utils.getParam('comic_id') +'&callback=?',function(data) {
                var aka_name = data.aka_name,
                    vols = data.vols,
                    min_capture = data.min_capture,
                    max_capture = data.max_capture,
                    listid = 0,
                    listid_array = [],
                    li_array = ['<li data-role="list-divider">' + aka_name + '</li>'];
                    
                //先判断是正序还是倒序的排列
                if(utils.getParam('reversesort') !== 'true'){
                    //正序      
                    $('#reversesort').find('span').eq(0).text('倒序排列');
                    listid_array = [];
                    listid = 0;
                    for (var i = 0; i < vols; i++) {
                      li_array.push(tplComicVol(i + 1, listid));
                      listid_array.push({'listid':listid, 'vol_no':(i + 1), 'capture_no':-1});
                      listid++;
                    }
                    if(min_capture > 0){
                        for (var i = min_capture; i <= max_capture; i++) {
                          li_array.push(tplComicCapture(i, listid));
                          listid_array.push({'listid':listid, 'vol_no':-1, 'capture_no':i});
                          listid++;
                        }
                    }
                }else{
                    //倒序
                    $('#reversesort').find('span').eq(0).text('正序排列');
                    listid_array = [];
                    listid = 0;
                    if(min_capture > 0){
                        for (var i = max_capture; i >= min_capture; i--) {
                          li_array.push(tplComicCapture(i, listid));
                          listid_array.push({'listid':listid, 'vol_no':-1, 'capture_no':i});
                          listid++;
                        }
                    }
                    for (var i = vols; i > 0; i--) {
                      li_array.push(tplComicVol(i, listid));
                      listid_array.push({'listid':listid, 'vol_no':(i), 'capture_no':-1});
                      listid++;
                    }                    
                }
                //将所有的章节关系存在localstorage中
                utils.setParam('listid_array', utils.object2String(listid_array));
                    
                var $listview = $('#comic').find('ul[data-role="listview"]');
                $listview.html(li_array.join(''));
                $listview.listview('refresh');
                $listview.undelegate();
                $listview.delegate('li a', 'click', function(e) {
                    if(utils.string2Object(utils.getParam('listid_array'))[$(this).data('listid')].capture_no === -1){
                        utils.setParam('vol_no', utils.string2Object(utils.getParam('listid_array'))[$(this).data('listid')].vol_no);
                        utils.setParam('capture_no', -1);
                    }
                    else if(utils.string2Object(utils.getParam('listid_array'))[$(this).data('listid')].vol_no === -1){
                        utils.setParam('capture_no', utils.string2Object(utils.getParam('listid_array'))[$(this).data('listid')].capture_no);
                        utils.setParam('vol_no', -1);
                    }
                    utils.setParam('listid', parseInt($(this).data('listid')));      
                });
            }
         );
         
         var vol_no = utils.getParam('vol_no');
         //如果当前的vol或capture存有值，将相应的li置为active
         /*
         $.each($('#comic').find('ul[data-role="listview"] li a'), function(i, item){           
             if($(item).attr('data-vol_no') ==  vol_no){
                 $(item).addClass('ui-btn-active');
             }
             else{
                 $(item).removeClass('ui-btn-active');
             }
         })
         $listview = $('#comic').find('ul[data-role="listview"]');
         $listview.listview('refresh');
         */
    }
}

//观看漫画页
controllers.comicpages = {
    pageshow : function(event){
        var comic_id = utils.getParam('comic_id')
        var vol_no = utils.getParam('vol_no')
        var capture_no = utils.getParam('capture_no')
        $(document).keydown(controllers['currcomicpage']['keydown'])
        preloadimage.preloadInit()
        preloadimage.ajaxRequest(comic_id, vol_no, capture_no)
        //设定可以缩放
        viewport = document.querySelector("meta[name=viewport]");
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes');
        
        //for jquery mobile 1.1.0
        //$.mobile.zoom.enable()
        //默认取消显示header及footer
        //$.mobile.fixedToolbars.hide()
        
        //设定卷数及页数
        if(utils.getParam('vol_no') != -1){
            $('#labelvolno').text('第' + utils.getParam('vol_no') + '卷')
        }
        else if (utils.getParam('capture_no') != -1){
            $('#labelvolno').text('第' + utils.getParam('capture_no') + '话')
        }
        
        //记录用户浏览历史
        utils.setUserBrowseHistory()
        
        //感应屏幕翻转事件
        $(window).bind('orientationchange', function(event) {
            preloadimage.resizeImg()
        });
    },
    pagehide  : function(event){
        //alert('unbind')
        $(document).unbind('keydown', controllers['currcomicpage']['keydown'])
        
        //取消缩放
        viewport = document.querySelector("meta[name=viewport]");
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
        
        //取消翻转感应
        $(window).unbind('orientationchange')
    },
    //左右手势
    swipeleft : function(event){
        if(!preloadimage.onNextPage()){
            //到达最后一页了，直接转到下一卷/话
            return controllers.autoGoVolCap('next');
        }
        return true;
    },
    swiperight : function(event){ 
        if(!preloadimage.onPrevPage()){
            //到达第一页了，直接转到上一卷/话
            return controllers.autoGoVolCap('prev');
        }
        return true;
    }
}

//键盘响应
controllers.currcomicpage = {
    keydown : function(event){
     
        if(event.keyCode == 37)
        {
            //左
            if(!preloadimage.onPrevPage()){
                //到达第一页了，直接转到上一卷/话
                curr_listid = utils.getParam('listid');
                controllers.autoGoVolCap('prev');
            }
        }
        else if(event.keyCode == 39)
        {
            //右
            if(!preloadimage.onNextPage()){
                //到达最后一页了，直接转到下一卷/话
                curr_listid = parseInt(utils.getParam('listid'));
                controllers.autoGoVolCap('next');
            }
        }
    }
}

//自动翻页按钮处理
controllers.AutoTurnPage = {
    'click' : function(event){
        if(preloadimage.isAutoTurnPage()){
            $('#AutoTurnPage').removeClass('ui-btn-active')
        }
        else{
            $('#AutoTurnPage').addClass('ui-btn-active')
        }  
        preloadimage.setAutoTurnPage()   
    }
}

//用于感应页码跳转
controllers.pageslider = {
    'tap' : function(event){
        alert($('#pageslider').attr('value'))
        return false
    }
}

//用于翻页到第一页/最后一页后的自动跳转
controllers.autoGoVolCap = function(action){
    var listid = 0;
    curr_listid = parseInt(utils.getParam('listid'));
    if(((utils.getParam('reversesort') === 'true') && (action === 'next')) || 
            ((utils.getParam('reversesort') !== 'true') && (action === 'prev'))){
        listid = curr_listid - 1;
    }
    else{
        listid = curr_listid + 1;
    }
    listid_array_obj = utils.string2Object(utils.getParam('listid_array'));
    if(((listid < 0) && (utils.getParam('reversesort') !== 'true')) ||
            (listid >= utils.getPropertyCount(listid_array_obj) && (utils.getParam('reversesort') === 'true'))){
        alert('不好意思，已经是万物之始了，前面一片空无......');
        return false;
    }
    else if(((listid >= utils.getPropertyCount(listid_array_obj)) && (utils.getParam('reversesort') !== 'true')) || 
            ((listid < 0) && (utils.getParam('reversesort') === 'true'))){
        alert('了不起的毅力，您一口气到达漫画之路的尽头，去休息一下吧......');
        return false;       
    }
    listid_array_item = utils.string2Object(utils.getParam('listid_array'))[listid];
    vol_no = listid_array_item.vol_no;
    capture_no = listid_array_item.capture_no;
    utils.setParam('vol_no', vol_no);
    utils.setParam('capture_no', capture_no);
    utils.setParam('listid', listid);
    
    //重新载入页面
    $.mobile.changePage('comicpages.html', {reloadPage: true},{ allowSamePageTranstion: true},{ transition: 'none'});            
    return true;
};

//-----------------------------------------------------------------------------
controllers.categories = {
    pageshow : function(event){     
        if(!utils.getParam('comic_type_group')) {
            $.getJSON(website + '/getcomicbytypegroup?callback=?',function(data) {
                for(i in data.comic_type_group){
                    data.comic_type_group[i].istoggle = false;
                }
                utils.setParam('comic_type_group', utils.object2String(data.comic_type_group)); 
                controllers.categories.pageshow();
            })
        }else{
            var li_array = []
            var comics_group = utils.string2Object(utils.getParam('comic_type_group'));
            tplComicsGroup(li_array, comics_group);          
            var $listview = $('#categories').find('ul[data-role="listview"]');
            $listview.html(li_array.join(''));
            $listview.listview('refresh');
            $listview.undelegate();
            $listview.delegate('li a', 'click', function(e) {
                utils.setParam('comic_id', $(this).data("comic_id"));
                utils.setParam('akaname', $(this).data("akaname"));
            });
            
            //对展开/缩放功能重新绑定函数
            $("#categories li a").die('click', controllers['categories']['togglelist']);
            $("#categories li a").live('click', controllers['categories']['togglelist']);
            
            //默认初始化时，如果没有设定展开，则全部收缩
            $.each($("#categories li"), function(i, item){
                if($(item).attr("comictype") && comics_group[parseInt($(item).data('itemid'))] === false){
                    $(item).toggle("slow")
                }
             });      
         }       
    },
    
    togglelist : function(event) {         
        //重新设定展开项
        var comics_group = utils.string2Object(utils.getParam('comic_type_group'));
        comics_group[parseInt($(this).data('itemid'))].istoggle = !comics_group[parseInt($(this).data('itemid'))].istoggle;
        utils.setParam('comic_type_group', utils.object2String(comics_group));
        
        //刷新页面
        controllers.categories.pageshow();
    },
    
    pagehide  : function(event){
        $("#categories li a").die('click', controllers['categories']['togglelist'])
    }
}

//------------------------------------------------------------------------------
controllers.user = {
    pagecreate : function(event){
        //showLoginWidget('user');
    },
    
    pageshow : function(event){
        var $listview = $('#user').find('ul[data-role="listview"]');
         
        //先判断用户是不是登录状态，不是就不费力了
        /*
        if(utils.isLogin.prototype.singnal != 'True'){
            $listview.html('<li data-role="list-divider">我的浏览历史</li>');
            $listview.listview('refresh');
            return;
        }
        */
        
        //下面是获取用户的浏览记录，刷新显示
        utils.getUserBrowseHistory(function(histories){
            //得到json数据，设置界面
            var li_array = [];
            for (var i = 0, max = histories.length; i < max; i++) {
                if(histories[i].capture == -1){
                    li_array.push('<li data-icon="false"><a href="comicpages.html" data-role="button" data-vol_no="' + 
                        histories[i].vol.toString() + '" data-comic_id="' + histories[i].comic_id.toString() + '">' + histories[i].akaname + '  第' + histories[i].vol.toString() + '卷' + '</a><span class="ui-li-aside">' + histories[i].datetime.toString() + '&nbsp&nbsp&nbsp&nbsp</span></li>');
                }
                else if(histories[i].vol == -1){
                    li_array.push('<li data-icon="false"><a href="comicpages.html" data-role="button" data-capture_no="' + 
                        histories[i].capture.toString() + '" data-comic_id="' + histories[i].comic_id.toString() + '">' + histories[i].akaname + '  第' + histories[i].capture.toString() + '话' + '</a><span class="ui-li-aside">' + histories[i].datetime.toString() + '&nbsp&nbsp&nbsp&nbsp</span></li>');                    
                }
            };
            $listview.html('<li data-role="list-divider">我的浏览历史</li>');
            $listview.append(li_array.join(''));
            $listview.listview('refresh');
            
            $listview.undelegate();
            $listview.delegate('li a', 'click', function(e) {
                utils.setParam('comic_id', $(this).data('comic_id'));
                if($(this).data("vol_no")){
                    utils.setParam('vol_no', $(this).data('vol_no'));
                    utils.setParam('capture_no', -1);
                }
                else if($(this).data('capture_no')){
                    utils.setParam('capture_no', $(this).data('capture_no'));
                    utils.setParam('vol_no', -1);
                }      
            });
        })
    }
}

//------------------------------------------------------------------------------
controllers.about = {
    pagecreate : function(event){
    }
}

//-------------------------------------------------------------------------------
controllers.reversesort = {
    click : function(event){
        if(utils.getParam('reversesort') === 'true'){
            //倒序
            utils.setParam('reversesort', 'false');
            
        }else{
            utils.setParam('reversesort', 'true');
        }
        $.mobile.changePage('comic.html', {reloadPage: true},{ allowSamePageTranstion: true},{ transition: 'none'});
    }
}

//------------------------------------翻页---------------------------------------
controllers.btn_page_next = {
    click : function(event){
        if(!preloadimage.onNextPage()){
            //到达最后一页了，直接转到下一卷/话
            return controllers.autoGoVolCap('next');
        }
        return true;        
    }
}


controllers.btn_page_prev = {
    click : function(event){
        if(!preloadimage.onPrevPage()){
            //到达最后一页了，直接转到下一卷/话
            return controllers.autoGoVolCap('prev');
        }
        return true;        
    }
}

var pages = [
	{id: 'comic', event:'pageshow'},   
    //{id: 'comicpages', event:'pageshow,swipeleft,swiperight,pagehide'},   
    {id: 'comicpages', event:'pageshow,pagehide'}, 	
	{id: 'index', event:'pagebeforecreate,pageshow'},
	{id: 'AutoTurnPage', event:'click'},
	{id: 'categories', event:'pageshow,pagehide'},
	{id: 'user', event:'pageshow'},
	{id: 'about', event:'pagecreate'},
	
	{id: 'btn_page_next', event:'click'},
	{id: 'btn_page_prev', event:'click'},
	{id: 'reversesort', event:'click'},
	{id: 'SearchByAkaname', event:'input'},
]

Comicview.run(pages)