import {ethers} from "hardhat";

async function main() {

    const dean20 = await ethers.deployContract("Dean20");
    await dean20.waitForDeployment();

    const myERC20 = await ethers.deployContract("MyERC20");
    await myERC20.waitForDeployment();

    console.log(`Contract: Dean20 deployed to ${dean20.target}`);

    console.log(`Contract: MyERC20 deployed to ${myERC20.target}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
