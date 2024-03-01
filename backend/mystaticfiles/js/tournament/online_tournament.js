// VARIABLES

const base_wssurl = 'ws://' + window.location.host + '/ws/tournament/'


// SOCKET INCOMING EVENTS

const on_message = (message) => {
    handler = on_message_handlers.filter((e) => message.type === e.type)

    handler[0]?.handler(message.arg)
}

const on_players_update = (arg) => {
    console.log('PLAYERS UPDATE')
    console.log(arg)
}

const on_message_handlers = [
    { type: 'players_update', handler: on_players_update }
]

// PAGE LOADING

const load_create_online = () => {
    loadContent('/tournament/create_online_page', 'content')
    .then(fetch_new_tournament_id)
    .then(connect_socket)
}

const load_tournament_requests = () => {
    loadContent('/tournament/tournament_requests_page', 'content')
}

// SERVER COMMUNICATIONS

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
    const socket = new WebSocket(base_wssurl + 'd')

    socket.onopen = function(event) {
        console.log("WebSocket connection opened:", event);
    }

    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        on_message(message);
    }

    socket.onclose = function(event) {
        console.log("WebSocket connection closed:", event);
    }
}
