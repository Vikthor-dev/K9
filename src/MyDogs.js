import "./MyDogs.css"
import DogCard from "./DogCard"
import { useEffect, useState } from 'react';
import { db } from './firebase'
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import store from "./store"
import { useNavigate } from "react-router-dom";

const MyDogs = ({ userData }) => {

    const [posts, setPosts] = useState([]);

    const navigate = useNavigate()

    useEffect(()=>{
        if(!store.loggedIn){
            navigate('/login')
        }
    })

    useEffect(() => {
        const fetchPosts = async () => {
            try {

                const q = query(collection(db, 'Posts'), where('postedBy', '==', userData.email), orderBy('datePosted', 'asc'));


                const postsCollection = await getDocs(q);
                const postsData = postsCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPosts(postsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, [userData.email]);

    useEffect(() => {
        console.log(posts)
    })




    return (
        <div className="mydogs">
            <div className="flex-container">
                {posts.map((post, index) => (
                    <DogCard key={index} data={post} />
                ))}
            </div>
        </div>
    );
}

export default MyDogs;