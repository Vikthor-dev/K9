import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import FGender from "../src/icons/femenine.png"
import MGender from "../src/icons/male.png"
import "./DogCard.css"
import { useNavigate } from 'react-router-dom'

const DogCard = ({ data }) => {

    const navigate = useNavigate();

    return (
        <>
            <Card id="Card" style={{ width: '18rem' }}>
                <Card.Img variant="top" src={data.slika} />
                <Card.Body>
                    <div id="name-gender">
                        <Card.Title id="name">"{data.ime}"</Card.Title>
                        <img
                            id="gender"
                            src={data.spol === 'Mužjak' ? MGender : FGender}
                            alt={data.spol === 'Mužjak' ? 'Muško' : 'Žensko'}
                        />
                        <p id="godine">{data.dob}</p>
                    </div>
                    <Card.Text>
                        {data.opis}
                    </Card.Text>
                    <Button onClick={() => navigate(`/details/${data.id}`)} variant="primary">Pogledaj me</Button>
                </Card.Body>
            </Card>
        </>
    );
}


export default DogCard;