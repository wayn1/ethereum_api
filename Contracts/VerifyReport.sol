pragma solidity ^0.4.9;

contract VerifyReport{

    event succeed(uint seq);

    address owner;
    uint public seq = 0;
    bool storable = true;
    struct data {
        string addr;
    }

    mapping(uint=>data) public datas;

    /*set smart contract owner*/
    function VerifyReport()
    {
        owner = msg.sender;
    }

    /*kill this smart contract*/
    function kill()
    {
        if (msg.sender == owner)
        {
            suicide(owner);
        }
    }

    /*storing transaction addr into smart contract*/
    function uploadData(string tx) returns(string){
        if(msg.sender == owner && storable) {
            seq++;
            datas[seq].addr = tx;
            succeed(seq);
            return datas[seq].addr;
        }
    }

    /*set storable false*/
    function IsStorable() returns(string){
        storable = false;
        return 'UnStorable..';
    }

}
