const randomString = require('randomstring');
const account = require('ethjs-account');
import { ITinlake } from '../types/tinlake';
import assert from 'assert';
import { createTinlake, TestProvider } from '../test/utils';
import testConfig from '../test/config';
import { interestRateToFee } from '../utils/interestRateToFee';

const testProvider = new TestProvider(testConfig);
const adminAccount = account.generate(randomString.generate(32));
const borrowerAccount = account.generate(randomString.generate(32));
const lenderAccount = account.generate(randomString.generate(32));
const { SUCCESS_STATUS, FAUCET_AMOUNT, contractAddresses } = testConfig;
let adminTinlake : Partial<ITinlake>;
let governanceTinlake : Partial<ITinlake> ;

// ------------ admin tests borrower-site -------------
describe('admin tests', async () => {

  before(async () => {
    // fund admin account with eth
    adminTinlake = await createTinlake(adminAccount, testConfig);
    governanceTinlake = await createTinlake(testConfig.godAccount, testConfig);
    await testProvider.fundAccountWithETH(adminAccount.address, FAUCET_AMOUNT);
    await testProvider.fundAccountWithETH(borrowerAccount.address, FAUCET_AMOUNT);
  });

  describe('ceiling', async () => {
    it('success: set ceiling for a loan', async () => {
      // rely admin on ceiling contract
      await governanceTinlake.relyAddress(adminAccount.address, contractAddresses['CEILING']);
      // await tinlake.setCeiling(loanId, ceiling);
    });

    it('success: init rate', async () => {
        // rely admin on ceiling contract
      await governanceTinlake.relyAddress(adminAccount.address, contractAddresses['PILE']);
      const rate = '5';
      const ratePerSecond = interestRateToFee(rate);
      const initResult = await adminTinlake.initRate(ratePerSecond);
      assert.equal(initResult.status, SUCCESS_STATUS);
    });

    it('success: set rate for loan', async () => {
    });
  });

  describe('pile', async () => {
    // rely admin account on pile
  });

  // ------------ admin tests lender-site -------------
  describe('operator', async () => {
    it('success: set allowance for junior investor', async () => {
      // rely admin on junior operator
      await governanceTinlake.relyAddress(adminAccount.address, contractAddresses['JUNIOR_OPERATOR']);
      const maxCurrency = '1000';
      const maxToken = 100;

      // set allowance for lender address
      const allowanceResult: any = await adminTinlake.approveAllowanceJunior(lenderAccount.address, maxCurrency, maxToken);

      const maxSupplyAmount = await adminTinlake.getMaxSupplyAmountJunior(lenderAccount.address);
      const maxRedeemAmount = await adminTinlake.getMaxRedeemAmountJunior(lenderAccount.address);
      assert.equal(allowanceResult.status, SUCCESS_STATUS);
      assert.equal(maxRedeemAmount, maxToken);
      assert.equal(maxSupplyAmount, maxCurrency);
    });
  });
});