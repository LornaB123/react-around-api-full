// const BASE_URL = 'https://register.nomoreparties.co'
const BASE_URL = 'http://localhost:3001';

export const register = (password, email) => {
    return fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password, email })
    })
    .then(res => res.json())
};
export const authorize = (password, email) => {
    return fetch(`${BASE_URL}/signin`, {
      method: 'POST',
      referrerPolicy: 'no-referrer',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password, email })
    })
    .then((res) => res.ok ? res.json() : Promise.reject('Error' + res.statusText))
    .then((data) => {
      if (data.token){
        localStorage.setItem('jwt', data.token);
        return data;
      } else {
        return;
      }
    })
    .catch(err => console.log(err))
  };

export const checkToken = (token) => {
    return fetch(`${BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(res => res.ok ? res.json() : Promise.reject('Error' + res.statusText))
    .then((res) => {return res});
}