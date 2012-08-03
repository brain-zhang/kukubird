#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import web
from config.settings import render
from config.settings import comic_num_per_page
from models import mirrordb
from config.settings import mc
from hashlib import md5

#===================memcache临时缓存函数，因为type的运算量很大，为其额外开辟一个函数===========================  
def _memchache_get_comic_by_type_group(callback, string_content = 'getcomicbytypegroup', time = 5):
    "memcache缓存,time默认为5分钟"
    
    #hash一下，为了key键分布更均衡
    key = md5(string_content.encode('UTF-16')).hexdigest()
    res = mc.get(key)
    if not res:
        res = _get_comic_by_type_group()
        mc.set(key, res, time * 60)
        
    res = callback + '(' + res + ')'
    return res   

def _get_comic_by_type_group():
        list_type_comics = []
        res = mirrordb.get_comics_types()
        types = [i['typeL1'] for i in res]
        for type_item in types:
            this_type_comics = mirrordb.get_comics_by_type(type_item)
            this_type_comics = [{"comic_id":i['comic_id'], "aka_name":i['aka_name'], "first_photo":i["first_photo"], 
                                 "summary":((i["summary"].replace("'", '"')).replace('\n', '')).replace('\r', '')} for i in this_type_comics]
            list_type_comics.append({'type':type_item, 'comics':this_type_comics})
        finalres =   json.dumps({"comic_type_group":list_type_comics})
        return finalres
    
#===============================================hack手段结束=================================================    

class ComicView():
    "显示浏览页面"
    def GET(self):
        return render.welcome()
    
class CreateComicpage():
    "显示创建漫画页面"
    def GET(self):
        return render.createcomicpage()
    
class GetHotComics():
    "返回热门漫画列表"
    def GET(self):
        callback = web.input().callback
        curr_page_no = web.input().currpageno
        hot_comics = mirrordb.get_hot_comics(curr_page_no)
        comics = [{"comic_id":i['comic_id'], "aka_name":i['aka_name'], "first_photo":i["first_photo"], "summary":i["summary"]} for i in hot_comics]
        return callback + '(' + json.dumps({"comics":comics}) + ')'
        #return json.dumps({'comicid':1})
        
class GetComicLength():
    "返回漫画的卷数，回数。如'火影忍者'有1-30卷，之后为451-500回，返回值为'火影忍者',30,451,500"
    def GET(self):
        callback = web.input().callback
        comic_id = web.input().id
        vols, min_capture, max_capture = mirrordb.get_comic_length(comic_id)
        try:
            aka_name = mirrordb.get_comic_aka_name_by_id(comic_id)
        except:
            return render.error("查询出错",'/')
        print callback + '(' + json.dumps({"aka_name":aka_name, "vols":vols, "min_capture":min_capture, "max_capture":max_capture}) + ')'
        return callback + '(' + json.dumps({"aka_name":aka_name, "vols":vols, "min_capture":min_capture, "max_capture":max_capture}) + ')'
    
class GetComicPages():
    "响应 Ajax请求，根据comic_name返回url列表"
    def GET(self):
        need_intro = web.input().needintro
        callback = web.input().callback
        comic_id = web.input().comic_id
        vol = web.input().vol
        capture = web.input().capture
        urllist = mirrordb.get_comic_url_by_id(comic_id, vol, capture)
        res = []
        if need_intro == 'True':
            res.append('images/loading/region.png')
            
        for item in urllist:
            res.append(item['url'])
        res =  callback + '(' + json.dumps({'imglist':res}) + ')'
        print res
        return res
    
class GetComicByTypeGroup():
    """
                    返回如下格式的数据:
            {categories:[{"type":"冒险", "comics":["海贼王", "火影忍者"]}...]}
    """
    def GET(self):
        callback = web.input().callback
        return _memchache_get_comic_by_type_group(callback)
    
class GetTotalPageNum():    
    """
                返回漫画总页数
    """
    def GET(self):
        callback = web.input().callback
        comic_num =  mirrordb.get_total_comic_num()[0]['comic_count']
        total_page = int(comic_num) / comic_num_per_page + 1
        return callback + '(' + json.dumps({'total_page':str(total_page)}) + ')'
    
class GetAllComics():    
    """
                返回所有漫画信息
    """
    def GET(self):
        callback = web.input().callback
        all_comics_info = mirrordb.get_all_comics()
        all_comics = [{"comic_id":i['comic_id'], "aka_name":i['aka_name'], "first_photo":i["first_photo"], "summary":((i["summary"].replace("'", '"')).replace('\n', '')).replace('\r', '')} for i in all_comics_info]
        
        return callback + '(' + json.dumps({'all_comics':all_comics}) + ')'    
    
    
#=========for download tools==========
class GetComicidByAkaName():
    "根据漫画名称返回漫画id"
    def GET(self):
        aka_name = web.input().akaname
        return mirrordb.get_comic_id_by_aka_name(aka_name)
        