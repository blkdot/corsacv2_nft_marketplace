import * as actions from '../../actions';
import axios from 'axios';

export const fetchUsers = () => async (dispatch) => {

  dispatch(actions.getUsers.request());

  try {
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user/all`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {}
    }).then(async res => {
      dispatch(actions.getUsers.success(res.data.users));
    });
  } catch (err) {
    console.log("fetching users error:", err);
    dispatch(actions.getUsers.failure(err));
  }
};

export const setCurrentUser = (walletAddr) => async (dispatch) => {
  try {
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        walletAddr: walletAddr
      }
    }).then(async res => {
      if (res.data.user) {
        dispatch(actions.setCurrentUser(res.data.user));
      } else {
        dispatch(actions.setCurrentUser({
          walletAddr: '',
          name: 'Unregistered User',
          avatar: null,
          banner: null,
          about: null,
          twitter: null,
          youtube: null,
          instagram: null,
          created_at: null
        }));
      }
    });
  } catch (err) {
    console.log("fetching user error:", err);
    dispatch(actions.setCurrentUser(null));
  }
};
