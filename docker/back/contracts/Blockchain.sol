pragma solidity ^0.8.12; //truffle solidity version
                                                            
contract BlockchainAuction{

    struct auction{
        address payable owner;              //경매 개최자(판매자),
        address theBidWinner;               //낙찰자
        uint DBID;                          //디비 아이디
        uint theWinningBid;                 //최종 낙찰가
    }

    uint  public auctionEnd;                //경매 종료 시간
    address public highestBidder;              //경매 현재 최고가
    uint public highestBids;                //경매 현재 최고가 제시자

    auction a;                            

    mapping(address=>uint) public deposit;        //보증금 매핑
    mapping(address=>uint) public bids;           //비드 매핑

    bool locked;                                  //mutex

    modifier noReentrancy(){
        require(!locked,"Reentrant call");
        locked = true;
        _;
        locked= false;
    }

    event LogBid(address bidder, uint bid);

    //생성자, AuctionBox.createAuction()를 통해 호출됨,auction 구조체의 owner 및 DBID 저장
    //bidding time은 유닉스타임으로 보내줄 것!!
    constructor(address payable _owner,uint _dbid, uint _biddingTime) {
        a.owner = _owner;
        a.DBID = _dbid;
        auctionEnd = _biddingTime;
    }

    //보증금 함수, sender 정보를 value 정보와 매핑(deposit)
    function receiveDeposit() public payable {
        require(block.timestamp <= auctionEnd, "The auction has been closed.");
        deposit [msg.sender] = msg.value;
    }
    
    function bid(uint _bid) public{
        require(block.timestamp <= auctionEnd, "The auction has been closed.");
        require(_bid> highestBids, "It's smaller than the highestBids.");
        require(deposit[msg.sender]>0,"You didn't pay the deposit.");
        bids[msg.sender] = _bid;
        highestBidder = msg.sender;
        highestBids = _bid;
        emit LogBid(msg.sender, _bid);
    }

    // 낙찰 함수, auction 구조체에의 남은 부분(theBidWinner,theWinningBid)를 저장 및 owner에게 최종낙찰가 전송
    // successfulBidTransfered 이벤트 호출, 해당 auction의 주소, 누가(from) 누구에게(to) 얼마(amount)를 전송하였는지 기록
    // highestBids를 value로 해서 보내줄 것
    function successfulBid()public payable{
        require(block.timestamp > auctionEnd, "The auction don't close.");
        require(msg.sender==highestBidder,"You not highestBidder");
        require(msg.value == highestBids, "Send a different amount from the winning bid");
        require(a.theWinningBid==0,"You've already make a successful bid");
        a.theBidWinner = msg.sender;
        a.theWinningBid = highestBids;
        a.owner.transfer(highestBids);
    }

    //보증금 환불 함수, msg.sender에게 보증금 환불 (transfer 후, deposit[msg.sender]=0으로 변경)
    //refundedDespoit 이벤트 호출, 해당 auction의 주소, 얼마(amount)를 전송하였는지 기록
    function refundDeposit() public payable{
        require(block.timestamp >=auctionEnd, "The auction don't close.");
        require(deposit[msg.sender]>0,"You've already received Ether");
        uint value = deposit[msg.sender];
        deposit[msg.sender]=0;
        payable(msg.sender).transfer(value);
    }

}

contract BlockchainBox{
    event AuctionCreated(BlockchainAuction auctionContract, uint dbid);
 
    //auction contract 호출 함수
    //AuctionCreated 이벤트 호출, 생성된 auction 주소, dbid 기록
    //bidding time은 유닉스타임으로 보내줄 것!!
    function createAuction(uint _dbid, uint _biddingTime) public returns(BlockchainAuction){
        BlockchainAuction newAuction = new BlockchainAuction(payable(msg.sender),_dbid,_biddingTime);
        emit AuctionCreated(newAuction,_dbid);
        return newAuction;
    }
}
