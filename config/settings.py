#!/usr/bin/env python
# coding: utf-8
import web
import os

web.config.debug = True
#如果是在本地调试，请打开此开关，如果上传到sae，请置为False
LOCAL_DEBUG = False
LOCAL_MYSQL_DEBUG = False

if LOCAL_DEBUG:
	database = "database/comic.db"
	db = web.database(dbn='sqlite', db=database)
	utildb = web.database(dbn = 'sqlite', db = '../database/comic.db')
	templates_root = 'templates'
else:
    import sae
    app_root = os.path.dirname(__file__)
    templates_root = os.path.join(app_root, '../templates')
    db = web.database(dbn='mysql', db=sae.const.MYSQL_DB, host=sae.const.MYSQL_HOST, \
        port=int(sae.const.MYSQL_PORT),user=sae.const.MYSQL_USER, pw=sae.const.MYSQL_PASS)
    utildb = db

if LOCAL_MYSQL_DEBUG:
    db = web.database(dbn='mysql', db='kukubird', host='127.0.0.1', port=3306, user='root', pw='')
    util_db = db
    templates_root = 'templates'
   
def _create_memcache_client():
    try:
        import pylibmc
        return pylibmc.Client()
    except ImportError:
        import memcache
        return memcache.Client(['127.0.0.1:11211'])
    
mc = _create_memcache_client()    

render = web.template.render(templates_root, cache=False)

web.config.debug = False
config = web.storage(
	    static = '/static',
    	site_name = 'coocomicserver',
)

#默认返回用户浏览记录的条数
user_browse_history_limit = 10
#每页显示的漫画数目
comic_num_per_page = 6

#数据表名
ComicResource = 'CooComicServerComicResource'
ComicURL = 'CooComicServerComicURLV2'
ComicUserinfo = 'CooComicServerUserinfo'
ComicUserbrowseHistory = 'CooComicServerUserBrowseHistory'

web.template.Template.globals['config'] = config
web.template.Template.globals['render'] = render

