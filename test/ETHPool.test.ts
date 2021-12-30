import { expect } from 'chai'
import { ethers } from 'hardhat'
import '@nomiclabs/hardhat-ethers'

import { ETHPool__factory, ETHPool } from '../build/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

const { getContractFactory, getSigners } = ethers

describe('ETHPool', () => {
  let ethPool: ETHPool
  let signers: SignerWithAddress[];
  let team, clientA, clientB, clientC:SignerWithAddress;


  //NOTE: SETUP Conditions
  beforeEach(async () => {
    signers = await getSigners();
    [team, clientA, clientB, clientC] = signers;

    const ETHPoolFactory = (await getContractFactory('ETHPool', team)) as ETHPool__factory
    ethPool = await ETHPoolFactory.deploy()
    await ethPool.deployed()

    const intialTotalPoolBalance = await ethPool.getTotalPoolBalance()
    expect(intialTotalPoolBalance).to.eq(0)
    expect(ethPool.address).to.properAddress

    const totalStakeBalance = await ethPool.getTotalStakeBalance()
    expect(totalStakeBalance).to.eq(0);
  })


  describe('getTotalPoolBalance', async () => {
    it('getTotalPoolBalance initial must be 0', async () => {
      const totalPoolBalance = await ethPool.getTotalPoolBalance()
      expect(totalPoolBalance).to.eq(0)
    })
  })

  describe('getTotalStakeBalance', async () => {
    it('getTotalStakeBalance initial must be 0', async () => {
      const totalStakeBalance = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalance).to.eq(0)
    })
  })

  describe('getTotalStakeBalance + Deposit + getDepositStake', async () => {
    
    it('reverted with \'The team cannot deposit\'', async () => {
      await expect(ethPool.connect(team).deposit({value:5000 })).to.be.revertedWith('The team cannot deposit')
     
      const totalStakeBalanceAfterDeposit = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDeposit).to.eq(0)
    })

    it('getTotalStakeBalance initial must be 5000 after 0', async () => {    
      await ethPool.connect(clientA).deposit({value:5000 })
   
      const totalStakeBalanceAfterDeposit = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDeposit).to.eq(5000)
    })

    it('getTotalStakeBalance initial must be 8000 after 5000 after 0 (same sender)', async () => {
      await ethPool.connect(clientA).deposit({value:5000 })
     
      const totalStakeBalanceAfterDeposit = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDeposit).to.eq(5000)
     
      await ethPool.connect(clientA).deposit({value:3000 })
     
      const totalStakeBalanceAfterSecondDeposit = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterSecondDeposit).to.eq(8000)
    })

    it('getTotalStakeBalance must be 8000 after 5000 after 0 (multiple senders)', async () => {
      await ethPool.connect(clientA).deposit({value:5000 })
     
      const totalStakeBalanceAfterDepositA = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositA).to.eq(5000)
     
      await ethPool.connect(clientB).deposit({value:3000 })
     
      const totalStakeBalanceAfterDepositB = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositB).to.eq(8000)
    })

    it('getTotalStakeBalance must be 8000 after 5000 after 0 (multiple senders) + getDepositStake', async () => {
      await ethPool.connect(clientA).deposit({value:5000 })
      
      const totalStakeBalanceAfterDepositA = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositA).to.eq(5000)
      const depositStakeA = await ethPool.connect(clientA).getDepositStake();
      expect(depositStakeA).to.eq(5000)
      
      await ethPool.connect(clientB).deposit({value:3000 })
      const totalStakeBalanceAfterDepositB = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositB).to.eq(8000)
      const depositStakeB = await ethPool.connect(clientB).getDepositStake();
      expect(depositStakeB).to.eq(3000)
    })

    
  })

  describe('getTotalStakeBalance + Deposit + getDepositStake + withDraw', async () => {
    it('getTotalStakeBalance initial must be 5000 after 0', async () => {
      await ethPool.connect(clientA).deposit({value: 5000})
      const totalStakeBalanceAfterDeposit = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDeposit).to.eq(5000)
    
      await ethPool.connect(clientA).withdraw();
      const totalStakeBalanceAfterWithdrawal= await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterWithdrawal).to.eq(0)
    })

    it('getTotalStakeBalance initial must be 0, 5000, 8000, 5000 (deposit widthrawals multiple accounts)', async () => {
      await ethPool.connect(clientA).deposit({value: 5000})
      const totalStakeBalanceAfterDepositA = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositA).to.eq(5000)
     
      await ethPool.connect(clientB).deposit({value: 3000})
      const totalStakeBalanceAfterDepositB = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositB).to.eq(8000)
     
      await ethPool.connect(clientB).withdraw();
      const totalStakeBalanceAfterWidthrawB = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterWidthrawB).to.eq(5000)
    })
   
  })
  
  
  describe('Deposits + Withdrawals + Rewards', async () => {
    it('Distribute no team', async ()=> {
      await expect( ethPool.connect(clientA).distribute({value:1000})).to.be.revertedWith('Only the team can Distribute');
    });

    it('Distribute team but no stakers (previous deposits)', async ()=> {
      await expect( ethPool.connect(team).distribute({value:1000})).to.be.revertedWith('No stakers for distribution');
    });

    it('Distribute team, one single deposit (1 takes all)', async ()=> {
      await ethPool.connect(clientA).deposit({value: 5000})
      const totalStakeBalanceAfterDepositA = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositA).to.eq(5000)

     
      await ethPool.connect(team).distribute({value:1000});

      const totalStakeBalanceAfterDistribution = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDistribution).to.eq(5000)

      const totalPoolBalanceAfterDistribution = await ethPool.getTotalPoolBalance()
      expect(totalPoolBalanceAfterDistribution).to.eq(20)

      await expect(ethPool.connect(clientA).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientA.address, 6000);
    });

    it('Distribute, 2 deposits (50/50)', async ()=> {
      await ethPool.connect(clientA).deposit({value: 5000})
      const totalStakeBalanceAfterDepositA = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositA).to.eq(5000)

      await ethPool.connect(clientB).deposit({value: 5000})
      const totalStakeBalanceAfterDepositB = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositB).to.eq(10000)

      await ethPool.connect(team).distribute({value:1000});

      await expect(ethPool.connect(clientA).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientA.address, 5500);
      await expect(ethPool.connect(clientB).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientB.address, 5500);
    });

    it('Deposit -> Distribute -> Deposit, 2 deposits (50/50) but rewards only for 1', async ()=> {
      await ethPool.connect(clientA).deposit({value: 5000})
      const totalStakeBalanceAfterDepositA = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositA).to.eq(5000)

      await ethPool.connect(team).distribute({value:1000});

      await ethPool.connect(clientB).deposit({value: 5000})
      const totalStakeBalanceAfterDepositB = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositB).to.eq(10000)


      await expect(ethPool.connect(clientA).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientA.address, 6000);
      await expect(ethPool.connect(clientB).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientB.address, 5000);
    });

    it('Deposit -> Distribute -> Deposit, 2 deposits (60/40) uneven rewards', async ()=> {
      await ethPool.connect(clientA).deposit({value: 6000})
      const totalStakeBalanceAfterDepositA = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositA).to.eq(6000)
    
      await ethPool.connect(clientB).deposit({value: 4000})
      const totalStakeBalanceAfterDepositB = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositB).to.eq(10000)

      await ethPool.connect(team).distribute({value:1000});

      await expect(ethPool.connect(clientA).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientA.address, 6600);
      await expect(ethPool.connect(clientB).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientB.address, 4400);
    });

    it('Deposit -> Distribute -> Deposit, 3 deposits (33/33/33) even rewards, 10 remain due precision  ', async ()=> {
      await ethPool.connect(clientA).deposit({value: 3000})
      const totalStakeBalanceAfterDepositA = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositA).to.eq(3000)
    
      await ethPool.connect(clientB).deposit({value: 3000})
      const totalStakeBalanceAfterDepositB = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositB).to.eq(6000)

      await ethPool.connect(clientC).deposit({value: 3000})
      const totalStakeBalanceAfterDepositC = await ethPool.getTotalStakeBalance()
      expect(totalStakeBalanceAfterDepositC).to.eq(9000)

      await ethPool.connect(team).distribute({value:1000});

      await expect(ethPool.connect(clientA).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientA.address, 3330);
      await expect(ethPool.connect(clientB).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientB.address, 3330);
      await expect(ethPool.connect(clientC).withdraw()).to.emit(ethPool, 'Withdraw').withArgs(clientC.address, 3330);
    });
  });

})
