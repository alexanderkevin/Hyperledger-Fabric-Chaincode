/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const moment = require('moment');

class CarContract extends Contract {

    async carExists(ctx, carId) {
        const buffer = await ctx.stub.getState(carId);
        return (!!buffer && buffer.length > 0);
    }

    async assetExist(buffer){
        return (!!buffer && buffer.length > 0);
    }

    async requestCar(ctx, carId, data) {
        const exists = await this.carExists(ctx, carId);
        data = JSON.parse(data);
        if (exists) {
            throw new Error(`The car ${carId} already exists`);
        }
        if(!data.manufacture){
            throw new Error('manufacture must be filled');
        }
        else if(!data.year){
            throw new Error('year must be filled');
        }
        else if(!data.name){
            throw new Error('name must be filled');
        }
        data.lastStatus = 'REQUESTED';
        data.history = [{
            status:'REQUESTED',
            time: moment().format()
        }];
        const asset = { data };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(carId, buffer);
    }

    async makeCar(ctx, carId){
        // Check Car existence
        const oldCarAssetBuffer = await ctx.stub.getState(carId);
        if(!await this.assetExist(oldCarAssetBuffer)){
            throw new Error(`The car ${carId} does not exist`);
        }

        let oldCarAsset = JSON.parse(oldCarAssetBuffer.toString());
        if(oldCarAsset.data.lastStatus === 'MANUFACTURED'){
            throw new Error(`The car ${carId} is already manufactured`);
        }
        else if(oldCarAsset.data.lastStatus !== 'REQUESTED'){
            throw new Error(`The car ${carId} already belong to person ${oldCarAsset.data.owner}`);
        }


        let newHistory = {
            status:'MANUFACTURED',
            time: moment().format()
        };
        oldCarAsset.data.lastStatus = 'MANUFACTURED';
        oldCarAsset.data.history.push(newHistory);
        const newCarAsset = {data:oldCarAsset.data};
        const newDataBuffer = Buffer.from(JSON.stringify(newCarAsset));

        await ctx.stub.putState(carId, newDataBuffer);
    }

    async readCar(ctx, carId) {
        const exists = await this.carExists(ctx, carId);
        if (!exists) {
            throw new Error(`The car ${carId} does not exist`);
        }
        const buffer = await ctx.stub.getState(carId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async queryAllCar(ctx) {
        const startKey = 'CAR_0';
        const endKey = 'CAR_9999999999999999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async updateCar(ctx, carId, newdata) {
        const exists = await this.carExists(ctx, carId);
        newdata = JSON.parse(newdata);
        if (!exists) {
            throw new Error(`The car ${carId} does not exist`);
        }
        const asset = { data: newdata };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(carId, buffer);
    }

    async deleteCar(ctx, carId) {
        const exists = await this.carExists(ctx, carId);
        if (!exists) {
            throw new Error(`The car ${carId} does not exist`);
        }
        await ctx.stub.deleteState(carId);
    }

    async readCarHistory(ctx, carId) {
        const exists = await this.carExists(ctx, carId);
        if (!exists) {
            throw new Error(`The car ${carId} does not exist`);
        }

        let buffer = await ctx.stub.getHistoryForKey(carId);
        let results = await this.getAllResults(buffer, true);

        return results;
    }

    async getAllResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }

}

module.exports = CarContract;
