import {loadFixture,} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";

describe("Normal ERC-20", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployMyERC20() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();

        const MyERC = await ethers.getContractFactory("MyERC20");
        const myERC = await MyERC.deploy();

        return {myERC, owner, otherAccount, otherAccount2};
    }

    describe("Deployment", function () {
        it("Should make sure that the deployment was successful", async function () {
            const {
                owner,
                myERC
            } = await loadFixture(deployMyERC20);

            expect(myERC.target).exist;
        });

        it("Should test all the optional functions", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);

            expect(await myERC.name()).to.be.equal("Dean20");
            expect(await myERC.symbol()).to.be.equal("DTK");
            expect(await myERC.decimals()).to.be.equal(18);
            expect(await myERC.totalSupply()).to.be.equal(1000000);
            const initialOwnerBalance = await myERC.balanceOf(owner.address);
            expect(initialOwnerBalance).to.be.equal(1000000);

        });
    });

    describe("Test Transfer", () => {
        it("Should transfer token successfully", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);

            const amount = 500000;
            const transferTx = await myERC.connect(owner).transfer(otherAccount.address, amount);
            await transferTx.wait();

            const ownerBalance = await myERC.balanceOf(owner.address);
            const otherAccountBalance = await myERC.balanceOf(otherAccount.address);

            expect(ownerBalance).to.be.equal(500000);
            expect(otherAccountBalance).to.be.equal(500000);
            expect(await myERC.totalSupply()).to.be.equal(1000000);
        });
        it("Should emit Transfer event after a successful transfer", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);

            const amount = 500000;

            expect(await myERC.connect(owner).transfer(otherAccount.address, amount))
                .to.emit(myERC, "Transfer")
                .withArgs(owner.address, otherAccount.address, amount);

        });

        it("Should not permit Address Zero to send transaction", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);

            const zeroAddress = "0x0000000000000000000000000000000000000000";
            const zeroSigner = await ethers.provider.getSigner(zeroAddress);

            expect(myERC.connect(zeroSigner).transfer(otherAccount.address, 120000))
                .to.be.revertedWithCustomError(myERC, "ZERO_ADDRESS_NOT_ALLOWED");
        });

        it("Should not permit Address Zero to receive funds", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);

            const zeroAddress = "0x0000000000000000000000000000000000000000";
            const zeroSigner = await ethers.provider.getSigner(zeroAddress);

            expect(myERC.connect(owner).transfer(zeroAddress, 120000))
                .to.be.revertedWithCustomError(myERC, "ZERO_ADDRESS_NOT_ALLOWED");
        });
        it("Total supply should be more or equal to msg.sender balance for transfer to go through ",
            async function () {
                const {
                    myERC,
                    owner,
                    otherAccount
                } = await loadFixture(deployMyERC20);

                expect(myERC.connect(owner).transfer(otherAccount.address, 1200000))
                    .to.be.revertedWithCustomError(myERC, "BALANCE_MORE_THAN_TOTAL_SUPPLY");
            });
    });
    describe("Test TransferFrom", () => {
        it("Should be able to approve a user to spend on your behalf", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);
            expect(await myERC.balanceOf(owner.address)).to.be.equal(1000000);

            const tx = await myERC.connect(owner).approve(otherAccount.address, 20000);
            await tx.wait();

            expect(await myERC.allowance(owner.address, otherAccount.address)).to.be.equal(20000);
        });
        it("Should emit Approval event after approval", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);
            const amount = 20000;

            const tx = await myERC.connect(owner).approve(otherAccount.address, amount);
            await tx.wait();

             expect(await myERC.connect(owner).transfer(otherAccount.address, amount))
                .to.emit(myERC, "Approval")
                .withArgs(owner.address, otherAccount.address, amount);
        });

        it("Should be able to transferFrom successfully", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);
            expect(await myERC.balanceOf(owner.address)).to.be.equal(1000000);

            const approveTx = await myERC.connect(owner).approve(otherAccount.address, 20000);
            await approveTx.wait();

            const tx = await myERC.transferFrom(owner.address, otherAccount.address, 20000);
            await tx.wait();

            expect(await myERC.balanceOf(otherAccount.address)).to.be.equal(20000);
            expect(await myERC.balanceOf(owner.address)).to.be.equal(980000);
            expect(await myERC.totalSupply()).to.be.equal(1000000);
        });

        it("Should not permit Address Zero to send transferFrom transaction", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);

            const amount = 120000;
            const zeroAddress = "0x0000000000000000000000000000000000000000";

            expect(myERC.transferFrom(zeroAddress, otherAccount.address, amount))
                .to.be.revertedWithCustomError(myERC, "ZERO_ADDRESS_NOT_ALLOWED");
        });

        it("Should not permit Address Zero to receive funds from a transferFrom tx", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);

            const amount = 120000;

            const zeroAddress = "0x0000000000000000000000000000000000000000";

            expect(myERC.transferFrom(owner.address, zeroAddress, amount))
                .to.be.revertedWithCustomError(myERC, "ZERO_ADDRESS_NOT_ALLOWED");
        });

        it("should revert if allowance amount < amount to spend on the owner behalf",
            async function () {
                const {
                    myERC,
                    owner,
                    otherAccount
                } = await loadFixture(deployMyERC20);
                const amount = 120000;

                const approveTx = await myERC.connect(owner).approve(otherAccount.address, amount);
                await approveTx.wait();

                expect(myERC.transferFrom(owner.address, otherAccount.address, 150000))
                    .to.be.revertedWithCustomError(myERC, "INSUFFICIENT_ALLOWANCE_BALANCE");
            });
        it("should revert if allowance amount > owner balance", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);

            expect(await myERC.balanceOf(owner.address)).to.be.equal(1_000_000);
            const amount = 1_200_000;

            expect(myERC.transferFrom(owner.address, otherAccount.address, amount))
                .to.be.revertedWithCustomError(myERC, "INSUFFICIENT_BALANCE");
        });
    });

    describe("Test Mint", () => {
        it("Should mint successfully", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);
            const amount = 50_000;
            const tx = await myERC.connect(owner).mint(otherAccount.address, amount);
            await tx.wait();

            expect(await myERC.balanceOf(otherAccount.address)).to.be.equal(amount);
        });
        it("Should revert if not owner", async function () {
            const {
                myERC,
                owner,
                otherAccount,
                otherAccount2
            } = await loadFixture(deployMyERC20);
            const amount = 50_000;

            expect( myERC.connect(otherAccount).mint(otherAccount2.address, amount))
                .to.be.revertedWithCustomError(myERC,"ONLY_OWNER_IS_ALLOWED");
        });
    });

     describe("Test Burn", () => {
        it("Should burn successfully", async function () {
            const {
                myERC,
                owner,
                otherAccount
            } = await loadFixture(deployMyERC20);
            const amount = 300_000;
            const tx = await myERC.connect(owner).burn(amount);
            await tx.wait();

            expect(await myERC.balanceOf(owner.address)).to.be.equal(700_000);
        });

        it("Should revert msg.sender balance == 0", async function () {
            const {
                myERC,
                owner,
                otherAccount,
                otherAccount2
            } = await loadFixture(deployMyERC20);
            const amount = 12_000;

            expect( myERC.connect(otherAccount).burn( amount))
                .to.be.revertedWithCustomError(myERC,"CANNOT_BURN_ZERO_TOKEN");
        });
    });
});
