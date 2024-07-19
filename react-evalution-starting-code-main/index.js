const API = (() => {
  const URL = "http://localhost:3000";

  const getCart = () => {
    return fetch(`${URL}/cart`).then((res) => res.json());
  };

  const getInventory = () => {
    return fetch(`${URL}/inventory`).then((res) => res.json());
  };

  const addToCart = (inventoryItem) => {
    const cartItem = {
      id: inventoryItem.id,
      content: inventoryItem.content,
      amount: inventoryItem.amount,
    };
    return fetch(`${URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItem),
    }).then((res) => res.json());
  };

  const updateCart = (cartItem, newAmount) => {
    const updatedItem = {
      ...cartItem,
      amount: newAmount,
    };

    return fetch(`${URL}/cart/${cartItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    }).then((res) => res.json())
      .then((updatedItem) => {
        return updatedItem;
      });
  };

  const deleteFromCart = (id) => {
    return fetch(`${URL}/cart/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  const checkout = () => {
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const Model = (() => {
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }

    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange();
    }

    set inventory(newInventory) {
      this.#inventory = newInventory.map(item => {
        const existingItem = this.#inventory.find(i => i.id === item.id);
        return { ...item, initialQuantity: existingItem ? existingItem.initialQuantity : 0 };
      });
      this.#onChange();
    }

    subscribe(cb) {
      this.#onChange = cb;
    }
  }

  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;

  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  const inventoryListEl = document.querySelector(".inventory-container ul");
  const cartListEl = document.querySelector(".cart-container ul");
  const checkoutBtnEl = document.querySelector(".checkout-btn");

  const renderInventory = (inventory) => {
    inventoryListEl.innerHTML = inventory
      .map(
        (item) => `
      <li id="inventory-${item.id}">
        ${item.content}
        <button type="button" class="decrement-btn">-</button>
        <span class="quantity">${item.initialQuantity || 0}</span>
        <button type="button" class="increment-btn">+</button>
        <button type="button" class="add-to-cart-btn">add to cart</button>
      </li>`
      )
      .join("");
  };

  const renderCart = (cart) => {
    cartListEl.innerHTML = cart
      .map(
        (item) => `
      <li id="cart-${item.id}">
        ${item.content} x ${item.amount}
        <button type="button" class="delete-btn">delete</button>
      </li>`
      )
      .join("");
  };

  return {
    renderInventory,
    renderCart,
    inventoryListEl,
    cartListEl,
    checkoutBtnEl,
  };
})();


const Controller = ((model, view) => {
  const state = new model.State();

  const init = () => {
    state.subscribe(() => {
      view.renderInventory(state.inventory);
      view.renderCart(state.cart);
    });

    model.getInventory().then((inventory) => {
      state.inventory = inventory.map(item => ({ ...item, initialQuantity: 0 }));
    });
    model.getCart().then((cart) => {
      state.cart = cart;
    });
  };

  const handleUpdateAmount = () => {
    view.inventoryListEl.addEventListener("click", (event) => {
      const id = parseInt(event.target.closest("li").id.replace("inventory-", ""));
      const item = state.inventory.find((item) => item.id === id);
      const quantityEl = event.target.closest("li").querySelector(".quantity");
      let quantity = parseInt(quantityEl.textContent);

      if (event.target.classList.contains("increment-btn")) {
        quantityEl.textContent = ++quantity;
        item.initialQuantity = quantity;
      }

      if (event.target.classList.contains("decrement-btn")) {
        quantityEl.textContent = quantity > 0 ? --quantity : 0;
        item.initialQuantity = quantity;
      }
    });
  };

  const handleAddToCart = () => {
    view.inventoryListEl.addEventListener("click", (event) => {
      if (event.target.classList.contains("add-to-cart-btn")) {
        const id = event.target.closest("li").id.replace("inventory-", "");
        const item = state.inventory.find((item) => item.id.toString() === id);

        if (!item) {
          console.error(`Item with id ${id} not found in inventory`);
          return;
        }

        const quantityEl = event.target.closest("li").querySelector(".quantity");
        const quantity = parseInt(quantityEl.textContent);

        if (quantity > 0) {
          const cartItem = state.cart.find((cartItem) => cartItem.id.toString() === item.id.toString());
          if (cartItem) {
            const newAmount = cartItem.amount + quantity;
            model.updateCart(cartItem, newAmount).then((updatedItem) => {
              state.cart = state.cart.map((cartItem) =>
                cartItem.id === updatedItem.id ? updatedItem : cartItem
              );
            });
          } else {
            model.addToCart({ id: item.id, content: item.content, amount: quantity }).then((newItem) => {
              state.cart = [...state.cart, newItem];
            });
          }
        }
      }
    });
  };

  const handleDelete = () => {
    view.cartListEl.addEventListener("click", (event) => {
      if (event.target.classList.contains("delete-btn")) {
        const id = parseInt(event.target.closest("li").id.replace("cart-", ""));
        model.deleteFromCart(id).then(() => {
          state.cart = state.cart.filter((cartItem) => cartItem.id !== id);
        });
      }
    });
  };

  const handleCheckout = () => {
    view.checkoutBtnEl.addEventListener("click", () => {
      model.checkout().then(() => {
        state.cart = [];
      });
    });
  };

  const bootstrap = () => {
    init();
    handleUpdateAmount();
    handleAddToCart();
    handleDelete();
    handleCheckout();
  };

  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
