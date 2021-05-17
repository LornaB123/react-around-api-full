class Api { 
    constructor({baseUrl, headers}) { 
        //constructor body 
        this._baseUrl = baseUrl; 
        this._headers = headers; 
    } 
 
    // GET specified URL-cards 
    getInitialCards(token) { 
        return fetch(this._baseUrl + '/cards/', { 
            headers:  {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }, 
        }) 
        .then(res => res.ok ? res.json() : Promise.reject('Error' + res.statusText)) 
    } 
 
    //GET specified URL -user-info 
    getUserInfo(token) { 
        return fetch(this._baseUrl + '/users/me/', { 
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }) 
        .then(res => res.ok ? res.json() : Promise.reject('Error' + res.statusText)) 
    } 
 
      getAppInfo(){ 
          //gather all info together and render all at once 
          return Promise.all([this.getUserInfo(token), this.getInitialCards(token)]) 
      } 
 
    //POST speicifed url -cards 
    addCard({ name, link }, token) { 
        return fetch(this._baseUrl + '/cards/', { 
            headers:  {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }, 
            method: "POST", 
            body: JSON.stringify({ 
                name, 
                link 
            }) 
        }) 
        .then(res => res.ok ? res.json() : Promise.reject('Error' + res.statusText)) 
        .catch(err => console.log(err)) 
    } 
 
    // //DELETE specified url =cardID 
    removeCard(cardID, token) { 
         return fetch(this._baseUrl + '/cards/' + cardID, { 
             headers:  {
                 'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}`,
             }, 
             method: "DELETE", 
             }) 
         .then(res => res.ok ? res.json() : Promise.reject('Error' + res.statusText)) 
     } 
 
    //PUT specified url cardID 
    //DELETE specified url cardID 
    addLike(cardID, token) { 
        return fetch(this._baseUrl + '/cards/likes/' + cardID, { 
            headers:  {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }, 
            method: "PUT", 
            }) 
        .then(res => res.ok ? res.json() : Promise.reject('Error' + res.statusText)) 
    } 
 
    removeLike(cardID, token){ 
        return fetch(this._baseUrl + '/cards/likes/' + cardID, { 
            headers:  {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }, 
            method: "DELETE", 
            }) 
        .then(res => res.ok ? res.json() : Promise.reject('Error' + res.statusText))
    } 
 
    //PATCH user-info 
    setUserInfo({ name, about }, token) { 
        return fetch(this._baseUrl + '/users/me/', { 
            method: "PATCH", 
            headers: {
                'Cotnent-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }, 
            body: JSON.stringify({ 
                name, 
                about 
        }) 
    }) 
        .then(res => res.ok ? res.json() : Promise.reject('Error' + res.statusText))  
} 
 
    //PATCH avatar 
    setUserAvatar(avatar, token) { 
        return fetch(this._baseUrl + '/users/me/avatar/', { 
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }, 
            method: "PATCH", 
            body: JSON.stringify({ 
                avatar 
            }) 
        }) 
        .then(res => res.ok ? res.json() : Promise.reject('Error' + res.statusText)) 
    } 
} 
//connect api 
// project server URL = https://around.nomoreparties.co/v1/ + ADD Group ID here(group-7)...,  
//authorization = TOKEN( a950b923-6d6c-4927-9948-6833c1950cc9 ) 
const api = new Api({ 
    // baseUrl: "https://around.nomoreparties.co/v1/group-7", 
    // headers: { 
    //     authorization: "a950b923-6d6c-4927-9948-6833c1950cc9", 
    //     "Content-Type": "application/json" 
    // } 
    baseUrl: 'http://localhost:3001', 
}); 

export default api;