import { Web3Provider } from '@ethersproject/providers';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const rinkebyId = 4;

// set the aria-hidden attribute while the modal is open
Modal.setAppElement('#root');

function OptionsSeller({ web3Provider }) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const changeModal = async () => {
      if (web3Provider === null) {
        setModalMessage('Please connect your Web3 Wallet');
        setModalIsOpen(true);
        return;
      }
      const currentNetwork = await web3Provider.getNetwork();
      if (currentNetwork.chainId !== rinkebyId) {
        setModalMessage(
          'Please change your wallet connection to the Rinkeby Test Net'
        );
        setModalIsOpen(true);
        return;
      }
      setModalIsOpen(false);
    };

    changeModal();
  }, [web3Provider]);

  console.log(web3Provider !== null ? 'not null' : 'is null');
  console.log(web3Provider);

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => setModalIsOpen(false)}
      style={modalStyles}
      contentLabel="Web3 Provider Alerts"
    >
      <div>{modalMessage}</div>
    </Modal>
  );
}

OptionsSeller.propTypes = {
  web3Provider: PropTypes.instanceOf(Web3Provider),
};

export default OptionsSeller;
