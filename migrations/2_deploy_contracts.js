var Token = artifacts.require("./ZilliqaToken.sol");

var tokenContract;

module.exports = function(deployer) {
    var admin = "0x9e389b3b8322C2fAA5F8539E34845455D848d407"; // BTC suisse account address
    var totalTokenAmount = 12.6 * 1000000000 * 1000000000000;

    return Token.new(admin, totalTokenAmount).then(function(result) {
        tokenContract = result;
    });
};
