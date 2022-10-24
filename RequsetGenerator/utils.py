import os
import sys
import json
import pymysql
import fileinput
from web3 import Web3,HTTPProvider
import logging.handlers
from psutil import Process
from win32con import SW_HIDE,SW_SHOW
from win32event import WaitForSingleObject
from win32com.shell.shell import ShellExecuteEx
from win32process import GetProcessId,GetExitCodeProcess
from win32com.shell.shellcon import SEE_MASK_NOCLOSEPROCESS, SEE_MASK_DOENVSUBST

logger = logging.getLogger('logger')
w3 = Web3(HTTPProvider("http://127.0.0.1:8545"))

def open_cmd(executable,params=""):
    execute_info=ShellExecuteEx(lpVerb = 'open',
                    lpFile=executable,
                    lpParameters=params,
                    fMask = SEE_MASK_NOCLOSEPROCESS | SEE_MASK_DOENVSUBST,
                    nShow= SW_SHOW
    )
    hproc = execute_info['hProcess']
    return hproc

def wait_and_close_handle(hproc):
    WaitForSingleObject(hproc, -1)
    GetExitCodeProcess(hproc)

def close_cmd(hproc):
    parent_pid = GetProcessId(hproc)
    parent = Process(parent_pid)
    for child in parent.children(recursive=True):
        child.kill()
    parent.kill()
    GetExitCodeProcess(hproc)

def get_logger(filename):  
    formatter = logging.Formatter('%(message)s')
    stream_handler = logging.StreamHandler()
    file_handler = logging.FileHandler(filename=f'{filename}')
    stream_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    logger.setLevel(logging.DEBUG)

def del_logger():
    while logger.hasHandlers():
        logger.removeHandler(logger.handlers[0])


def get_address():
    backend_folder = os.path.abspath("../System/back")
    web3_pending_filter = w3.eth.filter('pending')
    wait_and_close_handle(open_cmd('cmd.exe',f'/c cd {backend_folder} & truffle migrate'))
    transaction_hashes  = w3.eth.getFilterChanges(web3_pending_filter.filter_id)
    TransactionReceipt = [w3.eth.getTransactionReceipt(h) for h in transaction_hashes]
    contractAddrss = TransactionReceipt[0]["contractAddress"]
    accounts = w3.geth.personal.list_accounts()
    return accounts, contractAddrss

def modify(filename, text, replace):
    for line in fileinput.input(filename,inplace=True):
        if text in line:
            line = line.replace(line,replace)
        sys.stdout.write(line)

def set_db_data(user):
    conn = pymysql.connect(host='localhost',user='root',password='homerun1006!',db='blue_auction',charset='utf8')
    curs = conn.cursor()
    sql = ['SET foreign_key_checks = 0;','truncate auction_items;', 'truncate users;', 'truncate bids;','truncate participants;','truncate sellers;','truncate transactions;','truncate highests;','SET foreign_key_checks = 1;','use blue_auction;','DROP EVENT IF EXISTS event_1;']
    for i in sql:
        curs.execute(i)
        conn.commit()
    for i in range(user):
        sql = f'INSERT INTO USERS SET id={i}, pw={i}, balance=100000'
        curs.execute(sql)
        conn.commit()
    curs.close()
    conn.close()

def add_geth_account(user):
    geth_abspath = os.path.abspath("..\\GDCPEA-main\\GDCPEA-Geth-example\\build\\bin\geth.exe") 
    account_len=len(w3.eth.accounts)
    if account_len < user +1:
        for j in range(int(user)):
            w3.geth.personal.new_account('')
    

__all__ = ('open_cmd','close_cmd','wait_and_close_handle')