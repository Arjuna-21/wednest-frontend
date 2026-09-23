import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from './Navbar';
import "./SearchHalls.css";
import { useNavigate } from 'react-router-dom';
import WHall from '/images/wedding-hall.jpg';

function SearchHalls() {

    const navigate = useNavigate();

    const [halls, setHalls] = useState([]);
    const [search, setSearch] = useState("");
    useEffect(() => {
    fetch(`${URL}/halls`)
      .then((response) => response.json())
      .then((data) => {
        setHalls(data.halls);
      }).catch((error) => {
        console.log(error);
      })
  }, []);

  const filterHalls =
    halls.filter(wednest =>  
        wednest.hall_name.toLowerCase().includes(search.toLowerCase()) ||
        wednest.city.toLowerCase().includes(search.toLowerCase()) ||
        wednest.price.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className='search-halls-box'>
        <Navbar />
        <div class="search-halls-container">
            <div class="search-halls">
                <h3>Search Halls</h3>
                <input type="text" value={search} placeholder='Search halls' onChange={(e) => setSearch(e.target.value)}/>
            </div>
            {
                filterHalls.map((hall) => (
                    <div key={hall.id} className='hall-search'>
                        <div class="hall-Image">
                            <img src={WHall} alt="" />
                        </div>
                        <div class="details">
                            <h2>{hall.hall_name}</h2>
                            <p>{hall.city}, {hall.state}</p>
                            <h3>{hall.capacity_from} - {hall.capacity_to}</h3>
                            <p>{hall.price}</p>
                            <button className='search-details-btn' onClick={() => navigate(`/halls/${hall.id}`)}>View Hall Details </button>
                        </div>
                    </div>
                ))
            }
        </div>
        
    </div>
  )
}

export default SearchHalls