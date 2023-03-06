import { ChainId, JSBI, Percent, Token, WETH , Pool, Order, FeeAmount,TickMath, TradeType, LimitOrderManager, toHex} from 'dfyn-sdk-v2'
import { ConcenratedPoolABI,ConcenratedPoolHelperABI,dyDxAbi,v2VaultAbi } from './abis.js'
import { Contract, ethers } from 'ethers'
import { Interface } from '@ethersproject/abi'
import { JsonRpcProvider } from '@ethersproject/providers'
import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";
import { tryParseTick } from './utils.js'
import fetch from 'node-fetch';
import {ConcentratedPoolManager,Position} from 'dfyn-sdk-v2';
import { erc20Abi } from './abis.js'


const __dirname = resolve();
dotenvConfig({ path: resolve(__dirname, "./.env") });

// _______________ CONSTANTS _______________ //
const privateKey = process.env.PRIVATE_KEY;
const concentratedLiquidityPoolManager = '0xE664A5DBa489b55144B30b9260C09301AAbFa14e';
const TUSDC = new Token(ChainId.MATIC, '0x191B957b6D591e07C49eF8C1c837823F72DAeE01', 18, 'TUSDC', 'TestUSDC')
const TCOIN = new Token(ChainId.MATIC, '0xeE8f6cDa4a4e4e37F5dE3cCC4d6d013BbF0BDC11', 18, 'TCOIN', 'Tcoin')
const ethersProvider = new ethers.providers.JsonRpcProvider('https://matic.getblock.io/4edbfbad-6502-47e0-b996-e3a329b33e81/mainnet/')

// connect private key to ethers provider
const wallet = new ethers.Wallet(privateKey, ethersProvider)
const signer = wallet.connect(ethersProvider)
debugger
const provider = new JsonRpcProvider(
    'https://matic.getblock.io/4edbfbad-6502-47e0-b996-e3a329b33e81/mainnet/',
    ChainId.MATIC
  )

const concentratedPool = new Contract('0xb2541d2e2492ee6421e648d354531b179c032077', ConcenratedPoolABI, provider)
// const dyDx = new Contract('0xEb56Fe80b7db378Fc53631744B1136E5C3AF64CA',dyDxAbi,provider)
const concenratedPoolHelper = new Contract('0xED4f25884A8606DB024206e73B0a4AEfccF34112',ConcenratedPoolHelperABI,provider)
// const vault = new Contract('0xCBdf60E9985C8cB70D360cBe8838758D7554EDcb',v2VaultAbi,provider)

//const tusdcBalance = await ((new Contract('0x191B957b6D591e07C49eF8C1c837823F72DAeE01',erc20Abi,provider)).balanceOf(wallet.address))/(10**18)
//const tcoinBalance = await ((new Contract('0xeE8f6cDa4a4e4e37F5dE3cCC4d6d013BbF0BDC11',erc20Abi,provider)).balanceOf(wallet.address))/(10**18)
// console.log('Starting Liquidity:','Token A: ',tusdcBalance,'Token B:',tcoinBalance)
const liquidity = await concentratedPool.liquidity()
const sqrtPriceX96 = await concentratedPool.getPriceAndNearestTicks()

// Create Pool Instance
const pool = new Pool(
    TCOIN,
    TUSDC,
    500,
    sqrtPriceX96._price,
    liquidity,
    TickMath.getTickAtSqrtRatio(JSBI.BigInt(sqrtPriceX96._price))
  )


// Fetch exisiting position
const url = 'https://subgraph.satsuma-prod.com/57a2c796086f/dfyn/dfyn-concentrated-2/api'
const query = `{
    positions(where:{owner:"${wallet.address.toLowerCase()}"}){
      id
      pool{
        id
        tick
      }
      tickLower{
        tickIdx
      }
      tickUpper{
        tickIdx
      }
      liquidity
  }
  }`

const fetchOrders = async () => {
console.log('fetching orders')
const response = await fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({
    query
    }),
})

const data:any = await response.json()
return data.data.positions
}

