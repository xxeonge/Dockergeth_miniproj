package main

import(
        "log"
        "net"
        "os"
        "time"
        "strconv"
        "strings"
        "bufio"
)

func main() {
	//You should name the log file to save.
        fileName := "file name"
        fo, err := os.Create(fileName)
        if err != nil {
                log.Println(err)
        }
        defer fo.Close()

	//You should set a listening port number
        l, err := net.Listen("tcp", ":1111")
        if nil != err{
                log.Println(err);
        }
        defer l.Close()

        for{
                conn, err := l.Accept()
                if nil!=err{
                        log.Println(err);
                        continue
                }
                go ConnHandler(conn,fo)
        }
}

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
                
		if !strings.Contains(s,"HTTP") {
                        _, err := fo.Write([]byte(s))
                        if err != nil {
                                log.Println(err)
                        }
                }
        }
}
