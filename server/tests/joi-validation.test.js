'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');
const { schemas } = require('../middleware/validationSchemas');

describe('Joi Polymorphic Save Schemas Validation Tests', () => {
    
    describe('saveToken Schema', () => {
        test('should pass with valid token data and strip unknown parameters', () => {
            const payload = {
                name: 'AutoCon Gas Token',
                symbol: 'AGAS',
                contractAddress: '0x1234567890123456789012345678901234567890',
                ownerAddress: '0x0987654321098765432109876543210987654321',
                network: 'sepolia',
                extraInjectedProperty: 'malicious_payload_here',
                maliciousObject: { injectAdmin: true }
            };

            const { error, value } = schemas.saveToken.validate(payload, { stripUnknown: true });

            assert.strictEqual(error, undefined);
            assert.strictEqual(value.name, 'AutoCon Gas Token');
            assert.strictEqual(value.symbol, 'AGAS');
            assert.strictEqual(value.contractAddress, '0x1234567890123456789012345678901234567890');
            assert.strictEqual(value.ownerAddress, '0x0987654321098765432109876543210987654321');
            assert.strictEqual(value.network, 'sepolia');
            
            // Critical defense checks: Joi must completely strip the unknown properties
            assert.strictEqual(value.extraInjectedProperty, undefined);
            assert.strictEqual(value.maliciousObject, undefined);
        });

        test('should reject invalid ethereum addresses', () => {
            const payload = {
                name: 'AutoCon Gas Token',
                symbol: 'AGAS',
                contractAddress: '0xInvalidEthereumAddressLengthShort',
                ownerAddress: '0x0987654321098765432109876543210987654321',
                network: 'sepolia'
            };

            const { error } = schemas.saveToken.validate(payload);
            assert.notStrictEqual(error, undefined);
            assert.match(error.message, /"contractAddress"/);
        });

        test('should reject unsupported networks', () => {
            const payload = {
                name: 'AutoCon Gas Token',
                symbol: 'AGAS',
                contractAddress: '0x1234567890123456789012345678901234567890',
                ownerAddress: '0x0987654321098765432109876543210987654321',
                network: 'ethereumMainnetClassicDeprecated'
            };

            const { error } = schemas.saveToken.validate(payload);
            assert.notStrictEqual(error, undefined);
            assert.match(error.message, /"network"/);
        });
    });

    describe('saveNFT Schema', () => {
        test('should pass with valid NFT data, allow valid metadata fields, and strip unknown properties', () => {
            const payload = {
                name: 'AutoCon Art',
                symbol: 'ACART',
                contractAddress: '0x1234567890123456789012345678901234567890',
                ownerAddress: '0x0987654321098765432109876543210987654321',
                network: 'amoy',
                maxSupply: 1000,
                mintPrice: '0.05',
                baseURI: 'ipfs://QmYwAPJzv5CZ1A3VEedK2t4H86n56d98/meta/',
                unsupportedMetaField: 'exploit_value'
            };

            const { error, value } = schemas.saveNFT.validate(payload, { stripUnknown: true });

            assert.strictEqual(error, undefined);
            assert.strictEqual(value.name, 'AutoCon Art');
            assert.strictEqual(value.symbol, 'ACART');
            assert.strictEqual(value.maxSupply, 1000);
            assert.strictEqual(value.mintPrice, '0.05');
            assert.strictEqual(value.baseURI, 'ipfs://QmYwAPJzv5CZ1A3VEedK2t4H86n56d98/meta/');
            
            // Critical defense checks
            assert.strictEqual(value.unsupportedMetaField, undefined);
        });

        test('should reject invalid mintPrice format', () => {
            const payload = {
                name: 'AutoCon Art',
                symbol: 'ACART',
                contractAddress: '0x1234567890123456789012345678901234567890',
                ownerAddress: '0x0987654321098765432109876543210987654321',
                network: 'amoy',
                maxSupply: 1000,
                mintPrice: '0.05ETH' // invalid suffix
            };

            const { error } = schemas.saveNFT.validate(payload);
            assert.notStrictEqual(error, undefined);
            assert.match(error.message, /"mintPrice"/);
        });
    });

    describe('saveAuction Schema', () => {
        test('should pass with valid auction data and strip unknown parameters', () => {
            const payload = {
                name: 'Car Auction',
                itemName: 'Model S',
                itemDescription: 'Electric sedan in mint condition',
                contractAddress: '0x1234567890123456789012345678901234567890',
                ownerAddress: '0x0987654321098765432109876543210987654321',
                network: 'bnbtestnet',
                duration: 86400,
                minimumBid: '1.5',
                exploitPayload: '{"$gt": ""}' // MongoDB injection payload attempt
            };

            const { error, value } = schemas.saveAuction.validate(payload, { stripUnknown: true });

            assert.strictEqual(error, undefined);
            assert.strictEqual(value.name, 'Car Auction');
            assert.strictEqual(value.itemName, 'Model S');
            assert.strictEqual(value.itemDescription, 'Electric sedan in mint condition');
            assert.strictEqual(value.duration, 86400);
            assert.strictEqual(value.minimumBid, '1.5');
            
            // Critical defense checks
            assert.strictEqual(value.exploitPayload, undefined);
        });

        test('should reject invalid duration types', () => {
            const payload = {
                name: 'Car Auction',
                itemName: 'Model S',
                contractAddress: '0x1234567890123456789012345678901234567890',
                ownerAddress: '0x0987654321098765432109876543210987654321',
                network: 'bnbtestnet',
                duration: 'two-hours' // invalid integer
            };

            const { error } = schemas.saveAuction.validate(payload);
            assert.notStrictEqual(error, undefined);
            assert.match(error.message, /"duration" must be a number/);
        });
    });
});
