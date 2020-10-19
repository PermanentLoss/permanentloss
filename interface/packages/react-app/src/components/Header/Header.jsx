import PropTypes from 'prop-types';
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function Header({ children }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand>
        <Nav.Link href="/" className="btn-dark">
          PermanentLoss
        </Nav.Link>
      </Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto" />
      </Navbar.Collapse>
      <Nav.Link href="/faq" className="btn-dark">
        Faq
      </Nav.Link>
      {children}
    </Navbar>
  );
}

Header.propTypes = {
  children: PropTypes.object,
};

export default Header;
