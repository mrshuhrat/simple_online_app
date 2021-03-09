import { useEffect, useState } from "react"

import io from "socket.io-client"

const serviceUrl = "ws://localhost:4050"

function App () {

	const [username, setUsername] = useState(null)

	const [newUser, setNewUser] = useState(null)

	const [socket, setSocket] = useState(null)

	const [resp, setResponse] = useState({
		loading: true,
		data: [],
	})

	useEffect(() => {

		setSocket(io(serviceUrl, { transports: ["websocket"] }))

	}, [])

	useEffect(() => {

		if (socket) {

			socket.on("new_user", u => {

				setNewUser(u)
			})
		}

	}, [socket])

	useEffect(() => {

		if (username) {

			socket.emit("new_login", username)
		}

	}, [username, socket])

	useEffect(() => {

		;(async () => {

			const kesh = await caches.open("sample_app")

			const request = new Request("http://localhost:4050/users")

			try {
				const response = await fetch(request)

				if (response.status >= 200 && response.status <= 299) {

					const readyData = await response.json()

					setResponse({ loading: false, data: readyData, })

					if ("caches" in window) {

						kesh.add(request)
					}
				}
			}
			catch(error) {
				
				const keys = await kesh.keys()

				if (keys.length) {

					const response = await kesh.match(request)

					const readyData = await response.json()

					setResponse({ loading: false, data: readyData, })
				}
			}

		})()

	}, [])

	return (
		<>

			{
				newUser && <h1 onClick={() => setNewUser(null)}>{newUser} is online!</h1>
			}

			{

				resp.loading && <>loading...</>
			}

			{
				!resp.loading && resp.data.length > 0 && (

					<>
						<ul>
							{
								resp.data.map(user => (
									<li key={user.id}>
										<p>{user.username}</p>
									</li>
								))
							}
						</ul>
					</>
				)
			}

			{username}

			<input
				type="text"
				onKeyUp={event => {

					if (event.keyCode === 13) {

						setUsername(event.target.value.trim().toLowerCase())
					}
				}}
			/>

				
		</>
	)
}

export default App
