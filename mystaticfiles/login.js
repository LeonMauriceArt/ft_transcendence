function submitLoginForm(){
    var csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
    var login = document.getElementById("login").value;
    var password = document.getElementById("password").value;
    data = {
        login: login,
        password: password
    }

    var xml = new XMLHttpRequest();
    xml.open("POST", "/user/submit_login/", true);
    xml.setRequestHeader("Login-Cred", "json;charset=UTF-8");
    xml.setRequestHeader("X-CSRFToken", csrfToken);
    xml.send(JSON.stringify(data));

    xml.onload = function(){
        if (xml.status === 200)
            console.log("BRAVO COAIE");
        else
            console.log(xml.status);
    }
}
