//Config for DB
const firebaseConfig = {
  apiKey: "AIzaSyAR1eUSZfWnVIgY_tNI4iaVKH1a-8dYGic",
  authDomain: "dumb-bird-db.firebaseapp.com",
  databaseURL: "https://dumb-bird-db-default-rtdb.firebaseio.com",
  projectId: "dumb-bird-db",
  storageBucket: "dumb-bird-db.appspot.com",
  messagingSenderId: "970929035984",
  appId: "1:970929035984:web:2b51072a9a421612e59cd5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleAuth = new firebase.auth.GoogleAuthProvider();

//Login
let renderLogin = ()=>{
  $("body").html(`
  <div class= "login">
    <div class= "container">
      <div class= "col">
        <h1>Login</h1>
        <input type= "text" placeholder= "Email" id= "exist-email"/>
        <input type= "password" placeholder= "Password" id= "exist-pass"/>
        <br>
          <i>
            <small id= "signuppage">Sign up for an account</small>
          </i>
          <small>
            <input type="checkbox" id= "show-pass">Show password</input>
          </small>
        </br>
        <button type= "text" id= "login-button">Login</button>
        <button type= "text" id= "login-google">Login with Google</button>
      </div>
    </div>
  </div>
  `);

  // Show password button
  $("#show-pass").on("click", ()=>{
    let showpass = document.getElementById("exist-pass");
    if (showpass.type === "password"){
      showpass.type = "text";
    }else{
      showpass.type = "password";
    }
  });

  //Google login
  $("#login-google").on("click", ()=>{
    firebase.auth().signInWithPopup(googleAuth)
      .then((result) => {
        let loginInfo = result.loginInfo;
        let googleToken = loginInfo.accessToken;
        let user = result.user;
        let userName = user["displayName"];
        let email = user["email"];
        let uid = user["uid"];
        writeUserData(uid, userName, email)
        console.log("successfully logged in with google.")
      }).catch((error) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        let loginInfo = error.loginInfo;
        alert(errorMessage + " " + errorCode)
        console.log(loginInfo)
      });
  });

  //Switch to login page if button clicked
  $("#signuppage").on("click", ()=> {
    renderSignUp();
  });

  //Login button functionality
  $("#login-button").on("click", ()=>{
    let email = $("#exist-email").val();
    let pass = $("#exist-pass").val();

    firebase.auth().signInWithEmailAndPassword(email, pass)
      .catch((error) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        alert(errorMessage + " " + errorCode);
      });

  });
}

//Signup
let renderSignUp = ()=>{
  $("body").html(`
  <div class = "signup">
    <div class = "container">
      <div class = "col">
        <h1>Sign up</h1>
        <input type = "text" placeholder = "Email" id = "new-email">
        <input type = "password" placeholder = "Password" id = "new-pass">
        <br> 
          <i>
            <small id="logininstead">Already have an account with us?</small>
          </i>
          <small>
            <input type="checkbox" id="showpass">Show Password</input>
          </small>
        </br>
        <button type= "text" id= "signup">Sign Up</button>
        <button type= "text" id= "singup-with-google">Sign Up with Google</button>
      </div>
    </div>
  </div>
  `);

  //Switch to login page.
  $("#logininstead").on("click", ()=>{
    renderLogin();
  });

  //Show password button
  $("#showpass").on("click", ()=>{
    let showpass = document.getElementById("new-pass");
    if(showpass.type === "password"){
      showpass.type = "text";
    }else{
      showpass.type = "password";
    }
  });

  //Actual signup button function.
  $("#signup").on("click", ()=>{
    let email = $("#new-email").val();
    let pass = $("#new-pass").val();
  
    auth.createUserWithEmailAndPassword(email,pass).then((loginInfo)=> {
      let user = loginInfo.user;
      writeUserData(user.uid, user.email, user.pass)
      console.log("successfully signed up with email")
    })
    .catch((error)=>{
      let errorCode = error.code;
      let errorMessage = error.message;
      alert(errorMessage + "" + errorCode);
    });
  });

  //Google Signup
  $("#signup-with-google").on("click", ()=>{
    firebase.auth().signInWithPopup(googleAuth)
      .then((result) => {
        let loginInfo = result.loginInfo;
        let googleToken = loginInfo.accessToken;
        let user = result.user;
        let userName = user["displayName"];
        let email = user["email"];
        let uid = user["uid"];
        writeUserData(uid, userName, email)
        console.log("successfully signed up with google.")
      }).catch((error) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        let loginInfo = error.loginInfo;
        alert(errorMessage + " " + errorCode)
        console.log(loginInfo)
      });
  });  
}

