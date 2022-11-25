### 필수로 필요한 것
**Docker** & **Docker compose**
### Microsoft store 에서 ubuntu 20.04 wsl 다운로드하여 사용


>Ubuntu 20.04 기준으로 작성되었음

### Docker 설치
```Docker -v``` 명령어 실행 시 오류 발생 시 Docker 설치 필요
#### Docker 설치 과정()

아래의 명령어로 입력하여 스크립트로 docker 설치
```
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Docker compose 설치
``` docker-compose -version```  명령어 실행 시 오류 발생할 경우 docker-compose 설치 필요


### 만약에 도커 실행이 안된다 wls 환경 필수!!
```sudo /etc/init.d/docker start``` 로 도커 실행해주기

#### Docker-compose 설치 과정
```
sudo apt-get update
sudo apt-get install docker-compose-plugin
sudo apt install docker-compose
```

### Docker Geth Node 설치
1. ``` git clone https://github.com/AMKNSEC-LAB/dockerGeth ```으로 git clone 
   (현재 해당 github가 private로 설정되어있어서 git clone에 실패시, 해당 깃에 접속하여 직접 파일 다운로드 하여 사용)
   ***git clone 없이 그냥 wsl 환경으로 dockerGeth 폴더 이동시켜서 사용하면 됨***

2. clone 한 파일 내부에서 start.sh, startWtihServer.sh, request.sh, makeCompseFile.sh, makeNodeIPFile.sh 파일 실행권한 주기
3. RequsetGenerator 폴더에서 pip 설치하기
4. Geth 노드 실행
   1. auction server 없이 geth만 실행 할 경우 ```sudo ./start.sh <Node 개수>```
   2. auction server 같이 geth를 실행 할 경우 ```sudo ./startWinthServer.sh <Node  개수>```
   3. server, request generator 동시 실행하여 테스트 로그 저장할 경우 ```sudo ./request.sh <Node 개수> <client 수> <repeat 수>```

5. 현재 Geth node와 관련된 docker가 백그라운드에서 실행되지 않음, 만약 백그라운드에서 실행되길 원하면, start*.sh 파일 내부에서 ```docker-compose -f geth.docker-compose.yml``` 라인 마지막에 -d 포함하여  start*.sh 파일 실행

ㄴㄴ

### 실험
**$1 : node 개수 $2 : client 수 $3 : repet**
```sudo ./request <node개수> <client 수> <반복횟수>```
현재 하나의 케이스 경우만 반복가능 추후 수정 예정