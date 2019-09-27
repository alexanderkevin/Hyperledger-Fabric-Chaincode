/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const moment = require('moment');

class TransactionContract extends Contract {

    async assetExist(buffer){
        return (!!buffer && buffer.length > 0);
    }

    async buyNewCar(ctx, carId, personId) {
        // Check person data
        const personAssetBuffer = await ctx.stub.getState(personId);
        if(!await this.assetExist(personAssetBuffer)){
            throw new Error(`The person ${personId} does not exist`);
        }

        // Check Car Data
        const oldCarAssetBuffer = await ctx.stub.getState(carId);
        if(!await this.assetExist(oldCarAssetBuffer)){
            throw new Error(`The car ${carId} does not exist`);
        }

        let oldCarAsset = JSON.parse(oldCarAssetBuffer.toString());
        if(oldCarAsset.data.lastStatus !== 'MANUFACTURED'){
            throw new Error(`The car ${carId} is not ready to be sold now`);
        }
        else if(oldCarAsset.data.owner){
            throw new Error(`The car ${carId} already belong to person ${oldCarAsset.data.owner}`);
        }

        oldCarAsset.data.owner = personId;
        let newHistory = {
            status:'CHANGE_OWNER',
            newOwner:personId,
            currentOwner:'NEW_CAR',
            time: moment().format()
        };
        oldCarAsset.data.lastStatus = 'AFTER_SALES';
        oldCarAsset.data.history.push(newHistory);

        const newCarAsset = {data:oldCarAsset.data};
        const newDataBuffer = Buffer.from(JSON.stringify(newCarAsset));

        await ctx.stub.putState(carId, newDataBuffer);

    }

    async transferCar(ctx, carId, personId) {
        // Check person data
        const personAssetBuffer = await ctx.stub.getState(personId);
        if(!await this.assetExist(personAssetBuffer)){
            throw new Error(`The person ${personId} does not exist`);
        }

        // Check Car Data
        const oldCarAssetBuffer = await ctx.stub.getState(carId);
        if(!await this.assetExist(oldCarAssetBuffer)){
            throw new Error(`The car ${carId} does not exist`);
        }

        let oldCarAsset = JSON.parse(oldCarAssetBuffer.toString());
        if(oldCarAsset.data.owner){
            if(oldCarAsset.data.owner === personId){
                throw new Error(`The car ${carId} cannot be transfered to the same person ${personId}`);
            }
        }
        else if(oldCarAsset.data.lastStatus !== 'AFTER_SALES'){
            throw new Error(`The car ${carId} is cannot be transfered due to car still in ${oldCarAsset.data.lastStatus}`);
        }
        let newHistory = {
            status:'CHANGE_OWNER',
            newOwner:personId,
            currentOwner: oldCarAsset.data.owner,
            time: moment().format()
        };
        oldCarAsset.data.lastStatus = 'AFTER_SALES';
        oldCarAsset.data.history.push(newHistory);
        oldCarAsset.data.owner = personId;
        const newCarAsset = {data:oldCarAsset.data};
        const newDataBuffer = Buffer.from(JSON.stringify(newCarAsset));

        await ctx.stub.putState(carId, newDataBuffer);

    }

}

module.exports = TransactionContract;
