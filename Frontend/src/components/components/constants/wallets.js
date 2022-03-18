const Metamask = './img/wallet/1.png';
const Bitski = './img/wallet/2.png';
const Fortmatic = './img/wallet/3.png';
const WalletConnect = './img/wallet/4.png';
const CoinbaseWallet = './img/wallet/5.png';
const Arkane = './img/wallet/6.png';
const Authereum = './img/wallet/7.png';
const Torus = './img/wallet/8.png';

export const connectors = [
  {
    title: "Metamask",
    icon: Metamask,
    connectorId: "injected",
    note: "Most Popular",
    description: "Start exploring blockchain applications in seconds.  Trusted by over 1 million users worldwide.",
    priority: 1,
  },
  // {
  //   title: "Bitski",
  //   icon: Bitski,
  //   connectorId: "injected",
  //   note: "",
  //   description: "Bitski connects communities, creators and brands through unique, ownable digital content.",
  //   priority: 999,
  // },
  // {
  //   title: "Fortmatic",
  //   icon: Fortmatic,
  //   connectorId: "injected",
  //   note: "",
  //   description: "Let users access your Ethereum app from anywhere. No more browser extensions.",
  //   priority: 999,
  // },
  {
    title: "WalletConnect",
    icon: WalletConnect,
    connectorId: "walletconnect",
    note: "",
    description: "Open source protocol for connecting decentralised applications to mobile wallets.",
    priority: 2,
  },
  // {
  //   title: "Coinbase Wallet",
  //   icon: CoinbaseWallet,
  //   connectorId: "injected",
  //   note: "",
  //   description: "The easiest and most secure crypto wallet. ... No Coinbase account required.",
  //   priority: 999,
  // },
  // {
  //   title: "Arkane",
  //   icon: Arkane,
  //   connectorId: "injected",
  //   note: "",
  //   description: "Make it easy to create blockchain applications with secure wallets solutions.",
  //   priority: 999,
  // },
  // {
  //   title: "Authereum",
  //   icon: Authereum,
  //   connectorId: "injected",
  //   note: "",
  //   description: "Your wallet where you want it. Log into your favorite dapps with Authereum.",
  //   priority: 999,
  // },
  // {
  //   title: "Torus",
  //   icon: Torus,
  //   connectorId: "injected",
  //   note: "Most Simple",
  //   description: "Open source protocol for connecting decentralised applications to mobile wallets.",
  //   priority: 999,
  // },
];
