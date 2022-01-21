/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };
  class Product {
    constructor(id, data) {
      const thisProduct = this;
      //thisProduct.dom = {};
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      //console.log('new Product:', thisProduct);
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.prepareCartProductParams();
    }
    renderInMenu() {
      const thisProduct = this;

      /* generate HTML based on temlate */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }
    getElements() {
      const thisProduct = this;

      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      //console.log(thisProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }
    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */

      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log(select.menuProduct.clickable);
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */


        const activeProduct = document.querySelector(select.all.menuProductsActive);
        //console.log(activeProduct);
        /* if there is active product and it's not thisProduct.element, remove class active from it */

        if (activeProduct != null && thisProduct.activeProduct != null) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });

    }
    initOrderForm() {
      const thisProduct = this;
      //console.log('method-name:initOrderForm');

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;

      //console.log('method-name:processOrder');

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for (let optionId in param.options) {

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);
          //create varible to check default price
          const checkDefault = optionId.hasOwnProperty('default');


          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            // check if the option is not default
            if (checkDefault == false) {
              //console.log(checkDefault);
              // add option price to price variable
              price += option.price;
              //thisProduct.imageWrapper.classList.add(classNames.menuProduct.imageVisible);

              //console.log(thisProduct.imageWrapper);
            }
          } else {
            // check if the option is default

            if (checkDefault == true) {
              // reduce price variable
              price -= option.price;
              thisProduct.imageWrapper.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //console.log(optionImage);

          if (optionImage) {
            if (optionSelected) {

              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }

          }

        }
      }
      /* multiply price by amount */

      thisProduct.priceSingle = price;
      thisProduct.priceSum = price *= thisProduct.amountWidget.value;
      //const priceSingle =  price * thisProduct.amountWidget.value ; 
      price *= thisProduct.amountWidget.value;
      //console.log('price single:', thisProduct.priceSingle);
      //console.log('price:', price);
      //console.log(thisProduct.amountWidget.value);
      // update calculated price in the HTML

      thisProduct.priceElem.innerHTML = thisProduct.priceSum;
      //console.log(price);
      //console.log('price:', thisProduct.priceSum);
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    addToCart() {
      const thisProduct = this;
      thisProduct.prepareCartProduct();
      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSum,
        params: {}
      };
      productSummary.params = thisProduct.prepareCartProductParams();
      //console.log('product Summary:', productSummary);
      return productSummary;
    }
    prepareCartProductParams() {
      const thisProduct = this;
      //console.log('method-name:prepareCartProductParams');
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      const params = {};

      // for very category (param)
      for (let paramId in thisProduct.data.params) {
        //console.log('paramId:',paramId);
        //console.log('data:', thisProduct.data);
        const param = thisProduct.data.params[paramId];

        //console.log('param:',param);
        //console.log('params:',params);
        params[paramId] = {
          label: param.label,
          options: {}
        };
        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
            //console.log(option.label);
            //console.log(params[paramId].options);
          }
        }

      }

      return params;

    }

  }
  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);

    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);
      /* TODO: Add validation */
      if (thisWidget.value !== newValue && !isNaN(newValue) && value >= 0 && value <= 10) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }


      thisWidget.input.value = thisWidget.value;

      //console.log(thisWidget.value);
    }
    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }
    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }


  }

  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      //thisCart.update();

      //console.log('new Cart', thisCart);
    }
    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.productList = document.querySelector(select.cart.productList);
      thisCart.dom.wrapper = element;
      //console.log(thisCart.dom);
      //console.log(thisCart.dom.wrapper);
      thisCart.dom.toggleTrigger = document.querySelector(select.cart.toggleTrigger);
      //console.log(thisCart.dom.toggleTrigger);
      thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      } );
      thisCart.dom.productList.addEventListener('remove', function(event){
        console.log('remove');
        thisCart.remove(event.detail.cartProduct);
      } );

    }
    add(menuProduct) {
      const thisCart = this;
      /* generate HTML based on temlate */
      const generatedHTML = templates.cartProduct(menuProduct);
      //console.log(generatedHTML);

      /* create element using utils.createElementFromHTML */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      //console.log(generatedDOM);

      /* add element to cart */
      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);
      thisCart.update();
    }
    update() {
      const thisCart = this;

      thisCart.deliveryFee = 0;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (let product of thisCart.products) {
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;

      }
      if (thisCart.totalNumber != 0) {
        thisCart.deliveryFee = 20;

      }
      
      for ( let totalPrice of thisCart.dom.totalPrice ){
        totalPrice.innerHTML = thisCart.subtotalPrice + thisCart.deliveryFee;
      }
      
      //thisCart.totalPrice =  thisCart.subtotalPrice + thisCart.deliveryFee;



      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      
      
      console.log('delivety:', thisCart.deliveryFee);
      console.log('amount:', thisCart.totalNumber);
      console.log('subtotal price', thisCart.subtotalPrice);
      console.log('total price', thisCart.totalPrice);
      console.log('total price', thisCart.dom.totalPrice);
    }
    remove(cartProduct){
      const thisCart = this;
      thisCart.products = thisCart.products.filter(product => product !== cartProduct);
      cartProduct.dom.wrapper.remove();


      thisCart.update();
    }

  }
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      console.log(menuProduct);
      console.log('NEWthisCartProduct:', thisCartProduct);
    }

    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }
    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });

    }
    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent ('remove',{
        bubbles: true,
        detail:{
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('remove');
      //console.log(thisCartProduct.remove());
      console.log(event.detail.cartProduct);
      //return event.detail.cartProduct;
      
      
    }
    initActions(){
      const thisCartProduct = this; 

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });

    }
  }

  const app = {
    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },
    init: function () {
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
      //console.log(this.initMenu);
    },
  };

  app.init();
}
