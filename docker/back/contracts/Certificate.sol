pragma solidity >=0.4.22 <0.9.0;

contract Certificate {
    struct userinfo{
        address addr; 
        string name; 
        string birth; 
        uint notBefore; 
        uint notAfter; 
        bytes32 id;
    }
    struct cert {
        bytes32 certhash;
        address caPubkey;
        address userPubkey;
    }
    
    struct deleteInfo{
        bytes32 certhash;
    }
    
    bytes32 certhash;
    address addr;
    uint notBefore;
    uint notAfter;
    
    constructor() public  {
        addr = msg.sender;
    }
    
    mapping(address => userinfo) public addressToInfo;
    mapping(address => cert) public certificates;
    deleteInfo[] public del;
    
    
    function hasinfo() public view returns(bool){
        if(addressToInfo[msg.sender].id == 0 ){
            return false;
        }
        return true;
    }
    
    function setTime() private {
        notBefore = block.timestamp;
        notAfter = notBefore + 365 days;
    }
    
    function newUserInfo(string memory name, string memory birth) private {
        addressToInfo[msg.sender].addr = msg.sender;
        addressToInfo[msg.sender].name = name;
        addressToInfo[msg.sender].birth = birth;
        addressToInfo[msg.sender].notBefore = notBefore;
        addressToInfo[msg.sender].notAfter = notAfter;
        addressToInfo[msg.sender].id = setId();
        
        certhash = keccak256(userinfoToBytes(addressToInfo[msg.sender]));
    }
    
    function userinfoToBytes(userinfo memory u) private returns (bytes memory data){
        uint _size = 116 + bytes(u.name).length + bytes(u.birth).length;
        bytes memory _data = new bytes(_size);
        
        uint counter = 0;
        bytes memory baddr = abi.encodePacked(u.addr);
        bytes memory bBefore = abi.encodePacked(u.notBefore);
        bytes memory bAfter = abi.encodePacked(u.notAfter);
        bytes memory bId = abi.encodePacked(u.id);
        for (uint i = 0; i < 20; i++){
            _data[counter] = bytes(baddr)[i];
            counter++;
        }
        for (uint i = 0; i < bytes(u.name).length; i++){
            _data[counter] = bytes(u.name)[i];
            counter++;
        }
        for (uint i = 0; i < bytes(u.birth).length; i++){
            _data[counter] = bytes(u.birth)[i];
            counter++;
        }
        for (uint i = 0; i < 32; i++){
            _data[counter] = bytes(bBefore)[i];
            counter++;
        }
        for (uint i = 0; i < 32; i++){
            _data[counter] = bytes(bAfter)[i];
            counter++;
        }
        for (uint i = 0; i < 32; i++){
            _data[counter] = bytes(bId)[i];
            counter++;
        }
        
        return _data;
    }
    
    function setId() public view returns(bytes32){
        return keccak256(abi.encodePacked(block.timestamp, msg.sender));
    }
    
    function newCert() private {
        certificates[msg.sender].caPubkey = 0xCcB8F0A7581075b74F74cfb1E4aB6fa822FACFac;
        certificates[msg.sender].userPubkey = msg.sender;
        certificates[msg.sender].certhash = certhash;
    }
    
    function getCertificate() public view returns(address, string memory, string memory, uint, uint, bytes32, address){
        return(addressToInfo[msg.sender].addr, addressToInfo[msg.sender].name, addressToInfo[msg.sender].birth, addressToInfo[msg.sender].notBefore, addressToInfo[msg.sender].notAfter, addressToInfo[msg.sender].id, msg.sender);
    }
    
    function getCertInfo() public view returns(bytes32, address, address){
        return(certificates[msg.sender].certhash, certificates[msg.sender].caPubkey, certificates[msg.sender].userPubkey);
    }
    
    function issue(string memory name, string memory birth) public {
        if(hasinfo() == false){
            setTime();
            newUserInfo(name, birth);
            newCert();
        }
    }

    function verification(string memory name, string memory birth, uint nbefore, uint nafter, bytes32 id) public view returns(bool){
        uint _size = 116 + bytes(name).length + bytes(birth).length;
        bytes memory _data = new bytes(_size);
        
        uint counter = 0;
        bytes memory baddr = abi.encodePacked(msg.sender);
        bytes memory bBefore = abi.encodePacked(nbefore);
        bytes memory bafter = abi.encodePacked(nafter);
        bytes memory bId = abi.encodePacked(id);
        for (uint i = 0; i < 20; i++){
            _data[counter] = bytes(baddr)[i];
            counter++;
        }
        for (uint i = 0; i < bytes(name).length; i++){
            _data[counter] = bytes(name)[i];
            counter++;
        }
        for (uint i = 0; i < bytes(birth).length; i++){
            _data[counter] = bytes(birth)[i];
            counter++;
        }
        for (uint i = 0; i < 32; i++){
            _data[counter] = bytes(bBefore)[i];
            counter++;
        }
        for (uint i = 0; i < 32; i++){
            _data[counter] = bytes(bafter)[i];
            counter++;
        }
        for (uint i = 0; i < 32; i++){
            _data[counter] = bytes(bId)[i];
            counter++;
        }
        
        bytes32 verifyHash = keccak256(_data);
        
        if(verifyHash == certificates[msg.sender].certhash){
            return true;
        }
        else{
            return false;
        }
    }
    
    function deleteCert() public {
        del.push(deleteInfo(certhash));
        delete addressToInfo[msg.sender];
        delete certificates[msg.sender];
    }
}