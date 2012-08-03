#!/usr/bin/env python
# coding: utf-8

pre_fix = 'controllers.'

urls = (
    '/',                    pre_fix + 'view.ComicView',
    '/createcomicpage',     pre_fix + 'view.CreateComicpage',
    '/gethotcomics',        pre_fix + 'view.GetHotComics',
    '/getcomicpages',       pre_fix + 'view.GetComicPages',        
    '/getcomiclength',      pre_fix + 'view.GetComicLength',   
    '/getcomicbytypegroup', pre_fix + 'view.GetComicByTypeGroup', 
    '/gettotalpagenum',     pre_fix + 'view.GetTotalPageNum',
    '/getallcomics',        pre_fix + 'view.GetAllComics',
    
    #真正后台也
    '/autocreateurl',       'fetchutils.fetchcomicurl.AutoCreateURL',
    
    #URL写入备份数据库，用于图床的备份
    '/back/autocreateurl',  'fetchutils.fetchcomicurl.BackAutoCreateURL',
    
    #用户交互部分
    '/user/getusercootoken',                    pre_fix + 'useraction.GetUserCootoken',
    '/user/getuserbrowsehistory',               pre_fix + 'useraction.GetUserBrowseHistory',
    '/user/setuserbrowsehistory',               pre_fix + 'useraction.SetUserBrowseHistory',
    
    #为下载工具准备的
    '/downloadtools/getcomicpages',             pre_fix + 'download.GetComicPages',
    '/downloadtools/getcomicidbyakaname',       pre_fix + 'download.GetComicidByAkaName',
    '/downloadtools/getcomiclength',            pre_fix + 'download.GetComicLength',
    '/downloadtools/getallakanames',            pre_fix + 'download.GetAllComics',
)
