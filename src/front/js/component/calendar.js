import React, { useState, useEffect, useContext } from 'react'
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import '../../styles/calendar.css'


export const Calendar = () => {
  const [selectedDay, setSelectedDay] = useState(new Date());

  const { store, actions } = useContext(Context);

  useEffect(() => {
    actions.getEventsGuests()
    actions.getAllEvents()
  }, [])


  const eventos = store.events;
  const evguest = store.eventguests;
  const userInfo = store.user?.result
  const userEmail = userInfo?.email

  let getGuestsEmail = evguest.filter(item => item.email);


  let eventsByGuests = [];
  let uniqueEventIds = new Set();
  for (let i = 0; i < eventos.length; i++) {
    for (let j = 0; j < getGuestsEmail.length; j++) {
      if (eventos[i].id === getGuestsEmail[j].event_id && !uniqueEventIds.has(eventos[i].id)) {
        eventsByGuests.push(eventos[i]);
        uniqueEventIds.add(eventos[i].id);
      }
    }
  }


  let onlyDay = format(selectedDay, 'PP');
  let formatDay = format(selectedDay, 'PPPP', { locale: es });
  let futureDate = eventsByGuests.filter(item => format(new Date(item.date), 'PP') == onlyDay && new Date(item.date).getTime() > new Date().getTime());
  futureDate.sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime() });
  let bookedDays = eventsByGuests.map((el => new Date(el.date) > new Date() ? new Date(el.date) : null));
  const bookedStyle = { color: "skyblue", fontWeight: "bold" };

  return (
    <div className='cal-container-div'>
      <DayPicker
        locale={es}
        mode="single"
        selected={selectedDay}
        onSelect={setSelectedDay}
        modifiers={{ booked: bookedDays }}
        modifiersStyles={{ booked: bookedStyle }}
        className="day-picker-cal"
      />
      <div className='next-events'  >
        {futureDate.length === 0 ? <p className="numEvent">No tienes ningún evento el {formatDay}</p>
          : futureDate.length === 1 ? <p className="numEvent">Tienes {futureDate.length} evento el {formatDay}</p>
            : <h5 className="numEvent">Tienes {futureDate.length} eventos el {formatDay}</h5>
        }

        {futureDate.map((el, index) => {
          return (
            <div key={index}>
              <Link className='event-info-cal' to={"/singleevent/" + el.id}>
                <p className='p-event' > Hora: {el.date.slice(11, 16)} &nbsp;&nbsp;&nbsp; {el.title} &nbsp;&nbsp;&nbsp;  Lugar: {el.location} &nbsp;&nbsp;&nbsp; Ver detalles</p>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  );
}