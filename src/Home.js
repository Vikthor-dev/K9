import './Home.css'
import DogCard from "./DogCard"
import Form from 'react-bootstrap/Form';
import { useEffect, useState } from 'react';
import { db } from './firebase'
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import store from "./store"
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const navigate = useNavigate('')

    useEffect(()=>{
        if(!store.loggedIn){
            navigate('/login')
        }
    })

    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyFemale, setShowOnlyFemale] = useState(false);
    const [showOnlyMale, setShowOnlyMale] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {

                let q = query(collection(db, 'Posts'), orderBy('datePosted', 'asc'));

                if (showOnlyFemale) {
                    q = query(q, where('spol', '==', 'Ženka'));
                } else if (showOnlyMale) {
                    q = query(q, where('spol', '==', 'Mužjak'));
                }

                const postsCollection = await getDocs(q);
                const postsData = postsCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const filteredPostsData = postsData.filter(post => post.vrsta.toLowerCase().includes(searchQuery))
                setPosts(filteredPostsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
        console.log("Search :", searchQuery);
    }, [searchQuery, showOnlyFemale, showOnlyMale]);

    useEffect(() => {
        console.log(posts)
    })
    
    return (
        <div className="home">
            <div id="search-filter">
                <Form.Control value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} id="search" type="text" placeholder="Pretrazi pasminu" />
                <Form.Check
                    type="switch"
                    id="female-switch"
                    label="Prikaži samo ženke"
                    checked={showOnlyFemale}
                    onChange={() => {
                        setShowOnlyFemale(!showOnlyFemale);
                        setShowOnlyMale(false); // Ensure only one gender filter is active at a time
                    }}
                />
                <Form.Check
                    type="switch"
                    id="male-switch"
                    label="Prikaži samo mužjake"
                    checked={showOnlyMale}
                    onChange={() => {
                        setShowOnlyMale(!showOnlyMale);
                        setShowOnlyFemale(false); // Ensure only one gender filter is active at a time
                    }}
                />

            </div>
            <div className="flex-container">
                {posts.map((post, index) => (
                    <DogCard key={index} data={post} />
                ))}
            </div>
        </div>
    );
}

export default Home;