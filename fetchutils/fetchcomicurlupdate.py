#!/usr/bin/env python
# -*- coding: utf-8 -*-

import web
import getopt
import sys
import re

sqlite_db = web.database(dbn = 'sqlite', db = 'MangaCon.dat')
mysql_db = web.database(dbn = 'mysql', db = 'kukubird_test', host = '192.168.1.100', port = 3306, user = 'root', pw = '')


#无敌盗链器，未完成.........
def analy_comic_from_database(table_name = 'Tasks', comic_id = -1):
    #先清除localpath
    sqlite_db.query('update ' +  table_name + ' set localpath=""')
    #先获取漫画名称，用于构造本地地址时使用
    akaname = mysql_db.query('select aka_name from CooComicServerComicResource where comic_id=' + str(comic_id)).list()[0]['aka_name']
    
    res = sqlite_db.query('select * from ' + table_name).list()
    vol_no = 1
    capture_no = -1
    for item in res:
        #对每一条记录分析
        #先看一下是卷还是话
        if item['name'].find(u'卷') != -1 or item['name'].find(u'VOL') != -1 or item['name'].find(u'高清'):
            #看来是卷，构造语句，插入mysql当中
            capture_no = -1
            urls = eval(str(item['urls']))
            for page, url in enumerate(urls):
                #先插入原数据库
                #先改一下url
                org_url = url['url']
                change_url = org_url
                if change_url.find('http://manhua.178.com/imgs/') != -1:
                    change_url = change_url.replace(r'http://manhua.178.com/imgs/', r'http://imgfast.manhua.178.com/') 
                else:
                    print 'Err URL, please check...............'
                    
                mysql_db.insert('CooComicServerComicURL_local', vol = vol_no, capture = capture_no, 
                                page = int(page) + 1, url = change_url, comic_id = comic_id)
                #再构造插入V2的语句
                strpage_url = '%03d' %(page + 1)
                mysql_db.insert('CooComicServerComicURLV2_local', vol = vol_no, capture = capture_no,
                                page = int(page) + 1, url = 'http://img.kukubird.net:8080/' + akaname + 
                                '/vol_' + str(vol_no) + '/' + strpage_url + org_url[-4:], comic_id = comic_id)
            #vol值增加
            vol_no = vol_no + 1
            
        if item['name'].find(u'话') != -1:
            #看来是卷，构造语句，插入mysql当中
            vol_no = -1
            capture_no = int(re.compile('.*第(.*)话', item['name']).group(1))
            urls = eval(str(item['urls']))
            for page, url in enumerate(urls):
                #先插入原数据库
                #先改一下url
                org_url = url['url']
                change_url = org_url
                if change_url.find('http://manhua.178.com/imgs/') != -1:
                    change_url = change_url.replace(r'http://manhua.178.com/imgs/', r'http://imgfast.manhua.178.com/') 
                else:
                    print 'Err URL, please check...............'
                    
                mysql_db.insert('CooComicServerComicURL_local_test', vol = vol_no, capture = capture_no, 
                                page = int(page) + 1, url = change_url, comic_id = comic_id)
                #再构造插入V2的语句
                strpage_url = '%03d' %(page + 1)
                mysql_db.insert('CooComicServerComicURLV2_local_test', vol = vol_no, capture = capture_no,
                                page = int(page) + 1, url = 'http://img.kukubird.net:8080/' + akaname + 
                                '/capture_' + str(capture_no) + '/' + strpage_url + org_url[-4:], comic_id = comic_id)
            
if __name__ == '__main__':
    #opts, args = getopt.getopt(sys.argv[1:], "comicid=")
    #comic_id = int(args[0])
    comic_id = 4
    print 'working comicid = %d' %(comic_id) + '.................'
    analy_comic_from_database(comic_id = comic_id)