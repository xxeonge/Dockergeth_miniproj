import json
import time
import random
import logging
import requests
import datetime
import randomGenerator
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

logger= logging.getLogger('logger')

class User:
    contract = ""
    def __init__(self,id,pw,user_id,timescale):
        self.id = id
        self.pw = pw
        self.header = None
        self.cookie = None
        self.user_id=user_id
        self.participant = None
        self.session = requests.Session()
        retry = Retry(connect = 10, backoff_factor = 1)
        adapter = HTTPAdapter(max_retries = retry)
        self.session.mount('http://', adapter)
        self.r = randomGenerator.RandomGenerator(random.random())
        self.timescale = timescale
        self.login()

    def random_time(self,timescale=4):
        mean = 36000 # 10hour
        randomNumber = self.r.expon(mean)
        result = randomNumber/self.timescale
        return result

    def login(self):
        body = dict(user=dict(id=self.id,pw=self.pw))
        response = self.session.post('http://localhost:3000/api/account/login',body)
        self.header = response.headers
        self.cookie = response.cookies

    def register(self):
        tmp = datetime.datetime.now()
        end = tmp + datetime.timedelta(seconds=604800/self.timescale)
        end_day = end.strftime("%Y-%m-%d")
        end_time = end.strftime("%H:%M:%S")
        body = dict(user_id=self.user_id,product=dict(category="1", name="owner", price="1", time=end_time,date= end_day, img_url="hahaha", description="test",contract="1111"))
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(url="http://localhost:3000/api/db/register", method='post', data=body,headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result:
                User.contract  = result['product']['contract']
                logger.info(f'{start},{self.user_id},register,WEB,{response.elapsed.total_seconds()}')
            else:
                logger.info(f'{start},{self.user_id},registerFail,WEB,{response.elapsed.total_seconds()}')
        except:
            print(result)
            logger.info(f'{start},{self.user_id},registerFail,WEB,{response.elapsed.total_seconds()}')

    def participate(self):
        body = dict(participate=dict(user_id=self.user_id, item_id="1", price="1"))
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(url='http://localhost:3000/api/db/participate', method='post', data=body,headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(f'{start},{self.user_id},participate,WEB,{response.elapsed.total_seconds()}')
                self.participant = result['participant_id']
            else:
                logger.info(f'{start},{self.user_id},participateFail,WEB,{response.elapsed.total_seconds()}')
                self.participant=-1
        except:
            logger.info(f'{start},{self.user_id},participateFail,WEB,{response.elapsed.total_seconds()}')
            self.participant=-1

    def bid(self):
        body = dict(participant_id=str(self.participant),item_id="1",user_id=str(self.user_id))
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(url='http://localhost:3000/api/db/bid', method='post',data=body,headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(f'{start},{self.user_id},bid,WEB,{response.elapsed.total_seconds()}')
            elif "small" in result["message"]:
                logger.info(f'{start},{self.user_id},bid,WEB,{response.elapsed.total_seconds()}')
                # print(result["message"])
            elif "Reentrant" in result["message"]:
                logger.info(f'{start},{self.user_id},bid,WEB,{response.elapsed.total_seconds()}')
            else:
                logger.info(f'{start},{self.user_id},bidFaild,WEB,{response.elapsed.total_seconds()}')

        except:
                logger.info(f'{start},{self.user_id},bidFail,WEB,{response.elapsed.total_seconds()}')

                
    def winner(self):
        body = dict(user_id=self.user_id,item_id="1")
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(url='http://localhost:3000/api/db/winner', method='post', data=body,headers=self.header,cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(f'{start},{self.user_id},checkWinner,WEB,{response.elapsed.total_seconds()}')
            else:
                logger.info(f'{start},{self.user_id},checkWinnerFail,WEB,{response.elapsed.total_seconds()}')
        except:
                logger.info(f'{start},{self.user_id},checkWinnerFail,WEB,{response.elapsed.total_seconds()}')
        return result['winner']

    def successful(self):
        body = dict(participant_id=self.participant,user_id=self.user_id,item_id="1")
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(url='http://localhost:3000/api/db/successful', method='post', data=body,headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(f'{start},{self.user_id},bidSuccess,WEB,{response.elapsed.total_seconds()}')
            else:
                logger.info(f'{start},{self.user_id},bidSuccessFail,WEB,{response.elapsed.total_seconds()}')
        except:
                logger.info(f'{start},{self.user_id},bidSuccessFail,WEB,{response.elapsed.total_seconds()}')
    
    def withdraw(self):
        body = dict(user_id=self.user_id,participant_id=self.participant,item_id="1")
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(url='http://localhost:3000/api/db/withdraw', method='post', data=body,headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(f'{start},{self.user_id},depositRefund,WEB,{response.elapsed.total_seconds()}')
            else:
                logger.info(f'{start},{self.user_id},depositRefundFail,WEB,{response.elapsed.total_seconds()}')
        except:
                logger.info(f'{start},{self.user_id},depositRefundFail,WEB,{response.elapsed.total_seconds()}')
    
    def get_status(self):
        body = dict(item_id="1")
        body = json.dumps(body).encode('utf-8')
        response = self.session.request(url="http://localhost:3000/api/validate/status", method='post', data=body,headers=self.header, cookies=self.cookie)
        result = response.json()
        return result['status_code']
    
    
def user_action(id,pw,user_id,timescale):
    u = User(id,pw,user_id,timescale)
    time.sleep(u.random_time())
    try:
        u.participate()
    except Exception as ex:
        print('participate - case 1 error',ex)
        return None
    try:
        u.bid()
    except Exception as ex:
        print('bid - case 1 error',ex)
        
    while(1):
        time.sleep(u.random_time())
        try:
            status = u.get_status()
        except Exception as ex:
            continue
        if status == 1:
            winner = u.winner()
            if not winner:
                u.bid()
        elif status ==2:
            winner = u.winner()
            if winner:
                try:
                    u.successful()
                except Exception as ex:
                    continue
            try:  
                u.withdraw()
            except Exception as ex:
                continue
            break
    del u

def create_auction(id,pw,user_id,timescale):
    u = User(id,pw,user_id,timescale)
    u.register()
    del u

