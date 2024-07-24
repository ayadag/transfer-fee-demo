// import dotenv from 'dotenv';
// import { addKeypairToEnvFile } from '@solana-developers/node-helpers';
import {
  createAccount,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  transferCheckedWithFee,
} from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  Keypair,
} from '@solana/web3.js';

// dotenv.config();

// if (!process.env.PAYER || !process.env.MINT_AUTHORITY || !process.env.MINT_KEYPAIR) {
//   throw new Error('Necessary keypairs not found, have you run the create-token script?');
// }

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// const payer = Keypair.fromSecretKey(
//   new Uint8Array(JSON.parse(process.env.PAYER))
// );

const PAYER = [151,250,133,160,178,197,133,103,69,122,236,210,204,163,134,138,41,3,125,57,8,168,214,17,218,120,180,227,245,234,75,72,10,76,127,170,65,248,245,58,114,27,168,242,66,37,79,216,141,207,121,134,27,72,177,85,105,137,186,168,39,146,175,38] //account11
const payer = Keypair.fromSecretKey(
  new Uint8Array(PAYER)
);

// const mintAuthority = Keypair.fromSecretKey(
//   new Uint8Array(JSON.parse(process.env.MINT_AUTHORITY))
// );

const mintAuthority = payer

// const mint = Keypair.fromSecretKey(
//   new Uint8Array(JSON.parse(process.env.MINT_KEYPAIR))
// ).publicKey;
const mint = Keypair.fromSecretKey(
    new Uint8Array([
      45, 112,  12, 217,  77,  18,  43, 195, 180, 249,  30,
      16, 244, 196,  52, 133,  51, 244,  94,  78,   0, 184,
      53, 205,  34, 206, 128,  79, 242,  13, 230,  45, 236,
     225,  11,  39, 207,  14, 199,  25, 118, 213,  81,  30,
      71,  43,  21,  11, 245,  57, 221,  14, 247, 117,   1,
     174,  85,  77, 100, 147,  53, 173,  34, 132
   ])
  ).publicKey;  //GwgFHj6641WeNqcut5oSqDA9FZHhriDMEWvj1kD9KUd1
//or
// const mint = new PublicKey('GwgFHj6641WeNqcut5oSqDA9FZHhriDMEWvj1kD9KUd1')

const balance = await connection.getBalance(payer.publicKey);
if (balance < 10000000) { // 0.01 SOL
  throw new Error(
    'Not enough SOL in payer account, please fund: ',
    payer.publicKey.toBase58()
  );
}

const feeBasisPoints = 50;
const decimals = 9;

const owner = Keypair.generate();

const sourceAccount = await createAccount(
  connection, // connection to use
  payer, // payer of transaction and intialization fee
  mint, // mint for the account
  owner.publicKey, // owner of the new account
  undefined, // optional keypair
  undefined, // options for confirming transaction
  TOKEN_2022_PROGRAM_ID // SPL token program id
);

// amount of tokens to mint to the new account
const mintAmount = BigInt(1_000_000_000_000);
await mintTo(
  connection, // connection to use
  payer, // payer of transaction fee
  mint, // mint for the token account
  sourceAccount, // address of account to mint to
  mintAuthority, // minting authority
  mintAmount, // amount to mint
  [], // signing acocunt
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID // SPL token program id
);

const recipientKeypair = Keypair.generate();
// await addKeypairToEnvFile(recipientKeypair, 'RECIPIENT_KEYPAIR');
console.log('recipientKeypair: ', recipientKeypair)
// const RECIPIENT_KEYPAIR = '2wQkEABxE9abUhB1JnsiGMVrrVpdxFyJ73ViHVga6pW93ZQe1wd8SwdhbnauSZEqumAu4QzzV5h4bk7AdBy38zzE' //account2  CLdt94RjT9Mnxh2jUFCiyDMsjfY158GBwt6bHtrcVb5L 
// const recipientKeypair = Keypair.fromSecretKey(
//   // new Uint8Array(JSON.parse(process.env.RECIPIENT_KEYPAIR))
//   // new Uint8Array.from(bs58.decode(RECIPIENT_KEYPAIR))
//   new Uint8Array(bs58.decode(RECIPIENT_KEYPAIR))
//   // new Uint8Array(JSON.parse(RECIPIENT_KEYPAIR))
//   // new Uint8Array(RECIPIENT_KEYPAIR)
// );

const destinationAccount = await createAccount(
  connection, // connection to use
  payer, // payer of transaction and intialization fee
  mint, // mint for the account
  owner.publicKey, // owner of the new account
  recipientKeypair, // optional keypair
  undefined, // options for confirming transaction
  TOKEN_2022_PROGRAM_ID // SPL token program id
);

// amount of tokens we want to transfer
const transferAmount = BigInt(10_000_000_000);

// the reason why we divide by 10_000 is that 1 basis point is 1/100th of 1% | 0.01%
let fee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000);
if (fee > BigInt(5_000)) {
  fee = BigInt(5_000); // Max fee
}

const transferCheckedWithFeeSig = await transferCheckedWithFee(
  connection, // connection to use
  payer, // payer of the transaction fee
  sourceAccount, // source account
  mint, // mint for the account
  destinationAccount, // destination account
  owner, // owner of the source account
  transferAmount, // number of tokens to transfer
  decimals, // number of decimals
  fee, // expected fee collected for transfer
  [], // signing accounts
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID // SPL token program id
);

console.log(
  'Tokens minted and transferred:',
  `https://solana.fm/tx/${transferCheckedWithFeeSig}?cluster=devnet-solana`
);


//ayad
/*
Tokens minted and transferred: https://solana.fm/tx/qjGgWGfDKgXqoA4MTQUwGy2rdhsecd64uwPkK3ENBFP5iRFrxGP7ZDXnGEQXtxPbFN6qDupSy9PKB95DySeRhfa?cluster=devnet-solana
*/

/*
recipientKeypair:  Keypair {
  _keypair: {
    publicKey: Uint8Array(32) [
       94,  26, 225,  34,   2,  67, 239, 130,
       67,  48, 149, 111, 126, 114,  51,  13,
      113, 247,   3,  40,  54, 156,  54,  49,
       97,  65, 129,  78, 112, 117,  39, 243
    ],
    secretKey: Uint8Array(64) [
      168, 191,  75, 236, 106, 219, 142, 157,  81, 151, 164,
      173,  35, 179, 119,  18,  87, 118,   8, 245,  66,  81,
      255,  91,  92,  27,  81, 135,  33, 126,  15,  87,  94,
       26, 225,  34,   2,  67, 239, 130,  67,  48, 149, 111,
      126, 114,  51,  13, 113, 247,   3,  40,  54, 156,  54,
       49,  97,  65, 129,  78, 112, 117,  39, 243
    ]
  }
}
Tokens minted and transferred: https://solana.fm/tx/3cCJFW2edyRBEg5FfMPRfx1sqN3VC33Vggn3ShqVngcceAJ8aroVQ7C3Cyc9Z3rMVnRjrMoGnm7enxjG28CNE3hu?cluster=devnet-solana
 */