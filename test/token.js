var Token = artifacts.require("./ZilliqaToken.sol");
var BigNumber = require('bignumber.js');
var Helpers = require('./helpers.js');

////////////////////////////////////////////////////////////////////////////////

var tokenContract;

var tokenOwner;
var tokenAdmin;

var tokenOwnerAccount;
var nonOwnerAccount;

var totalSupply = web3.toWei( new BigNumber(12600000000), "ether" );

var erc20TokenContract;

////////////////////////////////////////////////////////////////////////////////
// tests are currently broken

contract('token contract', function(accounts) {

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });

  it("mine one block to get current time", function() {
    return Helpers.sendPromise( 'evm_mine', [] );
  });

  it("deploy token and init accounts", function() {
    tokenOwner = accounts[0];
    tokenAdmin = accounts[1];
    
    var currentTime = web3.eth.getBlock('latest').timestamp;

    return Token.new(tokenAdmin, totalSupply, {from: tokenOwner}).then(function(result){
      tokenContract = result;
      
      // check total supply
      return tokenContract.totalSupply();        
    }).then(function(result){
      assert.equal(result.valueOf(), totalSupply.valueOf(), "unexpected total supply");
    });
  });
  
  it("transfer before transfer start time", function() {
    var value = new BigNumber(5);
    return tokenContract.transfer(accounts[2], value, {from:tokenOwner}).then(function(){
        // get balances
        return tokenContract.balanceOf(tokenOwner);
      }).then(function(result){
        assert.equal(result.valueOf(), totalSupply.minus(value).valueOf(), "unexpected balance");
        return tokenContract.balanceOf(accounts[2]);
      }).then(function(result){
        assert.equal(result.valueOf(), value.valueOf(), "unexpected balance");    
      });
  });

  it("transfer from owner when transfers started", function() {
    var value = new BigNumber(5);
    return tokenContract.transfer(accounts[2], value, {from:tokenOwner}).then(function(){
        // get balances
        return tokenContract.balanceOf(tokenOwner);
      }).then(function(result){
        assert.equal(result.valueOf(), totalSupply.minus(value.mul(2)).valueOf(), "unexpected balance");
        return tokenContract.balanceOf(accounts[2]);
      }).then(function(result){
        assert.equal(result.valueOf(), value.mul(2).valueOf(), "unexpected balance");    
      });
  });

  it("transfer from non owner when transfers started", function() {
    var value = new BigNumber(5);
    return tokenContract.transfer(accounts[1], value, {from:accounts[2]}).then(function(){
        assert.fail("transfer is during sale is expected to fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom non owner when transfers started", function() {
    var value = new BigNumber(5);
    return tokenContract.approve(accounts[5], value, {from:accounts[2]}).then(function(){
        return tokenContract.transferFrom(accounts[2],accounts[3],value,{from:accounts[5]});
    }).then(function(){
        assert.fail("transfer from should fail in token sale");  
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
        // revert approve
        return tokenContract.approve(accounts[5], new BigNumber(0), {from:accounts[2]});
    });
  });
  
  it("transfer more than balance", function() {
    var value = new BigNumber(101);
    return tokenContract.transfer(accounts[8], value, {from:accounts[7]}).then(function(){
        assert.fail("transfer should fail");                
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer to address 0", function() {
    var value = new BigNumber(1);
    return tokenContract.transfer("0x0000000000000000000000000000000000000000", value, {from:accounts[7]}).then(function(){
        assert.fail("transfer should fail");                
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer to token contract", function() {
    var value = new BigNumber(1);
    return tokenContract.transfer(tokenContract.address, value, {from:accounts[7]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer - see that balance changes", function() {
    var value = new BigNumber(60);
    return tokenContract.transfer(accounts[8], value, {from:accounts[7]}).then(function(){
        return tokenContract.balanceOf(accounts[7]);
    }).then(function(result){
        assert.equal(result.valueOf(), new BigNumber(40).valueOf(), "unexpected balance");
        return tokenContract.balanceOf(accounts[8]);
    }).then(function(result){
        assert.equal(result.valueOf(), new BigNumber(60).valueOf(), "unexpected balance");    
    });
  });
  
  it("approve more than balance", function() {
    var value = new BigNumber(180);
    return tokenContract.approve(accounts[9], value, {from:accounts[8]}).then(function(){
        return tokenContract.allowance(accounts[8],accounts[9]);
    }).then(function(result){
        assert.equal(result.valueOf(), value.valueOf(), "unexpected allowance");
    });
  });

  it("transferfrom more than balance", function() {
    var value = new BigNumber(180);  
    return tokenContract.transferFrom(accounts[8], accounts[7], value, {from:accounts[9]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom to address 0", function() {
    var value = new BigNumber(10);  
    return tokenContract.transferFrom(accounts[8], "0x0000000000000000000000000000000000000000", value, {from:accounts[9]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom to token contract", function() {
    var value = new BigNumber(10);  
    return tokenContract.transferFrom(accounts[8], tokenContract.address, value, {from:accounts[9]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom", function() {
    var value = new BigNumber(10);  
    return tokenContract.transferFrom(accounts[8], accounts[6], value, {from:accounts[9]}).then(function(){
        // check balance was changed
        return tokenContract.balanceOf(accounts[6]);
    }).then(function(result){
        assert.equal(result.valueOf(), value.valueOf(), "unexpected balance");
        return tokenContract.balanceOf(accounts[8]);
    }).then(function(result){
        assert.equal(result.valueOf(), (new BigNumber(50)).valueOf(), "unexpected balance");
        
        // check allwance was changed
        return tokenContract.allowance(accounts[8],accounts[9]);
    }).then(function(result){
        assert.equal(result.valueOf(), (new BigNumber(170)).valueOf(), "unexpected allowance");
    });
  });

  it("burn - see that balance and total supply changes", function() {
    var value = new BigNumber(4);
    return tokenContract.burn(value, {from:accounts[6]}).then(function(){
        return tokenContract.balanceOf(accounts[6]);
    }).then(function(result){
        assert.equal(result.valueOf(), new BigNumber(6).valueOf(), "unexpected balance");
        // check total supply
        return tokenContract.totalSupply();
    }).then(function(result){
        assert.equal(result.valueOf(), (totalSupply.minus(value)).valueOf(), "unexpected balance");
        totalSupply = totalSupply.minus(value);    
    });
  });

  it("burn - burn more than balance should fail", function() {
    var value = new BigNumber(14);
    return tokenContract.burn(value, {from:accounts[6]}).then(function(){
        assert.fail("burn should fail");    
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });
  
  it("transfer from owner when transfers started", function() {
    var value = new BigNumber(100);
    return tokenContract.transfer(accounts[5], value, {from:tokenOwner});
  });

  it("burn from", function() {
    var value = new BigNumber(50);
    return tokenContract.approve(accounts[3], value, {from:accounts[5]}).then(function(){
        return tokenContract.burnFrom(accounts[5], value, {from:accounts[3]});
    }).then(function(){
        // check accounts[5] balance was reduced
        return tokenContract.balanceOf(accounts[5]);
    }).then(function(result){
        assert.equal(result.valueOf(), (new BigNumber(50)).valueOf(), "unexpected balance");
        
        // check total supply was reduced
        return tokenContract.totalSupply();
    }).then(function(result){
        assert.equal(result.valueOf(), totalSupply.minus(50), "unexpected total supply");
        totalSupply = totalSupply.minus(50);
    });
  });

  it("mine one block to get current time", function() {
    return Helpers.sendPromise( 'evm_mine', [] );
  });

  it("deploy token and init accounts", function() {
    var currentTime = web3.eth.getBlock('latest').timestamp;

    return Token.new(tokenAdmin, totalSupply, {from: accounts[5]}).then(function(result){
      erc20TokenContract = result;
      return erc20TokenContract.transfer(tokenContract.address,new BigNumber(1),{from:accounts[5]});
    }).then(function(){
      // check balance
      return erc20TokenContract.balanceOf(tokenContract.address);
    }).then(function(result){
      assert.equal(result.valueOf(),(new BigNumber(1)).valueOf(), "unexpected balance" );          
    });
  });

  it("try to drain contract from non-admin address", function() {
    return tokenContract.emergencyERC20Drain( erc20TokenContract.address, new BigNumber(1), {from:tokenOwner}).then(function(result){
    }).then(function(){
        assert.fail("burn should fail");    
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("try to drain contract from admin address", function() {
    return tokenContract.emergencyERC20Drain( erc20TokenContract.address, new BigNumber(1), {from:tokenAdmin}).then(function(result){
    }).then(function(){
        return erc20TokenContract.balanceOf(tokenAdmin);
    }).then(function(result){
        assert.equal(result.valueOf(), (new BigNumber(1)).valueOf(), "unexpected admin balance");
    });
  });
});
