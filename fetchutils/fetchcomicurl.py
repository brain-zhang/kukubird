#!/usr/bin/env python
# -*- coding: utf-8 -*-

from config.settings import utildb, db, ComicResource, ComicURL, render
from models import mirrordb
import urllib2
import web

#备份的远端地址
backregurl = 'http://img.kukubird.net:8080/'

def add_comic_records(vol = -1, capture = -1, pages = 100, startURL = '', comic_id = -1):
    url = ''
    for i in xrange(1, pages):
        url = startURL + str(i) + '.jpg'
        utildb.insert('comicURL', vol = vol, capture = capture, 
                  page = i, url = url, comic_id = comic_id, quality_rank = 0)
        
class AutoCreateURL():
    def GET(self):
        comic_aka_name = web.input().comic_aka_name
        regurl = web.input().comicurl
        vol_no = web.input().vol
        capture_no = web.input().capture
        totalpages = web.input().totalpages
        vol_capture_name = web.input().volcapturename
        begin_page_no = web.input().beginpageno
        
        comic_id = -1
        res = db.query('select * from ' + ComicResource + ' where aka_name="' + comic_aka_name + '"').list()
        try:
            comic_id = res[0]['comic_id']
        except:
            #没有这部漫画，先插入
            db.insert(ComicResource, aka_name= comic_aka_name, hotrank = 10)
            comic_id = db.query('select * from ' + ComicResource + ' where aka_name="' + comic_aka_name + '"').list()[0]['comic_id']
        
        urllist = []
        try:
            page_url_no_length = int(regurl[regurl.find('*') + 1])
        except:
            return render.error('地址格式错误!', '/createcomicpage')
        
        for i in xrange(int(begin_page_no), int(totalpages) + int(begin_page_no)):
            strformat = "%0" + str(page_url_no_length) + "d"
            stri = strformat % (i,)
            stri = str(stri)
            striV2 = "%03d" %(i - int(begin_page_no) + 1)
            url = regurl[:regurl.find('*') - 1] + stri + regurl[regurl.find('*') + 3:]
            urlV2 = ''
            if int(vol_no) > 0:
                urlV2 = backregurl + comic_aka_name + '/vol_' + str(vol_no) + '/' + striV2  + regurl[regurl.find('*') + 3:].lower()
            elif int(capture_no) > 0:
                urlV2 = backregurl + comic_aka_name + '/capture_' + str(capture_no) + '/' + striV2 + regurl[regurl.find('*') + 3:].lower()
            urllist.append(url)
            try:
                db.insert(ComicURL.replace('V2', ''), vol = vol_no, capture = capture_no, 
                          page = i, url = url, comic_id = comic_id, quality_rank = 0, vol_capture_name = vol_capture_name)
                db.insert(ComicURL.replace('V2', '') + 'V2', vol = vol_no, capture = capture_no, 
                          page = i, url = urlV2, comic_id = comic_id, quality_rank = 0, vol_capture_name = vol_capture_name)                
            except:
                return render.error('URL已经录入，重复!', '/createcomicpage')
            
        #搞定了，返回一个OK页面
        return render.ok(urllist)
    
class BackAutoCreateURL():
    "向备份数据库中写入备份数据，还未测试"
    def GET(self):

        return '此功能已关闭'
        comic_id = web.input().comic_id        
        
        res = db.query('select * from ' + ComicResource + ' where comic_id="' + comic_id + '"').list()
        comic_aka_name = res[0]['aka_name']
        vol_no, min_capture, max_capture = mirrordb.get_comic_length(int(comic_id))
        
        #如果是卷
        if vol_no > 0:
            for vol in xrange(1, vol_no + 1):
                #先获取每一卷的totalpages
                totalpages = db.query('select  count(page) as count_page from CooComicServerComicURL where comic_id=' + 
                                      str(comic_id) + ' and vol=' + str(vol) + ' group by vol')[0]['count_page']
                for i in xrange(1, int(totalpages) + 1):
                    stri = '%03d' %(i)                
                    url = backregurl + comic_aka_name + '/vol_' + str(vol) + '/' + stri + '.jpg'
                    try:
                        #这里改一下数据库
                        db.insert(ComicURL + 'V2', vol = vol, capture = -1, 
                                  page = stri, url = url, comic_id = comic_id, quality_rank = 0)
                    except:
                        return 'URL已经录入，重复!'
                
        #话
        if min_capture > 0:
            for capture in xrange(min_capture, max_capture + 1):
                #先获取每一话的totalpages
                totalpages = db.query('select  count(page) as count_page from CooComicServerComicURL where comic_id=' + 
                                      str(comic_id) + ' and capture=' + str(capture) + ' group by capture')[0]['count_page']
                for i in xrange(1, int(totalpages) + 1):
                    stri = '%03d' %(i)                
                    url = backregurl + comic_aka_name + '/capture_' + str(capture) + '/' + stri + '.jpg'
                    try:
                        #这里改一下数据库
                        db.insert(ComicURL + 'V2', vol = -1, capture = capture, 
                                  page = stri, url = url, comic_id = comic_id, quality_rank = 0)
                    except:
                        return 'URL已经录入，重复!'
            
        #搞定了，返回一个OK页面
        return 'OK'
        
        
if __name__ == '__main__':
    add_comic_records(vol = 25, pages = 100, capture = -1,
                      startURL = 'http://pics1.89890.com/1/1205/14425/', comic_id = 5)