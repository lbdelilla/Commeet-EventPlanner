import React, { useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { LeftSideBar } from "./sidebarleft";
import { ViewTitle } from "./viewTitle";
import { Comments } from "./comments";
import { CreateEventForm } from "../component/createevent";
import { MapComponent } from "./mapcomponent";

import "../../styles/singleevent.css"

export const SingleEvent = () => {
  const { store, actions } = useContext(Context);
  const [showPopup, setShowPopup] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const handleCreateEventClick = () => {
    setShowCreateEvent(true);
  };

  const params = useParams();
  const navigate = useNavigate();

  let eveResult = store.events.filter(el => el.id == params.theid);
  let currentEvent = store.events.find((el) => el.id == params.theid);
  let eventGuestByEvent = store.eventguests.filter(el => el.event_id == params.theid);

  let confirmedGuests = eventGuestByEvent.filter(
    (el) => el.rsvp_status == true);


  const userId = JSON.parse(localStorage.getItem('userId'));

  let isEventCreator = currentEvent?.user_id === userId.id

  const getAllContacts = async () => {
    await actions.getAllContacts()
  }

  useEffect(() => {
    getAllContacts();

  }, [])

  

  let allContacts = store.allContacts?.results;
  console.log(allContacts)

  let namesByEvent = [];
  if (allContacts) {
    for (let i = 0; i < eventGuestByEvent.length; i++) {
      for (let j = 0; j < allContacts.length; j++) {
        if (eventGuestByEvent[i].contact_id === allContacts[j].id) {
          namesByEvent.push(allContacts[j]);
        }
      }
    }
  }

  const handleDelete = (eventId) => {
    actions.deleteEvent(eventId)
    navigate("/private")
  }


  return (
    <div className="dash-container">
      <div className="column">
        <LeftSideBar />
      </div>
      <div className="col">
        <ViewTitle title="Dashboard / Detalles del evento" className="dash-title" />
        <button className="add-event" onClick={handleCreateEventClick}><i className="fa-solid fa-plus plus-btn"></i>Crear Evento</button>
        {!showCreateEvent ? (
          <>
            <div className='event-detail container'>
              <div className="event-content">
                {eveResult.map((el, index) => {
                  return (
                    <div key={index} >
                      <div className='row'>
                        <div className="first-container col-sm-4">
                          <div className="title-container">
                            <img className="event-image rounded-circle" width="60" height="60" src={el.image} />
                            <p className="event-title-s"><strong>{el.title}</strong></p>
                          </div>
                          <div className="settings dropdown">
                            <button className="settings-btn btn dropdown-toggle btn-sm" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                              <li className="dropdown-item">Editar evento</li>
                              <button className="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#deleteModal" onClick={() => {handleDelete(el.id) }}>
                                Eliminar evento
                              </button>
                            </ul>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-4 event-info ms-3">
                            <p className="event-date-s my-1"><strong>Horario: </strong>{el.date}</p>
                            <p className="event-location-s my-1"><strong>Lugar: </strong>{el.location}</p>
                            <p className="event-description-s my-1"><strong>Descripción: </strong>{el.description}</p>
                            <div className="event-guests-s">
                              <p className="event-guests-list my-1"><strong>Invitados:</strong></p>
                            </div>
                            <div className="guests-map">
                              <ul className="guest-list my-1">
                                {namesByEvent.map((el, index) => {
                                  return (
                                    <li className="each-guest" key={index}>
                                      <img src="https://res.cloudinary.com/dkcoownwg/image/upload/v1677503257/avatar_knpmj6.png" alt="hugenerd" width="25" height="25" className="rounded-circle" />
                                      <p key={index} className="guest-name mx-2 mt-1">{el.name}</p>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                            {isEventCreator && (
                              <div>
                                <div className="event-guests-s">
                                  <p className="event-guests-list my-1"><strong>Invitados que confirmaron su asistencia:</strong></p>
                                </div>
                                <div className="guests-map">
                                  <ul className="guest-list my-1">
                                    {confirmedGuests.map((el, index) => {
                                      let contact = store.userContacts.find(
                                        (contact) => contact.id === el.contact_id
                                      );
                                      return (
                                        <li className="each-guest" key={index}>
                                          <img src="https://res.cloudinary.com/dkcoownwg/image/upload/v1677503257/avatar_knpmj6.png" alt="hugenerd" width="25" height="25" className="rounded-circle" />
                                          <p key={index} className="guest-name mx-2 mt-1">{contact && contact.name}</p>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </div>
                            )}</div>
                        </div>
                        <div className="col d-md-flex justify-content-md-end">
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="row com-map-row">
              <Comments />
              <MapComponent />
            </div>
          </>
        ) : (
          <CreateEventForm className="create-event-container" />
        )}


      </div>
    </div>
  )
};


SingleEvent.propTypes = {
  match: PropTypes.object
};