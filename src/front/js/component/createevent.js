
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import { AddGuestsToEvent } from './addguests';
import "../../styles/createevent.css"


export const CreateEventForm = () => {
  const { store, actions } = useContext(Context);
  const [showAddGuests, setShowAddGuests] = useState(false);
  const [showCreateEventForm, setShowCreateEventForm] = useState(true);
  const [address, setAddress] = useState('');
  const [listLati, setLati] = useState('');
  const [listLongi, setLongi] = useState('');
  const [listTitle, setTitle] = useState('');
  const [listDate, setDate] = useState('');
  const [listTime, setTime] = useState('');
  const [listDescription, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [imageSrc, setImageSrc] = useState("")
  const [imageFile, setImageFile] = useState(null);

  let dateTime = listDate + " " + listTime + ":00"


  const navigate = useNavigate();

  const userId = JSON.parse(localStorage.getItem('userId'))

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const handleUploadClick = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'ml_default');

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log("this is data img", data)
    setImageSrc(data.secure_url);

    const objNewEvent = {
      title: listTitle,
      date: dateTime,
      description: listDescription,
      location: address,
      image: data.secure_url,
      user_id: userId.id,
      lati: listLati,
      longi: listLongi,
    };

    actions.sendNewEvent(objNewEvent);
    setShowCreateEventForm(false);
    setShowAddGuests(true);

  }


  const inputRef = useRef(null);
  const apiKey = process.env.REACT_APP_GOOGLEPLACES_API_KEY;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const selectedAddress =
          place.formatted_address;
        setAddress(selectedAddress);

        const geocoder = new
          window.google.maps.Geocoder();
        geocoder.geocode({ address: selectedAddress },
          (results, status) => {

            if (status === "OK") {
              setLongi(results[0].geometry.location.lat())
              setLati(results[0].geometry.location.lng())

              console.log(`Latitud: ${results[0].geometry.location.lat()}, Longitud: ${results[0].geometry.location.lng()}`);
            } else {
              console.error("No se pudo obtener la ubicación para la dirección especificada");
            }
          });
      });

    };


    return () => {
      document.body.removeChild(script);
    }
  }, [apiKey]);

  
  return (
    <>
      {showCreateEventForm && (
        <div className='create-event'>
          <p className='create-title'>Ingresa aquí la información del nuevo evento</p>
          <form onSubmit={handleUploadClick}>
            <div className="form-group">
              <label className='create-label' htmlFor="exampleInputEmail1">Título</label>
              <input className="create-input form-control" onChange={(e) => {
                setTitle(e.target.value)
              }} type="text" name="title" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Nombre de tu evento..." required />
            </div>
            <div className="form-group">
              <label className='create-label' htmlFor="exampleInputEmail1">Fecha</label>
              <input className="create-input form-control" onChange={(e) => {
                setDate(e.target.value)
              }} type="date" name="date" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Fecha del evento" required />
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputEmail1">Time</label>
              <input onChange={(e) => {
                setTime(e.target.value)
              }} type="time" name="time" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter Time" />
            </div>
            <div className="form-group">
              <label className='create-label' htmlFor="exampleInputEmail1">Descripción</label>
              <input className="create-input form-control" onChange={(e) => {
                setDescription(e.target.value)
              }} type="text-area" name="description" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Descripción del evento..." required />
            </div>
            <div className="form-group">
              <label className='create-label' htmlFor="exampleInputEmail1">Imagen</label>
              <input className="create-input form-control" accept="image/*" onChange={handleFileInputChange}
                type="file" name="image" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter image" />
            </div>
            <div className="form-group">
              <label className='create-label' htmlFor="exampleInputEmail1">Lugar</label>
              <input
                className="create-input form-control"
                type="text"
                name="location"
                placeholder="Enter Location"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                ref={inputRef}
                required
              />
            </div>
            <button className='create-ev-btn' type="submit" >Crear Evento</button>
          </form >
        </div >
      )}
      {showAddGuests && <AddGuestsToEvent />}
    </>
  );
};