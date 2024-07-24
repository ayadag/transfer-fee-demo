// import bs58 from 'bs58';

// import dotenv from 'dotenv';
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
} from '@solana/web3.js';

// dotenv.config();

// if (!process.env.RECIPIENT_KEYPAIR || !process.env.MINT_KEYPAIR ) {
//   throw new Error('Necessary keypairs not found, have you run the create-token and mint-and-transfer scripts?');
// }

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// const payer = Keypair.fromSecretKey(
//   new Uint8Array(JSON.parse(process.env.PAYER))
// );

const PAYER = [151,250,133,160,178,197,133,103,69,122,236,210,204,163,134,138,41,3,125,57,8,168,214,17,218,120,180,227,245,234,75,72,10,76,127,170,65,248,245,58,114,27,168,242,66,37,79,216,141,207,121,134,27,72,177,85,105,137,186,168,39,146,175,38] //account11
const payer = Keypair.fromSecretKey(
  new Uint8Array(PAYER)
);

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

// const withdrawWithheldAuthority = Keypair.fromSecretKey(
//   new Uint8Array(JSON.parse(process.env.WITHDRAW_WITHHELD_AUTHORITY))
// );
const withdrawWithheldAuthority = payer;

// const recipientKeypair = Keypair.fromSecretKey(
//   new Uint8Array(JSON.parse(process.env.RECIPIENT_KEYPAIR))
// );
// const RECIPIENT_KEYPAIR = '2wQkEABxE9abUhB1JnsiGMVrrVpdxFyJ73ViHVga6pW93ZQe1wd8SwdhbnauSZEqumAu4QzzV5h4bk7AdBy38zzE' //account2  CLdt94RjT9Mnxh2jUFCiyDMsjfY158GBwt6bHtrcVb5L 
// const recipientKeypair = Keypair.fromSecretKey(
//   // new Uint8Array(JSON.parse(process.env.RECIPIENT_KEYPAIR))
//   // new Uint8Array.from(bs58.decode(RECIPIENT_KEYPAIR))
//   new Uint8Array(bs58.decode(RECIPIENT_KEYPAIR))
//   // new Uint8Array(JSON.parse(RECIPIENT_KEYPAIR))
//   // new Uint8Array(RECIPIENT_KEYPAIR)
// );

const recipientKeypair = Keypair.fromSecretKey(
  new Uint8Array([
    168, 191,  75, 236, 106, 219, 142, 157,  81, 151, 164,
    173,  35, 179, 119,  18,  87, 118,   8, 245,  66,  81,
    255,  91,  92,  27,  81, 135,  33, 126,  15,  87,  94,
     26, 225,  34,   2,  67, 239, 130,  67,  48, 149, 111,
    126, 114,  51,  13, 113, 247,   3,  40,  54, 156,  54,
     49,  97,  65, 129,  78, 112, 117,  39, 243
  ])
)
console.log('recipientKeypair.publickey: ', recipientKeypair.publicKey)

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


//ayad
/*
Found 1 accounts to withdraw from 🤑
Bag secured, check it: https://solana.fm/tx/4UdRSDNPiT9HVDaciWZGAvpVD8fX2fgSSiqFVFqENX8YBc916Ecs8FAEoeF2f3SsM4FauRbAudTCKd1gtZTsqZKE?cluster=devnet-solana
*/

/*
recipientKeypair.publickey:  PublicKey [PublicKey(7LM6ZaBbmazPtghAennquFRo2v5mCcft69CS37ewfqKp)] {
  _bn: <BN: 5e1ae1220243ef824330956f7e72330d71f70328369c36316141814e707527f3>
}
Found 1 accounts to withdraw from 🤑
Bag secured, check it: https://solana.fm/tx/3rze1D55qCDNWQ5DFuQuj8tz4PwM8iBxchqXyj14R5C8Jp2aYzFwermkMFNoStzD7HqykX4E6R9VLqcj2t5x3byQ?cluster=devnet-solana
 */