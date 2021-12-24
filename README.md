Before running:

1. Only run on localnet
2. Run `anchor run copyIdl` before launching
3. Run `anchor test` to generate the programId's
4. Make sure to find and replace programId's with the newly generated programId's
5. Make sure to find and replace account IDs found in `./app/src/redux/initState.ts` with the newly generated accounts
6. Run `solana-test-validator` in one tab
7. Run `anchor build && anchor deploy && anchor test --skip-build --skip-deploy`

replace (from step 4):
- ratio: 6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z
- mint_and_deposit: 9AWyK1cbjJxP5HLctXeiG1ZHRkZo7sUiy7km7SCtjG9G
