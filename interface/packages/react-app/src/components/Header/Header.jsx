import PropTypes from 'prop-types';
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function Header({ children }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand>PermanentLoss</Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto" />
      </Navbar.Collapse>
      {children}
    </Navbar>
  );
}

Header.propTypes = {
  children: PropTypes.elementType,
};

export default Header;
