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

document.getElementById('address').innerHTML = 'My address: '+ myAccount.getAddress();

const symbol = 'EXMP'
const name = 'Example Coin'
const description = 'My example coin'
const granularity = 1
const amount = 1000
const iconUrl = 'http://a.b.com/icon.png'

// creazione del token e ricerca in caso di creazione con successo
new RadixTransactionBuilder().createTokenSingleIssuance(
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
      // ricerca del token 
      radixTokenManager.getTokenDefinition(tokenReference).then(tokenDefinition => {
        document.getElementById('token').innerHTML = 'Total supply of EXMP: ' + tokenDefinition.totalSupply
      }).catch(error => {
        // Token wasn't found for some reason
        console.error('Token not found')
      })
    },
    error: error => { console.error('Error submitting transaction', error) }
  })

const tokenReference = `/${myIdentity.account.getAddress()}/${symbol}`
console.log('Token reference' + tokenReference)


