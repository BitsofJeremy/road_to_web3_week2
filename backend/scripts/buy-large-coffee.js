// scripts/buy-coffee.js

const hre = require("hardhat");

// Returns the Ether balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx ++;
  }
}

// Logs the memos stored on-chain from coffee purchases.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
  }
}

async function main() {
  // Get the example accounts we'll be working with.
  const [owner, smallTipper, largeTipper, withdrawer] = await hre.ethers.getSigners();

  // We get the contract to deploy.
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();

  // Deploy the contract.
  await buyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to:", buyMeACoffee.address);

  // Check balances before the coffee purchase.
  const addresses = [owner.address, smallTipper.address, largeTipper.address, withdrawer.address, buyMeACoffee.address];
  console.log("== start ==");
  await printBalances(addresses);

    // Buy regular coffee
  smallCoffee =  {value: hre.ethers.utils.parseEther("0.01")};
  await buyMeACoffee.connect(smallTipper).buyCoffee("Bob", "I like turtles.", smallCoffee);

  // Buy the owner a few Large coffees.
  const largeCoffee = {value: hre.ethers.utils.parseEther("0.03")};
  await buyMeACoffee.connect(largeTipper).buyLargeCoffee("Carolina", "You're the best!", largeCoffee);


  // Check balances after the coffee purchase.
  console.log("== bought coffee ==");
  await printBalances(addresses);

  // Change withdraw address to withdrawer
  console.log("== Change withdraw address ==");
  await buyMeACoffee.connect(owner).changeWithdrawAddress(withdrawer.address);

  // Withdraw.
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balances after withdrawal.
  console.log("== withdrawTips ==");
  await printBalances(addresses);

  // Check out the memos.
  console.log("== memos ==");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
