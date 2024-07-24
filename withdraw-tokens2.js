import bs58 from 'bs58';

// import dotenv from 'dotenv';
import {
  getTransferFeeAmount,
  TOKEN_2022_PROGRAM_ID,
  unpackAccount,
  withdrawWithheldTokensFromMint,
} from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';

// import {
//   PAYER,
//   RECIPIENT_KEYPAIR,
// } from './config-copy';

// dotenv.config();

// const PAYER = [179,3,16,89,75,94,147,146,107,142,137,163,66,234,236,82,65,183,254,245,47,110,215,216,72,127,119,46,215,249,199,241,11,212,37,99,137,5,243,10,5,224,219,17,144,108,64,250,90,25,98,185,74,111,2,81,54,174,65,121,23,185,59,201]
const PAYER = [151,250,133,160,178,197,133,103,69,122,236,210,204,163,134,138,41,3,125,57,8,168,214,17,218,120,180,227,245,234,75,72,10,76,127,170,65,248,245,58,114,27,168,242,66,37,79,216,141,207,121,134,27,72,177,85,105,137,186,168,39,146,175,38] //account11
// export const PAYER = "43EeRipwq7QZurfASn7CnYuJ14pVaCEv7KWav9vknt1bFR6qspYXC2DbaC2gGydrVx4TFtWfyCFkEaLLLMB2bZoT"
const RECIPIENT_KEYPAIR = '2wQkEABxE9abUhB1JnsiGMVrrVpdxFyJ73ViHVga6pW93ZQe1wd8SwdhbnauSZEqumAu4QzzV5h4bk7AdBy38zzE' //account2  CLdt94RjT9Mnxh2jUFCiyDMsjfY158GBwt6bHtrcVb5L 
// const RECIPIENT_KEYPAIR = [219,80,248,37,168,206,248,75,62,231,9,245,47,197,202,69,56,123,48,65,227,254,97,100,53,237,228,29,125,72,128,38,136,84,211,19,40,174,29,210,203,159,149,192,140,13,214,156,232,252,83,20,21,196,200,128,119,222,73,90,15,130,2,214] //Main Wallet

// if (!process.env.RECIPIENT_KEYPAIR || !process.env.MINT_KEYPAIR ) {
//   throw new Error('Necessary keypairs not found, have you run the create-token and mint-and-transfer scripts?');
// }

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const payer = Keypair.fromSecretKey(
  // new Uint8Array(JSON.parse(process.env.PAYER))
  // Uint8Array.from(PAYER)
  // new Uint8Array(JSON.parse(PAYER))
  new Uint8Array(PAYER)

);

// const mint = Keypair.fromSecretKey(
//   new Uint8Array(JSON.parse(process.env.MINT_KEYPAIR))
// ).publicKey;
// const mint = new PublicKey("Enjp5SF3Ft1oRJ7PnEm5t4xCV1rR9b6f4cCFH6QghZQB") //spl-2022
// const mint = new PublicKey("jqoKcrxD2nPNUDboA7JojvRXBfQNedD6Yhnse2kTwfX") // aleyana
const mint = new PublicKey("66fo8qDCE32QkcWmqwriFJA4feEYhSZs3iyeyBpzpe2c") //spl224
const withdrawWithheldAuthority = Keypair.fromSecretKey(
  // new Uint8Array(JSON.parse(process.env.WITHDRAW_WITHHELD_AUTHORITY))
  // Uint8Array.from(PAYER)
  // new Uint8Array(JSON.parse(PAYER))
  new Uint8Array(PAYER)
);

const recipientKeypair = Keypair.fromSecretKey(
  // new Uint8Array(JSON.parse(process.env.RECIPIENT_KEYPAIR))
  // new Uint8Array.from(bs58.decode(RECIPIENT_KEYPAIR))
  new Uint8Array(bs58.decode(RECIPIENT_KEYPAIR))
  // new Uint8Array(JSON.parse(RECIPIENT_KEYPAIR))
  // new Uint8Array(RECIPIENT_KEYPAIR)
);

// const recipientPublicKey = new PublicKey('CLdt94RjT9Mnxh2jUFCiyDMsjfY158GBwt6bHtrcVb5L')

const balance = await connection.getBalance(payer.publicKey);
if (balance < 10000000) { // 0.01 SOL
  throw new Error(
    'Not enough SOL in payer account, please fund: ',
    payer.publicKey.toBase58()
  );
}

const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
  commitment: 'confirmed',
  filters: [
    {
      memcmp: {
        offset: 0,
        bytes: mint.toString(),
      },
    },
  ],
});

const accountsToWithdrawFrom = [];

for (const accountInfo of allAccounts) {
  const account = unpackAccount(
    accountInfo.pubkey,
    accountInfo.account,
    TOKEN_2022_PROGRAM_ID
  );

  // We then extract the transfer fee extension data from the account
  const transferFeeAmount = getTransferFeeAmount(account);

  if (
    transferFeeAmount !== null &&
    transferFeeAmount.withheldAmount > BigInt(0)
  ) {
    accountsToWithdrawFrom.push(accountInfo.pubkey);
  }
}

if (accountsToWithdrawFrom.length === 0) {
  throw new Error('No accounts to withdraw from: no transfers have been made');
} else {
  console.log('Found', accountsToWithdrawFrom.length, 'accounts to withdraw from 🤑');
  console.log('accountsToWithdrawFrom: ', accountsToWithdrawFrom) //ayad
}

// const withdrawTokensSig = await withdrawWithheldTokensFromAccounts(
//   connection, // connection to use
//   payer, // payer of the transaction fee
//   mint, // the token mint
//   recipientKeypair.publicKey, // the destination account
//   withdrawWithheldAuthority, // the withdraw withheld token authority
//   [], // signing accounts
//   accountsToWithdrawFrom, // source accounts from which to withdraw withheld fees
//   undefined, // options for confirming the transaction
//   TOKEN_2022_PROGRAM_ID // SPL token program id
// );

// Optionally - you can also withdraw withheld tokens from the mint itself
// see ReadMe for the difference

const withdrawTokensSig = await withdrawWithheldTokensFromMint(
  connection, // connection to use
  payer, // payer of the transaction fee
  mint, // the token mint
  recipientKeypair.publicKey, // the destination account
  withdrawWithheldAuthority, // the withdraw withheld authority
  [], // signing accounts
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID // SPL token program id
);

console.log(
  'Bag secured, check it:',
  `https://solana.fm/tx/${withdrawTokensSig}?cluster=devnet-solana`
);

console.log('withdrawTokensSig: ', withdrawTokensSig)

//ayad
/*
accountsToWithdrawFrom:  [
  PublicKey [PublicKey(13norQkkBSKaX9CUGMcbRjkwgomRQw2FGKuHxgx737ek)] {
    _bn: <BN: b6f4e7322e52972c1f55ca77cf8374fcb42de088912e4ab35ca8ed41768cb5>
  },
  PublicKey [PublicKey(29hHEDx3BuBGkv4yWuFnYsURXvUEYjF19PnFkMnTd4tQ)] {
    _bn: <BN: 1115e0be71f9d93cca9e0ab1f314f5933657bda42cb0034c2c4fbaa31dda59f1>
  },
  PublicKey [PublicKey(B9hVhZvkT8hXT5TcvmWsuobywYzrvYArG3kju3wov1Jv)] {
    _bn: <BN: 96cf4da9d6e15de36572877f9d0d5d07041790022247cd09fb55ea0cd6509d77>
  }
]*/