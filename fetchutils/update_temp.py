#!/usr/bin/env python
# -*- coding: utf-8 -*-

import web
import getopt
import sys

sqlite_db = web.database(dbn = 'sqlite', db = 'MangaCon.dat')
mysql_db = web.database(dbn = 'mysql', db = 'kukubird', host = '127.0.0.1', port = 3306, user = 'root', pw = '')

def update_url_local():
    """
    将原来有错误的地址:
    http://manhua.178.com/imgs/
    改为
    http://imgfast.manhua.178.com/
    """
    res = mysql_db.query("select * from CooComicServerComicURL_local").list()
    for item in res:
        url = item['url']
        url = url.replace(r'http://manhua.178.com/imgs/', r'http://imgfast.manhua.178.com/')
        url_id = str(item['url_id'])
        mysql_db.query('update CooComicServerComicURL_local set url ="' + url + '" where url_id=' + url_id)
            
if __name__ == '__main__':
    update_url_local()