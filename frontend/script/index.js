// this is for the ui responsiveness


toggle = document.querySelector('#picture-toggle')
pic = document.querySelector('#pic-section')
let opened = false

toggle.addEventListener('click', e =>{
    pic.classList.toggle('full-height')
    toggle.classList.toggle('rotated')
})

let loginErrModal = new bootstrap.Modal(document.getElementById('login-alert-modal'))

let poetryBtn = document.querySelector('#poetry-post-btn')
let poetryModal = new bootstrap.Modal(document.getElementById('poetry-modal'),
{
    keyboard: false
})

poetryBtn.addEventListener('click' , event => {

    if(localStorage.getItem('isLoggedIn') === 'false'){
        loginErrModal.show()
        return
    }
    event.preventDefault()
    poetryModal.show()
})


const contentFeed = document.querySelector('#content')
const loadFeed = async function(){
    
    const getFeed = func.httpsCallable("getPoetry")
    const datas = (await getFeed().then(res => {
        return res
    })).data

    console.log(datas)
    datas.forEach(data => {
        contentFeed.innerHTML += generatePost(data['title'],data['content'],"")
    });

}

loadFeed()


const generatePost = function (title, content, imgURL){
    imgURL = 'picPlaceholder.jpg'
    return `
    <!-- content -->
                  <div class="post rounded shadow align-center mt-4">
                     <div class="pic-section m-0 rounded-top" id='pic-section'>
                        <img src="${imgURL}" alt="pic" srcset="">
                     </div>
                     <div class="text-section rounded-top row pt-3 pb-3">
                        <div class="col-1 vote text-center">
                           <a href="#" class="upvote">
                              <i class="bi bi-caret-up" id="upvote"></i>
                           </a>
                           <small id="total-vote">25</small>
                           <a href="" class="downvote">
                              <i class="bi bi-caret-down" id="downvote"></i>
                           </a>
                        </div>
                        <div class="col-10">
                           <div class="top row">
                              <p class="h3 col-10">${title}</p>
                              <div class="col-2 text-center d-flex flex-row toggle" id="picture-toggle">
                                 <i class="bi bi-chevron-down ms-1 h3"></i>
                              </div>
                           </div>
                           <p class="content">
                              ${content}
                           </p>
                           <hr>
                           <div class="creator-section row">
                              <div class="col-12 col-lg-6">
                                 <small>Poetry by </small>
                                 <img class="rounded-circle" src="personPlaceholder.jpg" width="30px">
                                 <small class="poet-name">Poet's Name</small>
                              </div>
                              <div class="col-12 col-lg-6">
                                 <small class=""> Picture by</small>
                                 <img class="rounded-circle" src="personPlaceholder.jpg" width="30px">
                                 <small class="poet-name">Painter's Name</small>
                              </div>
                           </div>
                        </div>
                        <div class="col-1"></div>
                     </div>
                  </div>
    `
}