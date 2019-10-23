import { activeWalletSelector } from "../redux/config.selectors";
import { useDispatch, useSelector } from "react-redux";


export function useWallet() {

  const wallet = useSelector(x => activeWalletSelector(x));
  const wallets = useSelector(({ config }) => config.wallets);
  const dispatch = useDispatch<any>();

  return {
    wallet,
    wallets,
    setActiveWallet: dispatch.config.setActiveWallet,
    addWallet: dispatch.config.addWallet,
    reloadWallet: dispatch.wallet.reloadWallet,
  };
}
