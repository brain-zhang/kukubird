#!/usr/bin/env python
# -*- coding: utf-8 -*-

from config.settings import db, ComicResource, ComicURL, ComicUserinfo, ComicUserbrowseHistory
from config.settings import user_browse_history_limit, comic_num_per_page
from config.settings import mc
from hashlib import md5

def get_comic_url_by_id(comic_id, vol, capture, is_local_back = 1):
    "根据传入的comic_id,vol,capture搜寻合适的URL返回"
    query_sql = ''
    if int(vol) > 0:
        query_sql = 'select url from ' + ComicURL + ','  + ComicResource + \
            ' where ' + ComicURL + '.vol=' + str(vol) + ' and ' + ComicURL + \
            '.comic_id = ' + ComicResource + '.comic_id and ' + ComicResource + '.comic_id =' + str(comic_id) + \
            ' and ' + ComicURL + '.is_local_back =' + str(is_local_back) + ' order by page ASC'
    if int(capture) > 0:
        query_sql  = 'select url from ' + ComicURL + ', '  + ComicResource + \
            ' where ' + ComicURL + '.capture=' + str(capture) + ' and ' + ComicURL + \
            '.comic_id = ' + ComicResource + '.comic_id and ' + ComicResource + '.comic_id =' + str(comic_id) + \
            ' and ' + ComicURL + '.is_local_back =' + str(is_local_back) + ' order by page ASC'
    
    db.query('update ' + ComicResource + ' set hotrank = hotrank + 1 where comic_id =' + str(comic_id))
    return _memchache_get_records(query_sql)


def get_comic_url_by_vol(aka_name, vol_no, is_local_back = 1):
    "获取漫画的卷数"
    query_sql =  'select url from ' + ComicURL + ',' + ComicResource + \
    ' where ' + ComicURL + '.comic_id = ' + ComicResource + '.comic_id and ' + ComicResource + '.aka_name ="' + aka_name + '"' + \
    ' and comicURL.vol = ' + str(vol_no) + ' and ' + ComicURL + '.is_local_back =' + str(is_local_back)
    
    return _memchache_get_records(query_sql) 

def get_comic_url_by_capture(aka_name, capture_no, is_local_back = 1):
    "获取漫画的话数"
    query_sql = 'select url from ' + ComicURL + ',' + ComicResource + \
    ' where ' + ComicURL + '.comic_id = ' + ComicResource + '.comic_id and ' + ComicResource + '.aka_name ="' + aka_name + '"' + \
    ' and comicURL.capture =' + str(capture_no) + ' and ' + ComicURL + '.is_local_back =' + str(is_local_back)
    
    return _memchache_get_records(query_sql)
    
def get_hot_comics(curr_page_no, is_local_back = 1):
    "获取热门漫画列表"
    curr_page_no = int(curr_page_no)
    query_sql  = 'select * from ' + ComicResource + ' where is_local_back =' + str(is_local_back) + \
        ' order by hotrank DESC limit ' + str(comic_num_per_page) + ' offset ' + str(comic_num_per_page * (curr_page_no - 1))
    return _memchache_get_records(query_sql)

def get_total_comic_num(is_local_back = 1):
    "获取总页数"
    query_sql = 'select count(comic_id) as comic_count from ' + ComicResource + ' where is_local_back =' + str(is_local_back)
    return _memchache_get_records(query_sql)

def get_all_comics():
    "获取所有漫画列表"
    query_sql = 'select * from ' + ComicResource
    return _memchache_get_records(query_sql)

def get_comics_by_type(typeL1, is_local_back = 1):
    "根据分类查找漫画"
    query_sql = 'select * from ' + ComicResource + ' where typeL1 ="' + typeL1 + '" and ' + 'is_local_back =' + str(is_local_back)
    return _memchache_get_records(query_sql)
    

def get_comics_types(is_local_back = 1):
    "获取漫画分类 "
    query_sql = 'select typeL1 from ' + ComicResource + ' where is_local_back =' + str(is_local_back) + ' group by typeL1'
    return _memchache_get_records(query_sql)

def get_comic_length(comic_id, is_local_back = 1):
    "检测漫画的卷数、话数"
    comic_id = str(comic_id)
    vols = min_capture = max_capture = 0
    try:
        vols_sql = 'select distinct vol from ' + ComicURL + ',' + ComicResource + \
        ' where ' + ComicURL + '.comic_id = ' + ComicResource + '.comic_id and ' + ComicResource + '.comic_id = ' + comic_id + \
        ' and vol <> -1' + ' and ' + ComicURL + '.is_local_back =' + str(is_local_back)
        
        captures_sql = 'select distinct capture, min(capture) as min_capture, max(capture) as max_capture from ' + ComicURL + ',' + ComicResource + \
        ' where ' + ComicURL + '.comic_id = ' + ComicResource + '.comic_id and ' + ComicResource + '.comic_id = ' + comic_id + \
        ' and capture <> -1' + ' and ' + ComicURL + '.is_local_back =' + str(is_local_back)
        
        vols = len(_memchache_get_records(vols_sql))
        res = _memchache_get_records(captures_sql)[0]
        if res['max_capture']:
            min_capture, max_capture = res['min_capture'], res['max_capture']
        else:
            min_capture = max_capture = 0
    except:
        vols = min_capture = max_capture = 0
    return vols, min_capture, max_capture

