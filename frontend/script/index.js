// this is for the ui responsiveness
const getUser = func.httpsCallable("getUser")
const getFeed = func.httpsCallable("getPoetry")

const contentFeed = document.querySelector('#content')
const about = document.querySelector('#about-us')
loadFeed()

const expandPic = function(picID, chevronID){
   let pic = document.getElementById(picID)
   pic.classList.toggle('full-height')

   let chevron = document.getElementById(chevronID)
   chevron.classList.toggle('rotated')

}