// Remove liquidity from inactive positions and call create new position
const removeInactivePositions = async() => {
  const positions = await fetchOrders();
  const gasPrice = ethers.utils.hexlify(69000000000)
  const gasLimit = ethers.utils.hexlify(Number(1000000))
  for(let i=0;i<positions.length;i++){
    console.log(positions[i].liquidity)
    if (positions[i].liquidity > 0){
      if(parseFloat(positions[i].tickLower.tickIdx) > parseFloat(positions[i].pool.tick)
      || parseFloat(positions[i].pool.tick) > parseFloat(positions[i].tickUpper.tickIdx))

      {
        console.log(positions[i].id,": Out Of Range")
        console.log("Readjusting position to make it in range...")
        const positionSDK = new Position({
          pool: pool,
          liquidity: positions[i].liquidity.toString(),
          tickLower: parseFloat(positions[i].tickLower.tickIdx),
          tickUpper: parseFloat(positions[i].tickUpper.tickIdx),
        })
        
        const { calldata, value } = ConcentratedPoolManager.removeCallParameters(positionSDK, {
          tokenId: positions[i].id.toString(),
          liquidityPercentage: new Percent(100),
          slippageTolerance: new Percent(1),
          recipient: wallet.address,
          unwrapVault: true,
        })
    
        const removeLiquidityTxn = await signer.sendTransaction({
          from: wallet.address,
          to: concentratedLiquidityPoolManager,
          data: calldata,
          maxFeePerGas: 500000000000, 
          maxPriorityFeePerGas: 50000000000, 
          gasLimit
          })
        
        console.log(' Remove Liquidity Transaction :', removeLiquidityTxn.hash)
        await removeLiquidityTxn.wait()
        createNewPosition();
      }
    }
    
  }
}

//Create new position with active in range liquidity
const createNewPosition = async() => {
    const sqrtPriceX96 = await concentratedPool.getPriceAndNearestTicks()
    const upperPrice = (JSBI.divide(JSBI.add(JSBI.BigInt(sqrtPriceX96._price), JSBI.multiply(JSBI.BigInt(2),JSBI.BigInt(10**18))),JSBI.BigInt(10**18))).toString()
    const lowerPrice = (JSBI.divide(JSBI.subtract(JSBI.BigInt(sqrtPriceX96._price), JSBI.multiply(JSBI.BigInt(2),JSBI.BigInt(10**18))),JSBI.BigInt(10**18))).toString()
  
    const validUpperTick = tryParseTick(pool?.token1, pool?.token0, FeeAmount.LOW, upperPrice, false)+100
    const validLowerTick = tryParseTick(pool?.token1, pool?.token0, FeeAmount.LOW, lowerPrice, true)-100

    const [lowerOld, upperOld] = await concenratedPoolHelper.getLowerOldAndUpperOld(
      concentratedPool.address,
      validLowerTick,
      validUpperTick
    )
    //console.log(TickMath.getTickAtSqrtRatio(lowerPrice),TickMath.getTickAtSqrtRatio(upperPrice))
    const position = await Position.fromAmounts({
      pool:pool,
      tickLower: validLowerTick,
      tickUpper: validUpperTick,
      amount0: JSBI.multiply(JSBI.BigInt(5),JSBI.BigInt(10**18)),
      amount1: JSBI.multiply(JSBI.BigInt(5),JSBI.BigInt(10**18)),
      useFullPrecision: true,
    })
    
    const { calldata , value} = ConcentratedPoolManager.addCallParameters(position,{
      slippageTolerance: new Percent(50, 10_000),
      recipient: wallet.address,
      deadline: '10000000000000000000',
      createPool: false,
      lowerOldTick: lowerOld,
      upperOldTick: upperOld,
    })

    const gasLimit = ethers.utils.hexlify(Number(1000000))
    const addLiquidityTxn = await signer.sendTransaction({
      from: wallet.address,
      to: concentratedLiquidityPoolManager,
      data: calldata,
      maxFeePerGas: 500000000000,
      maxPriorityFeePerGas: 50000000000, 
      gasLimit
      })
    
    console.log('Add liquidity Transaction',':', addLiquidityTxn.hash)
    await addLiquidityTxn.wait()
}
removeInactivePositions();





