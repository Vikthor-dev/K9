import "./Login.css"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from "react-bootstrap/Form"
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";
import {auth, signIn } from "./firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import store from "./store"

const Login = () => {

    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        email: '',
        lozinka: '',
    })

    const[error,setError]=useState(false);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    function login() {
        signIn(auth, userData.email, userData.lozinka)
            .then((userCredential) => {
                console.log("Successful login!")
                setUserData({
                    email:'',
                    lozinka:''
                })
                store.loggedIn = true;
                navigate('/')
            }).catch((error)=>{
                setError(true);
            })
    }

    return (
        <div className="login">
            <Row>
                <Col></Col>
                <Col>
                    <div className="box">
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control value={userData.email} name="email"
                                onChange={handleInputChange} required type="email" placeholder="janedoe@gmail.com" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Lozinka</Form.Label>
                            <Form.Control value={userData.lozinka} name="lozinka"
                                onChange={handleInputChange} required type="password" placeholder="********" />
                        </Form.Group>
                          <Button onClick={login} id="button" variant="primary">Login</Button>
                        <Link id="link" to="/password">Zaboravio sam lozinku?</Link>
                        <div className="box2">
                            <Link id="register" to="/register">Nemaš račun?</Link>
                            {error && <p id="error">Netočan email ili lozinka!</p>}
                        </div>
                    </div>
                </Col>
                <Col></Col>
            </Row>
        </div>
    );
}

export default Login;