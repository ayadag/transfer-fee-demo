import {
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
} from '@solana/web3.js';

const PAYER = [151,250,133,160,178,197,133,103,69,122,236,210,204,163,134,138,41,3,125,57,8,168,214,17,218,120,180,227,245,234,75,72,10,76,127,170,65,248,245,58,114,27,168,242,66,37,79,216,141,207,121,134,27,72,177,85,105,137,186,168,39,146,175,38]; //account11
const payer = Keypair.fromSecretKey(
  new Uint8Array(PAYER)
);

const RecipientKeypair = [
    168, 191,  75, 236, 106, 219, 142, 157,  81, 151, 164,
    173,  35, 179, 119,  18,  87, 118,   8, 245,  66,  81,
    255,  91,  92,  27,  81, 135,  33, 126,  15,  87,  94,
     26, 225,  34,   2,  67, 239, 130,  67,  48, 149, 111,
    126, 114,  51,  13, 113, 247,   3,  40,  54, 156,  54,
     49,  97,  65, 129,  78, 112, 117,  39, 243
]
const recipientKeypair = Keypair.fromSecretKey(
  new Uint8Array(RecipientKeypair)
);
console.log('recipientKeypair.publicKey.toBase58(): ', recipientKeypair.publicKey.toBase58())

// const mint = Keypair.fromSecretKey(
//     new Uint8Array([
//       45, 112,  12, 217,  77,  18,  43, 195, 180, 249,  30,
//       16, 244, 196,  52, 133,  51, 244,  94,  78,   0, 184,
//       53, 205,  34, 206, 128,  79, 242,  13, 230,  45, 236,
//      225,  11,  39, 207,  14, 199,  25, 118, 213,  81,  30,
//       71,  43,  21,  11, 245,  57, 221,  14, 247, 117,   1,
//      174,  85,  77, 100, 147,  53, 173,  34, 132
//    ])
// ).publicKey;  //GwgFHj6641WeNqcut5oSqDA9FZHhriDMEWvj1kD9KUd1
//or
const mint = new PublicKey('GwgFHj6641WeNqcut5oSqDA9FZHhriDMEWvj1kD9KUd1')
// const mint = new PublicKey('66fo8qDCE32QkcWmqwriFJA4feEYhSZs3iyeyBpzpe2c')
const owner = payer.publicKey
const getATADetails = async() => {
    const ATAdress = await getAssociatedTokenAddress(
        mint,
        // payer.publicKey,
        owner,
        false,
        TOKEN_2022_PROGRAM_ID
    );
    console.log('ATAdress.toBase58(): ', ATAdress.toBase58())
}

getATADetails();

//ATAdress: FKzKQRFEFqhnBFjPZ7BXBQ9x4zTP9iYjF5hYLnahUdVC

/*
recipientKeypair.publicKey.toBase58():  7LM6ZaBbmazPtghAennquFRo2v5mCcft69CS37ewfqKp
ATAdress.toBase58():  GAPoALAhgKbGr5t6VLbrcXUy23Hw34QJN3vMY7krMNaF
 */