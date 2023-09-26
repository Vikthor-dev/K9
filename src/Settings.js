import "./Settings.css"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import { Icon } from "leaflet"
import Button from "react-bootstrap/Button"
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useEffect, useState } from 'react'
import { db, auth, logout } from "./firebase";
import { getDoc, getDocs, query, where, collection, deleteDoc, doc, updateDoc, writeBatch } from "firebase/firestore";
import { useNavigate } from "react-router-dom"
import { deleteUser } from "firebase/auth"
import { storage } from './firebase';
import { ref , listAll , deleteObject } from "firebase/storage"
import store from "./store"

const Settings = ({ userData }) => {

    const navigate = useNavigate();

    useEffect(()=>{
        if(!store.loggedIn){
            navigate('/login')
        }
    })

    const [lat, setLat] = useState(0);
    const [long, setLong] = useState(0);
    const [formEdited, setFormEdited] = useState(false);

    useEffect(() => {
        console.log(userData.koordinate)
        var coordinates = userData.koordinate.split(",").map(coord => parseFloat(coord.trim()));

        var coordinate1 = coordinates[0];
        var coordinate2 = coordinates[1];

        console.log("Coordinate 1:", coordinate1);
        console.log("Coordinate 2:", coordinate2);

        setLat(coordinate1)
        setLong(coordinate2)

    }, [userData.koordinate])

    const renderMap = lat !== null && long !== null;

    const customIcon = new Icon({
        iconUrl: require('../src/icons/pets.png'),
        iconSize: [35, 35]
    })

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [modalShow, setModalShow] = useState(false);

    const closeModalAndUpdate = () => {
        update();
        setModalShow(false);
    };

    const [editData, setEditData] = useState({
        n_ime: '',
        n_prezime: '',
        n_grad: '',
        n_koordinate: ''
    })

    const [imageData, setImageData] = useState('');

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setFormEdited(true);
    };

    async function update() {
        try {
            const documentData = {
                ime: formEdited && editData.n_ime !== '' ? editData.n_ime : userData.ime,
                prezime: formEdited && editData.n_prezime !== '' ? editData.n_prezime : userData.prezime,
                email: userData.email,
                grad: formEdited && editData.n_grad !== '' ? editData.n_grad : userData.grad,
                koordinate: formEdited && editData.n_koordinate !== '' ? editData.n_koordinate : userData.koordinate,
                slika: formEdited && imageData !== '' ? imageData : userData.slika
            };

            const userDocRef = doc(db, "Users", userData.email);
            await updateDoc(userDocRef, documentData);

            const postsQuery = query(collection(db, "Posts"), where("postedBy", "==", userData.email));
            const postsSnapshot = await getDocs(postsQuery);

            const batch = writeBatch(db);
            postsSnapshot.forEach((postDoc) => {
                const postDocRef = doc(db, "Posts", postDoc.id);
                batch.update(postDocRef, {grad:documentData.grad,koordinate:documentData.koordinate, slika_vlasnika: documentData.slika , ime_vlasnika:documentData.ime , prezime_vlasnika:documentData.prezime });
            });
            await batch.commit();

            console.log("Document written with ID:", userData.email);
            navigate('/');
        } catch (error) {
            console.error("Error writing document:", error);
        }
    }

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
        setFormEdited(true);
    };

    const deleteAccount = async () => {
        try {
            const user = auth.currentUser;

            if (!user) {
                console.error("User not authenticated.");
                return;
            }

            console.log("Deleting user posts...");

            const postsQuery = query(collection(db, "Posts"), where("postedBy", "==", userData.email));
            const postsSnapshot = await getDocs(postsQuery);
            postsSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
                console.log("Deleted post with ID:", doc.id);
            });

            const pdfFilesRef = ref(storage, `pdfs/${userData.email}`);
            const pdfFilesList = await listAll(pdfFilesRef);
            pdfFilesList.items.forEach(async (itemRef) => {
                await deleteObject(itemRef);
            });

            console.log("Deleting user document...");
            const userRef = doc(db, "Users", userData.email);
            if ((await getDoc(userRef)).exists()) {
                await deleteDoc(userRef);
                console.log("Deleted user document.");
            } else {
                console.error("User document not found.");
            }


            console.log("Deleting user account...");
            await deleteUser(user);
            console.log("User account deleted.");

            logout(auth);
            navigate('/login');

        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };



    function goMaps() {
        window.open('https://www.google.com/maps', '_blank');
    }

    return (
        <div className="settings">
            <Row>
                <Col xs={3}>
                    <img id="userImg" src={userData.slika} alt="" />
                </Col>
                <Col>
                    <p id="info">Ime i prezime: {userData.ime} {userData.prezime}</p>
                    <p id="info">Grad : {userData.grad}</p>
                    <p id="email">{userData.email}</p>
                </Col>
                <Col>
                    {renderMap && (
                        <MapContainer center={[45.39874614945722, 15.533699533243292]} zoom={7}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <Marker position={[lat, long]} icon={customIcon}></Marker>
                        </MapContainer>
                    )}
                </Col>
            </Row>
            <Button id="delete-btn" variant="danger" onClick={handleShow}>Izbrisi racun</Button>
            <Button variant="secondary" onClick={() => setModalShow(true)} >Uredi racun</Button>


            <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Uredi račun</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form.Group className="mb-3">
                        <Form.Label>Ime</Form.Label>
                        <Form.Control name="n_ime"
                            onChange={handleInputChange} type="text" placeholder={userData.ime} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Prezime</Form.Label>
                        <Form.Control name="n_prezime"
                            onChange={handleInputChange} type="text" placeholder={userData.prezime} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Grad</Form.Label>
                        <Form.Control name="n_grad"
                            onChange={handleInputChange} type="text" placeholder={userData.grad} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label id="koordinatee" onClick={goMaps}>Koordinate</Form.Label>
                        <Form.Control name="n_koordinate"
                            onChange={handleInputChange} type="text" placeholder={userData.koordinate} />
                    </Form.Group>

                    <Form.Group id="slika" className="mb-3">
                        <Form.Label>Slika profila</Form.Label>
                        <Form.Control type="file" onChange={handleFileInputChange} />
                    </Form.Group>


                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalShow(false)}>
                        Odustani
                    </Button>
                    <Button variant="primary" onClick={closeModalAndUpdate}>
                        Spremi promjene
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Potvrdi brisanje računa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h6>Brisanje računa ne može se poništiti.</h6>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Odustani
                    </Button>
                    <Button variant="danger" onClick={deleteAccount}>
                        Izbriši račun
                    </Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
}

export default Settings;