//Home page
let homePage = (currentUser)=>{
  let uid = currentUser.uid;

  $("body").html(`
  <div class="col"> 
    <h2>Current user logged in: ${currentUser.email}</h2>
    <button id = "logout">Logout</button>
    <h1>Make a tweet!</h1>
    <div>
      <textarea id = "tweetcontent" maxlength = "100" placeholder= "Send a tweet!"></textarea>
      <span id='charsleft'> 100 </span>
    </div>
    <button id="sendtweet">Send the tweet!</button>

    <div class="tweets">
      <div id="alltweets">

      </div>
    </div>
  </div>
  `);


  //signout
  $("#logout").on("click", ()=>{
    firebase.auth().signOut();
  });
  console.log(uid)

  //Actually send a tweet
  $("#sendtweet").on("click", ()=>{
    var user = firebase.auth().currentUser;
    var userRef = firebase.database().ref().child("/users/" + user.uid + "/tweets/").push();
    var tweetRef = firebase.database().ref("tweets/").push();
    date = new Date().toLocaleString();
    message = $("#tweetcontent").val();
    const aTweet = {
      "content" : message,
      "likes" : 0,
      "date" : date,
      "authorID" : user.uid,
      "author": {
        "email": user.email
      }
    }
    userRef.set(aTweet);
    tweetRef.set(aTweet);
  }); 

  //Limit tweet characters
  $(document).ready(function(){
    var maxlength = 100;
    $("textarea").keypress(function(){
      var length = $(this).val().length;
      var length = maxlength - length;
      $("#charsleft").text(length);
    });
  });

  //actually show the tweets donovan jesus christ
  let tweetRef = firebase.database().ref('/tweets/');
  tweetRef.on("child_added", (ss)=>{
    let tweetObj = ss.val();
    renderTweets(tweetObj, ss.key);
  });
};

//Render tweets? Thanks to Zoe V on helping explain some of this.
let renderTweets = (tweetObj, uid)=> {
  var tAuthorID = tweetObj.authorID;
  var aRef = firebase.database().ref().child("/users").child(tAuthorID);
  aRef.get().then((ss) => {
    $("#alltweets").prepend(`
      <div class= "card mb-3 tweet" data-uid="${uid}" style="max-width:600px;">
        <div class="row g-0">
          <div class="card-body">
            <h4 class = "card-title">Tweeted by: ${tweetObj.author.email}</h4>
            <p class = "card-text">${tweetObj.content}</p>
            <button class = "like-button" id = "like-button" data-tweetid="${uid}">${tweetObj.likes} Likes</button>
            <small>Tweet date: ${tweetObj.date}</small>
          </div>
        </div>
      </div>
    `);
    var likesRef = firebase.database().ref("/likes").child(uid).child("likes");
    likesRef.on("value", ss => {
      $(`.like-button[data-tweetid=${uid}]`).html(`❤️ ${ss.val() || 0} Likes`);
    });
  });

  let tweetRef = firebase.database().ref('tweets/');
  tweetRef.on("child_added", (ss)=>{

    let userRef = firebase.database().ref('users/');
    let tweetObj = ss.val();

    userRef.child(tweetObj.author).get().then((snapshot) =>{
      let userObj = snapshot.val();
      console.log(userObj);
      renderTweet(tweetObj, ss.key, userObj);
        $(".like-button").off("click");
        $(".like-button").on("click", (evt)=>{
        let clickedTweet = $(evt.currentTarget).attr("data-tweetid");
        let likesRef = firebase.database().ref("/likes").child(clickedTweet);
        toggleLike(likesRef, uid);
      });
    });
  }); 
}

//Like tweets - mostly copied your code for likes tbh
let toggleLike = (tweetRef, uid)=>{
  tweetRef.transaction((tweetObj) => {
    if (!tweetObj) {
      tweetObj = {likes: 0};
    }
    if (tweetObj.likes && tweetObj.likes_by_user[uid]) {
      tweetObj.likes--;
      tweetObj.likes_by_user[uid] = null;
    } else {
      tweetObj.likes++;
      if (!tweetObj.likes_by_user) {
        tweetObj.likes_by_user = {};
      }
      tweetObj.likes_by_user[uid] = true;
    }
    return tweetObj;
  });
}


//Creating an account in the db
function writeUserData(uid, email){
  console.log(uid)
  console.log(email)
  firebase.database().ref('users/' + uid).set({
    email: email,
  })
}

//Getter for user data
// function getUserData (tweet){
//   var userRef = firebase.database().ref('users/');
//   console.log(tweet.author);

//   userRef.child(tweet.author).get().then((ss) => {
//     console.log(ss.val());
//     let userObj = ss.val();
//   });
// }

firebase.auth().onAuthStateChanged(user=>{
  if(!user){
    renderLogin();
    console.log("trying to render login/signup page")
  } else{
    homePage(user);
    console.log("trying to render homepage");
  }
})