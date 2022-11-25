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
#수정필요
class User:
    contract = ""

    def __init__(self, name, birth, pubkey, contractAddress, timescale=None):
        self.name = name
        self.birth = birth
        self.header = None
        self.cookie = None
        self.account = pubkey
        self.contractAddress = contractAddress
        self.issuarance = None
        self.hasinfo = False
        self.verify = False
        self.session = requests.Session()
        retry = Retry(connect=5, backoff_factor=1)
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount('http://', adapter)
        self.r = randomGenerator.RandomGenerator(random.random())
        self.timescale = timescale
    
    def random_time(self):
        timescale = self.timescale
        print('timescale is :' + str(timescale))
        mean = 36000  # 10hour
        randomNumber = self.r.expon(mean)
        result = randomNumber/self.timescale
        return result


    def issue(self):
        body = dict(issue=dict(name=self.name, birth=self.birth, caAddr=self.contractAddress, certificateOwner = self.account))
        body = json.dumps(body).encode('utf-8')
        start = int(time.time())
        response = self.session.request(
            url=f'{address}/cert/issue', method='post', data = body, headers=self.header, cookies=self.cookie)
        try:
            result = response.json()
            if result['success']:
                logger.info(
                    f'{start},{self.account},issue,WEB,{response.elapsed.total_seconds()}')
                self.issuarance=1
            else:
                logger.info(
                        f'{start},{self.account},issueFail,WEB,{response.elapsed.total_seconds()}')
                print(result["message"])
                self.participant = -1
        except:
            logger.info(
                f'{start},{self.account},issueFail,WEB,{response.elapsed.total_seconds()}')
            self.participant = -1


    
def user_action(name, birth, pubkey, timescale, contractAddress):
    u = User(name, birth, pubkey, contractAddress, timescale)
    time.sleep(u.random_time())
    try:
        u.issue()
    except Exception as ex:
        print('issue - case 1 error', ex)
        return None
    
    while(1):
        a = u.random_time()
        time.sleep(a)
        try:
            status = u.issuarance()
            print(pubkey,status)
            if status == 1:
                print('Successfully issuing')
                break
        except Exception as ex:
            print(pubkey,ex)
            break
    print("end", pubkey)
    
    del u


def create_certificate(name, birth, pubkey, timescale, contractAddress):
    u = User(name, birth, pubkey, contractAddress, timescale)
    del u