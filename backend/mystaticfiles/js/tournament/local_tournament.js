let users = []
let state = 1;

const hasEmptyString = (arr) => {
    arr.forEach((elem)=> {
        if (elem.trim().length === 0)
            return true;
    });
    return false;
};

const hasDuplicateStrings = (arr) => {
  let hasDuplicates = false;
  
  arr.forEach((element, index) => {
    arr.forEach((innerElement, innerIndex) => {
      if (index !== innerIndex && element === innerElement) {
        hasDuplicates = true;
      }
    });
  });

  return hasDuplicates;
};

const load_create_local = () => {
    loadContent('/tournament/create_local_page', 'content');
};

const start_tournament = () => {
    const usernames = [ ...document.querySelectorAll('.aliases_input')].map(e => e.value);

    if (hasDuplicateStrings(usernames) || hasEmptyString(usernames))
        return console.log('Error : same username or empty ones'); // TODO : show in UI.

    users = usernames.map(username => {
        username: username;
        win: 0;
        loss: 0;
    })

    loadContent('/tournament/local_tournament', 'content');
};

const player_state_block = ({ username, win, loss }) => {
};

const show_current_state = () => {
    const div = document.createElement('div');
};

