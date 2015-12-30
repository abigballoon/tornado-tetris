import logging
import tornado.escape
import tornado.web
import tornado.websocket
import hashlib, random, datetime

from tornado import gen
from tornado_mysql import err

class GeneralData:
    """"""
    # STT 保存着sessionId，toren和创建时间，每个 get() 方法开始都应该有一个检测个方法
    # sessionId 一直存活到会话结束，而toren就在每次提交之后改变
    STT = dict()
    cleanTime = 5*60*1000 # 这个转化成毫秒是因为tornado.ioloop.PeriodicCallback认的是毫秒级的
    sessionId_expire_time = 30*60 # 而这个是因为 datetime.datetime.timestamp 是秒级的

    @classmethod
    def updateToren(cls, request):
        sessionId = request.get_cookie('sessionId')
        toren = hashlib.md5(str(random.random()).encode('utf-8')).hexdigest()
        time = datetime.datetime.now().timestamp()
        cls.STT.update({sessionId:(toren, time)})
        request.set_cookie('toren',toren)

    @classmethod
    def validateSTT(cls, method):
        def checkSTT(*args):
            request = args[0]
            sessionId = request.get_cookie('sessionId')
            if sessionId == None:
                sessionId = hashlib.md5(str(random.random()).encode('utf-8')).hexdigest()
                toren = hashlib.md5(str(random.random()).encode('utf-8')).hexdigest()
                request.set_cookie('sessionId',sessionId)
                request.set_cookie('toren',toren)
                time = datetime.datetime.now().timestamp()
                cls.STT.update({sessionId:(toren, time)})
            return method(*args)
        return checkSTT

    @classmethod
    def cleanSTT(cls):
        """每隔clenaTime就会被调用（urls.py里的一个函数），清除过期的sesssion"""
        now = datetime.datetime.now().timestamp()
        for sessionId in cls.STT:
            if cls.STT[sessionId][1] - now > GeneralData.sessionId_expire_time:
                # 如果超过了过期时间就清掉
                cls.STT.pop(sessionId)

class TetrisHandler(tornado.web.RequestHandler):

    @GeneralData.validateSTT
    def get(self):
        self.set_cookie("gameID",str(random.randint(1000,9999)))
        self.render("gamepanel.html")

class TetrisControlHandler(tornado.web.RequestHandler):

    @GeneralData.validateSTT
    def get(self):
        self.render("controllor.html")

class TetrisSocketHandler(tornado.websocket.WebSocketHandler):
    gamepanels = {}
    controllors = {}
    links = {}

    def __init__(self, application, request, **keyargs):
        self.id = str(random.randint(1000,9999))
        tornado.websocket.WebSocketHandler.__init__(self, application, request, **keyargs)

    def open(self):
        response = {
            "command":"role",
            "val":"R",
            "cookies":"",
        }
        self.write_message(response)

    def on_message(self, message):
        message = eval(message)
        if message["command"] == "role":
            if message["val"] == "C":
                TetrisSocketHandler.controllors.update({self.id:self})
                response = {
                    "command":"link",
                    "val":"R",
                    "cookies":"",
                }
                self.write_message(response)
            elif message["val"] == "P":
                self.id = message["cookies"]
                TetrisSocketHandler.gamepanels.update({self.id:self})
        elif message["command"] == "link":
            TetrisSocketHandler.link(self, message["val"])
        elif message["command"] == "move":
            command = message["val"]
            gamepanel = TetrisSocketHandler.links[self.id]
            response = {
                    "command":"move",
                    "val":command,
                    "cookies":"",
                }
            gamepanel.write_message(response)

    @classmethod
    def link(cls, controllor, gameID):
        gamepanel = cls.gamepanels[gameID]
        cls.links.update({controllor.id:gamepanel})
