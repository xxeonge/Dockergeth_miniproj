import UserCertificate

from threading import Thread

def startExperiment(test_type,accounts,contractAddress,timescale):
    thread = []

    if test_type == "Certificate":
        UserCertificate.create_certificate(0,0,accounts[0], timescale, contractAddress)
        for j in range(1,len(accounts)):
            thread.append(Thread(target=UserCertificate.user_action, args=(j,j,accounts[j],timescale, contractAddress)))
    for t in thread:
        t.start()
    for t in thread:
        t.join()

