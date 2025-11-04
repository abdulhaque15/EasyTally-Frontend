import React, { Fragment } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import events from "./events";
import { addMonths, subMonths } from "date-fns";
import ModuleHeader from "../../components/ModuleHeader";
import { Container } from "react-bootstrap";
import { FaCalendarAlt } from "react-icons/fa";

const CalendarDashboard = () => {
  
  const today = new Date();
  const minDate = subMonths(today, 1);
  const maxDate = addMonths(today, 3);

  const customEventContent = (eventInfo) => {
    return (
      <div className="custom-text">
        <strong>{eventInfo.event.title}</strong>
        {eventInfo.event.extendedProps.ownername && (
          <div style={{ fontSize: "11px", marginTop: "2px" }}>
            {eventInfo.event.extendedProps.ownername}
          </div>
        )}
      </div>
    );
  };

  return (
    <Fragment>
      <ModuleHeader header={"Schedule Meeting"} icon={<FaCalendarAlt />} />
      <Container className="px-3 px-md-4 mt-4">
        <div className="align-items-center justify-content-center">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            displayEventEnd={true}
            defaultView="dayGridMonth"
            themeSystem="Simplex"
            height="auto"
            validRange={{
              start: minDate.toISOString().split("T")[0],
              end: maxDate.toISOString().split("T")[0],
            }}
            eventContent={customEventContent}
          />
        </div>
      </Container>
    </Fragment>
  );
};

export default CalendarDashboard;
