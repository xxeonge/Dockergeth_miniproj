const { web3 } = window
const selectedAddress = web3.eth.defaultAccount  //1~2 현재 엑티브되어있는 메타마스크 계정을 가지고 온다

console.log("selectedAddress: " +selectedAddress); //연결된 계정 확인 로그

$(document).ready(function() {
    const productRegistryContractAddress = '0xd37EBA24BBa140474e93d42DB0C147f819B6ce79'; //스마트컨트랙트 주소
    const productRegistryContractABI = //스마트컨트랙트 ABI 코드
    [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "addressToInfo",
        "outputs": [
          {
            "internalType": "address",
            "name": "addr",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "birth",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "notBefore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "notAfter",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "certificates",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "certhash",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "caPubkey",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "userPubkey",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "del",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "certhash",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "deleteCert",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getCertInfo",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getCertificate",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "hasinfo",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "birth",
            "type": "string"
          }
        ],
        "name": "issue",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "setId",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hash",
            "type": "bytes32"
          }
        ],
        "name": "verification",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "birth",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "nbefore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nafter",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          }
        ],
        "name": "verification2",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]

    $('#itemUploadButton').click(itemUploadButton);
    $('#showTableButton').click(showTable);
    $('#deletecertButton').click(deletecertButton);
    $('#documentVerifyButton').click(documentVerifyButton);
    //$('#Save').click(Save);

	
    $('#contractLink').text(productRegistryContractAddress);
    $('#contractLink').attr('href', 'https://ropsten.etherscan.io/address/' + productRegistryContractAddress);
    
    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }    
    });

	async function showTable() {
    console.time("showTable");  //사용자가 버튼을 누른 순간부터 리스트가 반환될 때까지의 시간
    const Toast = Swal.mixin({
      toast: true,
      position: 'center-center',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
      }})

        if (window.ethereum)
        try {
          const accounts = await ethereum.request({ method: 'eth_requestAccounts' }); //메타마스크와 연결되어있는가
        } catch (err) {
            Toast.fire({
              icon: 'error',
              title: 'Access to your Ethereum account rejected.'
          });
        }
      if (typeof web3 === 'undefined'){
        Toast.fire({
          icon: 'error',
          title: 'Please install MetaMask to access the Ethereum Web3 injected API from your Web browser.'
      });
      }
		let contract = web3.eth.contract(productRegistryContractABI).at(productRegistryContractAddress);
    let account = selectedAddress 
    console.time("callgetCert");  //getCertificate 호출-응답 시간
		contract.getCertificate(function(err, result) {
			if (err){
        Toast.fire({
          icon: 'error',
          title: 'Smart contract call failed :('
      });
      }
			// console.log("certificate: " + result);
      console.timeEnd("callgetCert");

      let toString = result.toString();
      let strArray = toString.split(",");
      let cert_address = strArray[0];
      let name = strArray[1];
      let birth = strArray[2];
      let eff_date = strArray[3];
      let exp_date = strArray[4];
      let cert_id = strArray[5];
      let notBefore = new Date(strArray[3]*1000);
			//console.log("notBefore: " + notBefore);
      let notAfter = new Date(strArray[4]*1000);
			// console.log("notAfter: " + notAfter);
      // console.log("ID: " + strArray[5]);

      $("#myTable").empty();
      if(strArray[1]==''){
        Toast.fire({
          icon: 'error',
          title: 'Your certificate does not exist'
      });
      }
      else{
        console.time("ISuser_cert_info"); //DB에 입력값 전송-완료 시간
        $.ajax({  //db에 입력값 전송
          url: '/usercert',
          async: true,
          type: 'POST',
          data: {
            cert_addr: cert_address,
            eff: eff_date,
            exp: exp_date,
            id: cert_id,
            name: name,
            birth: birth
          },
          dataType: 'json',
          success: function(data){console.log("성공");},
          error: function(data){console.log("오류" + err);}
        });
        console.timeEnd("ISuser_cert_info");
        $('#myTable').append('<table width = "100%"><tr><th rowspan = "6">인증서</th><td>address</td><td>' + strArray[0] + "</td></tr><tr><td>이름</td><td>" + strArray[1] + "</td></tr><tr><td>생년월일</td><td>" + strArray[2] + "</td></tr><tr><td>유효기간(시작)</td><td>" + notBefore  + "</td></tr><tr><td>유효기간(끝)</td><td>" + notAfter + "</td></tr><tr><td>ID</td><td>" + strArray[5] + '</td></tr></table>' );
      }
      console.timeEnd("showTable");
		});
  }
    
    async function itemUploadButton() {
      console.time('submit');
      const Toast = Swal.mixin({
        toast: true,
        position: 'center-center',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }})
      if (window.ethereum)
        try {
          await window.ethereum.enable(); //메타마스크와 연결되어있는가
        } catch (err) {
            Toast.fire({
              icon: 'error',
              title: 'Access to your Ethereum account rejected.'
          });
        }
      if (typeof web3 === 'undefined'){
        Toast.fire({
          icon: 'error',
          title: 'Please install MetaMask to access the Ethereum Web3 injected API from your Web browser.'
      });
      }
        
      let account = selectedAddress 
      //console.log("my account: " , account);
      let userName = $("#usname").val();
      //console.log("userName: " , userName);
      let birth = $("#usbirth").val();
      //console.log("userBirth: " , birth);

      let contract = web3.eth.contract(productRegistryContractABI).at(productRegistryContractAddress);

      console.time('callhasInfo');
      contract.hasinfo(function(err,result){
        if (result == true){
          Toast.fire({
            icon: 'error',
            title: 'Your certificate already exists'
        });
        }
        else{
          console.timeEnd('callhasInfo');
          console.time('ISuser_info');
          $.ajax({  //db에 입력값 전송
            url: '/userinfo',
            async: true,
            type: 'POST',
            data: {
              name: userName,
              birth: birth,
              addr: account
            },
            dataType: 'json',
            success: function(data){console.log("성공");},
            error: function(data){console.log("오류" + err);}
          });
          console.timeEnd('ISuser_info');
          console.time('callissue');
          contract.issue(userName, birth, function(err, result) {
            if (err){
              Toast.fire({
                icon: 'error',
                title: 'Smart contract call failed :('
              });
            }
            else{
              Toast.fire({
                icon: 'success',
                title: 'Document successfully added to the registry.'
              });
            }
          });
          console.timeEnd('callissue');
          console.timeEnd('submit');
        }
      })    
    }

    async function deletecertButton(){
      console.time('delete');
      const Toast = Swal.mixin({
        toast: true,
        position: 'center-center',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }})
      if (window.ethereum)
        try {
          await window.ethereum.enable(); //메타마스크와 연결되어있는가
        } catch (err) {
            Toast.fire({
              icon: 'error',
              title: 'Access to your Ethereum account rejected.'
          });
        }
      if (typeof web3 === 'undefined'){
        Toast.fire({
          icon: 'error',
          title: 'Please install MetaMask to access the Ethereum Web3 injected API from your Web browser.'
      });
      }
      let account = selectedAddress 
      console.log("account: " , account);
      let contract = web3.eth.contract(productRegistryContractABI).at(productRegistryContractAddress);
      contract.hasinfo(function(err,result){
        if(result == false){
          Toast.fire({
            icon: 'error',
            title: 'Your certificate does not exist'
          });
        }
        else{
          console.time('delDB_data')
          $.ajax({  //db에 입력값 전송
            url: '/delete',
            async: true,
            type: 'DELETE',
            data: {
              addr: account
            },
            dataType: 'json',
            success: function(data){console.log("성공");},
            error: function(data){console.log("오류" + err);}
          });
        }
        console.timeEnd('delDB_data');
        console.time('callDeleteCert');
        contract.deleteCert(function(err, result){
          Toast.fire({
            icon: 'success',
            title: 'your certification is successfully revoked'
          });
        })
        console.timeEnd('callDeleteCert');
        console.timeEnd('delete');
      })
    }

    async function documentVerifyButton() {
      const Toast = Swal.mixin({
        toast: true,
        position: 'center-center',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }})
      if (window.ethereum)
        try {
          await window.ethereum.enable(); //메타마스크와 연결되어있는가
        } catch (err) {
            Toast.fire({
              icon: 'error',
              title: 'Access to your Ethereum account rejected.'
          });
        }
      if (typeof web3 === 'undefined'){
        Toast.fire({
          icon: 'error',
          title: 'Please install MetaMask to access the Ethereum Web3 injected API from your Web browser.'
      });
      }
      let contract = web3.eth.contract(productRegistryContractABI).at(productRegistryContractAddress);
      let name = $("#vname").val();
  		let birth = $("#vbirth").val();
      let notBefore = $("#vnotB").val();
  		let notAfter = $("#vnotA").val();
      let id = $("#vcertId").val();
      
      contract.verification2(name,birth,notBefore,notAfter,id,function(err,result){
        if (err){
          Toast.fire({
            icon: 'error',
            title: 'Smart contract call failed :('
          });
        }
        else if (result == true){
          Toast.fire({
            icon: 'success',
            title: 'The certificate you submitted has been validated.'
        });
      }
        else if (result == false){
          Toast.fire({
            icon: 'error',
            title: 'The certificate you submitted is not valid.'
        });
      }
    });
  };
});