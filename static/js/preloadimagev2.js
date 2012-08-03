//用于 图片预加载的实现
//memoryboxes@gmail.com
//2012-04-01

//接受地址列表，预加载图片

var urllist_queue = new Array();
var pre_load_img_num = 0;
var curr_page_no = -1;

//一次性请求图片上限
var pre_load_img_num_weight = 1;

//缓冲的图片数目
var pre_load_img_num_limit = 6;

//翻下一页
function on_next_page()
{
    //先判断是不是到了最后一页
    if(curr_page_no >= urllist_queue.length)
    {
        alert("已经到达最后一页");
        return;
    }
    $('.iStu12 li.images div.slide img').eq(0).hide(300, function(){$(this).remove();});
    imgtext = '<img src="' + urllist_queue[curr_page_no + 1] + '">"'
    $('.iStu12 li.images div.slide').append(imgtext);
    _pre_load_imgs(++curr_page_no);
}

//上一页
function on_prev_page()
{
    //先判断是不是到了第一页
    if(curr_page_no <= 0)
    {
        alert("已经到达第一页");
        return;
    }
    $('.iStu12 li.images div.slide img').eq(0).hide(300, function(){$(this).remove();});
    imgtext = '<img src="' + urllist_queue[curr_page_no - 1] + '">"'
    $('.iStu12 li.images div.slide').append(imgtext);
    _pre_load_imgs(--curr_page_no);    
}

//指定页数
function jump_to_page(page)
{
    $('.iStu12 li.images div.slide img').eq(0).hide(300, function(){$(this).remove();});
    imgtext = '<img src="' + urllist_queue[page] + '">"'
    $('.iStu12 li.images div.slide').append(imgtext);
    _pre_load_imgs(page);      
}

//预载
function _pre_load_imgs(curr_page)
{
    //curr_page=13, 缓冲 ..10,11,12,14,15,15..页
    min = (curr_page - pre_load_img_num_limit) > 0 ? (curr_page - pre_load_img_num_limit) : 0;
    max = (curr_page + pre_load_img_num_limit) > urllist_queue.length ? urllist_queue.length : (curr_page + pre_load_img_num_limit);
    for (var i = min; i  < max; i++) {
        var img = new Image();
        img.src = urllist_queue[i];
    };
}

//ajax请求
function ajax_request()
{
    urllist = [];
    $.post('/getcomic', {'aka_name':'灌篮高手'}, function(data){
        urllist_queue = eval("(" + data + ")").urllist;
        on_next_page();
    })
}

$(window).load(function(){
    $('.iStu12 li.next').click(function(){on_next_page();});
    $('.iStu12 li.prev').click(function(){on_prev_page();});
    ajax_request();}
    );
