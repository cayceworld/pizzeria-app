import { templates } from './../settings.js';
class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidget();
  }
  render(element) {
    const thisHome = this;

    const generateHTML = templates.homePage();


    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generateHTML;
  }
  initWidget() {
    // eslint-disable-next-line
    const thisHome = this;
    var elem = document.querySelector('.main-carousel');
    // eslint-disable-next-line
    var flkty = new Flickity(elem, {
      // options
      cellAlign: 'left',
      contain: true
    });

    // element argument can be a selector string
    //   for an individual element
    // eslint-disable-next-line
    var flkty = new Flickity('.main-carousel', {
      // options
    });



  }
}
export default Home;