import {
  radixUniverse,
  RadixUniverse,
  RadixIdentityManager,
  RadixAccount,
  RadixTransactionBuilder,
  radixTokenManager
} from 'radixdlt'

radixUniverse.bootstrap(RadixUniverse.LOCALHOST_SINGLENODE)

const identityManager = new RadixIdentityManager()
const myIdentity = identityManager.generateSimpleIdentity()
const myAccount = myIdentity.account

myAccount.openNodeConnection()

const faucetAddress = 'JH1P8f3znbyrDj8F4RWpix7hRkgxqHjdW2fNnKpR3v6ufXnknor'
const faucetAccount = RadixAccount.fromAddress(faucetAddress, true)
const message = 'Dear Faucet, may I please have some money?'

RadixTransactionBuilder
  .createRadixMessageAtom(myAccount, faucetAccount, message)
  .signAndSubmit(myIdentity)


const radixToken = radixUniverse.nativeToken
myAccount.transferSystem.getTokenUnitsBalanceUpdates().subscribe(balance => {
  // Get the balance for the token we are interested in
  const nativeTokenBalance = balance[radixToken.toString()]
  console.log("nativeTokenBalance: " + nativeTokenBalance)
  // do we have at least 5 tokens?
  if (nativeTokenBalance.greaterThan(5)) {

    // Put your friends' address here
    const toAddress = 'JHn1iZFKf3GPwk7dMcsYRN9gG8BCSdsvQa8CBENuiwV69Y9pPCB'
    const toAccount = RadixAccount.fromAddress(toAddress, true)

    // Send 5 tokens to the address
    RadixTransactionBuilder
      .createTransferAtom(myAccount, toAccount, radixToken, 5)
      .signAndSubmit(myIdentity)
  }
})

document.getElementById('address').innerHTML = 'My address: ' + myAccount.getAddress();

createToken()

function createToken() {
  const symbol = 'EXMP'
  const name = 'Example Coin'
  const description = 'My example coin'
  const granularity = 1
  const amount = 1000
  const iconUrl = 'http://a.b.com/icon.png'

  // creazione del token e ricerca in caso di creazione con successo
  new RadixTransactionBuilder().createTokenMultiIssuance(
    myIdentity.account,
    name,
    symbol,
    description,
    granularity,
    amount,
    iconUrl,
  ).signAndSubmit(myIdentity)
    .subscribe({
      next: status => { console.log(status) },
      complete: async () => {
        console.log('Token defintion has been created')
        const tokenReference = `/${myIdentity.account.getAddress()}/${symbol}`
        console.log('Token reference: ' + tokenReference)
        lookupToken(tokenReference)
        mintTokens(tokenReference, 5)
      },
      error: error => { console.error('Error submitting transaction', error) }
    })
}

function lookupToken(tokenReference) {
  // ricerca del token 
  radixTokenManager.getTokenDefinition(tokenReference).then(tokenDefinition => {
    document.getElementById('tokenAmount').innerHTML = 'Total supply of EXMP: ' + tokenDefinition.totalSupply
  }).catch(error => {
    // Token wasn't found for some reason
    console.error('Token not found')
  })
}

function mintTokens(tokenReference, amountToMint) {
  // minting some tokens
  RadixTransactionBuilder.createMintAtom(myIdentity.account, tokenReference, amountToMint)
    .signAndSubmit(myIdentity)
    .subscribe({
      next: status => { console.log(status) },
      complete: () => {
        console.log('Tokens have been minted')
        burnTokens(tokenReference, 10)
      },
      error: error => { console.error('Error submitting transaction', error) }
    })
}

function burnTokens(tokenReference, amountToBurn) {
  // burning some tokens
  RadixTransactionBuilder.createBurnAtom(myIdentity.account, tokenReference, amountToBurn)
    .signAndSubmit(myIdentity)
    .subscribe({
      next: status => { console.log(status) },
      complete: () => {
        console.log('Tokens have been burned')
        sendTokens(tokenReference)
      },
      error: error => { console.error('Error submitting transaction', error) }
    })
}

function sendTokens(tokenReference) {
  // sending some tokens
  const toAccount = RadixAccount.fromAddress('JEaSfBftmFdseSRKfTm6hJNhQi3FAEqmVzAPTxsf55wPqXvBxRB', true)
  const token = tokenReference // My token
  const amountToSend = 123

  const transactionStatus = RadixTransactionBuilder
    .createTransferAtom(myAccount, toAccount, token, amountToSend)
    .signAndSubmit(myIdentity)

  transactionStatus.subscribe({
    next: status => {
      console.log(status)
      // For a valid transaction, this will print, 'FINDING_NODE', 'GENERATING_POW', 'SIGNING', 'STORE', 'STORED'
    },
    complete: () => { console.log('Transaction completed') },
    error: error => { console.error('Error submitting transaction', error) }
  })
}