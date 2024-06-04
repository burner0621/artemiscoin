import { Routes, Route } from "react-router-dom";

import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home/Home";
import { useEffect } from "react";
import WOW from "wow.js";
import HomeTwo from "./pages/Home/HomeTwo";
import Blog from "./pages/Blog/Blog";
import BlogDetailsPage from "./pages/BlogDetails/BlogDetailsPage";
import logoIcon from "./assets/img/logo/mark.png";

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';

import Config from "./config";

const config = getDefaultConfig({
  appName: 'blockmono',
  projectId: '757d1cece59093a0645ebab02cd6c102',
  chains: [Config.CHAIN],
  ssr: false,
});

const customTheme = {
  ...darkTheme({
    borderRadius: "none",
    overlayBlur: "large",
  }),
  fonts: {
    body: 'VT323',
  },
  colors: {
    modalBackground: "#1A1B1F",
    accentColor: "#3396FF",
    modalBorder: "#3396FF"
  }
}

const queryClient = new QueryClient();

const Disclaimer = ({ Link, Text }) => {
  return (
    <Text>
      <div style={{ fontSize: "20px", padding: "2px" }}>By connecting your wallet, you agree to our{' '}
        <Link href={Config.POLICY_LINK}>Terms of Service & Privacy Policy</Link>
      </div>
    </Text>
  );
};

const WalletAvatar = ({ size }) => {
  return <img
    src={logoIcon}
    height={size}
    width={size}
    alt="blockmono"
    style={{ borderRadius: 999 }}
  />;
};

function App() {
  useEffect(() => {
    const wow = new WOW({
      boxClass: "wow",
      animateClass: "animated",
      offset: 0,
      mobile: false,
      live: true,
    });
    wow.init();
  }, []);

  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: 'blockmono',
            disclaimer: Disclaimer
          }}
          // showRecentTransactions={true}
          modalSize="compact"
          avatar={WalletAvatar}
          theme={customTheme}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="home-two" element={<HomeTwo />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog-details" element={<BlogDetailsPage />} />
          </Routes>
          <ToastContainer pauseOnFocusLoss={true} position="top-right" toastClassName={'bg-gradient-to-r from-indigo-500 via-blue-500 to-pink-500'} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
