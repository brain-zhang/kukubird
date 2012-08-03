#!/usr/bin/env python
# -*- coding: utf-8 -*-
# 一个小工具，从我们的网站rest接口请求json数据，然后下载漫画

import urllib2
import urllib
import re
import os
import sys
import getopt
import logging
import socket
import time

#记录log
logger=logging.getLogger()
handler=logging.FileHandler("Down_Comic_Log.txt")
logger.addHandler(handler)
logger.setLevel(logging.NOTSET)

LOCAL_DEBUG = False

if LOCAL_DEBUG:
    get_comic_para_site_download = u'http://192.168.1.199:8080/downloadtools/'
    get_comic_para_site = u'http://192.168.1.199:8080/'
else:
    get_comic_para_site_download = u'http://3.coocomicserver.sinaapp.com/downloadtools/'
    get_comic_para_site = u'http://3.coocomicserver.sinaapp.com/'

def get_comic_url_by_comicid(comic_id = 1, vol = 1, capture = -1):   
    time.sleep(1) 
    json_data = urllib2.urlopen(get_comic_para_site_download + 
                    u'getcomicpages?needintro=False&callback=download&comic_id=' + str(comic_id) + 
                    u'&vol=' + str(vol) + u'&capture=' + str(capture)).read()
    jsondump_data = re.match(r'download(\(.*\)).*', json_data).group(1)[1:-1]
    urllist = eval(jsondump_data)['imglist']
    return urllist    
    
def get_comicid_by_aka_name(aka_name):
    json_data = urllib2.urlopen(get_comic_para_site_download + 
                                u'getcomicidbyakaname?callback=download&akaname=' + aka_name).read()
    return int(json_data)                           
        
def get_comic_length_by_comicid(comic_id):
    json_data = urllib2.urlopen(get_comic_para_site_download + 
                            u'getcomiclength?callback=download&id=' + str(comic_id)).read()
    jsondump_data = re.match(r'.*(\(.*\)).*', json_data).group(1)[1:-1]
    vols = eval(jsondump_data)['vols']
    min_capture = eval(jsondump_data)['min_capture']
    max_capture = eval(jsondump_data)['max_capture']
    return vols, min_capture, max_capture

def download_by_aka_name(aka_name, dir = '/home/memorybox/comic/'):
    comic_id = get_comicid_by_aka_name(aka_name)
    vols, min_capture, max_capture = get_comic_length_by_comicid(comic_id)
    if vols > 0:
        for i in xrange(1, vols + 1):
            #先下载卷
            vol_dir_name = dir + aka_name + u'/vol_' + str(i) + u'/'
            try:
                urllist = get_comic_url_by_comicid(comic_id = comic_id, vol = i, capture=-1)
            except:
                time.sleep(2)
                urllist = get_comic_url_by_comicid(comic_id = comic_id, vol = i, capture=-1)
                
            for ii in xrange(0, len(urllist)):
                #开始下载每一页
                extern_name = urllist[ii][-3:]
                page = "%03d" %(ii + 1)
                url_file_full_path = vol_dir_name + str(page) + '.' + extern_name
                try:
                    urlretrieve_wrapper(urllist[ii], url_file_full_path)
                except:
                    logger.error('下载失败:漫画名称:' + aka_name + ',卷:' + str(i) + ',页:' + str(ii))
        
    if min_capture > 0:
        for i in xrange(min_capture, max_capture + 1):        
            #再下载话
            capture_dir_name = dir + aka_name + u'/capture_' + str(i) + u'/'
            try:
                urllist = get_comic_url_by_comicid(comic_id = comic_id, vol = -1, capture = i)
            except:
                time.sleep(2)
                urllist = get_comic_url_by_comicid(comic_id = comic_id, vol = -1, capture = i)
                
            for ii in xrange(0, len(urllist)):
                #开始下载每一页
                extern_name = urllist[ii][-3:]
                page = "%03d" %(ii + 1)
                url_file_full_path = capture_dir_name + str(page) + '.' + extern_name
                try:
                    urlretrieve_wrapper(urllist[ii], url_file_full_path)
                except:
                    logger.error('下载失败:漫画名称:' + aka_name + ',话:' + str(i) + ',页:' + str(ii)) 
                    
def get_all_akanames():
    json_data = urllib2.urlopen(get_comic_para_site_download + 
                                u'getallakanames?callback=download').read()
    json_data = re.match(r'download\((.*)\)$', json_data).group(1)
    jsondump_data = eval(json_data)
    akanames = [i['aka_name'] for i in jsondump_data['all_comics']]
    return akanames
                                
                    
def urlretrieve_wrapper(url, path):
    "下载函数的包装器，如果path不存在则创建"
    directory = path[:path.rfind('/')]
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    #如果文件小于5K,先删除
    if os.path.isfile(path) and os.path.getsize(path) < 1024 * 5:
        os.remove(path)
        
    #如果文件不存在则下载
    if not os.path.isfile(path):
        header = {'Accept-Charset':'GBK,utf-8;q=0.7,*;q=0.3',
                  'User-Agent' : 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.151 Safari/534.16',
                  'Referer':'http://manhua.178.com/'}
        request = urllib2.Request(url,headers = header)
        res = urllib2.urlopen(request)
        f = file(path, 'wb')
        f.write(res.read())
        f.close()
        res.close()
                
if __name__ == '__main__':
#    opts, args = getopt.getopt(sys.argv[1:], "akaname=")
#    aka_name = args[0].decode('GB2312')
    reload(sys)
    sys.setdefaultencoding('utf8')
    akanames = get_all_akanames()
    
    #设置 超时
    socket.setdefaulttimeout(60)
    
    for aka_name in akanames:
        print 'downloading............' + aka_name.decode('unicode_escape')
        download_by_aka_name(aka_name.decode('unicode_escape'))
