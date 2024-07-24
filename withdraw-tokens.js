import bs58 from 'bs58';
import dotenv from 'dotenv';

import {
  getTransferFeeAmount,
  TOKEN_2022_PROGRAM_ID,
  unpackAccount,
  withdrawWithheldTokensFromAccounts,
} from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';

import {
  PAYER,
  RECIPIENT_KEYPAIR,
} from './config-copy';

dotenv.config();

if (!process.env.RECIPIENT_KEYPAIR || !process.env.MINT_KEYPAIR ) {
  throw new Error('Necessary keypairs not found, have you run the create-token and mint-and-transfer scripts?');
}

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const payer = Keypair.fromSecretKey(
  // new Uint8Array(JSON.parse(process.env.PAYER))
  new Uint8Array.from(PAYER)
);

// const mint = Keypair.fromSecretKey(
//   new Uint8Array(JSON.parse(process.env.MINT_KEYPAIR))
// ).publicKey;
const mint = new PublicKey("Enjp5SF3Ft1oRJ7PnEm5t4xCV1rR9b6f4cCFH6QghZQB") //spl-2022

const withdrawWithheldAuthority = Keypair.fromSecretKey(
  // new Uint8Array(JSON.parse(process.env.WITHDRAW_WITHHELD_AUTHORITY))
  new Uint8Array.from(PAYER)
);

const recipientKeypair = Keypair.fromSecretKey(
  // new Uint8Array(JSON.parse(process.env.RECIPIENT_KEYPAIR))
  new Uint8Array.from(bs58.decode(RECIPIENT_KEYPAIR))
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
}

const withdrawTokensSig = await withdrawWithheldTokensFromAccounts(
  connection, // connection to use
  payer, // payer of the transaction fee
  mint, // the token mint
  recipientKeypair.publicKey, // the destination account
  withdrawWithheldAuthority, // the withdraw withheld token authority
  [], // signing accounts
  accountsToWithdrawFrom, // source accounts from which to withdraw withheld fees
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID // SPL token program id
);

console.log(
  'Bag secured, check it:',
  `https://solana.fm/tx/${withdrawTokensSig}?cluster=devnet-solana`
);

console.log('withdrawTokensSig: ', withdrawTokensSig)
// Optionally - you can also withdraw withheld tokens from the mint itself
// see ReadMe for the difference

// await withdrawWithheldTokensFromMint(
//   connection, // connection to use
//   payer, // payer of the transaction fee
//   mint, // the token mint
//   recipientKeypair.publicKey, // the destination account
//   withdrawWithheldAuthority, // the withdraw withheld authority
//   [], // signing accounts
//   undefined, // options for confirming the transaction
//   TOKEN_2022_PROGRAM_ID // SPL token program id
// );
