const loadFeed = async function(){
    contentFeed.innerHTML = ''
     
     const datas = (await getFeed().then(res => {
         return res
     })).data
 
 
     datas.forEach( async data => {
        console.log(data)

     const html = await generatePost(data['title'],data['content'],data['hasPic'],data['picture'], data['users'])
       contentFeed.innerHTML += html
     });
 }



const generatePost = async function (title, content, hasPic, picture, users){
   
    console.log(users)
     poet = users[0]
 
     console.log(poet)
     const poetIMG = poet.profilePic
     const poetName = poet.name
 
     let picOwnerName = ' '
     let imgURL = '/noPic.jpg'
     let picOwnerIMG = '' 
     if (hasPic){
       const picOwner = users[1]
 
 
       console.log("hello world")
       imgURL = await storage.ref(picture).getDownloadURL().then(
          url => url
       )
 
       console.log(imgURL)
       picOwnerIMG = picOwner.profilePic
       picOwnerName = picOwner.name
     }
 
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
                                  ${hasPic ? `
                                     <small class=""> Picture by</small>
                                     <img class="rounded-circle" src="${picOwnerIMG}" width="30px">`
                                     : '<small class=""> No picture yet</small>'}
                                  <small class="poet-name">${picOwnerName}</small>
                               </div>
                            </div>
                         </div>
                         <div class="col-1"></div>
                      </div>
                   </div>
     `
 }
 