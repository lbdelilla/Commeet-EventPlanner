const BACKEND_URL = process.env.BACKEND_URL

const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			token: null,
			userContacts: [],
			contactsAvatars: [],
			allUsers: [],
			user: [],
			eventguests: [],
			events: [],
			comments: [],
			allContacts: [],

		},
		actions: {
			// Use getActions to call a function within a fuction
			synctoken: () => {
				const token = localStorage.getItem("token");
				console.log("App just loaded, synching the local storage");
				if (token && token != "" && token != undefined) setStore({ token: token });
			},

			login: async (email, password) => {

				const requestOptions = {
					method: "POST",
					headers: {
						"Content-type": "application/json"

					},
					body: JSON.stringify({
						"email": email,
						"password": password
					})
				};
				try {
					const resp = await fetch((`${BACKEND_URL}/api/login/`), requestOptions)

					if (resp.status != 200) {
						console.log("An error has occurred");
						return false;
					}
					const data = await resp.json();

					localStorage.setItem("token", data.access_token,);
					const userId = { id: data.id }
					localStorage.setItem("userId", JSON.stringify(userId))

					setStore({ ...getStore(), token: data.access_token })
					return true;
				}
				catch (error) {
					console.error("There has been an error login in")
				}
			},

			// register: async (email, password, name, phone, city, country)=>{
			// los parámetros deben estar en el mismo orden en que se llaman (register.js 22)
			register: async (name, email, password, city, country, phone) => {

				const requestOptions = {
					method: "POST",
					headers: {
						"Content-type": "application/json"
					},
					body: JSON.stringify({
						"name": name,
						"email": email,
						"country": country,
						"city": city,
						"phone": phone,
						"password": password
					})
				};

				try {
					const resp = await fetch(`${BACKEND_URL}/api/register`, requestOptions)
					if (resp.status != 200) {
						alert("An error has occurred while creating the user");
						return false;
					}
					const data = await resp.json();
					console.log(data)
					return true;
				}
				catch (error) {
					console.error("There has been an error creating a user")
				}
			},
			getUserData: async () => {
				const store = getStore();
				const requestOptions = {
					method: "GET",
					headers: {
						Authorization: `Bearer ${store.token}`,
					},

				};
				try {
					const res = await fetch(`${BACKEND_URL}/api/private`, requestOptions);
					const data = await res.json();
					return data;
				} catch (error) {
					console.log(error);
				}
			},

			logout: () => {
				const token = localStorage.removeItem("token");
				const userId = localStorage.removeItem("userId")


				setStore({
					token: null, 
					userContacts: [],
					contactsAvatars: [],
					allUsers: [],
					user: [],
					eventguests: [],
					events: [],
					comments: [],
					allContacts: [],
				});
			},
			addNewContact: async (name, email, userId) => {
				const requestOptions = {
					method: "POST",
					headers: {
						"Content-type": "application/json"
					},
					body: JSON.stringify({
						"name": name,
						"email": email,
						"user_id": userId
					})
				}
				try {
					const res = await fetch(`${BACKEND_URL}/api/contact/register`, requestOptions);
					if (res.status !== 200) {
						alert("An error has occurred while adding the new contact");
						return false;
					}
					const newContact = await res.json();
					const currentContacts = getStore().userContacts;
					const updatedContacts = currentContacts.concat(newContact);
					setStore({ ...getStore(), userContacts: updatedContacts });
					return true;
				}
				catch (error) {
					console.log(error);
				}
			},
			getUserContacts: async () => {
				const requestOptions = {
					method: "GET",
					headers: {
						"Content-type": "application/json"
					},
				}
				const userId = JSON.parse(localStorage.getItem("userId"))
				try {
					const response = await fetch(`${BACKEND_URL}/api/contacts/${userId.id}`, requestOptions)
					const contacts = await response.json();

					const userContacts = contacts.results.map(contact => ({
						name: contact.name,
						email: contact.email,
						id: contact.id
					}));
					setStore({ ...getStore(), userContacts })

				} catch (error) {
					console.log(error);
				};
			},
			getAllContacts: async () => {
				const requestOptions = {
					method: "GET",
					headers: {
						"Content-type": "application/json"
					},
				}

				try {
					const response = await fetch(`${BACKEND_URL}/api/contacts/`, requestOptions)
					const contacts = await response.json();

					setStore({ ...getStore(), allContacts: contacts })

				} catch (error) {
					console.log(error);
				};
			},
			getUserInfo: async () => {
				const requestOptions = {
					method: "GET",
					headers: {
						"Content-type": "application/json"
					},
				}
				const userId = JSON.parse(localStorage.getItem("userId"))
				try {
					const response = await fetch(`${BACKEND_URL}/api/users/${userId.id}`, requestOptions)
					const user = await response.json();
					setStore({ ...getStore(), user })
				} catch (error) {
					console.log(error);
				};
			},
			editContact: async (contactId, updatedName, updatedEmail, updatedAvatarUrl) => {
				const requestOptions = {
					method: "PUT",
					headers: {
						"Content-type": "application/json"
					},
					body: JSON.stringify({
						name: updatedName,
						email: updatedEmail,
						avatar_url: updatedAvatarUrl
					})
				}

				try {
					const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}`, requestOptions)
					const updatedContact = await response.json();

					const prevStore = getStore();
					const updatedContacts = prevStore.userContacts.map((contact) => {
						if (contact.id === contactId) {
							return updatedContact;
						} else {
							return contact;
						}
					});

					setStore({
						...prevStore,
						userContacts: updatedContacts
					});
				} catch (error) {
					console.log(error);
				}
			},
			contactsAvatar: async (contacts, avatars) => {
				try {
					contacts.forEach((contact) => {
						if (avatars[contact.email]) {
							contact.avatar = `${BACKEND_URL}${avatars[contact.email]}`;
						}
						setStore({ ...getStore(), contactsAvatars: contacts });
						console.log("CA", contactsAvatars)
					});


					return contacts;

				} catch (error) {
					console.error(error);
				}
			},

			deleteContact: async (contactId) => {
				const requestOptions = {
					method: "DELETE",
					headers: {
						"Content-type": "application/json"
					},
				}
				try {
					const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}`, requestOptions);
					const data = await response.json();
					console.log(data);

					setStore({
						...getStore(),
						userContacts: getStore().userContacts.filter((contact) => contact.id !== contactId),
					});
				} catch (error) {
					console.log(error);
				}
			},
			editUserInfo: async (field, value) => {
				const userId = JSON.parse(localStorage.getItem("userId"));
				const user = getStore().user;

				let updatedValue = value;



				const updatedUser = {
					...user,
					[field]: updatedValue
				};
				console.log(updatedUser)
				try {

					const response = await fetch(`${BACKEND_URL}/api/users/${userId.id}`, {
						method: "PUT",
						headers: {
							"Content-type": "application/json"
						},
						body: JSON.stringify(updatedUser)
					});

					const updatedUserInfo = await fetch(`${BACKEND_URL}/api/users/${userId.id}`);
					const updatedUserObject = await updatedUserInfo.json();

					const prevStore = getStore();
					setStore({
						...prevStore,
						user: updatedUserObject
					});
				} catch (error) {
					console.log(error);
				}
			},
			setNewPassword: async (userId, password) => {
				const user = getStore().user;

				let updatedPassword = password;

				const updatedUser = {
					...user,
					"password": updatedPassword
				};
				console.log(updatedUser)
				try {

					const updatedUserInfo = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
						method: "PUT",
						headers: {
							"Content-type": "application/json"
						},
						body: JSON.stringify(updatedUser)
					});

					const updatedUserObject = await updatedUserInfo.json();

					const prevStore = getStore();
					setStore({
						...prevStore,
						user: updatedUserObject
					});
					return true
				} catch (error) {
					console.log(error);
				}
			},
			deleteUser: async () => {
				const userId = JSON.parse(localStorage.getItem("userId"));
				const requestOptions = {
					method: "DELETE",
					headers: {
						"Content-type": "application/json"
					},
				}
				try {
					const response = await fetch(`${BACKEND_URL}/api/users/${userId.id}`, requestOptions);
					const data = await response.json();
					console.log(data);
					const token = localStorage.removeItem("token");
					const userId = localStorage.removeItem("userId")

					setStore({ token: null });


				} catch (error) {
					console.log(error);
				}
			},
			getEventsGuests: async () => {
				const requestOptions = {
					method: "GET",
				};
				try {
					const res = await fetch(`${BACKEND_URL}/api/events_guests`, requestOptions);
					const data = await res.json();

					setStore({ ...getStore(), eventguests: data.results });

				} catch (error) {
					console.log(error);
				}
			},
			getAllEvents: async () => {
				const requestOptions = {
					method: "GET",
				};
				try {
					const res = await fetch(`${BACKEND_URL}/api/events`, requestOptions);
					const data = await res.json();

					setStore({ ...getStore(), events: data.results });

				} catch (error) {
					console.log(error);
				}
			},
			deleteEvent: async (eventId) => {
				const requestOptions = {
					method: "DELETE",
					headers: {
						"Content-type": "application/json"
					},
				}
				try {
					const response = await fetch(`${BACKEND_URL}/api/events/${eventId}`, requestOptions);
					const data = await response.json();


					setStore({
						...getStore(),
						events: getStore().events.filter((event) => event.id !== eventId),
					});
				} catch (error) {
					console.log(error);
				}
			},
			postComment: async (userId, content, eventId) => {
				const requestOptions = {
					method: "POST",
					headers: {
						"Content-type": "application/json"
					},
					body: JSON.stringify({
						"user_id": userId,
						"content": content,
						"event_id": eventId,
					})
				}
				try {
					const res = await fetch(`${BACKEND_URL}/api/comment/${userId}`, requestOptions);
					console.log("this is res", res);
					if (res.status !== 200) {
						alert("An error has occurred while adding the new comment");
						return false;
					}
					const newComment = await res.json();
					const currentComments = getStore().comments;
					const updatedComments = currentComments.concat(newComment);
					setStore({ ...getStore(), comments: updatedComments });
					return true;
				}
				catch (error) {
					console.log(error);
				}
			},
			getComments: async (eventId) => {
				console.log(eventId)
				const requestOptions = {
					method: "GET",
				};
				try {
					const res = await fetch(`${BACKEND_URL}/api/comments/${eventId}`, requestOptions);
					const data = await res.json();

					setStore({ ...getStore(), comments: data });
				} catch (error) {
					console.log(error);
				}
			},
			getAllUsers: async () => {
				const requestOptions = {
					method: "GET",
				};
				try {
					const res = await fetch(`${BACKEND_URL}/api/users`, requestOptions);
					const data = await res.json();

					setStore({ ...getStore(), allUsers: data.results });

				} catch (error) {
					console.log(error);
				}
			},
			editEventInfo: async (eventId, field, value) => {
				const updatedEvent = { [field]: value };
				console.log("updatedevent", updatedEvent, eventId)

				try {
					const response = await fetch(`${BACKEND_URL}/api/events/${eventId}`, {
						method: "PUT",
						headers: {
							"Content-type": "application/json"
						},
						body: JSON.stringify(updatedEvent)
					});

					const updatedEventInfo = await response.json();

					const prevStore = getStore();
					const updatedEvents = prevStore.events.map((event) =>
						event.id === eventId ? updatedEventInfo : event
					);

					setStore({
						...prevStore,
						events: updatedEvents
					});
				} catch (error) {
					console.log(error);
				}
			},
			sendNewEvent: async (newEvent) => {
				console.log(newEvent)
				const requestOptions = {
					method: "POST",
					headers: {
						"Content-type": "application/json"
					},
					body: JSON.stringify(newEvent),
				}

				try {
					const resp = await fetch(`${BACKEND_URL}/api/event/register`, requestOptions)
					if (resp.status != 200) {
						alert("An error has occurred while creating the event");
						return false;
					}
					const newEvent = await resp.json();
					const currentEvents = getStore().events;
					const updatedEvents = currentEvents.concat(newEvent);
					setStore({ ...getStore(), events: updatedEvents });
					return true;

				} catch (error) {
					console.log("There has been an error creating a event", error);
				}

			},
			sendNewEventGuess: async (objGuessEvent) => {
				for (let i = 0; i < objGuessEvent.length; i++) {
					try {

						const url = `${BACKEND_URL}/api/events_guest/register`
						const request = {

							method: "POST",
							body: JSON.stringify(objGuessEvent[i]),

							headers: { "Content-Type": "application/json" },
						};
						console.log(request);
						const response = await fetch(url, request);
						const result = await response.json();
						console.log(result);
					} catch (error) {
						console.log(error);
					}
				};
			},
			updateRSVP: async (formData) => {
				const requestOptions = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(formData),
				};
				try {
					const resp = await fetch(`${BACKEND_URL}/api/actualizar-rsvp`, requestOptions)
					if (resp.status != 200) {
						console.log("An error has occurred");
						return false;
					}
					const updatedGuest = await resp.json();
					const currentGuests = getStore().eventguests;
					const updatedGuests = currentGuests.concat(updatedGuest);
					setStore({ ...getStore(), eventguests: updatedGuests });
					return true;

				} catch (error) {
					console.error("There has been an error with the RSVP")
				}
			},



		}
	}
}





export default getState;
