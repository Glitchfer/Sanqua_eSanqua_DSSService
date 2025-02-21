const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var config = require('../config/config.json');
const Dukpt = require('dukpt');
const dukpt2 = require('@shenyan1206/dukpt');

const Utility = require('peters-globallib-v2');
const dukpt = require('@shenyan1206/dukpt');
const utilInstance = new Utility();

const fs = require('fs');

const crypto = require('crypto');

class Security {
	constructor() {}

	async generateEncryptedPassword(pPassword) {
		var salt = await bcrypt.genSalt(10);
		var password = await bcrypt.hash(pPassword, salt);
		return password;
	}

	async encryptCriticalField(pParam) {
		if ('email' in pParam == true) {
			pParam.email = await utilInstance.encrypt(pParam.email);
		}
		if ('phone1' in pParam == true) {
			pParam.phone1 = await utilInstance.encrypt(pParam.phone1);
		}
		if ('phone2' in pParam == true) {
			pParam.phone2 = await utilInstance.encrypt(pParam.phone2);
		}

		return pParam;
	}

	async testDUKPT() {
		var bdk = '0123456789ABCDEFFEDCBA9876543210';
		var ksn = 'FFFF9876543210E00000';
		var data = '';

		// Example 1:

		var dukpt = new Dukpt(bdk, ksn, 'pinkey');

		var options = {
			inputEncoding: 'ascii',
			outputEncoding: 'hex',
			encryptionMode: '3DES'
		};

		console.log(`>>> 1. Generate IPEK`);
		var xIPEK = Dukpt._createIPEK(bdk, ksn);
		console.log(`>>> IPEK : ${xIPEK}`);

		console.log(`>>> 2. Derive Key from IPEK`);
		var xDerIPEK = Dukpt._createDataKeyHex(xIPEK, ksn);
		console.log(`>>> Derived from IPEK : ${xDerIPEK}`);

		console.log(`>>> Encrypted 1 : `);
		data = '1Þ103.102.33.91ÞTMP Lt 1';
		ksn = 'FFFF9876543210E00001';
		var xDerKey = Dukpt._deriveKeyHex(xDerIPEK, ksn);
		console.log(`>>> Derived from Key Session: ${xDerKey}`);
		var xEncryptedValue = Dukpt.encryptAES(xDerKey, await utilInstance.dataToHexstring(data));
		console.log(`>>> Encrypted Value: ${await utilInstance.dataToHexstring(xEncryptedValue)}`);

		console.log(`>>> Decrypt 1 : `);
		xDerKey = Dukpt._deriveKeyHex(xDerIPEK, ksn);
		xEncryptedValue = xEncryptedValue.replace(/\s/g, '');
		var xDecryptedValue = Dukpt.decryptAES(xDerKey, await utilInstance.dataToHexstring(xEncryptedValue));
		console.log(`>>> Decrypted Value : ${xDecryptedValue}`);

		// console.log(`>>> Encrypted 2 : `);
		// data = '1Þ103.102.33.91ÞTMP Lt 1';
		// ksn = 'FFFF9876543210E00002';
		// xDerKey = Dukpt._deriveKeyHex(xDerIPEK, ksn);
		// console.log(`>>> Derived from Key Session: ${xDerKey}`);
		// xEncryptedValue = Dukpt.encryptAES(xDerKey, data);
		// console.log(`>>> Encrypted Value: ${await utilInstance.dataToHexstring(xEncryptedValue)}`);
	}

