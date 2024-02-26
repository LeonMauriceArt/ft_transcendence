const get_lobby_data = () => {
    fetch(`/tournament/api/tournament/${localStorage.getItem('current_tournament_id')}/`, {
        method: "GET"
    }).then(response => {
        if (!response.ok)
            throw new Error('Can\'t get tournament info')
        return response.json()
    }).then(console.log)
    .catch(console.error)
}