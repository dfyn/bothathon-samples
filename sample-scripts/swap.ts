import { BigNumber, Contract, ethers } from "ethers";
import { JsonRpcProvider } from '@ethersproject/providers'
import { ChainId } from "dfyn-sdk-v2";
import axios from 'axios'
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import fetch from 'node-fetch';
import { erc20Abi } from './abis.js'
import { Interface } from "ethers/lib/utils.js";

const __dirname = resolve();
dotenvConfig({ path: resolve(__dirname, "./.env") });


// _______________ CONSTANTS _______________ //
const privateKey = process.env.PRIVATE_KEY;
const router = '0x47b7169c7d722C65eC1545f0a14770c3C8acBe43'

// web3 instance for polygon, chainId = 137
//const web3 = new Web3('https://polygon-rpc.com/')
// const ethersProvider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/')
// /const ethersProvider = new ethers.providers.JsonRpcProvider('https://matic.getblock.io/4edbfbad-6502-47e0-b996-e3a329b33e81/mainnet/')

// connect private key to ethers provider
const ethersProvider = new JsonRpcProvider(
    'https://polygon-mainnet.g.alchemy.com/v2/aDKJq_J0-enA7NOA3ln8Ra7eujzxWx70',
    ChainId.MATIC
)
const wallet = new ethers.Wallet(privateKey, ethersProvider)
const signer = wallet.connect(ethersProvider)


const baseURL = "https://api.defyn.network/quote"

const baseParameters = {
    deadline: 10800,
    slippageTolerance: 2,
    type: "exactIn",
    protocols: "v2dfyn",
    // tokenInAddress:"0x779A94F3D040B3aECC506B887C9C9E331d51dD7f",
    tokenInChainId: 137,
    // tokenOutAddress:"0x191B957b6D591e07C49eF8C1c837823F72DAeE01",
    tokenOutChainId: 137,
    amount: "8000000000000000000000",
    recipient: "0xb97987D9B528fEf604ef129D8f9B7c84764766b8"
}

const swapSimulate = async () => {

    const token0 = "0x779A94F3D040B3aECC506B887C9C9E331d51dD7f"
    const token1 = "0x191B957b6D591e07C49eF8C1c837823F72DAeE01"
    const gasPlatformApi = '20f13dc0-b15c-4746-ba3d-4e8defb0d817'
    const gasPrice = 1500000000000
    const gasLimit = 1000000
    for (let i = 0; i <= 100; i++) {
        //const zeroForOne = 0
        const zeroForOne = randomIntFromInterval(0, 1) === 0
        console.log(zeroForOne)
        const params = zeroForOne ? {
            ...baseParameters, tokenInAddress: token0, tokenOutAddress: token1
        } : {
            ...baseParameters, tokenInAddress: token1, tokenOutAddress: token0
        }
        
        const res = await axios.get("https://api.defyn.network/quote", { params })
        
        // @Todo fetch baseFee , set maxFeePerGas = maxPriorityFeePerGas + 2*baseFee + 10 gwei
        // fetch, default maxPriorityFeePerGas = 50 gwei
        const Txn = await signer.sendTransaction({
            from: wallet.address,
            to: router,
            data: res.data.methodParameters.calldata,
            value: res.data.methodParameters.value,
            maxFeePerGas: 300000000000, //wei, 1 gwei = 10^9 wei 
            maxPriorityFeePerGas: 30000000000, //wei
            gasLimit
        })
        //console.log(Txn)
        await Txn.wait()
        console.log(Txn.hash)
        await wait(10000)
        

    }



}
swapSimulate()

const wait = async (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}


function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}