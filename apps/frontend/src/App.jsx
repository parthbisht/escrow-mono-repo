import { EscrowCard } from './components/EscrowCard';

const cards = [
  {
    title: 'Create Escrow',
    description: 'Lock buyer funds, assign seller and arbitrator roles, and attach IPFS metadata.'
  },
  {
    title: 'Manage Delivery',
    description: 'Track delivery state, review windows, and release or cancel funds based on contract rules.'
  },
  {
    title: 'Resolve Disputes',
    description: 'Surface arbitration outcomes and payout splits from the backend and on-chain events.'
  }
];

function App() {
  return (
    <main className="layout">
      <header className="hero">
        <span className="badge">Monorepo Starter</span>
        <h1>Decentralized Escrow Platform</h1>
        <p>
          React frontend for interacting with the Hardhat escrow contract and the NestJS backend.
        </p>
      </header>

      <section className="grid">
        {cards.map((card) => (
          <EscrowCard
            key={card.title}
            title={card.title}
            description={card.description}
            actionLabel="Configure"
          >
            <ul>
              <li>Wallet connection ready for ethers.js integration.</li>
              <li>Prepared for contract reads/writes and backend API calls.</li>
              <li>Designed for production UI extension.</li>
            </ul>
          </EscrowCard>
        ))}
      </section>
    </main>
  );
}

export default App;
