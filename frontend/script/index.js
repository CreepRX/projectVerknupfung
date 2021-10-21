// this is for the ui responsiveness
const getUser = func.httpsCallable("getUser")

const contentFeed = document.querySelector('#content')
const loadFeed = async function(){
   contentFeed.innerHTML = ''
    
    const getFeed = func.httpsCallable("getPoetry")
    const datas = (await getFeed().then(res => {
        return res
    })).data
    datas.forEach( async data => {

      let poet = await getUser({
         UID : data['poetUID']
      }).then(
         r => {
            return r.data
         }
      )
      contentFeed.innerHTML += generatePost(data['title'],data['content'],poet)
    });

}

loadFeed()

const expandPic = function(picID, chevronID){
   let pic = document.getElementById(picID)
   pic.classList.toggle('full-height')

   let chevron = document.getElementById(chevronID)
   chevron.classList.toggle('rotated')

}

let loginErrModal = new bootstrap.Modal(document.getElementById('login-alert-modal'))

const generatePost = function (title, content, poet){
    const imgURL = 'picPlaceholder.jpg'
    const poetIMG = poet.profilePic
    const poetName = poet.name

    const picID = "pic-" + Math.floor(Math.random() * 100000000)
    const chevronID = "chev" + Math.floor(Math.random() * 1000000)
    return `
    <!-- content -->
                  <div class="post rounded shadow align-center mt-4">
                     <div class="pic-section m-0 rounded-top" id='${picID}' >
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
                              <div class="col-2 text-center d-flex flex-row toggle" id="${chevronID}" onClick="expandPic('${picID}', '${chevronID}')">
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
                                 <img class="rounded-circle" src="${poetIMG}" width="30px">
                                 <small class="poet-name">${poetName}</small>
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