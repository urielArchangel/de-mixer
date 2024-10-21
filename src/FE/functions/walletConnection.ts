import "@rainbow-me/rainbowkit/styles.css";
import { Theme } from "@rainbow-me/rainbowkit";
import { mainnet,sepolia } from "wagmi/chains";
import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Configure the public and web socket clients

export const config = getDefaultConfig({
  appName: "DE-Mixer Dapp",
  projectId: "0.1.0",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

// Custom RainbowKit Theme
export const myCustomButtonTheme: Theme = {
  blurs: {
    modalOverlay: "high",
  },
  colors: {
    accentColor: "#566778",
    accentColorForeground: "#ffffff",
    actionButtonBorder: "...",
    actionButtonBorderMobile: "...",
    actionButtonSecondaryBackground: "#000000",
    closeButton: "#ffffff",
    closeButtonBackground: "#000000",
    connectButtonBackground: "...",
    connectButtonBackgroundError: "#ff0000",
    connectButtonInnerBackground: "#78899a",
    connectButtonText: "#000000",
    connectButtonTextError: "#ff0000",
    connectionIndicator: "#0f0f0f",
    downloadBottomCardBackground: "#ffffff",
    downloadTopCardBackground: "#00aa00",
    error: "#ff0000",
    generalBorder: "...",
    generalBorderDim: "...",
    menuItemBackground: "#000000",
    modalBackdrop: "#112233ee",
    modalBackground: "#000000",
    modalBorder: "#00cccc",
    modalText: "#ffffff",
    modalTextDim: "#020202",
    modalTextSecondary: "#ffffff",
    profileAction: "#121212",
    profileActionHover: "#ffffff22",
    profileForeground: "#000000",
    selectedOptionBorder: "...",
    standby: "...",
  },
  fonts: {
    body: "...",
  },
  radii: {
    actionButton: "0",
    connectButton: "0",
    menuButton: "0",
    modal: "0",
    modalMobile: "0",
  },
  shadows: {
    connectButton: "...",
    dialog: "...",
    profileDetailsAction: "...",
    selectedOption: "...",
    selectedWallet: "...",
    walletLogo: "....",
  },
};
