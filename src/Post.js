import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import "./Post.css"
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import { useState } from 'react';
import { storage } from './firebase';
import { ref , uploadBytes} from "firebase/storage"
import { db } from "./firebase";
import { collection , addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import store from "./store"
import { useEffect } from 'react';

const Post = ({userData}) => {

    const navigate = useNavigate();

    useEffect(()=>{
        if(!store.loggedIn){
            navigate('/login')
        }
    })

    const [spolPsa, setSpolPsa] = useState('Mužjak');

    const [dogData, setDogData] = useState({
        ime: '',
        dob: '',
        opis: '',
        vrsta: ''
    })

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setDogData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectChange = (event) => {
        const value = event.target.value;
        setSpolPsa(value);
      };


    const [imageData, setImageData] = useState('');
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

    const [pdfFile, setPdfFile] = useState(null);
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setPdfFile(selectedFile);
    };

    const handleUpload = () => {
        if (pdfFile) {
          const uniqueHash = Math.random().toString(36).substring(7); // Generate a random hash
          const pdfFileName = `${pdfFile.name.split('.').slice(0, -1).join('.')}_${uniqueHash}.${pdfFile.name.split('.').pop()}`;
          const pdfRef = ref(storage, `pdfs/${userData.email}/${pdfFileName}`);
      
          return uploadBytes(pdfRef, pdfFile)
            .then((snapshot) => {
              console.log('PDF uploaded successfully!', snapshot);
              return pdfRef; // Return the reference
            })
            .catch((error) => {
              console.error('Error uploading PDF:', error);
              return null; // Return null in case of error
            });
        }
        return Promise.resolve(null); // Return a resolved promise if no PDF file
      };
      
    


      async function post() {
        try {
          const pdfRef = await handleUpload();
          const currentDate = new Date();
          const documentData = {
            ime: dogData.ime,
            dob: dogData.dob,
            opis: dogData.opis,
            vrsta: dogData.vrsta,
            spol: spolPsa,
            slika: imageData,
            pdfPath: pdfRef ? pdfRef.fullPath : null,
            postedBy: userData.email,
            ime_vlasnika:userData.ime,
            prezime_vlasnika:userData.prezime,
            grad: userData.grad,
            slika_vlasnika:userData.slika,
            koordinate:userData.koordinate,
            datePosted: currentDate
          };
      
          const collectionRef = collection(db, "Posts");
          await addDoc(collectionRef, documentData);
          
          console.log("Document added successfully.");
          navigate('/');
        } catch (error) {
          console.error("Error adding document:", error);
        }
      }
      


    return (
        <div className="post">
            <Row>
                <Col>

                    <Form.Group className="mb-3">
                        <Form.Label>Ime psa</Form.Label>
                        <Form.Control onChange={handleInputChange} name="ime" required type="text" placeholder="npr. Kika" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Datum rođenja</Form.Label>
                        <Form.Control onChange={handleInputChange} name="dob" required type="text" placeholder="npr. 17.06.2019." />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Kratki opis</Form.Label>
                        <Form.Control onChange={handleInputChange} name="opis" required as="textarea" rows={3} />
                    </Form.Group>
                    <Button variant='primary' onClick={post}>Objavi</Button>
                </Col>
                <Col>

                    <Form.Group className="mb-3">
                        <Form.Label>Vrsta psa</Form.Label>
                        <Form.Control onChange={handleInputChange} name="vrsta" required type="text" placeholder="npr. Belgijski ovčar" />
                    </Form.Group>

                    <Form.Label>Spol</Form.Label>
                    <Form.Select onChange={handleSelectChange} value={spolPsa} name="spolPsa" aria-label="Default select example">
                        <option value="Mužjak">Mužjak</option>
                        <option value="Ženka">Ženka</option>
                    </Form.Select>

                    <Form.Group id="slika" className="mb-3">
                        <Form.Label>Slika psa</Form.Label>
                        <Form.Control onChange={handleFileInputChange} type="file" />
                    </Form.Group>


                    <Form.Group className="mb-3">
                        <Form.Label>Pedigree psa</Form.Label>
                        <Form.Control type="file" accept=".pdf" onChange={handleFileChange} />
                    </Form.Group>

                </Col>
                <Col></Col>
            </Row>
        </div>
    );
}

export default Post;