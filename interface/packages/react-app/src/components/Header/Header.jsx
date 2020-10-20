import PropTypes from 'prop-types';
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import logo from './logo.png';
import styled from 'styled-components';

export const Image = styled.img`
  height: 65px;
`;

const OurNavBar = styled(Navbar)`
  padding: 0;
`;

function Header({ children }) {
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
      {children}
    </OurNavBar>
  );
}

Header.propTypes = {
  children: PropTypes.object,
};

export default Header;
