/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { PersonContract } = require('..');
const winston = require('winston');

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

describe('PersonContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new PersonContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"person 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"person 1002 value"}'));
        ctx.stub.getState.withArgs('CAR_1').resolves(Buffer.from('{"value":"person 1003 value"}'));
        ctx.stub.getState.withArgs('CAR_2').resolves(Buffer.from('{"value":"person 1004 value"}'));
    });

    describe('#personExists', () => {

        it('should return true for a person', async () => {
            await contract.personExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a person that does not exist', async () => {
            await contract.personExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createPerson', () => {

        it('should create a person', async () => {
            let insertData = '{"name":"Budi","gender":"Male"}';
            let resultData = {data:{name:'Budi',gender:'Male'}};
            await contract.createPerson(ctx, '1003', insertData);
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from(JSON.stringify(resultData)));
        });

        it('should throw an error for a person that already exists', async () => {
            await contract.createPerson(ctx, '1001', '{"name":"Budi","gender":"Male"}').should.be.rejectedWith(/The person 1001 already exists/);
        });

    });

    describe('#readPerson', () => {

        it('should return a person', async () => {
            await contract.readPerson(ctx, '1001').should.eventually.deep.equal({ value: 'person 1001 value' });
        });

        it('should throw an error for a person that does not exist', async () => {
            await contract.readPerson(ctx, '1003').should.be.rejectedWith(/The person 1003 does not exist/);
        });

    });

    // describe('#readPersonCar', () => {

    //     it('should return a person', async () => {
    //         await contract.readPersonCar(ctx, '1001').should.eventually.deep.equal({ value: 'person 1001 value' });
    //     });

    // });

    describe('#updatePerson', () => {

        it('should update a person', async () => {
            await contract.updatePerson(ctx, '1001', '{"name":"Budiantos","gender":"Male"}');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"data":{"name":"Budiantos","gender":"Male"}}'));
        });

        it('should throw an error for a person that does not exist', async () => {
            await contract.updatePerson(ctx, '1003', '{"name":"Budianto","gender":"Male"}').should.be.rejectedWith(/The person 1003 does not exist/);
        });

    });

    describe('#deletePerson', () => {

        it('should delete a person', async () => {
            await contract.deletePerson(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a person that does not exist', async () => {
            await contract.deletePerson(ctx, '1003').should.be.rejectedWith(/The person 1003 does not exist/);
        });

    });

});