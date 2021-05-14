import React, { useEffect, useState } from "react";
import {Route, Redirect, useHistory} from 'react-router-dom'
import CurrentUserContext from "../contexts/CurrentUserContext.js";

import Header from "./Header.js";
import Main from "./Main.js";
import Footer from "./Footer.js";
import PopupWithImage from "./PopupWithImage.js";
import PopupWithForm from "./PopupWithForm.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import Login from "./Login.js";
import Register from "./Register.js";
import InfoToolTip from "./InfoToolTip.js";
import logo from "../images/logo.svg";

import api from "../utils/api.js";
import {checkToken, authorize, register} from '../utils/auth';
import ProtectedRoute from "./ProtectedRoute.js";

function App() {
  const [editAvatarOpen, setEditAvatarOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [registered, setRegistered] = useState(false);
  const [isOpenToolTip, setIsOpenToolTip] = useState(false);

  const history = useHistory();

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    let likeStatus;
    if (isLiked === false) {
      likeStatus = api.addLike(card._id);
    } else {
      likeStatus = api.removeLike(card._id);
    }
    likeStatus
      .then((newCard) => {
        const newCards = cards.map((c) => (c._id === card._id ? newCard : c));
        //update the state
        setCards(newCards);
      })
      .catch((err) => console.log(err));
  }

  function handleCardDelete(card) {
    api
      .removeCard(card._id)
      .then(() => {
        const cardList = cards.filter((c) => c._id !== card._id);
        setCards(cardList);
      })
      .catch((err) => console.log(err));
  }

  //call server for profile content
  useEffect(() => {
    api
      .getInitialCards()
      .then((res) => {
        setCards(res);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    api
      .getUserInfo()
      .then((res) => {
        setCurrentUser(res);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      return checkToken(jwt)
        .then(({ data }) => {
          if (data) {
            setLoggedIn(true);
            setEmail(data.email);
            return;
          }
          setLoggedIn(false);
        })
        .catch((err) => console.log(err));
    }
    setLoggedIn(false);
  }, []);

  function handleUpdateUser({ name, about }) {
    api
      .setUserInfo({ name, about })
      .then((res) => {
        setCurrentUser(res);
      })
      .catch((err) => console.log(err))
      .finally(() => closeAllPopups());
  }

  function handleUpdateAvatar(avatar) {
    api
      .setUserAvatar(avatar)
      .then((res) => {
        setCurrentUser(res);
      })
      .catch((err) => console.log(err))
      .finally(() => closeAllPopups());
  }

  function handleAddPlace({ name, link }) {
    api
      .addCard({ name, link })
      .then((newCard) => {
        setCards([newCard, ...cards]);
      })
      .catch((err) => console.log(err))
      .finally(() => closeAllPopups());
  }

  //handler functions for popups
  function handleEditAvatarClick(e) {
    setEditAvatarOpen(true);
  }

  function handleEditProfileClick(e) {
    setEditProfileOpen(true);
  }

  function handleAddCardClick(e) {
    setAddCardOpen(true);
  }

  function closeAllPopups() {
    setEditAvatarOpen(false);
    setEditProfileOpen(false);
    setAddCardOpen(false);
    setDeletePopupOpen(false);
    setImagePopupOpen(false);
  }

  function handleClosePopups(e) {
    if (e.target !== e.currentTarget) return;
    closeAllPopups();
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setImagePopupOpen(true);
  }

  function toggleToolTip() {
    setIsOpenToolTip(!isOpenToolTip);
  }
  function handleRegister(password, email) {
    return register(password, email)
      .then((res) => {
        if (res.data) {
          setLoggedIn(true);
          history.push("/signin");
          handleAuth(password, email);
          setRegistered(true);
          toggleToolTip();
          return;
        }
        setRegistered(false);
        toggleToolTip();
      })
      .catch((err) => console.log(err));
  }
  function handleAuth(password, email) {
    authorize(password, email)
      .then(({ token }) => {
        if (token) {
          localStorage.setItem("jwt", token);
          setLoggedIn(true);
          setEmail(email);
          return;
        }
        setRegistered(false);
        toggleToolTip();
      })
      .catch((err) => console.log(err));
  }
  function handleLogin() {
    setLoggedIn(!loggedIn);
  }

  return (
    <div className="body">
      <CurrentUserContext.Provider value={currentUser}>
        <Route path="/signin">
          {loggedIn ? (
            <Redirect to="/" />
          ) : (
            <Login logo={logo} handleAuth={handleAuth} />
          )}
        </Route>
        <Route path="/signup">
          {loggedIn ? (
            <Redirect to="/" />
          ) : (
            <Register logo={logo} handleRegister={handleRegister} />
          )}
        </Route>
        <ProtectedRoute path="/" loggedIn={loggedIn}>
          <Header 
            logo={logo} 
            email={email} 
            handleLog={handleLogin} />
          <Main
            cards={cards}
            onEditAvatar={handleEditAvatarClick}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddCardClick}
            onCardDelete={handleCardDelete}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCloseButtons={closeAllPopups}
          />
          <Footer />
          <EditAvatarPopup
            isOpen={editAvatarOpen}
            onClose={handleClosePopups}
            onUpdateAvatar={handleUpdateAvatar}
          />
          <EditProfilePopup
            isOpen={editProfileOpen}
            onClose={handleClosePopups}
            onUpdateUser={handleUpdateUser}
          />
          <AddPlacePopup
            isOpen={addCardOpen}
            onClose={handleClosePopups}
            onAddPlace={handleAddPlace}
          />
          <PopupWithForm
            name="type_delete-card"
            title="Are you sure?"
            buttonText="Yes"
            isOpen={deletePopupOpen}
            onClose={handleClosePopups}
          />
          <PopupWithImage
            card={selectedCard}
            isOpen={imagePopupOpen}
            onClose={handleClosePopups}
          />
        </ProtectedRoute>
        <Route path='/'>
                { loggedIn ? <Redirect to='/' /> : <Redirect to='/signin' /> }
            </Route> 
            <InfoToolTip 
                isOpen={isOpenToolTip} 
                registered={registered} 
                toggle={toggleToolTip}
                />
      </CurrentUserContext.Provider>
    </div>
  );
}
export default App;
