$(document).ready(function () {
  var curPage = localStorage.getItem("currentPage");
  var wineReturned;
  var userID;
  var userName;
  var arrayOfStores;
  var wineNames = [];
  var numberBottles = [];
  // 1. Initialize Firebase
  var config = {
    apiKey: "AIzaSyAA89Se884k_LhKKY9GFcVOpRqFZp9aCEE",
    authDomain: "july2018uofr.firebaseapp.com",
    databaseURL: "https://july2018uofr.firebaseio.com",
    projectId: "july2018uofr",
    storageBucket: "july2018uofr.appspot.com",
    messagingSenderId: "266739656289"
  };

  firebase.initializeApp(config);

  var database = firebase.database();

  //snooth
  function buildQueryURL(input) {
    // queryURL is the url we'll use to query the API
    var queryURL = "https://api.snooth.com/wines/?";

    // Begin building an object to contain our API call's query parameters
    // Set the API key
    var queryParams = {
      akey: "b0jsh3j9ckyksr2k5xu3t8mgd6tqs5wqcseanmyg1ikcnv9j",
      q: input.name,
      color: input.type,
      n: 10
    };
    console.log(queryURL + $.param(queryParams));
    return queryURL + $.param(queryParams);
  }
  //This sets up the api call for the stores in the users area
  function storeURL(input) {
    var storeQuery = "https://api.snooth.com/stores/?";
    var zip = prompt("What zip code would you like to search? : ");
    // Begin building an object to contain our API call's query parameters
    // Set the API key
    var queryParams = {
      akey: "b0jsh3j9ckyksr2k5xu3t8mgd6tqs5wqcseanmyg1ikcnv9j",
      c: "US",
      z: zip
    };
    return storeQuery + $.param(queryParams);
  }

  $("#run-search").on("click", function (event) {
    event.preventDefault();
    wineSearch();
  });

  function storeSearch() {
    var storeLocationURL = storeURL();
    console.log(storeLocationURL);
    //This will call the local stores and save the results in the an array
    $.ajax({
      url: storeLocationURL,
      method: "GET"
    }).then(function (response) {
      arrayOfStores = JSON.parse(response);
      console.log("List of Stores in the area");
      console.log(arrayOfStores.stores);
    });
  }
  //Then when the array is created the following api will use the store ids to build a button to check its availability
  function wineSearch() {
    var wineType = $("#input-wine-color").val();
    var wineName = $("#input-wine-name").val();

    var holdingObject = {
      name: wineName,
      type: wineType
    };

    var queryURL = buildQueryURL(holdingObject);

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {
      wineReturned = JSON.parse(response);
      //console.log(wineReturned);
      //console.log("hello");
      if (wineReturned.wines) {
        updatePage(wineReturned.wines);
      } else {
        var fillInRow = $("<tr>");
        var emptyResults = $("<td>This wine cannot be located</td>");
        fillInRow.append(emptyResults);
        $("#wineReturned").append(fillInRow);
      }
    });
  }

  //This will add the returned wines to a table the user can select from
  function updatePage(input) {
    $("#wineReturned").empty();
    console.log("update page");

    for (var i = 0; i < input.length; i++) {
      console.log(input[i]);
      var fillInRow = $("<tr>");
      fillInRow.attr("data-name", input[i].name);

      var wineNameTD = $("<td>");
      wineNameTD.attr("class");
      wineNameTD.text(input[i].name);

      var wineVintageTD = $("<td>");
      if (input[i].vintage.length > 2) {
        wineVintageTD.text(input[i].vintage);
      } else {
        wineVintageTD.text("Not Available");
      }

      var inputNumber = $("<input>");
      inputNumber.attr("type", "number");
      inputNumber.attr("id", "name-" + i);
      inputNumber.attr("class", i);
      var selectedNumber = $("<td>").append(inputNumber);

      var selectBtn = $("<button>");
      selectBtn.attr("class", "chosenWine " + i);
      selectBtn.attr("data-wine", i);
      selectBtn.text("Select");
      var selectBTNTD = $("<td>").append(selectBtn);

      fillInRow.append(
        wineNameTD,
        wineVintageTD,
        selectedNumber,
        selectBTNTD
      );
      $("#wineReturned").append(fillInRow);
    }
  }

  //This is the location search that pulls the users location and searchs local stores for this wine
  $(document).on("click", ".locationSearch", function (event) {
    event.preventDefault();
    storeSearch();
  });

  // google maps search 



  //This adds the chosen wine to the database
  function updateDatabase(userID, wine, amount) {
    var updates = {
      amount: amount,
      wineCode: wine.code,
      varietal: wine.varietal,
      image: wine.image,
      name: wine.name,
      price: wine.price
    };
    database.ref("users/" + userID + "/wines").push(updates);
  }

  //this adds the chosen wine and number of bottles to a users cellar
  $(document).on("click", ".chosenWine", function (event) {
    event.preventDefault();

    //Needs to pull the data from the row for the wine info
    //returned wines are saved until a new search is initiated
    //allows for continual references back
    var working = $(this).attr("data-wine");
    var wineWorking = wineReturned.wines[working];
    var bottlesToAdd = $("#name-" + working).val();
    updateDatabase(userID, wineWorking, bottlesToAdd);
    $("#name-" + working).val("");
    fillHomePage();
  });

  //this will populate the cellar in the profile.html
  function cellarTableCreator() {
    if (curPage === "cellar") {
      database
        .ref("/users/" + userID + "/wines")
        .once("value", function (snapshot) {
          var i = 0;
          snapshot.forEach(function (childSnapshot) {
            console.log("cellarTableCreator");
            console.log(childSnapshot.val().key);
            var fillInRow = $("<tr>");
            fillInRow.attr("data-name", "cellarRow " + i);
            fillInRow.attr("id", "cellarRow" + i);

            var wineNameTD = $("<td>");
            wineNameTD.text(childSnapshot.val().name);

            var wineVarietal = $("<td>");
            wineVarietal.text(childSnapshot.val().varietal);

            var increaseBtn = $("<button>");
            increaseBtn.attr(
              "class",
              "btn btn-submit increase " + childSnapshot.key
            );
            increaseBtn.attr("data-key", childSnapshot.key);
            increaseBtn.attr(
              "data-amount",
              childSnapshot.val().amount
            );
            increaseBtn.text("+");

            var decreaseBtn = $("<button>");
            decreaseBtn.attr(
              "class",
              "btn btn-submit decrease " + childSnapshot.key
            );
            decreaseBtn.attr(
              "data-amount",
              childSnapshot.val().amount
            );
            decreaseBtn.attr("data-id", "cellarRow" + i);
            decreaseBtn.attr("data-key", childSnapshot.key);
            decreaseBtn.text("-");

            var pText = $("<p>");
            pText.text(childSnapshot.val().amount);
            pText.attr("id", childSnapshot.key);

            var bottles = $("<td>");
            bottles.attr("class", "bottleOWine");
            bottles.append(increaseBtn);
            bottles.append(pText);
            bottles.append(decreaseBtn);

            var selectBtn = $("<button>");
            selectBtn.attr("class", "locationSearch " + i);
            selectBtn.attr("data-wine", i);
            selectBtn.text("Location");
            var location = $("<td>").append(selectBtn);

            var remove = $("<button>");
            remove.attr("class", `btn btn-submit removeWine`);
            remove.attr("data-id", "cellarRow" + i);
            remove.attr("data-name", childSnapshot.val().name);
            remove.attr("data-key", childSnapshot.key);
            remove.text("Remove");
            var removeButton = $("<td>").append(remove);

            // removed wineImg as it is not defined yet
            fillInRow.append(
              wineNameTD,
              wineVarietal,
              bottles,
              location,
              removeButton
            );

            $("#wineCellar").append(fillInRow);
            i++;

            database
              .ref("/users/" + userID + "/wines")
              .on("value", function (snapshot) {
                wineNames = [];
                numberBottles = [];
                snapshot.forEach(function (childSnapshot) {
                  wineNames.push(childSnapshot.val().name.substr(0, 12));
                  numberBottles.push(childSnapshot.val().amount);
                  console.log(wineNames);
                  var ctx = document.getElementById("myChart").getContext('2d');
                  var myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                      labels: wineNames,
                      datasets: [{
                        label: '# of bottles',
                        data: numberBottles,
                        backgroundColor: [
                          'rgba(255, 250, 205, 0.2)', //		255-250-240
                          'rgba(54, 162, 235, 0.2)',
                          'rgba(255, 206, 86, 0.2)',
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(153, 102, 255, 0.2)',
                          'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                          'rgba(0, 0, 0, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                      }]
                    },
                    options: {
                      maintainAspectRatio: false,
                      scales: {
                        yAxes: [{
                          ticks: {
                            stepSize: 10,
                            beginAtZero: true
                          }
                        }]
                      }
                    }
                  });
                });
              });
          });
        });
    }
  }

  function createChart() {
    console.log(wineNames);
  }

  //this increases the number of bottles in the users cellar
  $(document).on("click", ".increase", function () {
    var currentAmount = JSON.parse($(this).attr("data-amount"));
    var newAmount = currentAmount + 1;
    console.log(newAmount);
    var selectedWine = $(this).attr("data-key");
    database
      .ref()
      .child("users/" + userID + "/wines/" + selectedWine)
      .update({
        amount: newAmount
      });
    $(`#${selectedWine}`).text(newAmount);
    $(`.${selectedWine}`).attr("data-amount", newAmount);
  });

  //This will decrease the amount in the table and database
  //Also, on 0 will ask the user if they want to delete the row
  $(document).on("click", ".decrease", function () {
    var currentAmount = JSON.parse($(this).attr("data-amount"));
    var newAmount = currentAmount - 1;
    console.log(newAmount);
    var selectedWine = $(this).attr("data-key");
    var thisID = $(this).attr("data-id");
    database
      .ref()
      .child("users/" + userID + "/wines/" + selectedWine)
      .update({
        amount: newAmount
      });
    $(`#${selectedWine}`).text(newAmount);
    $(`.${selectedWine}`).attr("data-amount", newAmount);
    if (newAmount === 0) {
      var foo = confirm(
        "Would you like to remove this wine from your cellar?"
      );
      if (foo) {
        database
          .ref()
          .child("users/" + userID + "/wines/" + selectedWine)
          .remove();
        $(`#${thisID}`).remove();
      }
    }
  });

  //this removes the row from the table of a selected wine, and clears it from the database
  $(document).on("click", ".removeWine", function () {
    console.log("remove line");
    var thisID = $(this).attr("data-id");
    var key = $(this).attr("data-key");
    database
      .ref()
      .child("users/" + userID + "/wines/" + key)
      .remove();
    $(`#${thisID}`).remove();
  });

  // begin login scripts
  var userExists = false;
  // is a user logged in?
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // if yes, show cellar
      $("#main-page").show();
      $("#sign-in-div").hide();
      $("#create-user-div").hide();
      console.log(user);
      userID = user.uid;
      userName = user;
      cellarTableCreator();
      fillHomePage();
      profileEdits();
      database
        .ref()
        .once("value")
        .then(function (snapshot) {
          console.log(userID);
          console.log("lettuce");
          if (
            !snapshot.child("users/" + userID + "/wines").exists()
          ) {
            console.log("testing2");
            database
              .ref()
              .child("users/")
              .child(user.uid)
              .child("/name")
              .set({
                name: user.displayName
              });
          }
        });

      //passes userID  out to global scope
    } else {
      // if not show signin page
      $("#main-page").hide();
      $("#sign-in-div").show();
      $("#create-user-div").hide();
      $("#profile-div").hide();
    }
  });

  function signInToggle() {
    if (userExists) {
      $("#main-page").hide();
      $("#sign-in-div").show();
      $("#create-user-div").hide();
      userExists = false;
    } else {
      $("#main-page").hide();
      $("#sign-in-div").hide();
      $("#create-user-div").show();
      userExists = true;
    }
  }

  // login with Google account
  function googleLogin() {
    var googleProvider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(googleProvider);
  }

  // login with facebook
  function facebookLogin() {
    var facebookProvider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(facebookProvider);
  }

  // create user for wine-cellar app
  function createUser() {
    var email = $("#username-input-create").val();
    var password = $("#password-input-create").val();
    var newUserName = $("#name-field").val();
    console.log(email, password);

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert(errorMessage);
      });
    $("#username-input-create").val("");
    $("#password-input-create").val("");
    $("#name-field").val("");
  }

  // login with wine-cellar account
  function login() {
    var emailSign = $("#username-input").val();
    var passwordSign = $("#password-input").val();
    firebase
      .auth()
      .signInWithEmailAndPassword(emailSign, passwordSign)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode2 = error.code;
        var errorMessage2 = error.message;
        window.alert(errorMessage2);
      });
    $("#username-input").val("");
    $("#password-input").val("");
  }

  function manuallyUpdateProfile() {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        var username, email;
        if (checkbox.ischecked) {}
        user.updateProfile({
            displayName: username,
            email: email
          })
          .then(function () {
            // Update successful.
          })
          .catch(function (error) {
            // An error happened.
            window.alert(error);
          });
      } else {
        // if not show signin page
        $("#main-page").hide();
        $("#sign-in-div").show();
        $("#create-user-div").hide();
        $("#create-profile-div").hide();
      }
    });
  }

  function logout() {
    window.location = "index.html";
    firebase.auth().signOut();
  }

  function reset() {
    var userToReset = firebase.auth().currentUser;
    var auth = firebase.auth();
    var emailAddress = userToReset.email;

    auth.sendPasswordResetEmail(emailAddress)
      .then(function () {
        // Email sent.
        window.alert("Password reset email has been sent.");
      })
      .catch(function (error) {
        // An error happened.
        window.alert(error);
      });
  }

  function fillHomePage() {
    if (curPage === "index") {
      database
        .ref("/users/" + userID + "/wines")
        .once("value", function (snapshot) {
          $("#rows-to-update").empty();
          snapshot.forEach(function (childSnapshot) {
            var newWine = childSnapshot.val().name;
            var newVarietal = childSnapshot.val().varietal;
            var newRow = $("<tr>").append(
              $("<td>").text(newWine),
              $("<td>").text(newVarietal)
            );
            console.log(newRow);
            $("#wine-table").append(newRow);
          });
        });
    }
  }

  function profileEdits() {
    if (curPage === "profile") {
      var user = firebase.auth().currentUser;
      $("#username-display").text(user.displayName);
      $("#email-display").text(user.email);
      database
        .ref("/users/" + userID + "/preferences")
        .once("value", function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var thisKey = childSnapshot.key;
            var thisInterest = childSnapshot.val();
            console.log(thisKey);
            console.log(thisInterest);
            $("#" + thisInterest).addClass(
              "interest-button-clicked"
            );
            $("#" + thisInterest).attr("clicked", "yes");
            $("#" + thisInterest).attr("key", thisKey);
          });
        });
      $(".interest-button").on("click", function () {
        if ($(this).attr("clicked") === "no") {
          $(this).addClass("interest-button-clicked");
          $(this).attr("clicked", "yes");
          var profilePreference = $(this).attr("preference-name");
          var profileKey = firebase
            .database()
            .ref("users/" + userID + "/preferences")
            .push().key;
          var profileUpdates = {};
          profileUpdates[
            "users/" + userID + "/preferences/" + profileKey
          ] = profilePreference;
          database.ref().update(profileUpdates);
          $(this).attr("key", profileKey);
        } else {
          $(this).removeClass("interest-button-clicked");
          $(this).attr("clicked", "no");
          var removalKey = $(this).attr("key");
          database
            .ref("users/" + userID + "/preferences/" + removalKey)
            .remove();
        }
      });
    }
  }

  $("#create-account-toggle").on("click", signInToggle);
  $("#sign-in-toggle").on("click", signInToggle);
  $("#sign-in").on("click", login);
  $("#create-user").on("click", createUser);
  $("#sign-in-google").on("click", googleLogin);
  $("#sign-in-facebook").on("click", facebookLogin);
  $("#logout").on("click", logout);
  $("#logout-profile").on("click", logout);
  // update profile click handler manuallyUpdateProfile
  // show profile click handler getProfile
  $("#reset-credentials").on("click", reset);
  $("#update-profile").on("click", manuallyUpdateProfile);
});