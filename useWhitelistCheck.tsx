import { useContext, useState } from 'react';
import { useAppDispatch } from '.';
import { UserContext } from '../context/userContext';
import { getWhitelistProof } from '../features/minting/mintingSlice';
import { CustomToast, ToastStatus } from './useToasts';

const useWhitelistCheck = (): {
  isWhitelisted: null | boolean;
  checkIfWhitelisted: (tokenId: number) => Promise<any>;
} => {
  const dispatch = useAppDispatch();
  const userContext = useContext(UserContext);
  const [isWhitelisted, setIsWhitelisted] = useState(null);
  const { setIsTransactionPending } = userContext;

  const checkIfWhitelisted = async (tokenId: number) => {
    try {
      const response = await dispatch(getWhitelistProof({ tokenId })).unwrap();
      return response;
    } catch {
      setIsTransactionPending(false);
      setIsWhitelisted(false);
      CustomToast({
        status: ToastStatus.NOT_WHITELISTED,
        message: 'Wallet not on Whitelist',
      });
    }
  };
  return { isWhitelisted, checkIfWhitelisted };
};

export default useWhitelistCheck;
