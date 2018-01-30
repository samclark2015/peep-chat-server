# Peep Server
The backend client for Peep, the not-so-secret messaging service.
Running on Node.js using the Express framework, this backend communicates with clients through a REST API for time-insensitive requests, and through WebSockets & WebPush for real-time messaging and notifications.
- [Models](#models)
- [REST Endpoints](#rest-endpoints)
- [WebSocket API](#websocket-api)

### Models:
$ prefix denotes a server-set value; should not be sent in POST requests.
```
User:
	$ _id: ObjectId,
	name: String,
	username: String,

Thread:
	$ _id: ObjectId,
	members: [User],
	messages: [Message],
	$ createdAt: Date,
	$ updatedAt: Date

Message:
	$ _id: ObjectId,
	sender: User,
	thread: ObjectId,
	content: Mixed,
	timestamp: Date

Subscription:
	$ _id: ObjectId,
	userId: ObjectId -> User,
	type: ['webpush'],
	data: Object   // subscription data obtained from WebPush framework


WSMessage:
	type: ['signon', 'typing', 'message'],
	payload: Object
```

### REST Endpoints:
```
POST /api/login
	Request Body:
		{
			username: String,
			password: String
		}
	Returns: JWT user token

GET /api/secure/threads
	Headers: 'Authorization'
	Returns: [Thread]

GET /api/secure/threads/:id
	Headers: 'Authorization'
	Returns: Thread

POST /api/secure/threads
	Headers: 'Authorization'
	Request Body: Thread
	Returns: Thread

DELETE /api/secure/threads
	Headers: 'Authorization'
	Returns: HTTP Status Code

GET /api/users
	Headers: 'Authorization'
	Returns: [User]

GET /api/users/me
	Headers: 'Authorization'
	Returns: User
		Note: Returns user record associated with request token

GET /api/users/:id
	Headers: 'Authorization'
	Returns: User

GET /api/users/active
	Headers: 'Authorization'
	Returns: [User]
		Note: Returns array of users who have an active WebSocket connection to the server

POST /api/subscribe
	Headers: 'Authorization'
	Request Body: Subscription
	Returns:
		{
			success: Boolean,
			payload: Object
		}
```

### WebSocket API
```
Endpoint: /api/ws
Communication model: WSMessage

'signon':
	payload: JWT token

'typing':
	payload: Message

'message':
	payload: Message
```
