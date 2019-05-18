import React from "react";
import {Button, Intent, Menu, MenuDivider, MenuItem, Popover, Position} from "@blueprintjs/core";
import {withWallet} from "../hoc/withWallet";
import Wallet from "@trx/core/dist/blockchain/wallet/wallet";
import prepareTestNetWallet from "../commands/createNewTestNetWallet";
import {withDialogs} from "../hoc/withDialogs";
import {connect} from "react-redux";
import {activeWalletDataSelector} from "../redux/config.selectors";
import {FormattedNumber} from "react-intl";
import {withNetwork} from "../hoc/withNetwork";
import {copyWithConfirmation} from "../utils/clipboard";

@withDialogs
@withNetwork
@withWallet
@connect(
  state => ({
    activeWalletData: activeWalletDataSelector(state),
  }),

  ({ config: { setWalletName, deleteWallet, }, wallet: { reloadWallet } }) => ({
    setWalletName,
    deleteWallet,
    reloadWalletAddress: reloadWallet,
  }),
  null,
  { pure: false },
)
export default class WalletMenu extends React.Component<any, any> {

  addWallet = async () => {

    const wallet = Wallet.create();

    const newName = await this.props.prompt("New Wallet Name");

    this.props.addWallet({
      name: newName,
      address: wallet.address,
      privateKey: wallet.privateKey,
    });

    this.props.setActiveWallet(wallet.address);
    this.props.reloadWalletAddress(wallet.address);
  };

  addTestNetWallet = async () => {

    const wallet = Wallet.create();

    const newName = await this.props.prompt("New Wallet Name");

    this.props.addWallet({
      name: newName,
      address: wallet.address,
      privateKey: wallet.privateKey,
    });

    this.props.setActiveWallet(wallet.address);

    await prepareTestNetWallet(wallet.address);
    this.props.reloadWalletAddress(wallet.address);
  };

  requestTestNetTrx = async () => {
    await prepareTestNetWallet(this.props.wallet.address);
    this.props.reloadWalletAddress(this.props.wallet.address);
  };

  import = async () => {

    const privateKey = await this.props.prompt("Private Key");

    const wallet = Wallet.importPrivateKey(privateKey);

    this.props.addWallet({
      name: 'Imported',
      address: wallet.address,
      privateKey: wallet.privateKey,
    });

    this.props.setActiveWallet(wallet.address);
    this.props.reloadWalletAddress(wallet.address);
  };

  changeWalletName = async () => {
    const {wallet} = this.props;
    const newName = await this.props.prompt("Change Wallet Name", wallet.name);

    this.props.setWalletName({
      wallet: wallet.address,
      name: newName
    });
  };


  deleteWallet = async (wallet) => {

    if (await this.props.confirmDelete({
      confirmText: 'Delete Wallet',
      body: (
        <p>
          Are you sure you want to delete <b>{wallet.name}</b>?
        </p>
      )
    })) {
      this.props.deleteWallet(wallet.address);
    }
  };


  isExtension = () => this.props.network.id === 'extension';

  render() {

    const { wallet, activeWalletData } = this.props;

    return (
      <Popover
        autoFocus={false}
        content={
          <Menu style={{ width: 400 }}>
            <MenuItem
              icon="id-number"
              text={wallet.address}
              onClick={() => copyWithConfirmation(wallet.address, `Copied ${this.props.wallet.address} to clipboard`)}
            />
            <MenuItem
              icon="credit-card"
              text={
                <React.Fragment>
                  <FormattedNumber value={activeWalletData.balance / 1000000} /> TRX
                </React.Fragment>
              }
            />
            <MenuItem
              icon="flash"
              text={
                <React.Fragment>
                  <FormattedNumber value={activeWalletData.energy} /> Energy
                </React.Fragment>
              }  />
            <MenuDivider />
            <MenuItem icon="new-text-box"
                      text="Rename Wallet"
                      disabled={this.isExtension()}
                      onClick={this.changeWalletName} />
            <MenuItem icon="trash"
                      disabled={this.isExtension()}
                      text="Delete Wallet"
                      intent={Intent.DANGER}
                      onClick={() => this.deleteWallet(wallet)} />
            <MenuItem icon="export"
                      disabled={this.isExtension()}
                      text="Export Private Key"
                      onClick={() =>
                        copyWithConfirmation(
                          wallet.privateKey,
                          `Copied private key to clipboard`, {
                            icon: "key",
                          })
                      } />

          };
            <MenuDivider />
            <MenuItem icon="folder-open" text="Open Wallet" disabled={this.isExtension()}>
              {
                Object.values(this.props.wallets).map((item: any) => (
                  <MenuItem key={item.address}
                            text={item.name}
                            onClick={() => {
                              this.props.setActiveWallet(item.address);
                              this.props.reloadWalletAddress(item.address);
                            }} />
                ))
              }
            </MenuItem>
            <MenuItem text="Create Wallet"
                      icon="document"
                      onClick={this.addWallet}
                      disabled={this.isExtension()}
                      intent={Intent.SUCCESS}
            />
            <MenuItem text="Import Private Key" icon="add-to-folder" onClick={this.import}  />
            <MenuDivider />
            <MenuItem text="Create Testnet Wallet" icon="clean" onClick={this.addTestNetWallet} disabled={this.isExtension()}  />
            <MenuItem text="Request Testnet TRX" icon="clean" onClick={this.requestTestNetTrx}  />
          </Menu>
        }
        position={Position.BOTTOM_RIGHT}>
        {
          wallet &&
            <Button
              icon="bank-account"
              rightIcon="caret-down"
              text={`${wallet.name} (${wallet.address.slice(0, 6)}..)`}
              className="mr-2" />
        }
      </Popover>
    );
  }
}
