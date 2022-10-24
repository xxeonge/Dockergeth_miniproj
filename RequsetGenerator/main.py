import os
import sys
import solcx
import asyncio
import asyncUtils
import time
from pathlib import Path
from web3 import HTTPProvider, Web3

# solcx.get_installable_solc_versions()
# solcx.install_solc()

w3 = Web3(HTTPProvider("http://localhost:8547"))  # etherNode1

test_type = "Blockchain"
client = int(sys.argv[1])
timescale = 504

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
time.sleep(120)
print("Start send eth",client)
async def transferBasicMoney(w3, client):
    await asyncUtils.transferBasicMoney(w3, client)
loop.run_until_complete(transferBasicMoney(w3, client))
os.chdir('./RequsetGenerator')
if test_type == "Blockchain":
    sol_path = "../docker/back/contracts/Blockchain.sol"
elif test_type == "Hybrid":
    sol_path = "../contract/Hybrid.sol"
solc_abspath = Path(sol_path).resolve()
compiled_sol = solcx.compile_files([solc_abspath], output_values=["abi", "bin-runtime", "bin"])
contract_interface = compiled_sol[f"{solc_abspath}:BlockchainBox"]
contract = w3.eth.contract(abi=contract_interface['abi'], bytecode= contract_interface['bin'])
w3.eth.default_account = w3.eth.coinbase
w3.geth.personal.unlockAccount(w3.eth.coinbase, 'pwd', 0)
tx_hash = contract.constructor().transact()
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
box_contract_address = tx_receipt.contractAddress

print(f'Box Contract Address : {box_contract_address}')
async def start_experiment(test_type, accounts, boxContractAddress,timescale):
    await asyncUtils.start_experiment(test_type, accounts, boxContractAddress,timescale)
print("start Experiment")
loop.run_until_complete(start_experiment(test_type, w3.eth.accounts[1:client+1], box_contract_address,timescale))
print("End Experiment")
w3.geth.miner.stop()
