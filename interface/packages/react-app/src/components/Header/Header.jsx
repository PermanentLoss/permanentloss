import React, { useEffect, useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import WalletButton from '../WalletButton';
import logo from './logo.png';

export const Image = styled.img`
  height: 65px;
`;

const OurNavBar = styled(Navbar)`
  padding: 0;
`;

function Header({ web3Provider, loadWeb3Modal }) {
  const [hideWalletButton, setHideWalletButton] = useState(true);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/faq') {
      setHideWalletButton(true);
    } else {
      setHideWalletButton(false);
    }
  }, [location]);

  return (
    <OurNavBar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand>
        <Nav.Link href="/" className="btn-dark">
          <Image src={logo} />
        </Nav.Link>
      </Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto" />
      </Navbar.Collapse>
      <Nav.Link href="/faq" className="btn-dark">
        Faq
      </Nav.Link>
      {!hideWalletButton && (
        <WalletButton
          web3Provider={web3Provider}
          loadWeb3Modal={loadWeb3Modal}
        />
      )}
    </OurNavBar>
  );
}

Header.propTypes = WalletButton.propTypes;

export default Header;
