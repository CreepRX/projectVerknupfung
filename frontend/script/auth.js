

let provider = new firebase.auth.GoogleAuthProvider()
auth.languageCode = 'en'

const loginbutton = document.querySelector('#login-anchor')
loginbutton.addEventListener('click', e =>{
    e.preventDefault()

    auth.signInWithPopup(provider).then(res =>{
        let credential = res.credential;
        let token = credential.accessToken;
    // The signed-in user info.
        let user = res.user;
        console.log(user)

 
    })
})

const usrStatus = document.querySelector('#user-status')


const logoutbutton = document.querySelector('#logout-anchor')
logoutbutton.addEventListener('click' , e => {
    e.preventDefault()
    firebase.auth().signOut().then(() => {
        logoutbutton.parentElement.classList.add('disabled')
        loginbutton.parentElement.classList.remove('disabled')
        usrStatus.classList.add('disabled')
      }).catch((err) => {
        // An error happened.
      });
})


auth.onAuthStateChanged(user =>{
    if (!user){
        localStorage.setItem('isLoggedIn', false)
        return
    }
    localStorage.setItem('isLoggedIn', true)
    logoutbutton.parentElement.classList.remove('disabled')
    usrStatus.classList.remove('disabled')
    const img = document.querySelector('#user-pic')
    const name = document.querySelector('#user-name')
    name.textContent = user.displayName
    img.src = user.photoURL
    img.srcset = user.photoURL

    loginbutton.parentElement.classList.add('disabled')
})