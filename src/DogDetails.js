import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import "./DogDetails.css"
import FGender from "../src/icons/femenine.png"
import MGender from "../src/icons/male.png"
import pdf from "../src/icons/pdf.png"
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import { Icon } from "leaflet"
import Form from "react-bootstrap/Form"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { db } from './firebase'
import { doc, getDoc, updateDoc, deleteDoc , addDoc, collection } from 'firebase/firestore'
import { storage } from './firebase';
import { ref, getDownloadURL, uploadBytes } from "firebase/storage"
import { useNavigate } from 'react-router-dom'

const DogDetails = ({ userData }) => {

    const navigate = useNavigate();

    const { id } = useParams();

    const [post, setPost] = useState(null);

    useEffect(() => {
        const fetchPostById = async () => {
            try {
                const postDocRef = doc(db, 'Posts', id);
                const postDocSnapshot = await getDoc(postDocRef);

                if (postDocSnapshot.exists()) {
                    setPost({
                        id: postDocSnapshot.id,
                        ...postDocSnapshot.data()
                    });
                    const pdfUrl = await getFileFromStorage(postDocSnapshot.data().pdfPath);

                    // Update the post with the PDF download URL
                    setPost((prevPost) => ({ ...prevPost, pdfUrl }));
                } else {
                    console.log('Post not found');
                }
            } catch (error) {
                console.error('Error fetching post details:', error);
            }
        };
        fetchPostById();
    }, [id]);

    const [parsedCoordinates, setParsedCoordinates] = useState(null);

    useEffect(() => {
        // Parse coordinates when post is available and contains koordinate
        if (post && post.koordinate) {
            const [x, y] = post.koordinate.split(',').map(parseFloat);
            setParsedCoordinates([x, y]);
        }
    }, [post]);

    const customIcon = new Icon({
        iconUrl: require('../src/icons/pets.png'),
        iconSize: [35, 35]
    })

    const [modalShow, setModalShow] = useState(false);


    const [show, setShow] = useState(false);
    const handleClose = () => {
        update();
        setShow(false);
    };
    const handleShow = () => setShow(true);

    const getFileFromStorage = async (storagePath) => {
        try {
            const fileRef = ref(storage, storagePath);
            const downloadURL = await getDownloadURL(fileRef);
            return downloadURL;
        } catch (error) {
            console.error('Error fetching file from Firebase Storage:', error);
            return null;
        }
    };

    const [editData, setEditData] = useState({
        n_opis: ''
    })

    const [imageData, setImageData] = useState('')
    const [formEdited, setFormEdited] = useState(false);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setFormEdited(true);
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
        setFormEdited(true);
    };

    const [pdfFile, setPdfFile] = useState(null);
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setPdfFile(selectedFile);
        setFormEdited(true);
    };

    async function update() {
        const uniqueHash = Math.random().toString(36).substring(7);
        let pdfFileName = '';

        if (pdfFile) {
            pdfFileName = `${pdfFile.name.split('.').slice(0, -1).join('.')}_${uniqueHash}.${pdfFile.name.split('.').pop()}`;
            const pdfPath = `pdfs/${userData.email}/${pdfFileName}`;
            const pdfRef = ref(storage, pdfPath);
            const snapshot = await uploadBytes(pdfRef, pdfFile)
            console.log("Snapshot: ", snapshot);

            try {
                const documentData = {
                    ime: post.ime,
                    dob: post.dob,
                    postedBy: userData.email,
                    grad: post.grad,
                    koordinate: post.koordinate,
                    slika: formEdited && imageData !== '' ? imageData : post.slika,
                    slika_vlasnika: post.slika_vlasnika,
                    datePosted: post.datePosted,
                    ime_vlasnika: post.ime_vlasnika,
                    prezime_vlasnika: post.prezime_vlasnika,
                    opis: formEdited && editData.n_opis !== '' ? editData.n_opis : post.opis,
                    vrsta: post.vrsta,
                    spol: post.spol,
                    pdfPath: formEdited && pdfPath !== '' ? pdfPath : post.pdfPath,
                };

                const userDocRef = doc(db, "Posts", post.id);
                await updateDoc(userDocRef, documentData);

                navigate('/');

                console.log("Document written with ID:", post.id);
            } catch (error) {
                console.error("Error writing document:", error);
            }
        } else {

            try {
                const documentData = {
                    ime: post.ime,
                    dob: post.dob,
                    postedBy: userData.email,
                    grad: post.grad,
                    koordinate: post.koordinate,
                    slika: formEdited && imageData !== '' ? imageData : post.slika,
                    slika_vlasnika: post.slika_vlasnika,
                    datePosted: post.datePosted,
                    ime_vlasnika: post.ime_vlasnika,
                    prezime_vlasnika: post.prezime_vlasnika,
                    opis: formEdited && editData.n_opis !== '' ? editData.n_opis : post.opis,
                    vrsta: post.vrsta,
                    spol: post.spol,
                    pdfPath: post.pdfPath,
                };

                const userDocRef = doc(db, "Posts", post.id);
                await updateDoc(userDocRef, documentData);

                navigate('/');

                console.log("Document written with ID:", post.id);
            } catch (error) {
                console.error("Error writing document:", error);
            }
        }
    }

    async function deletePost() {
        const postRef = doc(db, "Posts", post.id);
        if ((await getDoc(postRef)).exists()) {
            await deleteDoc(postRef);
            console.log("Deleted post document.");
            setModalShow(false);
            navigate('/')
        } else {
            console.error("Post document not found.");
        }
    }

    const isCurrentUserPost = post && userData && post.postedBy === userData.email;


    const [message, setMessage] = useState('');
    const handleMessage = (event) => {
        setMessage(event.target.value);
    };


    async function sendMessage() {

        const currentDate = new Date();
        const dateFormat = currentDate.getHours() + ":" + currentDate.getMinutes() + ", "+ currentDate.toDateString();

        try {
            let documentData = {
                Poruka: message,
                Poslao: userData.email,
                Primio: post.postedBy,
                Datum: dateFormat,
                Send_Ime : userData.ime,
                Send_Prezime: userData.prezime,
                Slika : userData.slika
            }

            const collectionRef = collection(db, "Poruke");
            await addDoc(collectionRef, documentData);

            console.log("Document added successfully.");
            setMessage('');
            navigate('/');

        } catch (error) {
            console.error("Error adding document:", error);
        }

    }



    return (
        <div className="details">
            {post ? (
                <div>
                    <Row>
                        <Col><img id="img" src={post.slika} alt="" /></Col>
                        <Col>
                            <p id='info'>Zovem se "{post.ime}"   <img
                                id="gender"
                                src={post.spol === 'Mužjak' ? MGender : FGender}
                                alt={post.spol === 'Mužjak' ? 'Muško' : 'Žensko'}
                            /></p>
                            <p id='info'>Rođen/a sam "{post.dob}"</p>
                            <p id='info'>Ja sam "{post.vrsta}"</p>
                            <p id='info'>Moj vlasnik je "{post.ime_vlasnika} {post.prezime_vlasnika}"</p>
                            <a id="pdf-link" href={post.pdfUrl} download>
                                <img id="pdf" src={pdf} alt="Download PDF" />
                            </a>

                        </Col>
                        <Col>

                            <MapContainer center={[44.86914710766841, 13.85881258219215]} zoom={8}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <Marker position={parsedCoordinates || [44.86914710766841, 13.85881258219215]} icon={customIcon}>
                                </Marker>


                            </MapContainer>
                        </Col>
                    </Row>
                    <Row id='mid'></Row>

                    <Row>
                        <Col><img id="userImagePic" src={post.slika_vlasnika} alt="" /></Col>
                        <Col xs={8}>
                            <p id="info">{post.ime_vlasnika} {post.prezime_vlasnika}</p>
                            <p id="info-2">{post.postedBy}</p>
                            <p id="info">{post.grad} , Croatia</p>
                            {userData.email !== post.postedBy && (
                                <div id="poruka">
                                    <Form.Control onChange={handleMessage} value={message} id="message" type="text" placeholder="Posalji mi poruku" />
                                    <img id="direct" onClick={sendMessage} src={require("../src/icons/direct.png")} alt="" />
                                </div>
                            )}
                        </Col>
                        <Col>
                            {isCurrentUserPost && (
                                <div>
                                    <Button onClick={() => setModalShow(true)} id="izbrisi" variant="danger">
                                        Obrisi objavu
                                    </Button>
                                    <Button id="uredi" onClick={handleShow} variant="primary">
                                        Uredi objavu
                                    </Button>
                                </div>
                            )}

                            <Modal show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Uredi objavu</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>


                                    <Form.Group className="mb-3">
                                        <Form.Label>Kratki opis</Form.Label>
                                        <Form.Control name="n_opis"
                                            onChange={handleInputChange} type="text" placeholder={post.opis} />
                                    </Form.Group>


                                    <Form.Group id="slika" className="mb-3">
                                        <Form.Label>Slika psa</Form.Label>
                                        <Form.Control type="file" onChange={handleFileInputChange} />
                                    </Form.Group>

                                    <Form.Group id="slika" className="mb-3">
                                        <Form.Label>Pedigree psa</Form.Label>
                                        <Form.Control type="file" accept=".pdf" onChange={handleFileChange} />
                                    </Form.Group>


                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClose}>
                                        Odustani
                                    </Button>
                                    <Button variant="primary" onClick={handleClose}>
                                        Spremi promjene
                                    </Button>
                                </Modal.Footer>
                            </Modal>

                            <Modal
                                show={modalShow}
                                onHide={() => setModalShow(false)}
                                size="lg"
                                aria-labelledby="contained-modal-title-vcenter"
                                centered
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title id="contained-modal-title-vcenter">
                                        Brisanje objave?
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p>
                                        Potvrdite brisanje objave , brisanje objave se ne može poništiti!
                                    </p>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="danger" onClick={deletePost} >Obrisi</Button>
                                </Modal.Footer>
                            </Modal>
                        </Col>
                    </Row>
                </div>
            ) : (
                <p>Loading dog details...</p>
            )}
        </div>
    );
}

export default DogDetails;