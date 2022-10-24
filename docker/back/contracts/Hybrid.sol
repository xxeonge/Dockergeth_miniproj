pragma solidity ^0.5.16;

contract HybridBox{
    event AuctionCreated(HybridAuction auctionContract, uint dbid);
 
    //auction contract 호출 함수
    //AuctionCreated 이벤트 호출, 생성된 auction 주소, dbid 기록
    function createAuction(uint _dbid) public{
        HybridAuction newAuction = new HybridAuction(msg.sender,_dbid);
        emit AuctionCreated(newAuction,_dbid);
    }
}

contract HybridAuction{

    struct auction{
        address payable owner;              //경매 개최자(판매자),
        address payable theBidWinner;       //낙찰자
        uint DBID;                          //디비 아이디
        uint theWinningBid;                 //최종 낙찰가
    }

    auction public a;                             
    mapping(address=>uint) public deposit;        //보증금 매핑


    //생성자, AuctionBox.createAuction()를 통해 호출됨,auction 구조체의 owner 및 DBID 저장
    constructor(address payable _owner,uint _dbid)public{
        a.owner = _owner;
        a.DBID = _dbid;
    }

    //보증금 함수, sender 정보를 value 정보와 매핑(deposit)
    function receiveDeposit() public payable {
        deposit [msg.sender] = msg.value;
    }

    //낙찰 함수, auction 구조체에의 남은 부분(theBidWinner,theWinningBid)를 저장 및 owner에게 최종낙찰가 전송
    //successfulBidTransfered 이벤트 호출, 해당 auction의 주소, 누가(from) 누구에게(to) 얼마(amount)를 전송하였는지 기록
    function successfulBid()public payable{
        a.theBidWinner = msg.sender;
        a.theWinningBid = msg.value;
        a.owner.transfer(msg.value);
    }

    //보증금 환불 함수, msg.sender에게 보증금 환불 (transfer 후, deposit[msg.sender]=0으로 변경)
    //refundedDespoit 이벤트 호출, 해당 auction의 주소, 얼마(amount)를 전송하였는지 기록
    function refundDeposit() public payable{
        require(deposit[msg.sender]>0,"You've already received Ether");
        uint value = deposit[msg.sender];
        deposit[msg.sender]=0;
        msg.sender.transfer(value);
        
    }
}