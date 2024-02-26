const create_tournament_el = (id, name, players_count) => {
  const liElement = document.createElement('li');
  
  liElement.addEventListener('click', () => join_pre_lobby(id));

  liElement.innerHTML = `
    <div>ID: ${id}</div>
    <div>NAME: ${name}</div>
    <div>PLAYERS: ${players_count} / 4</div>
  `;
  
  return liElement;
}

const fetch_tournaments = () => {
    return fetch("/tournament/api/tournament/")
    .then(response => {
        if (!response.ok)
            throw new Error('Fail to fetch ongoing tournaments.')
        return response.json()
    }).then(json => {
        return json
    }).catch(console.error)   
}

const load_create_online = () => {
    loadContent("/tournament/create_online", "dynamicContent");
};

const load_join_online = () => {
    loadContent("/tournament/join_online", "dynamicContent")
    .then(fetch_tournaments)
    .then(json => {
        const tournament_list = document.getElementById('tournament_list');
        json.forEach(element => {
            tournament_list.appendChild(create_tournament_el(element.id, element.name, element.players_count))
        });
    });
}

const load_lobby_online = () => {
    loadContent('/tournament/lobby', 'content');
}

const create_tournament = () => {
    const tournament_name = document.getElementById('tournament_name_input').value;

    return fetch("/tournament/api/tournament/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tournament_name: tournament_name })
    }).then(response => {
        if (!response.ok)
            throw new Error("Couldn,t create tournament");
        return response.json();
    }).then(json => join_pre_lobby(json.id))
    .catch(console.error)
};

const join_pre_lobby = (tournament_id) => {
    localStorage.setItem('current_tournament_id', tournament_id);
    loadContent('/tournament/pre_lobby', 'content')
}

const join_lobby = () => {
    const input_value = document.querySelector("#pre-lobby-box input").value;

    fetch(`/tournament/api/tournament/${localStorage.getItem('current_tournament_id')}/`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aliase: input_value })
    }).then(response => {
        if (!response.ok)
            throw new Error("Couldn't join tournament")
        return ;
    }).then (load_lobby_online)
    .catch(console.error)
}