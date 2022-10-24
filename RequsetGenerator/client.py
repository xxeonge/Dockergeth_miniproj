
import os
import socket
import ast
from eth_account import Account
import asyncUtils
from web3 import HTTPProvider, Web3
import asyncio
import solcx

w3 = Web3(HTTPProvider("http://127.0.0.1:30304"))

#set server ip&port
HOST = '192.168.0.14'
PORT = 9999
client_socket = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
client_socket.connect((HOST, PORT))

test_type = "Blockchain"
clients = [25,50,100]
timescale = 504
repetition = 1


genesis_abspath = os.path.abspath("..\\Geth\\genesis.json")
r = 1

for client in clients:

    for i in range(repetition):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        message = f'Info:{client}:{timescale}:{r}:{test_type}'
        client_socket.send(message.encode())

        while True:     
            data= client_socket.recv(1024)
            if "len" in data.decode():
                print(data.decode())
                length = int(data.decode().split(":")[1])
                buf = b''
                try:
                    step = length
                    while True:
                        data = client_socket.recv(step)
                        buf += data
                        if len(buf) == length:
                            break
                        elif len(buf) < length:
                            step = length - len(buf)
                except Exception as e:
                    print(e)
                print(buf)
                accounts = buf.decode().split(":")[1]
                accounts = ast.literal_eval(accounts)
                async def modify_log(test_type,client,timescale,r):
                    await asyncUtils.modify_log(test_type,client,timescale,r)
                loop.run_until_complete(modify_log(test_type,client,timescale,r))

                box_contract_address = buf.decode().split(":")[2]
                async def start_experiment(test_type,accounts,boxContractAddress,timescale):
                    await asyncUtils.start_experiment(test_type,accounts,boxContractAddress,timescale)
                print("start Experiment")        
                loop.run_until_complete(start_experiment(test_type,accounts,box_contract_address,timescale))
                break
    


