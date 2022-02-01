import { settings, select } from './settings.js';
import Product from './componenst/Product.js';
import Cart from './componenst/Cart.js';



const app = {
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
      console.log(event.detail.product);
      //app.cart.add(thisProduct.prepareCartProduct());
    });
  },
  initMenu: function () {
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    //console.log(url);
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedRespnose) {
        //console.log('parsedResponse', parsedRespnose);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedRespnose;
        /* execute initMenu method */
        thisApp.initMenu();
      });

    //console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  init: function () {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initData();

    thisApp.initCart();
    //console.log(this.initMenu);
  },

};

app.init();
