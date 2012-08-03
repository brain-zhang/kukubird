// 全局命名空间
var Comicview = {
	author : 'memoryboxes',
	version: '1.0',
	modified: 'memoryboxes@163.com',
	website:'http://www.Comicview.com'
}
// 工具包
Comicview.utils = {
	setParam : function (name,value){
	    //ios上需要先remove
	    sessionStorage.removeItem(name);
		sessionStorage.setItem(name,value);
	},
	getParam : function(name){
		return sessionStorage.getItem(name);
	},
	removeParam : function(name){
	    sessionStorage.removeItem(name);
	},
	
	//增加一个本地持久化存储的接口
	setStorageParam : function (name, value){
		localStorage.removeItem(name);
		localStorage.setItem(name, value);
	},
	getStorageParam : function (name){
		return localStorage.getItem(name);
	},
	removeStorageParam : function (name){
		localStorage.removeItem(name);
	},
	
	//设置用户远端cootoken
	setUserToken : function(qq_name, qq_uid){
	    if(sessionStorage.getItem('cootoken')){
            return;
	    }
	    else{
    	    $.getJSON(website + '/user/getusercootoken?callback=?',{'qq_name':qq_name, 'qq_uid':qq_uid}, function(data) {
    	        sessionStorage.setItem('cootoken', data.cootoken);  
                //再开一个记录，记录用户是否一直保持在线
                Comicview.utils.isLogin.prototype.singnal = 'True'          
                //再show一下page，防止异步json数据没有请求完毕，listview不刷新
                //这个太hack了，暂时没有其他招                       
                Comicview.controllers.user.pageshow()          
    	    });
    	}
	},
	
	//获取用户cootoken
	getUserToken : function(){
	    return sessionStorage.getItem('cootoken');
	},
	
	//用户注销，取消token
	removeUserToken : function(){
	    sessionStorage.removeItem('cootoken');
	},	
	
	//获取用户浏览历史
	
	/*
	getUserBrowseHistory : function(fnHistoryShow){
	    $.getJSON(website + '/user/getuserbrowsehistory?callback=?',{'cootoken':sessionStorage.getItem('cootoken')}, function(data) {
                sessionStorage.setItem('histories', data.histories);
                fnHistoryShow(data.histories)         
        });
	},
	
	//设置用户浏览历史
	setUserBrowseHistory : function(){
        $.getJSON(website + '/user/setuserbrowsehistory?callback=?',{'cootoken':sessionStorage.getItem('cootoken'), 'comic_id':sessionStorage.getItem('comic_id'), 
            'akaname':sessionStorage.getItem('akaname'), 'vol':sessionStorage.getItem('vol_no'), 'capture':sessionStorage.getItem('capture_no')}, 
            function(data) {
                return;    
	        });
	},
	*/
	
	//用于持久化存储本地用户浏览历史
	getUserBrowseHistory : function (fnHistoryShow){
		var user_history = new Array();
		if(utils.getStorageParam('user_history')){
			user_history = utils.string2Array(utils.getStorageParam('user_history'));
		}
		fnHistoryShow(user_history);
		
	},
	
	setUserBrowseHistory : function(){
		if(sessionStorage.getItem('akaname') === 'undefined'){
			return;
		}
		var user_history = new Array();
		if(utils.getStorageParam('user_history')){
			user_history = utils.string2Array(utils.getStorageParam('user_history'));
		}
		//先获取时间
		var now = new Date().format("MM-dd hh:mm");
		user_history.unshift({'comic_id':sessionStorage.getItem('comic_id'), 'akaname':sessionStorage.getItem('akaname'), 
			'vol':sessionStorage.getItem('vol_no'), 'capture':sessionStorage.getItem('capture_no'), 'datetime':now});
		utils.setStorageParam('user_history', utils.array2String(user_history));
	},
	
	
	//用户注销，取消history
	removeUserHistory : function(){
        sessionStorage.removeItem('histories');
    },
    isLogin : function() {
    },
    
    //用于转换的工具函数
    object2String : function(obj){
        var val, output = "";
        if(obj){
            output += "{";
            for(var i in obj){
                val = obj[i];
                switch(typeof val){
                    case ("object"):
                        if(val && val[0]){
                            output += "'" + i + "':" + Comicview.utils.array2String(val) + ",";
                        }else{
                            output += "'" + i + "':" + Comicview.utils.object2String(val) + ",";
                        }
                        break;
                    case ("string"):
                        output += "'" + i + "':'" + encodeURI(val) + "',";
                        break;
                    default:
                        output += i + ":" + val + ",";
                }
            }
            output = output.substring(0, output.length - 1) + "}";
        }
        return output;
    },
        
    array2String : function(array){
        var val,output = "";
        if(array){
            output += "[";
            for(var i in array){
                val = array[i];
                switch(typeof val){
                    case ("object"):
                        if(val[0]){
                            output += Comicview.utils.array2String(val) + ",";
                        }else{
                            output += Comicview.utils.object2String(val) + ",";
                        }
                        break;
                    case ("string"):
                        output += "'" + encodeURI(val) + "',";
                        break;
                    default:
                        output += val + ",";
                }
            }
            output = output.substring(0, output.length - 1) + "]";
        }
        return output;
    },
        
    string2Object : function(string){
        eval("var result = " + decodeURI(string));
        return result;
    },
        
    string2Array : function(string){
        eval("var result = " + decodeURI(string));
        return result;
    },
    
    getPropertyCount : function(o){
       var n, count = 0;
       for(n in o){
          if(o.hasOwnProperty(n)){
             count++;
          }
       }
       return count;
    },
}
// 业务控制中心，需应用实现
Comicview.controllers = {}
// 事件注册
Comicview.run = function(pages){
	var pages = pages,
	count = pages.length;
	for(var i=0;i<count;i++){
		var page = pages[i],
			id = page.id
			e_array = page.event.split(',');
		for(var j=0; j <e_array.length;j++){
			var e = e_array[j];
			if($.trim(e).length == 0)
				continue;
			$('#'+id).live(e, Comicview.controllers[id][e]);
		}
	}
	
	
//------------------------------系统环境改变--------------------------------------	
    /**
	 * 时间对象的格式化;
	 */
	Date.prototype.format = function(format) {
	    /*
	     * eg:format="YYYY-MM-dd hh:mm:ss";
	     */
	    var o = {
	        "M+" :this.getMonth() + 1, // month
	        "d+" :this.getDate(), // day
	        "h+" :this.getHours(), // hour
	        "m+" :this.getMinutes(), // minute
	        "s+" :this.getSeconds(), // second
	        "q+" :Math.floor((this.getMonth() + 3) / 3), // quarter
	        "S" :this.getMilliseconds()
	    // millisecond
	    }
	
	    if (/(y+)/.test(format)) {
	        format = format.replace(RegExp.$1, (this.getFullYear() + "")
	                .substr(4 - RegExp.$1.length));
	    }
	
	    for ( var k in o) {
	        if (new RegExp("(" + k + ")").test(format)) {
	            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
	                    : ("00" + o[k]).substr(("" + o[k]).length));
	        }
	    }
	    return format;
	};
	
	//部分初始化工作
	utils.setParam('need_intro', 'True');
}