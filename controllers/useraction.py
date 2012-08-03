#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import web
from config.settings import render
from models import mirrordb

#=========用户交互部分========== 
class GetUserCootoken():
    "获得用户cootoken"
    def GET(self):
        callback = web.input().callback
        qname = web.input().qq_name
        quid = web.input().qq_uid
        cootoken = mirrordb.get_user_cootoken(qname, quid)
        return callback + '(' + json.dumps({"cootoken":cootoken}) + ')' 
    
class GetUserBrowseHistory():
    "获取用户浏览记录"
    def GET(self):
        callback = web.input().callback
        cootoken = web.input().cootoken
        res = mirrordb.get_user_browsehistory(cootoken)
        histories = [eval(i['history']) for i in res]
        return callback + '(' + json.dumps({"histories":histories}) + ')'
    
class SetUserBrowseHistory():
    "记录用户浏览历史:格式:{'comic_id':'2', 'akaname':'海贼王', 'vol':'2', 'capture':'-1'}"
    def GET(self):
        callback = web.input().callback
        cootoken = web.input().cootoken
        comic_id = web.input().comic_id
        akaname = mirrordb.get_comic_aka_name_by_id(comic_id)
        vol = web.input().vol
        capture = web.input().capture
        mirrordb.set_user_browsehistory(cootoken, str({'comic_id':int(comic_id), 'akaname':akaname, 'vol':int(vol), 'capture':int(capture)}))
        return callback + '(' + json.dumps('OK') + ')'
#for test    
if __name__ == '__main__':
    #模拟访问一下
    import urllib2
    #print urllib2.urlopen('http://127.0.0.1:8080/user/getusercootoken?callback=test&qname=memorybox&quid=2').read()
    #urllib2.urlopen('http://127.0.0.1:8080/user/setuserbrowsehistory?cootoken=memorybox1&comic_id=2&vol=1&capture=-1')
    print urllib2.urlopen('http://127.0.0.1:8080/user/getuserbrowsehistory?callback=test&cootoken=memorybox1').read()
    
            