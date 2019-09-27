/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class PersonContract extends Contract {

    async personExists(ctx, personId) {
        const buffer = await ctx.stub.getState(personId);
        return (!!buffer && buffer.length > 0);
    }

    async createPerson(ctx, personId, data) {
        const exists = await this.personExists(ctx, personId);
        data = JSON.parse(data);
        if (exists) {
            throw new Error(`The person ${personId} already exists`);
        }
        if(!data.name){
            throw new Error('name must be filled');
        }
        else if(!data.gender){
            throw new Error('gender must be filled');
        }
        const asset = { data };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(personId, buffer);
    }

    async readPerson(ctx, personId) {
        const exists = await this.personExists(ctx, personId);
        if (!exists) {
            throw new Error(`The person ${personId} does not exist`);
        }
        const buffer = await ctx.stub.getState(personId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async queryAllPerson(ctx) {
        const startKey = 'PERSON_0';
        const endKey = 'PERSON_9999999999999999';

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

    async readPersonCar(ctx, personId) {
        const exists = await this.personExists(ctx, personId);
        if (!exists) {
            throw new Error(`The person ${personId} does not exist`);
        }
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
                console.info(Record);
                if(Record.data.owner === personId){
                    allResults.push({ Key, Record });
                }
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async updatePerson(ctx, personId, newdata) {
        const exists = await this.personExists(ctx, personId);
        newdata = JSON.parse(newdata);
        if (!exists) {
            throw new Error(`The person ${personId} does not exist`);
        }
        const asset = { data: newdata };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(personId, buffer);
    }

    async deletePerson(ctx, personId) {
        const exists = await this.personExists(ctx, personId);
        if (!exists) {
            throw new Error(`The person ${personId} does not exist`);
        }
        await ctx.stub.deleteState(personId);
    }

    async readPersonHistory(ctx, personId) {
        const exists = await this.personExists(ctx, personId);
        if (!exists) {
            throw new Error(`The car ${personId} does not exist`);
        }

        let buffer = await ctx.stub.getHistoryForKey(personId);
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

module.exports = PersonContract;
