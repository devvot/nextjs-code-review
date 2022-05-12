import { ChainId, useEthers } from '@usedapp/core';
import React, { useContext, useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { OwnedBattlefliesContext } from '../context/ownedBattlefliesContext';
import { StakedBattlefliesContext } from '../context/stakedBattlefliesContext';

export enum ToastStatus {
  PENDING = 'PENDING',
  PENDING_SIGNATURE = 'PENDING_SIGNATURE',
  EXISTING_USER = 'EXISTING_USER',
  NOT_WHITELISTED = 'NOT_WHITELISTED',
  CHAIN_NOT_SUPPORTED = 'CHAIN_NOT_SUPPORTED',
  FAILURE = 'FAILURE',
  REJECTED = 'REJECTED',
  SUCCESS = 'SUCCESS',
  WALLET_CONNECTED = 'WALLET_CONNECTED',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  SUFFICIENT_MAGIC_BALANCE = 'SUFFICIENT_MAGIC_BALANCE',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  REFRESH = 'REFRESH',
}

export const getColor = (status: string) => {
  const colors: {
    [key: string]: { color: string; icon: string; description: string };
  } = {
    EXISTING_USER: {
      color: `transition bg-core-purple hover:bg-core-purple-highlight`,
      icon: '/assets/icons/transaction-success.svg',
      description: 'Welcome Back',
    },
    REFRESH: {
      color: `transition bg-core-purple hover:bg-core-purple-highlight`,
      icon: '/assets/icons/transaction-success.svg',
      description: 'Please Refresh After Switching Networks',
    },
    SUFFICIENT_MAGIC_BALANCE: {
      color: `transition bg-core-purple hover:bg-core-purple-highlight`,
      icon: '/assets/icons/transaction-success.svg',
      description: 'Sufficient Magic Balance',
    },
    PENDING: {
      color: `transition bg-core-purple hover:bg-core-purple-highlight`,
      icon: '/assets/icons/transaction-submit.svg',
      description: 'Transaction Submitted',
    },
    PENDING_SIGNATURE: {
      color: `transition bg-core-purple hover:bg-core-purple-highlight`,
      icon: '/assets/icons/transaction-success.svg',
      description: 'Pending...',
    },
    CHAIN_NOT_SUPPORTED: {
      color: `transition bg-core-red hover:bg-core-red-highlight`,
      icon: '/assets/icons/transaction-failure.svg',
      description: 'Chain Not Supported',
    },
    REJECTED: {
      color: `transition bg-core-red hover:bg-core-red-highlight`,
      icon: '/assets/icons/transaction-failure.svg',
      description: 'Rejected',
    },
    WALLET_CONNECTED: {
      color: `transition bg-core-green hover:bg-core-green-highlight`,
      icon: '/assets/icons/transaction-success.svg',
      description: 'Wallet Connected',
    },
    SUCCESS: {
      color: `transition bg-core-green hover:bg-core-green-highlight`,
      icon: '/assets/icons/transaction-success.svg',
      description: 'Transaction Confirmed',
    },
    WALLET_DISCONNECTED: {
      color: `transition bg-core-purple hover:bg-core-purple-highlight`,
      icon: '/assets/icons/transaction-success.svg',
      description: 'Wallet Disconnected',
    },
    INSUFFICIENT_BALANCE: {
      color: `transition bg-core-orange hover:bg-core-orange-highlight`,
      icon: '/assets/icons/transaction-warning.svg',
      description: 'Insufficient Balance',
    },
    NOT_WHITELISTED: {
      color: `transition bg-core-red hover:bg-core-red-highlight`,
      icon: '/assets/icons/transaction-whitelist.svg',
      description: 'Whitelist',
    },
  };
  if (colors[status]) return colors[status];
  return colors[ToastStatus.PENDING];
};

const getHashLink = (hash: string) => {
  const supportedChain = {
    [ChainId.ArbitrumRinkeby]: 'https://testnet.arbiscan.io/tx',
    [ChainId.Arbitrum]: 'https://arbiscan.io/tx',
  };
  const { chainId: currentChainId } = useEthers();
  //@ts-ignore
  const hashLink = `${supportedChain[currentChainId]}/${hash}`;
  return hashLink;
};

const NotificationsContainer = () => {
  const { isStakedBattlefliesCartOpen } = useContext(StakedBattlefliesContext);
  const { isOwnedBattlefliesCartOpen } = useContext(OwnedBattlefliesContext);
  const [isAddingSidebarStyling, setIsAddingSidebarStyling] = useState(false);

  useEffect(() => {
    const SIDEBAR_TOASTS = [
      isStakedBattlefliesCartOpen,
      isOwnedBattlefliesCartOpen,
    ];
    setIsAddingSidebarStyling(SIDEBAR_TOASTS.some((cart) => cart === true));
  }, [isStakedBattlefliesCartOpen, isOwnedBattlefliesCartOpen]);

  const sidebarStyling = !isAddingSidebarStyling
    ? `absolute mt-20 max-w-[450px]`
    : `toasty`;

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerClassName={`${sidebarStyling}`}
      containerStyle={{
        ...(isAddingSidebarStyling && { position: 'relative' }),
        display: 'block',
        zIndex: 1,
      }}
      toastOptions={{
        // Define default options
        className: '',
        duration: 7000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        // Default options for specific types
        success: {
          duration: 3000,
          theme: {
            primary: 'green',
            secondary: 'black',
          },
        },
      }}
    />
  );
};

const TransactionLink = ({ hash }: { hash: string }) => {
  const hashLink = getHashLink(hash);
  return (
    <a style={{ width: '30px' }} href={hashLink} target="_blank">
      <img src="/assets/icons/transaction-link.svg" className="w-full h-full" />
    </a>
  );
};

const Toast = ({ t, status, message, account, hash }: ToastType) => {
  const isCenteringText = (status: string) => {
    const centers = [
      ToastStatus.WALLET_CONNECTED,
      ToastStatus.WALLET_DISCONNECTED,
      ToastStatus.EXISTING_USER,
      ToastStatus.SUFFICIENT_MAGIC_BALANCE,
    ];
    return centers.some((el) => el === status) && !message;
  };
  const hashLink = getHashLink(hash);
  return (
    <div
      style={{ maxWidth: '450px' }}
      className={`flex flex-col gap-2 w-full rounded justify-center ${
        getColor(status).color
      } p-4 ${t.visible ? 'fade-in' : 'fade-out-toast'}`}
    >
      <div className="flex">
        <img src={getColor(status).icon} className="pr-4" />

        <div
          className={`flex ${
            isCenteringText(status) && `justify-center`
          } w-full font-bold text-sm  text-center`}
        >
          {getColor(status).description} {ToastStatus.EXISTING_USER && account}
        </div>
      </div>
      {message && (
        <div className="flex justify-between items-center">
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {hash ? (
              <a href={hashLink} target="_blank">
                {message}
              </a>
            ) : (
              <>{message}</>
            )}
          </div>
          {hash && <TransactionLink hash={hash} />}{' '}
        </div>
      )}
    </div>
  );
};

type ToastType = {
  status: ToastStatus;
  message?: string;
  account?: string;
  hash?: string;
  t?: any;
};

export const CustomToast = ({ status, message, account, hash }: ToastType) => {
  return toast.custom((t) => (
    <Toast
      t={t}
      status={status}
      message={message}
      account={account}
      hash={hash}
    />
  ));
};

const ToastContainer = (): JSX.Element => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted && <NotificationsContainer />;
};

export default ToastContainer;
