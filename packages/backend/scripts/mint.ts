import {getUnnamedAccounts, ethers, deployments, network} from 'hardhat';
import {setupUsers} from '../test/utils';
import {BullBear} from '../typechain';
import {MockV3Aggregator} from '../typechain/@chainlink/contracts/src/v0.6/tests/MockV3Aggregator';

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  const tx = await p;
  try {
    await ethers.provider.send('evm_mine', []); // speed up on local network
  } catch (e) {}
  return tx.wait();
}

const setup = async () => {
  if (network.config.chainId == 31337) {
    await deployments.fixture('all');
  }
  const contracts = {
    BullBear: <BullBear>await ethers.getContract('BullBear'),
    MockV3Aggregator: <MockV3Aggregator>await ethers.getContract('MockV3Aggregator'),
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
  };
};

async function main() {
  const {BullBear, users, MockV3Aggregator} = await setup();
  const [user1] = users;

  await user1.BullBear.safeMint(user1.address);
  console.log('user1 has', (await BullBear.balanceOf(user1.address)).toString());
  console.log('before', (await BullBear.currentPrice()).toString());

  await MockV3Aggregator.updateAnswer('1000000000000000000');
  const interval = await BullBear.interval();
  await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
  await network.provider.send('evm_mine');
  await BullBear.performUpkeep([]);

  // await BullBear.getLatestPrice();
  console.log('after', (await BullBear.currentPrice()).toString());
  console.log('user1 NFT#0', (await BullBear.tokenURI(0)).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
