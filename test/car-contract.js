/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { CarContract } = require('..');
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

describe('CarContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new CarContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"car 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"car 1002 value"}'));
    });

    describe('#carExists', () => {

        it('should return true for a car', async () => {
            await contract.carExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a car that does not exist', async () => {
            await contract.carExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#requestCar', () => {

        it('should request a car', async () => {
            let insertData = '{"manufacture":"TOYOTA","year":2019,"name":"INNOVA"}';
            let resultData = {data:{manufacture:'TOYOTA',year:2019,name:'INNOVA',lastStatus:'REQUESTED',history:[{status:'REQUESTED',time:moment().format()}]}};
            await contract.requestCar(ctx, '1003', insertData);
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from(JSON.stringify(resultData)));
        });

        it('should throw an error for a car that already exists', async () => {
            await contract.requestCar(ctx, '1001', '{"manufacture":"TOYOTA","year":2019,"name":"INNOVA"}').should.be.rejectedWith(/The car 1001 already exists/);
        });

    });

    // describe('#makeCar', () => {

    //     it('should make a car', async () => {
    //         let insertData = '{"manufacture":"TOYOTA","year":2019,"name":"INNOVA"}';
    //         await contract.requestCar(ctx, '1003', insertData);

    //         // let resultData = {data:{manufacture:'TOYOTA',year:2019,name:'INNOVA',lastStatus:'MANUFACTURED',history:[{status:"REQUESTED",time:moment().format()}]}};
    //         await contract.makeCar(ctx, '1003');
    //         ctx.stub.putState.should.have.been.calledTwice('1003', Buffer.from(JSON.stringify("TEST")));
    //     });

    // });

    describe('#readCar', () => {

        it('should return a car', async () => {
            await contract.readCar(ctx, '1001').should.eventually.deep.equal({ value: 'car 1001 value' });
        });

        it('should throw an error for a car that does not exist', async () => {
            await contract.readCar(ctx, '1003').should.be.rejectedWith(/The car 1003 does not exist/);
        });

    });

    describe('#updateCar', () => {

        it('should update a car', async () => {
            await contract.updateCar(ctx, '1001', '{"manufacture":"TOYOTA","year":2019,"name":"INNOVA"}');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"data":{"manufacture":"TOYOTA","year":2019,"name":"INNOVA"}}'));
        });

        it('should throw an error for a car that does not exist', async () => {
            await contract.updateCar(ctx, '1003', '{"manufacture":"TOYOTA","year":2019,"name":"INNOVA"}').should.be.rejectedWith(/The car 1003 does not exist/);
        });

    });

    describe('#deleteCar', () => {

        it('should delete a car', async () => {
            await contract.deleteCar(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a car that does not exist', async () => {
            await contract.deleteCar(ctx, '1003').should.be.rejectedWith(/The car 1003 does not exist/);
        });

    });

});