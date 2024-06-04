import Button from "../Button/Button";
import { ConnectButton } from '@rainbow-me/rainbowkit';

const ConnectWallet = () => {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');
                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button
                                        sm='true'
                                        onClick={openConnectModal}
                                    >
                                        Connect
                                    </Button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <Button
                                        sm='true'
                                        onClick={openChainModal}
                                    >
                                        Wrong
                                    </Button>
                                );
                            }
                            return (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {/* <Button
                                        sm='true'
                                        onClick={openChainModal}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: "50px",
                                            borderRadius: 0,
                                        }}
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                style={{
                                                    background: 'white',
                                                    width: 36,
                                                    height: 36,
                                                    paddingLeft: 3,
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderColor: 'block'
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? 'Ethereum'}
                                                        src={chain.iconUrl}
                                                        width={30}
                                                        height={30}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </Button> */}
                                    <Button
                                        sm='true'
                                        style={{ width: "200px", padding: "10px 20px", height: 50, alignItems: "center", display: "flex" }}
                                        onClick={openAccountModal}>
                                        {account.displayName}
                                        {account.displayBalance
                                            ? ` (${account.displayBalance})`
                                            : ''}
                                    </Button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};

export default ConnectWallet;
