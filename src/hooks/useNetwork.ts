import { activeNetworkSelector } from "../redux/config.selectors";
import { useSelector } from "react-redux";

export function useNetwork() {

  const network = useSelector(state => activeNetworkSelector(state));
  const networks = useSelector(({ config }) => config.networks);

  return {
    network,
    networks
  };
}
