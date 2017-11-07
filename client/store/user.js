import axios from 'axios';
import history from '../history';
import { fetchCart } from './cart';
import { addError } from './error';

/**
 * ACTION TYPES
 */
const GET_USER = 'GET_USER';
const REMOVE_USER = 'REMOVE_USER';
const SET_SESSION = 'SET_SESSION';

const ADMIN_FETCH_USERS = 'ADMIN_FETCH_USERS';
const ADMIN_DELETE_USER = 'ADMIN_DELETE_USER';
const ADMIN_UPDATE_USER = 'ADMIN_UPDATE_USER';
/**
 * INITIAL STATE
 */
const defaultUser = {};

/**
 * ACTION CREATORS
 */
const getUser = user => ({ type: GET_USER, user });
const removeUser = () => ({ type: REMOVE_USER });
const setSess = id => ({ type: SET_SESSION, id });

const fetchUsers = users => ({ type: ADMIN_FETCH_USERS, users });
const deleteUser = id => ({ type: ADMIN_DELETE_USER, id });
const updateUser = user => ({ type: ADMIN_UPDATE_USER, user });

/**
 * REDUCER
 */
export default (state = defaultUser, action) => {
  switch (action.type) {
    case GET_USER:
      return action.user;

    case REMOVE_USER:
      return defaultUser;

    default:
      return state;
  }
};

export const sessionId = (state = '', action) => {
  switch (action.type) {
    case SET_SESSION:
      return action.id;

    default:
      return state;
  }
}

/**
 * THUNK CREATORS
 */

// QUESTION. Step 3. The me() function is run, which makes an /auth/me call. (located in /server/auth/index) The user data is returned.
// If a user exists, getUser sets the user state data to that user, otherwise, it is set to an empty object.
// A call to /auth/sessionId is then made. The returned data(string) is the set to the
// session state object. Then fetchCart is run with either userData or sess.data. Step 4 is in /client/store/cart
export const me = () => (dispatch) => {
  axios.get('/auth/me')
    .then((res) => {
      const userData = res.data;
      dispatch(getUser(userData || defaultUser))
      axios.get('/auth/sessionId')
        .then((sess) => {
          dispatch(setSess(sess.data))
          dispatch(fetchCart(userData || sess.data))
        })
    })
    .catch((err) => {
      dispatch(addError(err.response.statusText))
      console.log(err)
    })
};

export const auth = (email, password, method) => (dispatch) => {
  axios.post(`/auth/${method}`, { email, password })
    .then((res) => {
      dispatch(getUser(res.data))
      dispatch(fetchCart(res.data))
      history.push('/home')
    })
    .catch((err) => {
      dispatch(addError(err.response.statusText))
      dispatch(getUser({ err }))
    })
};

export const logout = () => (dispatch) => {
  axios.post('/auth/logout')
    .then(() => {
      dispatch(removeUser())
      history.push('/login')
    })
    .then(() => axios.get('/auth/sessionId')
      .then((sess) => {
        dispatch(fetchCart(sess.data))
      }))
    .catch((err) => {
      dispatch(addError(err.response.statusText))
      console.log(err)
    })
};

// ADMIN THUNKS

export const adminFetchUsers = () => (dispatch) => {
  axios.get('/api/admin/users')
    .then(res => dispatch(fetchUsers(res.data)))
    .catch(err => dispatch(addError(err.response.statusText)));
};

export const adminRemoveUser = id => (dispatch) => {
  dispatch(deleteUser(id));
  axios.delete(`/api/admin/users/${id}`)
    .catch((err) => {
      dispatch(addError(err.response.statusText));
      console.error(`Removing user: ${id} unsuccesful`, err)
    });
};

export const adminUpdateUser = (id, user) => (dispatch) => {
  axios.put(`/api/admin/users/${id}`, user)
    .then(res => dispatch(updateUser(res.data)))
    .catch((err) => {
      dispatch(addError(err.response.statusText))
      console.error(`Updating user: ${user} unsuccesful`, err)
    });
};
