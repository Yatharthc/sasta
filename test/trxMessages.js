const TRXMessages = artifacts.require("TRXMessages.sol");
const Web3 = require('web3');
const BigNumber = require('big-number');
const maxGasPerBlock = 6700000;

contract('TRXMessages', function(accounts) 
{
  const new_web3 = new Web3(web3.currentProvider);
  let trxMessagesInstance;
  let trxMessagesContract;
  
  const testPost = "Yo, yo.";

  beforeEach(async () =>
  {
    trxMessagesInstance = await TRXMessages.new();
    trxMessagesContract = new new_web3.eth.Contract(trxMessagesInstance.abi, trxMessagesInstance.address);
  });

  it("should deploy", async () =>
  {});

  it("should post", async () =>
  {
    await trxMessagesInstance.postMessage(testPost, {value: 1000000});
  });

  it("should get post", async () =>
  {
    await trxMessagesInstance.postMessage(testPost, {value: 1000000});
    assert.equal((await trxMessagesInstance.messages(0))[1], testPost);
  });

  it("should tip", async () =>
  {
    await trxMessagesInstance.postMessage(testPost, {value: 1000000, from: accounts[1]});
    const balanceBefore = new BigNumber(await new_web3.eth.getBalance(accounts[1]));
    await trxMessagesInstance.tipMessage(0, {value: 420});
    const balanceAfter = new BigNumber(await new_web3.eth.getBalance(accounts[1]));

    assert.equal(balanceAfter.minus(balanceBefore).toString(), Math.ceil(420 * .99));
  });

  it("should enforce owner only", async () =>
  {
    try
    {
      await trxMessagesInstance.withdraw({from: accounts[1]});
    }
    catch(error)
    {
      return;
    }

    assert.fail();
  });

  it.only("should allow owner withdraw", async () =>
  {
    await trxMessagesInstance.postMessage(testPost, {value: 1000000, from: accounts[1]});
    await trxMessagesInstance.tipMessage(0, {value: 420, from: accounts[2]});
    
    const balanceBefore = new BigNumber(await new_web3.eth.getBalance(accounts[0]));
    const tx = await trxMessagesInstance.withdraw({from: accounts[0]});
    const txInfo = await new_web3.eth.getTransaction(tx.tx);
    const balanceAfter = new BigNumber(await new_web3.eth.getBalance(accounts[0]));
    
    const gas = tx.receipt.gasUsed * txInfo.gasPrice;
    console.log(gas);
    assert.equal(balanceAfter.minus(balanceBefore).toString(), 1000000 + Math.floor(420 * .01) - gas);    
  });
});