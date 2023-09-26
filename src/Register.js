import "./Register.css"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from "react-bootstrap/Form"
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom"
import React, { useState } from 'react';
import { db, auth, createUser } from "./firebase";
import { doc , setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import store from "./store"

const Register = () => {

    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        ime: '',
        prezime: '',
        email: '',
        grad: '',
        koordinate: '',
    });

    const [lozinke, setLozinke] = useState({
        lozinka: '',
        check_lozinka: ''
    });

    const [imageData, setImageData] = useState('');

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleInputChangePass = (event) => {
        const { name, value } = event.target;
        setLozinke((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result;
                setImageData(base64Data);
            };
            reader.readAsDataURL(file);
        }
    };

    async function writeData() {
        const documentData = {
            ime: userData.ime,
            prezime: userData.prezime,
            email: userData.email,
            grad: userData.grad,
            koordinate:userData.koordinate,
            slika:imageData
        };
        try {
            const collectionRef = doc(db, "Users" , userData.email);
            await setDoc(collectionRef, documentData);
            console.log("Document written with ID:", userData.email);
          } catch (error) {
            console.error("Error writing document:", error);
          }
    }

    function register() {
        if (lozinke.lozinka === lozinke.check_lozinka) {
            createUser(auth, userData.email, lozinke.lozinka)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("Basic user created:", user);
                    writeData();
                    setUserData({
                        ime:'',
                        prezime:'',
                        email:'',
                        grad:'',
                        koordinate:''
                    })
                    setImageData('')
                    setLozinke({
                        lozinka:'',
                        check_lozinka:''
                    })
                    store.loggedIn = true;
                    navigate('/');
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    console.error("Error creating user:", errorMessage);
                });
        } else {
            setError(true);
        }
    }

    function goMaps(){
        window.open('https://www.google.com/maps', '_blank');
    }

    const[error,setError]=useState(false);

    return (
        <div className="register">
            <Row>
                <Col>
                    <div className="box">
                        <Form.Group className="mb-3">
                            <Form.Label>Ime</Form.Label>
                            <Form.Control value={userData.name}
                                onChange={handleInputChange} name="ime" required type="text" placeholder="Jane" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Prezime</Form.Label>
                            <Form.Control value={userData.prezime} name="prezime"
                                onChange={handleInputChange} required type="text" placeholder="Doe" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control value={userData.email} name="email"
                                onChange={handleInputChange} required type="email" placeholder="janedoe@gmail.com" />
                        </Form.Group>
                    </div>
                </Col>
                <Col>
                    <div className="box">
                        <Form.Group className="mb-3">
                            <Form.Label>Grad</Form.Label>
                            <Form.Control value={userData.grad} name="grad"
                                onChange={handleInputChange} required type="text" placeholder="Pula" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label id="koordinate" onClick={goMaps} >Koordinate grada</Form.Label>
                            <Form.Control value={userData.koordinate} name="koordinate"
                                onChange={handleInputChange} required type="text" placeholder="npr. 45.455435,47.34524" />
                        </Form.Group>
                        <Form.Group id="slika" className="mb-3">
                            <Form.Label>Slika profila</Form.Label>
                            <Form.Control type="file" onChange={handleFileInputChange} />
                        </Form.Group>
                    </div>
                </Col>
                <Col>
                    <div className="box">
                        <Form.Group className="mb-3">
                            <Form.Label>Lozinka</Form.Label>
                            <Form.Control value={lozinke.lozinka} name="lozinka"
                                onChange={handleInputChangePass} required type="password" placeholder="********" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Potvrdi Lozinku</Form.Label>
                            <Form.Control value={lozinke.check_lozinka} name="check_lozinka"
                                onChange={handleInputChangePass} required type="password" placeholder="********" />
                        </Form.Group>
                        <Button onClick={register} id="button" variant="primary">Register</Button>
                        <div className="box2">
                            <Link id="register" to="/login">Već imaš račun?</Link>
                            { error && <p id="confirm">Potvrdi lozinku!</p>}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default Register;