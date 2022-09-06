import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {ethers} from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  let btcUsdPriceOracleAddress;
  const {deployer} = await getNamedAccounts();
  const chainId = hre.network.config.chainId;
  if (chainId == 31337) {
    const {address} = await ethers.getContract('MockV3Aggregator');
    btcUsdPriceOracleAddress = address;
  } else {
    btcUsdPriceOracleAddress = '0xECe365B379E1dD183B20fc5f022230C044d51404';
  }
  await deploy('BullBear', {
    from: deployer,
    args: [10, btcUsdPriceOracleAddress],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};
export default func;
func.tags = ['Bull&Bear', 'all'];