	async testRSA(pParam) {
		// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
		// 	modulusLength: 1024
		// });

		// let xPublicKey = publicKey.export({
		// 	format: 'pem',
		// 	type: 'pkcs1'
		// });

		// let xPrivateKey = privateKey.export({
		// 	format: 'pem',
		// 	type: 'pkcs1'
		// });

		// console.log(`>>> Public Key : ${xPublicKey}`);
		// console.log(`>>> Private Key : ${xPrivateKey}`);

		let xPubKey = fs.readFileSync(
			'C:\\MIS-PETER\\SanQuaApp\\HRSystem\\Sanqua_eSanqua_HRSystem\\pubkey.pem',
			'utf8'
		);

		// xPubKey = `-----BEGIN RSA PUBLIC KEY-----\nMIGJAoGBAOK4UIXVy+0UkGnpEhsum6lxs5CEGg0dHLM2gi/qZWArlTQze85eibo92II5ugvWDsusGn8036K1SZccH8gmyWCqZUzj+EsjrV6Sz/9uTX7DU94oT3ATiZc7np4ly7QRzYn4sC+mLK2iksczJ6O1Fkw6HiD9CeCkpA8dsprB6VfjAgMBAAE=\n-----END RSA PUBLIC KEY-----\n`;
		xPubKey = `-----BEGIN RSA PUBLIC KEY-----\nMIGJAoGBAMb2wlTxHBYGMewit5ZwP/tKa/mc9MwyMxoZMdQ6immucemV3SWwdBFX\nxfD6EOaq3C6sgVhNOpAgf+lJz4U02Fx8DkaL+uEM/EuHEkScZQo+IxpGPsgiJc3V\nL6zZScQ/utqOE2BQtAX9VPVIzVP8uQtcNKowhyaLls/cMnvHzy8jAgMBAAE=\n-----END RSA PUBLIC KEY-----\n`;
		xPubKey = Buffer.from(xPubKey, 'utf-8');

		var encryptedData = crypto.publicEncrypt(
			{
				key: xPubKey,
				padding: crypto.constants.RSA_PKCS1_PADDING
				// oaepHash: 'sha256'
			},
			// We convert the data string to a buffer using `Buffer.from`
			// Buffer.from('1Þ102.34.32.200ÞSSID 1')
			Buffer.from(pParam.data)
		);

		console.log(`>>> Encrypted : ${encryptedData}`);
		let xHexEncrypted = Buffer.from(encryptedData).toString('base64'); //await utilInstance.numericArrayToHexstring(encryptedData);
		console.log(`>>> Encrypted in Hex : ${xHexEncrypted}`);
		console.log(`>>> Encrypted in Base64 : ${Buffer.from(encryptedData).toString('base64')}`);

		// let xPrivKey =
		// 	'-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQCsM7CVm8+ohni+MaRIAy6gA2o5BodS0mmceA+U6jjOdMtGUp31\nMX4CTlMmFP81VXGRGSO9w4Z7wRNQCb2hdrxGCHQb3pEOAkQ512iZVq0j3uqPvqzp\nJFmYXD97QGnK9Q6p9qMW5Wu8Ws9fcd8qrAviplj3UxIQ7QqoMN4dxCyUFQIDAQAB\nAoGAaG3waMpU5J6oGq+AMSu82s03Xd3XsyJnabxltqlUSeAKZlsz775T7JITWsTh\nADcQ6C2Wvz4UEHjGfYNqvMCE6/Q5N/mp9VH5nz+AoM+F/xMJ+gV4oltFsUDr6V83\nglNNDDXKlAQcb8PkiHhunzXkCIkrzaq36FO7PlK5mevYCAECQQDjhDyEq9IhKOpU\nV88UdGWK+HyD91jdMYWgLBtivuIHxrsx8WoOQop8kN1+XB45TLa9stRO5B4nI4m1\n3C4breQZAkEAwcKnXwk1T0jAgnKx1SQJmzRcghzHY8FYXD+fsO8gGOEVFpUq5Apa\n4jxd5mCuOQMzczx06ByC+0PBowv0XSVPXQJBAIG8dzIENHeaOD1OMRRt5zVeysoJ\nss+3HIaggCFHzeY3SamKCzsEcKnlhZg3eTidaRs1LWGrLRKObkmYu2YnO4kCQQCY\nWgEWpfvn4nGUYLDZweNXyT0wBYb2NhHPPyvGiM+5IEpfnlzCQC4kE4lV2xFCvPSY\nmKHn3HtVLHq2RHEZSHv1AkEAxv6Xz1tIDQNjNaC5idCp7r6wtt6Lc9V2R6Mq78m9\nZ0DFCEcL1BD0FRGj1drwjgi79YfQSd/z/TBrefYn35LUMA==\n-----END RSA PRIVATE KEY-----\n';

		// var decryptedData = crypto.privateDecrypt(
		// 	{
		// 		key: Buffer.from(xPrivKey),
		// 		// In order to decrypt the data, we need to specify the
		// 		// same hashing function and padding scheme that we used to
		// 		// encrypt the data in the previous step
		// 		// padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		// 		padding: crypto.constants.RSA_PKCS1_PADDING
		// 		// oaepHash: 'sha256'
		// 	},
		// 	Buffer.from(
		// 		'VKqV8DAcvaFypkmfSNViWaDbRZJtNAf1hHgJqrpgZxTwvOfeZCKXXkOzc55gGIxAOhMDz0n1KzfEknV4ULQMfvitk4QUagr+BK3Uz+k7HpDEn+wH+a80WuII2TIRGGKXdzWJ0QJjoawEzrtSD7ju/2MlbcFr5xRXpCgQM3mHwso=',
		// 		'base64'
		// 	)
		// );

		// console.log(`>>> Decrypted : ${decryptedData}`);
		return {
			status_code: '00',
			status_msg: 'OK',
			encrypted: xHexEncrypted
			// decrypted: decryptedData.toString('ascii')
		};
	}
}

module.exports = Security;
