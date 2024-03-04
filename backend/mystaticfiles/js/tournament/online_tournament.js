
// VARIABLES ------------------------------------

const base_wssurl = 'ws://' + window.location.host + '/ws/tournament/'
let g_socket = {}
let g_tournament_id = ''
let g_username = ''

// UI changes -----------------------------------

const create_player_div = (player, is_owner) => {
    const div = document.createElement('div')

    if (is_owner)
        div.classList.add('owner')

    div.innerHTML = `
        <h3>PLAYER: ${player}</h3>
        <div>AKA aliase</div>
    `
    
    return div
}

const create_owner_btns = () => {
    const div = document.createElement('div')

    div.innerHTML = `
        <button onclick="loadContent('/tournament/invite_page', 'content')">INVITE</button>
    `

    return div
}

const update_lobby_ui = (room) => {
    const lobby_container = document.getElementById('lobby-container')

    lobby_container.innerHTML = ''

    console.log(room)

    room.players.forEach((player) => {
        const is_owner = player === room.owner

        lobby_container.appendChild(create_player_div(player, is_owner))
    })

    if (g_username === room.owner)
        lobby_container.appendChild(create_owner_btns())
}

// SOCKET INCOMING EVENTS -----------------------

const on_message = (message) => {
    handler = on_message_handlers.filter((e) => message.type === e.type)

    handler[0]?.handler(message.arg)
}

const on_players_update = (arg) => {
    update_lobby_ui(arg)
}

const on_load_lobby = (arg) => {
    update_lobby_ui(arg)
}

const on_message_handlers = [
    { type: 'players_update', handler: on_players_update },
    { type: 'load_lobby', handler: on_load_lobby }
]

// PAGE LOADING ---------------------------------

const load_create_online = () => {
    loadContent('/tournament/create_online_page', 'content')
    .then(set_g_username)
    .then(fetch_new_tournament_id)
    .then(connect_socket)
    .catch(console.error)
}

const load_tournament_requests = () => {
    loadContent('/tournament/tournament_requests_page', 'content')
}

const load_lobby = () => {
    loadContent('/tournament/create_online_page', 'content')
    .then(() => {
        g_socket.send(JSON.stringify({ event: 'load_lobby' }))
    })
}

// SERVER COMMUNICATIONS ------------------------

const set_g_username = () => {
    return fetch('/user/username', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    .then((username) => g_username = username)
    .catch(console.error)
}

const fetch_new_tournament_id = () => {
    return fetch('/tournament/api/create_tournament', {
        method: 'GET',
        headers: {
            'Content-Type': 'application.json'
        }
    }).then(response => response.json())
    .catch(console.error)
}

const connect_socket = ({ tournament_id }) => {
    g_tournament_id = tournament_id
    g_socket = new WebSocket(base_wssurl + tournament_id)

    g_socket.onopen = function(event) {
        console.log("WebSocket connection opened:", event)
    }

    g_socket.onmessage = function(event) {
        const message = JSON.parse(event.data)
        on_message(message)
    }

    g_socket.onclose = function(event) {
        console.log("WebSocket connection closed:", event)
        socket = {}
    }

    const on_page_change = () => {
        g_socket.close()
        window.removeEventListener('page_change', on_page_change)
        g_socket = {}
        loadPage('/tournament/')
    }

    window.addEventListener('page_change', on_page_change)
}

const send_tournament_invite = (friend_username) => {
    fetch ('/tournament/api/tournament_requests/',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to_invite: friend_username,
            tournament_id: g_tournament_id
        }),
    }).then(response => {
        if (!response.ok)
            throw new Error('Canno\'t invite this friend')
        return response.json()
    }).then(console.log)
    .catch(console.error)
}

const delete_tournament_request = (tournament_id) => {
    return fetch('/tournament/api/tournament_requests/',
    {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tournament_id: tournament_id
        })
    }).catch(console.error)
}

const accept_tournament_request = (tournament_id) => {
    delete_tournament_request(tournament_id)
    .then(set_g_username)
    .then(() => loadContent('/tournament/create_online_page', 'content'))
    .then(() => connect_socket({ tournament_id: tournament_id }))
    .catch(console.error)
}

const deny_tournament_request = (tournament_id) => {
    delete_tournament_request(tournament_id)
    .then(load_tournament_requests)
}