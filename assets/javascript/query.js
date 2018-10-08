$(document).ready(function() {

    

  // Initialize Firebase
    // var config = {
    //     apiKey: "AIzaSyCCqK47YhNpEFmjbZnsbMBFly4v0ZZENe8",
    //     authDomain: "winecellarproject-dde91.firebaseapp.com",
    //     databaseURL: "https://winecellarproject-dde91.firebaseio.com",
    //     projectId: "winecellarproject-dde91",
    //     storageBucket: "winecellarproject-dde91.appspot.com",
    //     messagingSenderId: "619773653552"
    // };
    // firebase.initializeApp(config);
    // var database = firebase.database();
    var input = 0;
    callwineScore(input);
    // $(document).on("click", "#addWine", function(){
    //     var input = 0;
    //     callwineScore(input);
        // var name = ;
        // var color = ;
        // var varietal = ;
        // var country

        // database.ref().push({
        //     name:name,
        //     varietal:varietal,
        //     color:color,
        //     country:country,
        //     year:year,
        //     wineID:wineID
        // })
    //})


    function callwineScore(input) {
        var request = new XMLHttpRequest();

        request.open(
        "GET",
        "https://cors-anywhere.herokuapp.com/https://api.globalwinescore.com/globalwinescores/latest/?wine_id=121092"
        );

        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader(
        "Authorization",
        "Token ec92a47659317b5e11ad3adff4185307e8e1c669"
        );

        request.onreadystatechange = function() {
        if (this.readyState === 4) {
            //console.log('Status:', this.status);
            //console.log('Headers:', this.getAllResponseHeaders());
            //console.log('Body:', this.responseText);
            var working = JSON.parse(this.responseText);
            console.log(working.results[0]);
            //console.log(working.results[1]);

        }
        };
        console.log("hello World");
        request.send();
    }
    //callwineScore();
});
