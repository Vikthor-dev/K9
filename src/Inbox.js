import "./Inbox.css"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Message from "./Message"
import { useEffect, useState } from 'react';
import { db } from './firebase'
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import store from "./store"
import { useNavigate } from "react-router-dom";


const Inbox = ({userData}) => {


    const [poruke, setPoruke] = useState([]);

    const navigate = useNavigate()

    useEffect(()=>{
        if(!store.loggedIn){
            navigate('/login')
        }
    })

    useEffect(() => {
        const fetchPosts = async () => {
            try {

                let q = query(collection(db, 'Poruke'),where('Primio','==',userData.email), orderBy('Datum', 'asc'));


                const postsCollection = await getDocs(q);
                const postsData = postsCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPoruke(postsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    },[userData.email]);

    useEffect(() => {
        console.log(poruke)
    })

    return (
        <div className="inbox">
            <Row>
                <Col></Col>
                <Col xs={5}>
                {poruke.map((poruka, index) => (
                    <Message key={index} data={poruka} />
                ))}
                </Col>
                <Col></Col>
            </Row>
        </div>
    );
}

export default Inbox