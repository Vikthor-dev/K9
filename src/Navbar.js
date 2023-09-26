import "./Navbar.css"
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useLocation } from 'react-router-dom'
import { auth, logout } from "./firebase";
import store from "./store"

const NavbarComponent = ({data}) => {

    function signOut() {
        logout(auth);
        store.loggedIn = false;
    }

    const location = useLocation();

    const shouldHideNavbar = location.pathname === '/login';
    const shouldHideNavbar2 = location.pathname === '/register';
    const shouldHideNavbar3 = location.pathname === '/password';

    if (shouldHideNavbar || shouldHideNavbar2 || shouldHideNavbar3) {
        return null;
    }


    return (
        <>
            <Navbar id="navbar" bg="primary" variant="dark">
                <Navbar.Brand id="brand" href="#home">K9 Croatia</Navbar.Brand>
                <Nav className="me-auto">
                    <Link id="navlink" to="/">Početna</Link>
                    <Link id="navlink" to="/post">Objava</Link>
                    <Link id="navlink" to="/myDogs">Moji psi</Link>
                    <Link id="navlink" to="/inbox">Inbox</Link>
                    <Link id="navlink" to="/settings">Postavke</Link>
                </Nav>
                <Nav className="ml-auto">
                    <Link id="navlink-2" to="/settings" >{data.ime} {data.prezime}</Link>
                    <Link id="navlink-2" to="/login" onClick={signOut} >Logout</Link>
                </Nav>
            </Navbar>
        </>
    );
}

export default NavbarComponent;