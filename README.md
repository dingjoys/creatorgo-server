# CreatorGO

CeratorGO is a decentralized reputation protocol empowering creators to bring their works to the blockchain, boosting exposure, followers, and revenue.


## Data Streaming

The server provides webhook to read nft transfer events data, which is streamed by QuickNode service. Data will be stored in Mysql.

## Indexing Service

The raw data will be analysized by data syncing schedules and calculated into Creator Score. The APIs will provide data to the webapp.

```
yarn && yarn server
```

## Eas Attestation

Creators could choose to upload their Creator Score on chain powered by EAS service.

Schema Url - [https://base-sepolia.easscan.org/attestation/view/0xd0e0dce35a8abebdacb21b7956c1669dd10c0e884f8186a26ed9cb535d996019](https://base-sepolia.easscan.org/attestation/view/0xd0e0dce35a8abebdacb21b7956c1669dd10c0e884f8186a26ed9cb535d996019https:/)