pragma solidity ^0.4.9;

contract ReportMapping{

    address owner;
    uint public report_seq = 0;

    struct contracts{
        string timeStamp;
        string addr;
    }

    struct reports {
        string appId;
        string version;
        uint operatingSystem;
        uint contract_seq;
        bool storable;
        mapping(uint=>contracts) _contracts;
    }

    mapping(uint=>reports) public _reports;

    event setSucceed(uint report_seq);
    event uploadSucceed(uint contract_seq);

    /*set smart contract owner*/
    function ReportMapping()
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

    /*setting report info of apk*/
    function setInfo(string appId, string version, uint operatingSystem){
        if(msg.sender == owner){
            report_seq++;
            _reports[report_seq].appId = appId;
            _reports[report_seq].version = version;
            _reports[report_seq].operatingSystem = operatingSystem;
            _reports[report_seq].contract_seq = 0;
            _reports[report_seq].storable = true;
            setSucceed(report_seq);
        }
    }

    /*upload contract info of specify report*/
    function upload(uint seq, string time, string addr){
        if(msg.sender == owner && _reports[seq].storable == true) {
            uint tmp = _reports[seq].contract_seq + 1;
            _reports[seq].contract_seq = tmp;
            _reports[seq]._contracts[tmp].timeStamp = time;
            _reports[seq]._contracts[tmp].addr = addr;
            uploadSucceed(tmp);
        }
    }

    /*get contract info of specify report*/
    function getContract(uint seq,uint cseq) constant returns(string,string){
        return (_reports[seq]._contracts[cseq].timeStamp,_reports[seq]._contracts[cseq].addr);
    }

    function getContractSeq(uint seq) constant returns(uint){
        return _reports[seq].contract_seq;
    }

    /*set report info storable*/
    function setStorable(uint reportSeq, bool storable){
        if(msg.sender == owner){
            _reports[reportSeq].storable = storable;
        }
    }
}
