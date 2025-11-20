# FEVA PROTOCOL - DEPLOYED CONTRACTS

## Deployment Date: November 20, 2024

---

## Sepolia Testnet

### FEV Token
- Address: 0xaa3Ae25eBac250Ff67F4d9e3195C4C7610055067
- Supply: 1,000,000,000 FEV
- Explorer: https://sepolia.etherscan.io/address/0xaa3Ae25eBac250Ff67F4d9e3195C4C7610055067

---

## Arc Testnet

### Network Info
- RPC: https://rpc.testnet.arc.network
- Chain ID: 5042002
- Explorer: https://testnet.arcscan.app

### FEV Token
- Address: 0xb835C66Ade11a20A4C022cA64237027eA5B5fc50
- Supply: 1,000,000,000 FEV
- Explorer: https://testnet.arcscan.app/address/0xb835C66Ade11a20A4C022cA64237027eA5B5fc50

### DEX Factory
- Address: 0x5EE85b15F60786824b9D586CAD101Ebc9A6a0bAB
- Purpose: Creates TOKEN/FEV trading pairs
- Explorer: https://testnet.arcscan.app/address/0x5EE85b15F60786824b9D586CAD101Ebc9A6a0bAB

### DEX Router
- Address: 0x57eB45CF116A835CFFf5A244820EDC6b63963468
- Purpose: Swap and liquidity management
- Explorer: https://testnet.arcscan.app/address/0x57eB45CF116A835CFFf5A244820EDC6b63963468

### Token Factory
- Address: 0x9855CF5c109DAdd78735D4E04430Ab067C735Bc1
- Purpose: Deploy memecoins with metadata
- Explorer: https://testnet.arcscan.app/address/0x9855CF5c109DAdd78735D4E04430Ab067C735Bc1

---

## Frontend Configuration

Update frontend/.env:
```
VITE_FEV_TOKEN_SEPOLIA=0xaa3Ae25eBac250Ff67F4d9e3195C4C7610055067
VITE_FEV_TOKEN_ARC=0xb835C66Ade11a20A4C022cA64237027eA5B5fc50
VITE_DEX_FACTORY_ARC=0x5EE85b15F60786824b9D586CAD101Ebc9A6a0bAB
VITE_DEX_ROUTER_ARC=0x57eB45CF116A835CFFf5A244820EDC6b63963468
VITE_TOKEN_FACTORY_ARC=0x9855CF5c109DAdd78735D4E04430Ab067C735Bc1
VITE_ARC_RPC_URL=https://rpc.testnet.arc.network
VITE_ARC_CHAIN_ID=5042002
```

---

## Next Steps for Tomorrow

1. Update frontend/.env with deployed addresses
2. Start backend server
3. Start frontend
4. Test full platform functionality
5. Deploy first test memecoin
6. Test swap functionality
7. Test liquidity addition
8. Verify point system works

---

## Phase Status

- Phase 1: Smart Contracts - DEPLOYED
- Phase 2: Backend API - COMPLETE
- Phase 3: Frontend Trading - COMPLETE
- Phase 4: Bridge System - PENDING
- Phase 5: Token Launchpad UI - PENDING
- Phase 6: Gamification - PENDING
- Phase 7: Polish and Production Deploy - PENDING