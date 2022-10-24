
import UserDatabase
import UserHybrid
import UserBlockchain
from threading import Thread

def startExperiment(test_type,accounts,boxContract,timescale):
    thread = []
    if test_type == "Blockchain":
        UserBlockchain.create_auction(0,0,accounts[0],1,timescale,boxContract)
        for j in range(1,len(accounts)):
            thread.append(Thread(target=UserBlockchain.user_action, args=(j,j,accounts[j],j,timescale)))


    elif test_type =="Hybrid":
        UserHybrid.create_auction(0,0,accounts[0],1,timescale,boxContract)
        for j in range(1,accounts):
            for j in range(1,len(accounts)):
                thread.append(Thread(target=UserHybrid.user_action, args=()))            
    elif test_type=="Database":
        UserDatabase.create_auction(0,0,1,timescale)
        for j in range(1,accounts): 
            thread.append(Thread(target=UserDatabase.user_action, args=(j,j,j,timescale)))
                #thread start and join
    for t in thread:
        t.start()
    for t in thread:
        t.join()

