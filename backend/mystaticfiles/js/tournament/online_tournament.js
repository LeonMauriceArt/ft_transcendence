const create_tournament_el = (id, name, players_count) => {
  const liElement = document.createElement('li');
  
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
    }).catch(error => console.error(error))   
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

const create_tournament = () => {
    const tournament_name = document.getElementById('tournament_name_input').value;

    if (!tournament_name)
        return ;

    fetch("/tournament/api/tournament/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tournament_name: tournament_name })
    }).then(response => {
        if (!response.ok)
            console.log('ERROR XD')
        else
            console.log('BIG XD')
    })
};