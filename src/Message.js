import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import "./Message.css"
import { useState } from 'react';
import { doc, onSnapshot , addDoc , collection , deleteDoc,getDoc} from 'firebase/firestore';
import { db } from "./firebase";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Message = ({data}) => {

    const navigate = useNavigate()

    const[userData,setUserData]=useState('');

    const [reply, setReply] = useState('');
    const handleReply = (event) => {
        setReply(event.target.value);
    };

    useEffect(() => {
          try {
            const collectionRef = doc(db, "Users", data.Primio);
            onSnapshot(collectionRef, (snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.data();
                setUserData((prevUserData) => ({
                  ...prevUserData,
                  ime: data.ime,
                  prezime: data.prezime,
                  email: data.email,
                  grad: data.grad,
                  koordinate: data.koordinate,
                  slika: data.slika
                }));
              }
            });
          } catch (error) {
            console.error("Error getting document:", error);
          }
      }, [data.Primio]);


    async function sendReply(){
        const currentDate = new Date();
        const dateFormat = currentDate.getHours() + ":" + currentDate.getMinutes() + ", "+ currentDate.toDateString();

        try {
            let documentData = {
                Poruka: reply,
                Poslao: data.Primio,
                Primio: data.Poslao,
                Datum: dateFormat,
                Send_Ime : userData.ime,
                Send_Prezime: userData.prezime,
                Slika : userData.slika
            }
            const collectionRef = collection(db, "Poruke");
            await addDoc(collectionRef, documentData);

            console.log("Document added successfully.");

            console.log("Deleting reply document...");
            const userRef = doc(db, "Poruke", data.id);
            if ((await getDoc(userRef)).exists()) {
                await deleteDoc(userRef);
                console.log("Deleted user document.");
            } else {
                console.error("User document not found.");
            }
            setReply('');
            navigate('/');
        } catch (error) {
            console.error("Failed to reply!")
        }
    }

    async function deleteMessage(){
        console.log("Deleting reply document...");
        const userRef = doc(db, "Poruke", data.id);
        if ((await getDoc(userRef)).exists()) {
            await deleteDoc(userRef);
            console.log("Deleted user document.");
            navigate('/')
        } else {
            console.error("User document not found.");
        }
    }

    return (
        <>
            <Card id="card">
                <div className="user">
                    <img id="user" src={data.Slika} alt="" />
                    <p id="name">{data.Send_Ime} {data.Send_Prezime}</p>
                </div>
                <Card.Body>"{data.Poruka}"</Card.Body>
                <div className="reply">
                    <Form.Control id="reply" onChange={handleReply} value={reply} type="text" placeholder="reply" />
                    <img id="direct" onClick={sendReply} src={require("../src/icons/direct.png")} alt="" />
                </div>
                <div className="footer">
                    <p id="datum">{data.Datum}</p>
                    <img id="delete" onClick={deleteMessage} src={require("../src/icons/delete.png")} alt="" />
                </div>
            </Card>
        </>
    );
}

export default Message;