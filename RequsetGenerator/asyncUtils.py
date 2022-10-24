from time import sleep
import Experiment


async def transferBasicMoney(w3, client):
    eth = w3.eth.get_balance(w3.eth.coinbase)
    print("Wait mining")
    while eth < w3.toWei(client*10, 'ether'):
        sleep(60)
        eth = w3.eth.get_balance(w3.eth.coinbase)
    print("startsend")

    accounts = w3.geth.personal.list_accounts()
    for i in range(1, client+1):
        w3.geth.personal.unlockAccount(accounts[i], 'pwd', 0)
        w3.eth.send_transaction({
           'to': accounts[i],
           'from': w3.eth.coinbase,
           'value': w3.toWei(10, 'ether')
       }
       )


async def start_experiment(type, accounts, boxContractAddress, timescale):
    Experiment.startExperiment(type, accounts, boxContractAddress, timescale)
