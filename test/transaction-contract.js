/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { TransactionContract } = require('..');
const winston = require('winston');
const moment = require('moment');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('TransactionContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new TransactionContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"data":{"name":"Andy","gender":"Male"}}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"data":{"manufacture":"Toyota","name":"Innova","year":2010,"lastStatus":"MANUFACTURED","history":[]}}'));
    });

    describe('#BuyNewCar', () => {

        it('should return updated owner for a Transaction', async () => {
            await contract.buyNewCar(ctx, '1002','1001');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1002', Buffer.from(`{"data":{"manufacture":"Toyota","name":"Innova","year":2010,"lastStatus":"AFTER_SALES","history":[{"status":"CHANGE_OWNER","newOwner":"1001","currentOwner":"NEW_CAR","time":"${moment().format()}"}],"owner":"1001"}}`));
        });

        it('should return false for a Person that does not exist', async () => {
            await contract.buyNewCar(ctx, '1002','1003').should.be.rejectedWith(/The person 1003 does not exist/);
        });


        it('should return false for a Car that does not exist', async () => {
            await contract.buyNewCar(ctx, '1004','1001').should.be.rejectedWith(/The car 1004 does not exist/);
        });

    });

});
