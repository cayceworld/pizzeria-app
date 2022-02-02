import { templates, select } from './../settings.js';
import AmountWidget from './AmountWidget.js';
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
    
    console.log(generateHTML);

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);

  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}


export default Booking;