def get_comic_aka_name_by_id(comic_id):
    query_sql = 'select aka_name from ' + ComicResource + ' where comic_id = ' + str(comic_id)
    aka_name = db.query(query_sql)
    try:
        return aka_name[0]['aka_name']
    except:
        return "抱歉，收录漫画与ID不符"
    
def get_comic_id_by_aka_name(aka_name):
    "用于下载工具获取漫画id"
    query_sql = 'select * from ' + ComicResource + ' where aka_name = "' + aka_name + '"'
    res = _memchache_get_records(query_sql)
    try:
        return res[0]['comic_id']
    except:
        return "Err, no such comic"  
    
#===================用于登录用户的数据存储=====================
def get_user_cootoken(qq_name, qq_uid):
    "根据qget_user_cootokentoken，目前什么也不做，记录uid一下"
    cootoken = qq_uid
    try:
        cootoken = db.query('select * from ' + ComicUserinfo + ' where qq_uid="' + qq_uid + '"').list()[0]['cootoken']
    except:
        #数据库中没有这个用户
        db.insert(ComicUserinfo, qq_name = qq_name, qq_uid = qq_uid, cootoken = cootoken)
    return cootoken
    
    
def get_user_browsehistory(cootoken):
    """
                    根据传入的cootoken查找用户历史记录
                    格式:<storage[{'comic_id':'2', 'akaname':'海贼王', 'vol':'2', 'capture':'-1', 'browse_time':'2012-03-19'}...]>
    """
    query_str = 'select distinct(' + ComicUserbrowseHistory + r'.history) as history from ' + ComicUserbrowseHistory + ',' + ComicUserinfo + \
                    ' where ' + ComicUserbrowseHistory + r'.uid=' + ComicUserinfo + r'.uid and ' + ComicUserinfo + \
                    r'.cootoken="' + str(cootoken) + r'" order by browse_time DESC limit ' + str(user_browse_history_limit)
    return db.query(query_str).list()
    
def set_user_browsehistory(cootoken, history):
    """
                    根据传入的cootoken设置用户历史记录
                    格式:{'comic_id':'2', 'akaname':'海贼王', 'vol':'2', 'capture':'-1'}
    """
    try:
        uid = db.query('select * from ' + ComicUserinfo + ' where cootoken="' + str(cootoken) + '"').list()[0]['uid']
        db.insert(ComicUserbrowseHistory, uid = uid, history = history).list()
    except:
        #没有这个用户
        pass
    
#======================memcache缓存=================================    
def _memchache_get_records(query_sql, time = 5):
    "memcache缓存,time默认为5分钟"
    
    #hash一下，为了key键分布更均衡
    key = md5(query_sql.encode('UTF-16')).hexdigest()
    res = mc.get(key)
    if not res:
        res = db.query(query_sql).list()
        mc.set(key, res, 60 * time) #存5分钟

    res = db.query(query_sql).list()
    return res    
    
def get_comic_url_by_aka_name(aka_name):
    "测试用的，根据漫画名称返回"
    return db.query('select url from ' + ComicURL + ',' +  ComicResource +
        ' where ' + ComicURL + '.comic_id = ' + ComicResource + '.comic_id and ' + ComicResource + '.aka_name ="' + aka_name + '"').list()

def get_comic_url_by_local_name(local_name):
    "测试用，根据漫画的原名称(英文、日文)返回"
    return db.query('select url from ' + ComicURL + ',' + ComicResource +
    ' where ' + ComicURL + '.comic_id = ' + ComicResource  + '.comic_id and ' + ComicResource + '.local_name =“' + local_name + '"').list()

def get_comics_by_letter(letter):
    "根据字母排序，目前还未加入此功能"
    query_sql = 'select aka_name from ' + ComicResource  + ' where first_letter = "' + letter + '"'
    return _memchache_get_records(query_sql)
    
#for test    
if __name__ == '__main__':
    print get_comic_length(u"灌篮高手")
    print get_comic_url_by_aka_name(u"灌篮高手")
    print get_comic_url_by_vol("灌篮高手", 1)
    print get_hot_comics()
    print get_comics_by_type(u"体育")
    print get_comics_by_letter("g")