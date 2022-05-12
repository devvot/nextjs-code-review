import { ChainId, useEthers, useInjectedNetwork } from '@usedapp/core';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers, providers } from 'ethers';
import { useEffect } from 'react';
import Web3Modal from 'web3modal';
import { useAppDispatch } from '.';
import { ARBITRUM_NODE } from '../common/AppConfig';
import { LOGIN_SIGNATURE } from '../common/constants';
import { connectUser, logoutUser, setUserAuthorized } from '../redux/user';
import { CustomToast, ToastStatus } from './useToasts';
const LOCAL_STORAGE_CACHED_WEB_3_PROVIDER = 'WEB3_CONNECT_CACHED_PROVIDER';
const useWeb3Modal = () => {
  const { activate, deactivate } = useEthers();
  const { injectedProvider } = useInjectedNetwork();
  const dispatch = useAppDispatch();

  const providerOptions = {
    injected: {
      display: {
        name: 'Metamask',
        description: 'Connect with the provider in your Browser',
      },
      // @ts-ignore
      package: null,
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        bridge: 'https://bridge.walletconnect.org',
        infuraId: '14a0951f47e646c1b241aa533e150219',
        rpc: {
          [ChainId.ArbitrumRinkeby]:
            'https://arb-rinkeby.g.alchemy.com/v2/PDUCdHLoNrdDJwgVvCNPTx7MrHuQ0uBg',
          // PUBLIC / PRIVATE RPC NODE URL
          [ChainId.Arbitrum]: `${ARBITRUM_NODE}`,
        },
      },
    },
  };
  const web3Modal = (): Web3Modal =>
    new Web3Modal({
      providerOptions, // required
      cacheProvider: true,
    });

  const getUser = async (
    web3: Web3Modal,
    provider: ethers.providers.Web3Provider,
    address: string,
    signer: ethers.providers.JsonRpcSigner
  ): Promise<{
    address: string;
    sign: string;
  }> => {
    let signature;
    // DO NOT MODIFY
    CustomToast({
      status: ToastStatus.PENDING_SIGNATURE,
    });
    try {
      // @ts-ignore ignore .wc property not being present
      if (web3.wc || !injectedProvider) {
        signature = await provider.send('personal_sign', [
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes(LOGIN_SIGNATURE)),
          address.toLowerCase(),
        ]);
      } else {
        signature = await signer.signMessage(LOGIN_SIGNATURE);
      }
      const verifiedAddress = await ethers.utils.verifyMessage(
        LOGIN_SIGNATURE,
        signature
      );
      const user = { address: verifiedAddress, sign: signature };
      return user;
    } catch (error) {
      CustomToast({
        status: ToastStatus.REJECTED,
        message: error.message,
      });
      disconnectProvider();
      await dispatch(logoutUser());
    }
  };

  const connectProvider = async (): Promise<void> => {
    try {
      const web3 = await web3Modal().connect();
      const provider = new providers.Web3Provider(web3);
      await activate(web3);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const user = await getUser(web3, provider, address, signer);
      await login(user);
    } catch (error) {
      disconnectProvider();
      await dispatch(logoutUser());
    }
  };

  const login = async (address: { address: string; sign: string }) => {
    try {
      await dispatch(connectUser(address)).unwrap();
      CustomToast({
        status: ToastStatus.WALLET_CONNECTED,
      });
      dispatch(setUserAuthorized(true));
    } catch (e) {
      CustomToast({
        status: ToastStatus.REJECTED,
        message: 'Failed to login. Please try again in a moment...',
      });
    }
  };

  async function disconnectProvider() {
    await web3Modal().clearCachedProvider();
    CustomToast({
      status: ToastStatus.WALLET_DISCONNECTED,
    });
    deactivate();
    dispatch(setUserAuthorized(false));
    dispatch(logoutUser());
  }

  /**
   * Reconnect to web3 provider on page refresh
   */
  async function reconnect() {
    try {
      const provider = await web3Modal().connect();
      await activate(provider);
    } catch (error: any) {
      disconnectProvider();
    }
  }

  useEffect(() => {
    // AUTO RECONNECT ON REFRESH
    (async () => {
      if (localStorage.getItem(LOCAL_STORAGE_CACHED_WEB_3_PROVIDER)) {
        await reconnect();
      }
    })();
    if (window?.ethereum) {
      window.ethereum.on('message', (message) =>
        console.log('message: ', message)
      );

      /**
       * Direct user to refresh page after switch networks, if arbitrum or arbitrum rinkeby
       */
      window?.ethereum.on('chainChanged', (_chainId) => {
        if (
          _chainId?.toString() === `0xa4b1` ||
          _chainId?.toString() === `0x66eeb`
        ) {
          CustomToast({ status: ToastStatus.REFRESH });
          const timer = setInterval(() => {
            CustomToast({ status: ToastStatus.REFRESH });
          }, 8000);
          return () => clearTimeout(timer);
        }
      });
    }
  }, []);

  return { connectProvider, disconnectProvider };
};

export default useWeb3Modal;
