/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const CarContract = require('./lib/car-contract');
const PersonContract = require('./lib/person-contract');
const TransactionContract = require('./lib/transaction-contract');
module.exports.CarContract = CarContract;
module.exports.PersonContract = PersonContract;
module.exports.TransactionContract = TransactionContract;

module.exports.contracts = [ CarContract, PersonContract,TransactionContract];
