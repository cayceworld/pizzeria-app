import { templates, select } from './../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';
class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();


  }

  render(element) {
    const thisBooking = this;

    const generateHTML = templates.bookingWidget();
    

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element; 
    thisBooking.dom.wrapper.innerHTML = generateHTML;
    
    //console.log(generateHTML);

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);

    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    
    console.log(thisBooking.dom.datePicker);
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    
  }
}


export default Booking;