import Navbar from "./Navbar"
import Home from "./Home"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import DogDetails from "./DogDetails";
import Post from "./Post"
import MyDogs from "./MyDogs";
import Inbox from "./Inbox";
import Settings from "./Settings"
import Login from "./Login";
import Register from "./Register"
import Password from "./Password";
import { authState, auth, db } from "./firebase";
import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useState } from "react";
import store from "./store";

function App() {

  const [userData, setUserData] = useState({
    ime: '',
    prezime: '',
    email: '',
    grad: '',
    koordinate: '',
    slika: ''
  });

  useEffect(() => {
    async function getUser(Email) {
      try {
        const collectionRef = doc(db, "Users", Email);
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
    }

    authState(auth, (authUser) => {
      if (authUser) {
        getUser(authUser.email);
        store.loggedIn=true;
      } else {
        console.log("User is not authenticated!");
        store.loggedIn=false;
      }
    },
    (error) => {
      console.log('Error:', error);
    });
  }, []);

  useEffect(() => {
    console.log("User data from App: ", userData);
  });



  return (
    <Router>
      <div className="App">
        {userData && <Navbar data={userData} />}
        <div className="content">
          <Routes>
            <Route path="/" element={<Home userData={userData} />}></Route>
            <Route path="/details/:id" element={<DogDetails userData={userData} />}></Route>
            <Route path="/post" element={<Post userData={userData}  />}></Route>
            <Route path="/myDogs" element={<MyDogs userData={userData} />}></Route>
            <Route path="/inbox" element={<Inbox userData={userData} />}></Route>
            <Route path="/settings" element={<Settings userData={userData} />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/password" element={<Password />}></Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
