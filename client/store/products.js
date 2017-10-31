import axios from 'axios';

/* -----------------    ACTION TYPES ------------------ */

const FETCH_PRODUCTS = 'FETCH_PRODUCTS';
const CREATE_PRODUCT = 'CREATE_PRODUCT';
const REMOVE_PRODUCT = 'REMOVE_PRODUCT';
const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
/* ------------   ACTION CREATORS     ------------------ */

export const fetch = products => ({ type: FETCH_PRODUCTS, products });
export const create = product => ({ type: CREATE_PRODUCT, product });
export const remove = id => ({ type: REMOVE_PRODUCT, id });
export const update = product => ({ type: UPDATE_PRODUCT, product });


/* ------------       REDUCER     ------------------ */

export default (products = [], action) => {
  switch (action.type) {
    case FETCH_PRODUCTS:
      return action.products;

    case CREATE_PRODUCT:
      return [action.product, ...products];

    case REMOVE_PRODUCT:
      return products.filter(product => product.id !== action.id);

    case UPDATE_PRODUCT:
      return products.map(product => (
        action.product.id === product.id ? action.product : product
      ));

    default:
      return products;
  }
};
/* ------------   THUNK CREATORS     ------------------ */

export const fetchProducts = () => (dispatch) => {
  axios.get('/api/products')
    .then(res => dispatch(fetch(res.data)));
};

// optimistic
export const removeProduct = id => (dispatch) => {
  dispatch(remove(id));
  axios.delete(`/api/products/${id}`)
    .catch(err => console.error(`Removing product: ${id} unsuccesful`, err));
};

export const addProduct = product => (dispatch) => {
  axios.post('/api/products', product)
    .then(res => dispatch(create(res.data)))
    .catch(err => console.error(`Creating user: ${product} unsuccesful`, err));
};

export const updateProduct = (id, product) => (dispatch) => {
  axios.put(`/api/products/${id}`, product)
    .then(res => dispatch(update(res.data)))
    .catch(err => console.error(`Updating product: ${product} unsuccesful`, err));
};
