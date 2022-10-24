from ctypes import addressof
from email import header
import json
import time
import random
import logging
import requests
import datetime
import randomGenerator
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

logger = logging.getLogger('logger')

address = "http://localhost:3000"


class User:
    contract = ""

    def __init__(self, id, pw, account, user_id, timescale=None):
        self.id = id
        self.pw = pw
        self.header = None
        self.cookie = None
        self.account = account
        self.user_id = user_id
        self.participant = None
        self.conditionWithdraw = False
        self.condtionSuccssful = False
        self.session = requests.Session()
        retry = Retry(connect=5, backoff_factor=1)
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount('http://', adapter)
        self.r = randomGenerator.RandomGenerator(random.random())
        self.timescale = timescale
        self.login()

    def random_time(self):
        mean = 36000  # 10hour
        randomNumber = self.r.expon(mean)
        result = randomNumber/self.timescale
        return result

    def login(self):
        body = dict(user=dict(id=self.id, pw=self.pw))
        response = self.session.post(f'{address}/api/account/login', body)
        self.header = response.headers
        self.cookie = response.cookies
        print(response, self.account)

    def register(self, boxContractAddress):
        tmp = datetime.datetime.now()
        end = tmp + datetime.timedelta(seconds=604800/self.timescale)
        end_day = end.strftime("%Y-%m-%d")
        end_time = end.strftime("%H:%M:%S")
        print(end_time)
        body = dict(auctionOwner=self.account, user_id=self.user_id, boxAddress=boxContractAddress, product=dict(
            category="1", name="owner", price="1", time=end_time, date=end_day, img_url="hahaha", description="test", contract="1111"))
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        self.header['Connection'] = 'close'
        response = self.session.request(
            url=f"{address}/api/bc/register", method='post', data=body, headers=self.header, cookies=self.cookie)
        result = response.json()
        try:
            result = response.json()
            if result:
                User.contract = result['product']['contract']
                logger.info(
                    f'{start},{self.account},register,WEB,{response.elapsed.total_seconds()}')
            else:
                logger.info(
                    f'{start},{self.account},registerFail,WEB,{response.elapsed.total_seconds()}')
        except:
            logger.info(
                f'{start},{self.account},registerFail,WEB,{response.elapsed.total_seconds()}')
        finally:
            self.session.close()

    def participate(self):
        body = dict(participate=dict(user_id=self.user_id,
                    item_id="1", price="1", user_ganache=self.account))
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(
            url=f'{address}/api/bc/participate', method='post', data=body, headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(
                    f'{start},{self.account},participate,WEB,{response.elapsed.total_seconds()}')
                self.participant = 1
            else:
                logger.info(
                    f'{start},{self.account},participateFail,WEB,{response.elapsed.total_seconds()}')
                print(result["message"])
                self.participant = -1
        except:
            logger.info(
                f'{start},{self.account},participateFail,WEB,{response.elapsed.total_seconds()}')
            self.participant = -1

    def bid(self):
        body = dict(value=1, item_id="1", user_ganache=self.account)
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(
            url=f'{address}/api/bc/bid', method='post', data=body, headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(
                    f'{start},{self.account},bid,WEB,{response.elapsed.total_seconds()}')
            elif "small" in result["message"]:
                logger.info(
                    f'{start},{self.account},bid,WEB,{response.elapsed.total_seconds()}')
                # print(result["message"])
            elif "Reentrant" in result["message"]:
                logger.info(
                    f'{start},{self.account},bid,WEB,{response.elapsed.total_seconds()}')
            else:
                logger.info(
                    f'{start},{self.account},bidFail,WEB,{response.elapsed.total_seconds()}')

        except:
            logger.info(
                f'{start},{self.account},bidFail,WEB,{response.elapsed.total_seconds()}')

    def winner(self):
        body = dict(user_id=self.account, item_id="1",
                    user_ganache=self.account)
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(
            url=f'{address}/api/bc/winner', method='post', data=body, headers=self.header, cookies=self.cookie)
        result = response.json()
        try:
            result = response.json()
            if result['success']:
                logger.info(
                    f'{start},{self.account},checkWinner,WEB,{response.elapsed.total_seconds()}')
                if result['highestBidder'] == self.account:
                    return True
            else:
                logger.info(
                    f'{start},{self.account},checkWinnerFail,WEB,{response.elapsed.total_seconds()}')
        except:
            logger.info(
                f'{start},{self.account},checkWinnerFail,WEB,{response.elapsed.total_seconds()}')
        return False

    def successful(self):
        body = dict(user_ganache=self.account, item_id="1")
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(
            url=f'{address}/api/bc/successful', method='post', data=body, headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(
                    f'{start},{self.account},bidSuccess,WEB,{response.elapsed.total_seconds()}')
                self.condtionSuccssful = True
            else:
                logger.info(
                    f'{start},{self.account},bidSuccessFail,WEB,{response.elapsed.total_seconds()}')
        except:
            logger.info(
                f'{start},{self.account},bidSuccessFail,WEB,{response.elapsed.total_seconds()}')

    def withdraw(self):
        body = dict(user_ganache=self.account, item_id="1")
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        self.header['Connection'] = 'close'
        response = self.session.request(
            url=f'{address}/api/bc/withdraw', method='post', data=body, headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(
                    f'{start},{self.account},depositRefund,WEB,{response.elapsed.total_seconds()}')
                self.conditionWithdraw = True
                return True
            else:
                logger.info(
                    f'{start},{self.account},depositRefundFail,WEB,{response.elapsed.total_seconds()}')
                print(f'refundDeposit_fail{result["message"]}, {start}')
        except:
            logger.info(
                f'{start},{self.account},depositRefundFail,WEB,{response.elapsed.total_seconds()}')
        finally:
            self.session.close()

    def get_status(self):
        body = dict(item_id="1")
        body = json.dumps(body).encode('utf-8')
        response = self.session.request(
            url=f"{address}/api/validate/status", method='post', data=body, headers=self.header, cookies=self.cookie)
        result = response.json()
        return result['status_code']


def user_action(id, pw, account, user_id, timescale):
    u = User(id, pw, account, user_id, timescale)
    time.sleep(u.random_time())
    try:
        u.participate()
    except Exception as ex:
        print('participate - case 1 error', ex)
        return None
    try:
        u.bid()
    except Exception as ex:
        print('bid - case 1 error', ex)

    while (1):
        a = u.random_time()
        time.sleep(a)
        try:
            status = u.get_status()
            print(id,status)
            if status == 1:
                winner = u.winner()
                if not winner:
                    u.bid()
            elif status == 2:
                winner = u.winner()
                if winner:
                    if not u.condtionSuccssful:
                        u.successful()
                if not u.conditionWithdraw:
                    u.withdraw()
                else:
                    break
        except Exception as ex:
            print(id,ex)
            break
    print("end",id)

    del u


def create_auction(id, pw, account, user_id, timescale, boxContractAddress):
    u = User(id, pw, account, user_id, timescale)
    u.register(boxContractAddress)
    del u
