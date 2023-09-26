import "./Password.css"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from "react-bootstrap/Form"
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom"
import { auth, reset } from "./firebase"
import { useState } from "react";

const Password = () => {


    const [email, setEmail] = useState('');
    const [check, setCheck] = useState(false);


    const handleInputChange = (event) => {
        setEmail(event.target.value);
    };

    function resetPass() {
        reset(auth, email);
        setEmail('');
        setCheck(true);
    }




    return (
        <div className="password">
            <Row>
                <Col></Col>
                <Col>
                    <div className="box">
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control value={email} onChange={handleInputChange}
                                required type="email" placeholder="janedoe@gmail.com" />
                        </Form.Group>
                        <Button onClick={resetPass} id="button" variant="primary">Resertiraj lozinku</Button>
                        <div className="box2">
                            <Link id="register" to="/login">Povratak na login</Link>
                            {check && <p id="reset">Email za promijenu lozinke poslan!</p>}
                        </div>
                    </div>
                </Col>
                <Col></Col>
            </Row>
        </div>
    );
}

export default Password;