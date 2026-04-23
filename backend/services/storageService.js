import { Indexer, MemData } from '@0gfoundation/0g-ts-sdk'
import { ethers } from 'ethers'

import config from '../config/config.js'

const encoder = new TextEncoder()

function getStorageCredentials() {
  const { rpcUrl, indexerRpc, privateKey } = config.storage

  if (!rpcUrl) {
    throw new Error('0G storage RPC URL is not configured')
  }

  if (!indexerRpc) {
    throw new Error('0G storage indexer RPC URL is not configured')
  }

  if (!privateKey) {
    throw new Error('0G storage private key is not configured')
  }

  return { rpcUrl, indexerRpc, privateKey }
}

function normalizeRootHash(tx, tree) {
  const rootHash = tx?.rootHash || tx?.rootHashes?.[0] || tree?.rootHash?.()
  if (!rootHash) {
    throw new Error('0G upload completed without a root hash')
  }

  return rootHash
}

export async function uploadAgentMetadata(metadata) {
  const { rpcUrl, indexerRpc, privateKey } = getStorageCredentials()
  const payload = encoder.encode(JSON.stringify(metadata))
  const memData = new MemData(payload)
  const [tree, treeError] = await memData.merkleTree()

  if (treeError !== null) {
    throw new Error(`0G merkle tree error: ${treeError}`)
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const signer = new ethers.Wallet(privateKey, provider)
  const indexer = new Indexer(indexerRpc)
  const [tx, uploadError] = await indexer.upload(memData, rpcUrl, signer)

  if (uploadError !== null) {
    throw new Error(`0G upload error: ${uploadError}`)
  }

  const rootHash = normalizeRootHash(tx, tree)

  return {
    metadataUri: `0g://${rootHash}`,
    rootHash,
    txHash: tx?.txHash || null,
  }
}