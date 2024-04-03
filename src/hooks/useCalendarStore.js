import { useDispatch, useSelector } from "react-redux";
import {
  onAddNewEvent,
  onLogoutCalendar,
  onDeleteEvent,
  onLoadEvents,
  onSetActiveEvent,
  onUpdateEvent,
} from "../store/calendar/calendarSlice";
import calendarApi from "../api/calendarApi";
import { convertEventsToDateEvents } from "../helpers";
import Swal from "sweetalert2";

export const useCalendarStore = () => {
  const dispatch = useDispatch();

  const { events, activeEvent } = useSelector((state) => state.calendar);
  const { user } = useSelector((state) => state.auth);

  const setActiveEvent = (calendarEvent) => {
    dispatch(onSetActiveEvent(calendarEvent));
  };

  // No vamos a usar un thunks asíncronos, de frente vamos a disparar acciones síncronas
  const startSavingEvent = async (calendarEvent) => {

    try {
      if (calendarEvent.id) {
        // If user has an ID is because the event needs to be updated
        await calendarApi.put(`/events/${calendarEvent.id}`, calendarEvent);
        dispatch(onUpdateEvent({ ...calendarEvent }));
        Swal.fire('Update', "It has been updated successfully", 'success');
        return;
      } else {
        // Else is creating a new event and adding an unique ID event
        const { data } = await calendarApi.post("/events", calendarEvent);
        dispatch(onAddNewEvent({ ...calendarEvent, id: data.event.id, user: { ...user, _id: user.uid} }));
        Swal.fire('Creation', "It has been created successfully", 'success');
      
      }
    } catch (error) {
      console.log('error', error)
      Swal.fire('Error while saving event', error.response.data?.msg , 'error' )
    }
  };

  const startDeletingEvent = async () => {

    try {
      await calendarApi.delete(`/events/${ activeEvent.id }` );
      dispatch(onDeleteEvent());
      Swal.fire('Elimination', "It has been removed successfully", 'success');
      return;
      
    } catch (error) {
      console.log('error', error)
      Swal.fire('Error while deleting event', error.response.data?.msg , 'error' )
    }
  };

  const startLoadingEvents = async () => {

    try {
      const { data } = await calendarApi.get("/events");

      console.log('loading events', data)
      const events = convertEventsToDateEvents(data.events);

      dispatch(onLoadEvents(events));
    } catch (error) {
      console.log("Error loading events", error);
    }
  };  

  return {
    // * Propiedades
    events,
    activeEvent,
    hasEventSelected: !!activeEvent,

    // * Métodos
    setActiveEvent,
    startDeletingEvent,
    startSavingEvent,
    startLoadingEvents,
  };
};
