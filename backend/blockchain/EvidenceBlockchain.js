const Block = require('./Block');
const crypto = require('crypto');

class EvidenceBlockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Adjust for mining difficulty
    this.pendingEvidence = [];
    this.miningReward = 0; // No rewards for evidence blockchain
  }

  createGenesisBlock() {
    const genesisData = {
      message: 'JAN-KAWACH Evidence Vault Genesis Block',
      timestamp: new Date().toISOString(),
      creator: 'system'
    };
    
    return new Block(0, Date.now(), genesisData, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addEvidenceBlock(evidenceData) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      previousBlock.index + 1,
      Date.now(),
      evidenceData,
      previousBlock.hash
    );

    // Mine the block for proof of work
    newBlock.mineBlock(this.difficulty);
    
    // Add to the chain
    this.chain.push(newBlock);
    
    return newBlock;
  }

  createEvidenceData(fileName, fileHash, fileSize, userId, metadata = {}) {
    return {
      fileName,
      fileHash,
      fileSize,
      userId,
      uploadedAt: new Date().toISOString(),
      evidenceId: crypto.randomUUID(),
      metadata: {
        ...metadata,
        chainIndex: this.chain.length,
        integrity: 'verified'
      }
    };
  }

  getEvidenceByHash(fileHash) {
    for (let block of this.chain) {
      if (block.data && block.data.fileHash === fileHash) {
        return {
          block,
          chainIndex: block.index,
          timestamp: block.timestamp,
          hash: block.hash
        };
      }
    }
    return null;
  }

  getEvidenceByUserId(userId) {
    const userEvidence = [];
    
    for (let block of this.chain) {
      if (block.data && block.data.userId === userId) {
        userEvidence.push({
          block,
          chainIndex: block.index,
          timestamp: block.timestamp,
          hash: block.hash,
          evidenceData: block.data
        });
      }
    }
    
    return userEvidence;
  }

  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if current block is valid
      if (!currentBlock.hasValidTransactions()) {
        console.log('Invalid evidence data found');
        return false;
      }

      // Check if hash is correct
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log('Invalid hash found');
        return false;
      }

      // Check if block points to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log('Invalid previous hash found');
        return false;
      }
    }

    return true;
  }

  getBlockchainStats() {
    const totalBlocks = this.chain.length;
    const evidenceBlocks = this.chain.filter(block => 
      block.data && block.data.fileName
    ).length;
    
    return {
      totalBlocks,
      evidenceBlocks,
      genesisBlock: this.chain[0].hash,
      latestBlock: this.getLatestBlock().hash,
      chainValid: this.validateChain(),
      difficulty: this.difficulty
    };
  }

  verifyFileIntegrity(fileHash, originalBlock) {
    // Find the block containing this file
    const evidenceBlock = this.getEvidenceByHash(fileHash);
    
    if (!evidenceBlock) {
      return {
        verified: false,
        message: 'Evidence not found in blockchain'
      };
    }

    // Check if the block hash matches
    const recalculatedHash = evidenceBlock.block.calculateHash();
    
    if (recalculatedHash !== evidenceBlock.block.hash) {
      return {
        verified: false,
        message: 'Evidence has been tampered with'
      };
    }

    // Validate the entire chain up to this point
    const chainValid = this.validateChain();
    
    return {
      verified: chainValid,
      message: chainValid ? 'Evidence integrity verified' : 'Blockchain corruption detected',
      blockIndex: evidenceBlock.chainIndex,
      blockHash: evidenceBlock.hash,
      timestamp: evidenceBlock.timestamp
    };
  }

  exportChain() {
    return {
      chain: this.chain,
      stats: this.getBlockchainStats(),
      exportedAt: new Date().toISOString()
    };
  }
}

module.exports = EvidenceBlockchain;