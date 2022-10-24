# GDCPEA for blockchain performance evaluation
Geographically Distributed Cloud Performance Evaluation Ambassador (GDCPEA) is a concept to evaluate the time-related performance of blockchain services in a cloud environment where nodes constituting the bockchain network are geographically distributed. The GDCPE Log Server writes a timestamp log to the disk, including an arbitrary log message delivered by the GDCPE Ambassador and the time when the log record request was received.

Therefore, in order to measure the processing time of a certain internal service of a blockchain node, the GDCPE Ambassador is inserted before and after the corresponding service code area of the blockchain client, and eventually the elapsed time can be obtained from the timestamp logs recorded by the GDCPE Log Server.

<img src="https://github.com/tykim0402/GDCPEA/blob/main/GDCPEAmbassador.jpg?raw=true" width="750" height="400"> 
<br>

# GDCPE Log Server
The GDCPE Log Server is the TCP Socket server written in Go, and the source code is in the `log-server` directory.  
<br>
A part of the entire source code:
```go
func ConnHandler(conn net.Conn, fo *os.File){

        scanner := bufio.NewScanner(conn)

        defer conn.Close()

        for{
                ok := scanner.Scan()
                if !ok {
                        break
                }
		
		//The timestamp is recored in microseconds.
                t := time.Now().UnixNano()/1000
                s := strconv.FormatInt(t,10)+","+scanner.Text()+"\n"
                
								_, err := fo.Write([]byte(s))
                if err != nil {
	                log.Println(err)
						    }
        }
}
```
The GDPEA Log Server is listening on a dedicated port for the log recording reqeust from the GDCPE Ambassador, and when the request occurs, a log message and a timestamp in microseconds are recorded.
<br>

# GDCPE Ambassador
The GDCPE Ambassador is the TCP Socket client written in Go, and the source code is in the `ambassador` directory.  
<br>
A part of the entire source code:
```go
func ConnLogServer() (error) {

	//You should insert the log server's IP address directly on the code or map it to the DNS address within the host file.
        conn, err = net.Dial("tcp", "logServer:9617")
        if nil != err{
                fmt.Println("GDCPE Log Server connection error")
        }
        hostName, err = os.Hostname()

        return err
}
func WriteEvalLog(msgFromGDCPEA string) (error) {
        conn.Write([]byte(hostName+msgFromGDCPEA+"\n"))
        return nil
}
```
> Note: Since we focused on evaluating the performance of Go-ethereum (Geth), we provide a GDCPE Ambassador that can be used as a Go module.

With the start of the Geth client, call the ConnLogServer() to establish a socket connection, and then call WriteEvalLog() whenever it is required to request a timestamp log recording. 

Import GDCPEA module:
```angular2
GDCPEA "github.com/AMKN-SEC/GDCPEA/ambassador"
```

<br>

The log message format can be an arbitrary string. We created a message string by dividing several items into commas as follows:
```angular2
[Geth operation],[sender address],[Tx hash(block TxRootHash)],[block number]
```
<br>

## Inserting GDCPEA into the Geth source code
The table below is an example of inserting a GDCPEA into the Geth source code to record timestamp log of Geth main operation related to block(_mining block, propagating block, verifying block, writing block_), transaction(_committing transaction, sending tranaction_), and account balance(_checking balance_).
The Geth source code in the `GDCPE_Geth_example` directory is a modified version with such a GDCPEA code inserted. ([The original Geth source code](https://github.com/ethereum/go-ethereum.git))

| Action | File Path | GDCPEA Code / Log Message (Example) |
| --- | --- | --- |
| make a socket connection to a GDCPE Log Server | cmd/geth/main.go | GDCPEA.ConnLogServer() |
| mining block | miner/worker.go | GDCPEA.WriteEvalLog(",mining block,null,"+task.block.TxHash().String()+","+strconv.FormatUint(task.block.NumberU64(),10)) |
| mined block | consensus/ethash/sealer.go | GDCPEA.WriteEvalLog(",mined block,"+strconv.FormatInt(attempts,10)+","+block.TxHash().String()+","+strconv.FormatUint(number,10)) |
| propagating block | eth/handler.go | GDCPEA.WriteEvalLog(",propagating block,null,"+ev.Block.TxHash().String()+","+strconv.FormatUint(ev.Block.NumberU64(),10)) |
| propagating received block | eth/fetcher/block_fetcher.go | GDCPEA.WriteEvalLog(",propagating received block,null,"+block.Header().TxHash.String()+","+strconv.FormatUint(block.Header().Number.Uint64(),10)) |
| received block | eth/protocols/eth/handlers.go | GDCPEA.WriteEvalLog(",received block,null,"+ann.Block.TxHash().String()+","+strconv.FormatUint(ann.Block.NumberU64(),10)) |
| verifying header | consensus/ethash/consensus.go | GDCPEA.WriteEvalLog(",verifying header,null,"+header.TxHash.String()+","+strconv.FormatUint(header.Number.Uint64(),10)) |
| verified header | consensus/ethash/consensus.go | GDCPEA.WriteEvalLog(",verified header,null,"+header.TxHash.String()+","+strconv.FormatUint(header.Number.Uint64(),10)) |
| verifying body | core/block_validator.go | GDCPEA.WriteEvalLog(",verifying body,null,"+block.TxHash().String()+","+strconv.FormatUint(block.NumberU64(),10)) |
| verified body | core/block_validator.go | GDCPEA.WriteEvalLog(",verified body,null,"+block.TxHash().String()+","+strconv.FormatUint(block.NumberU64(),10)) |
| writing block | core/blockchain.go | GDCPEA.WriteEvalLog(",writing block,null,"+block.TxHash().String()+","+strconv.FormatUint(block.NumberU64(),10)) |
| wrote block | core/blockchain.go | GDCPEA.WriteEvalLog(",wrote block,null,"+block.TxHash().String()+","+strconv.FormatUint(block.NumberU64(),10)) |
| committing transaction | core/state_processor.go | GDCPEA.WriteEvalLog(",committing transaction,"+msg.From().String()+","+tx.Hash().String()+",null") |
| committed transaction | core/state_processor.go | GDCPEA.WriteEvalLog(",committed transaction,"+msg.From().String()+","+tx.Hash().String()+",null") |
| checking balance | internal/ethapi/api.go | GDCPEA.WriteEvalLog(",checking balance,"+address.String()+",null,null") |
| checked balance | core/state/state_object.go | GDCPEA.WriteEvalLog(",checked balance,"+s.address.String()+",null,null") |
| sending transaction | internal/ethapi/api.go | GDCPEA.WriteEvalLog(",sending transaction,"+args.From.String()+",null,null") |
| transaction hash | internal/ethapi/api.go | GDCPEA.WriteEvalLog(",transaction hash,"+args.From.String()+","+signed.Hash().String()+",null") |
| sent transaction | internal/ethapi/api.go | GDCPEA.WriteEvalLog(",sent transaction,null,"+tx.Hash().String()+",null") |

- The GDCPE Ambassador can be inserted in any Geth internal source code.
- In some cases, `strconv` module may need to be additionally imported. (e.g., convert the uint64 type block number to string type)
<br>

### GDCPEA dataset example
We conducted the performance evaluation experiment of Geth clients distributed in two AWS regions (seoul, ohio) by inserting GDCPA into Geth as above description.  
We deployed different numbers of nodes and clients in each scenario in terms of varying the Geth node composition.  

Experimental dataset: [![DOI: 10.21227/b7mg-yb75](https://zenodo.org/badge/doi/10.21227/b7mg-yb75.svg)](https://dx.doi.org/10.21227/b7mg-yb75)
