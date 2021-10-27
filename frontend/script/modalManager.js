let loginErrModal = new bootstrap.Modal(document.getElementById('login-alert-modal'))


let poetryBtn = document.querySelector('#poetry-post-btn')
let poetryModal = new bootstrap.Modal(document.getElementById('poetry-modal'))
poetryBtn.addEventListener('click' , event => {

    if(localStorage.getItem('isLoggedIn') === 'false'){
        loginErrModal.show()
        return
    }
    event.preventDefault()
    poetryModal.show()
})
const closePoetryModal = function(){
   loadFeed();
   poetryModal.hide()
}


let pictureBtn = document.getElementById('picture-post-btn')
let pictureModal = new bootstrap.Modal(document.getElementById('picture-modal'))
pictureBtn.addEventListener('click' , event => {

   if(localStorage.getItem('isLoggedIn') === 'false'){
       loginErrModal.show()
       return
   }
   event.preventDefault()
   pictureModal.show()
})

const closePictureModal = function(){
    loadFeed();
    pictureModal.hide()
 }
