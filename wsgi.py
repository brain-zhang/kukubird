#!/usr/bin/env python
# coding: utf-8
import web
import gettext
import os
from config.url import urls
from config.settings import render

app = web.application(urls, globals())

def notfound():
    return web.notfound(render.error("Hi,不要乱推门，乖...",'/'))

app.notfound = notfound

# But make this file runnable with Python for local dev mode
if __name__ == "__main__":
    app.run()
else:
    # Turn our web.py app into a WSGI app
    web.debug = False
    application = app.wsgifunc()
